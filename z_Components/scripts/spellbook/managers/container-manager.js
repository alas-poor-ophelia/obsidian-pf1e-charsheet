/**
 * @file container-manager.js
 * @description Manages DOM container lifecycle, resource tracking, and memory leak prevention for spellbook renderers
 */

import '../types/types.js'; // Import type definitions

/**
 * @class ContainerManager
 * @description Handles container lifecycle management, resource tracking, and cleanup operations
 * to prevent memory leaks in the Obsidian environment. Uses WeakMaps for automatic garbage
 * collection of container-specific resources.
 * 
 * @example
 * ```javascript
 * const manager = new ContainerManager(renderer);
 * manager._trackContainerResource(container, cleanupFn);
 * manager._cleanupAndClearContainer(container);
 * ```
 */
export class ContainerManager {
    /**
     * Creates a new ContainerManager instance
     * @param {import('../core/spellbook.js').SpellbookRenderer} renderer - Reference to the parent renderer for accessing shared state
     */
    constructor(renderer) {
        /**
         * Reference to parent renderer
         * @type {import('../core/spellbook.js').SpellbookRenderer | undefined}
         * @private
         */
        this.renderer = renderer;

        /**
         * WeakMap tracking cleanup functions for each container
         * @type {WeakMap<HTMLElement, Set<Function>>}
         * @private
         */
        this._containerResources = new WeakMap();

        /**
         * WeakMap tracking render state for each container
         * @type {WeakMap<HTMLElement, boolean>}
         * @private
         */
        this._containerRenderState = new WeakMap();

        /**
         * Set of disposable resources for global cleanup
         * @type {Set<Function>}
         * @private
         */
        this._disposables = new Set();

        /**
         * Map of component IDs to cleanup functions
         * @type {Map<string, Function>}
         * @private
         */
        this._componentCleanups = new Map();
    }

    /**
     * Registers a disposable resource for cleanup
     * @param {Function|{dispose: () => void}} cleanupFn - Cleanup function to call on disposal
     * @public
     */
    _registerDisposable(cleanupFn) {
        if (!this.renderer || this.renderer._disposed) {
            console.warn('Attempting to register disposable on disposed renderer');
            return;
        }
        
        // Handle both function and object with dispose method
        if (typeof cleanupFn === 'function') {
            this.renderer._disposables?.add(cleanupFn);
        } else if (cleanupFn && typeof cleanupFn.dispose === 'function') {
            this.renderer._disposables?.add(() => cleanupFn.dispose());
        } else {
            console.warn('Invalid disposable provided - must be function or object with dispose method');
        }
    }

    /**
     * Registers a component cleanup function
     * @param {import('../types/foundation.js').Component} component - Component for lifecycle management
     * @param {Function} cleanupFn - Cleanup function for the component
     * @public
     */
    _registerComponentCleanup(component, cleanupFn) {
        if (component?.register) {
            component.register(cleanupFn);
            this._registerDisposable(cleanupFn);
        }
    }

    /**
     * Tracks a cleanup resource for a specific container
     * @param {HTMLElement} container - The container element
     * @param {Function} cleanupFn - Cleanup function to associate with the container
     * @public
     */
    _trackContainerResource(container, cleanupFn) {
        if (!this._containerResources.has(container)) {
            this._containerResources.set(container, new Set());
        }

        const resources = this._containerResources.get(container);
        if (resources) {
            resources.add(cleanupFn);
        }
    }

    /**
     * Checks if a container has been rendered
     * @param {HTMLElement} container - The container to check
     * @returns {boolean} True if the container has been rendered
     * @public
     */
    _isContainerRendered(container) {
        return container && typeof container.hasAttribute === 'function' &&
            container.hasAttribute('data-spellbook-rendered');
    }

    /**
     * Cleans up all resources associated with a container and clears its content
     * @param {HTMLElement} container - The container to clean up
     * @public
     */
    _cleanupAndClearContainer(container) {
        // Clean up tracked resources for this container
        const resources = this._containerResources.get(container);
        if (resources && resources.size > 0) {
            for (const cleanupFn of resources) {
                try {
                    cleanupFn();
                } catch (error) {
                    console.warn('Error cleaning up container resource:', error);
                }
            }
            resources.clear();
        }

        // Clear children without using container.empty()
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Set up click handlers for spell links via spell link handler
        if (this.renderer?.spellLinkHandler) {
            this.renderer.spellLinkHandler.setupSpellLinkHandlers(container);
        }
    }

    /**
     * Marks a container as rendered
     * @param {HTMLElement} container - The container to mark
     * @param {import('../types/foundation.js').Component} component - Component for lifecycle management
     * @public
     */
    _markContainerRendered(container, component) {
        if (container && typeof container.setAttribute === 'function') {
            container.setAttribute('data-spellbook-rendered', 'true');
        }

        if (component?.register) {
            component.register(() => {
                // Clean up any tracked resources for this container
                const resources = this._containerResources.get(container);
                if (resources && resources.size > 0) {
                    for (const cleanupFn of resources) {
                        try {
                            cleanupFn();
                        } catch (error) {
                            console.warn('Error cleaning up container resource:', error);
                        }
                    }
                    resources.clear();
                }

                // Remove the rendered marker  
                if (container && typeof container.removeAttribute === 'function') {
                    container.removeAttribute('data-spellbook-rendered');
                }
            });
        }
    }

    /**
     * Prepares a container for rendering by cleaning up previous content
     * @param {HTMLElement} container - The container to prepare
     * @param {import('../types/foundation.js').Component} component - Component for lifecycle management
     * @returns {boolean} True if should proceed with rendering
     * @public
     */
    _setupContainerForRender(container, component) {
        // If already rendered, clean up and clear for re-render
        if (this._isContainerRendered(container)) {
            this._cleanupAndClearContainer(container);
        }

        // Mark as rendered and setup cleanup
        this._markContainerRendered(container, component);
        
        // Set up click handlers for spell links via spell link handler
        if (this.renderer?.spellLinkHandler) {
            this.renderer.spellLinkHandler.setupSpellLinkHandlers(container);
        }
        
        return true;
    }

    /**
     * Safely empties a container's content
     * @deprecated Use _cleanupAndClearContainer instead
     * @param {HTMLElement} container - The container to empty
     * @public
     */
    _safelyEmptyContainer(container) {
        console.warn('_safelyEmptyContainer is deprecated - use _cleanupAndClearContainer instead');
        container.empty();
    }

    /**
     * Disposes of all tracked resources and cleans up internal state
     * @public
     */
    dispose() {
        // Clean up all disposable resources
        for (const disposeFn of this._disposables) {
            try {
                disposeFn();
            } catch (error) {
                console.warn('Error disposing resource:', error);
            }
        }
        this._disposables.clear();

        // Clean up all component cleanups
        for (const [componentId, cleanupFn] of this._componentCleanups) {
            try {
                cleanupFn();
            } catch (error) {
                console.warn(`Error cleaning up component ${componentId}:`, error);
            }
        }
        this._componentCleanups.clear();

        // WeakMaps will be garbage collected automatically
        // Clear references to help GC
        this.renderer = undefined;
    }
}