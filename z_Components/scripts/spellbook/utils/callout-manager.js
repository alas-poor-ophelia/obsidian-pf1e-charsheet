/**
 * @fileoverview Manages callout collapse/expand functionality for spellbook renderers.
 * Handles state persistence, click detection, and UI synchronization for callouts.
 * 
 * @module callout-manager
 */

// Utility imports (if needed)

/**
 * @typedef {import('../core/spellbook.js').SpellbookRenderer} SpellbookRenderer
 */

/**
 * Manages callout state and interactions for spellbook UI components.
 * 
 * This class handles:
 * - Callout collapse/expand state persistence across reloads
 * - Click event detection and state determination
 * - UI synchronization with stored callout states
 * - Debounced state updates to prevent rapid toggling
 * 
 * @class CalloutManager
 */
export class CalloutManager {
    /**
     * Creates a new CalloutManager instance.
     * 
     * @param {SpellbookRenderer} renderer - The parent renderer instance for accessing shared state
     */
    constructor(renderer) {
        /**
         * Reference to the parent renderer for accessing shared state and methods.
         * @type {SpellbookRenderer}
         * @private
         */
        this.renderer = renderer;
        
        /**
         * Tracks callout collapse/expand states by unique keys.
         * Keys are generated based on spell level and callout type.
         * @type {Map<string, boolean>}
         * @private
         */
        this._calloutStates = new Map();
        
        /**
         * Tracks pending state updates for debouncing rapid changes.
         * @type {Map<string, NodeJS.Timeout>}
         * @private
         */
        this._pendingStateUpdates = new Map();
        
        /**
         * Default debounce delay in milliseconds for state updates.
         * @type {number}
         * @private
         * @readonly
         */
        this._debounceDelay = 150;
        
        /**
         * Tracks event listeners for cleanup to prevent memory leaks.
         * @type {Set<{element: HTMLElement, event: string, handler: Function, calloutId: string}>}
         * @private
         */
        this.eventListeners = new Set();
    }
    
    /**
     * Initializes the callout manager.
     * Sets up initial state tracking and loads persisted states.
     */
    initialize() {
        // Load any persisted callout states
        this._loadPersistedStates();
    }
    
    /**
     * Cleans up the callout manager resources.
     * Clears pending updates and state tracking.
     */
    cleanup() {
        // Clear any pending debounced updates
        for (const timeout of this._pendingStateUpdates.values()) {
            clearTimeout(timeout);
        }
        this._pendingStateUpdates.clear();
        
        // Clean up all tracked event listeners
        for (const listener of this.eventListeners) {
            try {
                listener.element.removeEventListener(listener.event, /** @type {EventListener} */(listener.handler));
            } catch (error) {
                console.warn('Error removing event listener during cleanup:', error);
            }
        }
        this.eventListeners.clear();
        
        // Clear state tracking
        this._calloutStates.clear();
    }
    
    /**
     * Loads persisted callout states from storage.
     * @private
     */
    _loadPersistedStates() {
        // Implementation will be added when extracting methods
        // This will load states from localStorage or similar persistence mechanism
    }
    
    // Method stubs for extraction from spellbook.js
    
    /**
     * Create a YAML-safe callout key
     * @param {string} title - The callout title
     * @param {string} context - Additional context (optional)
     * @returns {string} YAML-safe key
     */
    _createCalloutKey(title, context = '') {
        // Replace spaces with underscores and remove special characters
        const baseKey = title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        return context ? `${baseKey}_${context}` : baseKey;
    }
    
    /**
     * Get callout collapsed state from frontmatter
     * @param {string} calloutTitle - The callout title as displayed
     * @param {string} context - Additional context for uniqueness
     * @param {boolean} defaultState - Default collapsed state if not found
     * @returns {boolean} Whether the callout should be collapsed
     */
    getCalloutState(calloutTitle, context = '', defaultState = false) {
        const calloutKey = this._createCalloutKey(calloutTitle, context);
        const stateTarget = this.renderer.mb.parseBindTarget(`calloutStates.${calloutKey}`, this.renderer.spellbookFile.path);
        const storedState = this.renderer.mb.getMetadata(stateTarget);
        return storedState !== undefined ? storedState : defaultState;
    }
    
    /**
     * Set callout collapsed state in frontmatter
     * @param {string} calloutTitle - The callout title as displayed
     * @param {string} context - Additional context for uniqueness  
     * @param {boolean} collapsed - Whether the callout should be collapsed
     */
    setCalloutState(calloutTitle, context = '', collapsed) {
        const calloutKey = this._createCalloutKey(calloutTitle, context);
        const stateTarget = this.renderer.mb.parseBindTarget(`calloutStates.${calloutKey}`, this.renderer.spellbookFile.path);
        this.renderer.mb.setMetadata(stateTarget, collapsed);
    }
    
    /**
     * Helper method to create callout wrapper with persistent state
     * @param {string} title - Title for the callout
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').JSEngineContext} context - Engine context
     * @param {import('../types/types.js').JSEngine} engine - JS Engine instance
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     * @param {string} calloutType - Type of callout
     * @param {boolean} defaultCollapsed - Default collapsed state if not stored
     * @param {string} contextKey - Additional context for unique identification
     * @returns {Promise<HTMLElement>} The callout content element
     */
    async _createCalloutWrapper(title, container, context, engine, component, calloutType = "collapse-clean", defaultCollapsed = false, contextKey = '') {
        // Get persistent state for this callout
        const collapsed = this.getCalloutState(title, contextKey, defaultCollapsed);

        const wrp = container.createDiv();
        const collapseSymbol = collapsed ? "-" : "+";
        const calloutMd = engine.markdown.create(`> [!${calloutType}]${collapseSymbol} ${title}\n> temp`);
        await calloutMd.render(window.app, wrp, context.file.path, component);

        // Get the callout content area (second child of first child)
        // Cast needed because DOM API returns Element but Obsidian's elements are HTMLElements
        const calloutContent = /** @type {HTMLElement} */(wrp.children[0].children[1]);
        if (!this.renderer._setupContainerForRender(calloutContent, component)) {
            return calloutContent; // Already rendered
        }

        // Set up simple click handler for state tracking
        const calloutElement = /** @type {HTMLElement} */(wrp.children[0]);
        const calloutHeader = /** @type {HTMLElement} */(calloutElement.children[0]);

        if (calloutHeader) {
            const calloutId = this._createCalloutKey(title, contextKey);
            this.setupCalloutStateTracking(calloutHeader, calloutElement, calloutId, component, container);
        }

        return calloutContent;
    }
    
    /**
     * Set up callout state tracking with proper memory management
     * @param {HTMLElement} calloutHeader - The clickable header element
     * @param {HTMLElement} calloutElement - The full callout element
     * @param {string} calloutId - Unique callout identifier
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     * @param {HTMLElement} container - Container element for tracking cleanup
     */
    setupCalloutStateTracking(calloutHeader, calloutElement, calloutId, component, container) {
        // Create debounced save function for this specific callout
        const debouncedSave = this.debounce((/** @type {string} */ id, /** @type {HTMLElement} */ element) => {
            const isCollapsed = this.determineCalloutState(element);
            this.setCalloutStateById(id, isCollapsed);
        }, 150);

        // Create event handler with proper binding
        const handleToggle = (/** @type {Event} */ event) => {
            // Check if click was on the toggle area (not just any click in header)
            if (this.isCalloutToggleClick(event, calloutHeader)) {
                // Small delay to let Obsidian update the DOM state first
                setTimeout(() => {
                    debouncedSave(calloutId, calloutElement);
                }, 10);
            }
        };

        // Add event listener
        calloutHeader.addEventListener('click', handleToggle, {
            passive: true, // Optimize for performance
            capture: false
        });

        // Track this listener for cleanup
        this.eventListeners.add({
            element: calloutHeader,
            event: 'click',
            handler: handleToggle,
            calloutId: calloutId
        });

        // Track this event listener for container cleanup
        this.renderer.containerManager._trackContainerResource(container, () => {
            calloutHeader.removeEventListener('click', handleToggle);
            // Remove from tracking set
            for (const listener of this.eventListeners) {
                if (listener.element === calloutHeader && listener.handler === handleToggle) {
                    this.eventListeners.delete(listener);
                    break;
                }
            }
        });

        // Register cleanup with component lifecycle
        if (component?.register) {
            component.register(() => {
                calloutHeader.removeEventListener('click', handleToggle);
                // Remove from tracking set
                for (const listener of this.eventListeners) {
                    if (listener.element === calloutHeader && listener.handler === handleToggle) {
                        this.eventListeners.delete(listener);
                        break;
                    }
                }
            });
        }
    }
    
    /**
     * Determine if a click was on the callout toggle area
     * @param {Event} event - Click event
     * @param {HTMLElement} calloutHeader - Header element
     * @returns {boolean} Whether click was on toggle area
     */
    isCalloutToggleClick(event, calloutHeader) {
        // Look for the collapse indicator or clickable title area
        const target = /** @type {HTMLElement} */(event.target);
        return (
            target === calloutHeader ||
            target.classList.contains('callout-title') ||
            target.classList.contains('callout-icon') ||
            target.classList.contains('collapse-indicator') ||
            calloutHeader.contains(target)
        );
    }
    
    /**
     * Determine the current collapsed state of a callout
     * @param {HTMLElement} calloutElement - The callout element
     * @returns {boolean} Whether the callout is collapsed
     */
    determineCalloutState(calloutElement) {
        const calloutContent = /** @type {HTMLElement} */(calloutElement.children[1]);
        return (
            !calloutContent ||
            calloutContent.style.display === 'none' ||
            calloutContent.offsetHeight === 0 ||
            calloutElement.classList.contains('is-collapsed')
        );
    }
    
    /**
     * Set callout state by ID (used by the tracking system)
     * @param {string} calloutId - The callout ID
     * @param {boolean} collapsed - Whether collapsed
     */
    setCalloutStateById(calloutId, collapsed) {
        const stateTarget = this.renderer.mb.parseBindTarget(`calloutStates.${calloutId}`, this.renderer.spellbookFile.path);
        this.renderer.mb.setMetadata(stateTarget, collapsed);
    }
    
    /**
     * Debounce function to prevent excessive state saves
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        /** @type {NodeJS.Timeout | undefined} */
        let timeout;
        return function executedFunction(/** @type {...any} */ ...args) {
            const later = () => {
                if (timeout) clearTimeout(timeout);
                func(...args);
            };
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}