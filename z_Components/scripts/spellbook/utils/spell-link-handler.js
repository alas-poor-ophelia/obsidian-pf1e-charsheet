import '../types/types.js'; // Import type definitions

/**
 * @typedef {'default' | 'mainPane' | 'currentPane' | 'newWindow'} SpellLinkBehavior
 */

/**
 * Link behavior options for spell links
 * @enum {SpellLinkBehavior}
 */
export const SPELL_LINK_BEHAVIORS = {
    /** @type {'default'} */
    DEFAULT: 'default',        // Use Obsidian's default behavior
    /** @type {'mainPane'} */
    MAIN_PANE: 'mainPane',    // Force open in main pane (new tab)
    /** @type {'currentPane'} */
    CURRENT_PANE: 'currentPane', // Force open in current pane
    /** @type {'newWindow'} */
    NEW_WINDOW: 'newWindow'    // Force open in new window (desktop only)
};

/**
 * Handles spell link behaviors and click events for spellbook renderers.
 * 
 * The SpellLinkHandler class provides specialized handling for spell links within
 * the spellbook system. It supports different opening behaviors (default, main pane,
 * current pane, new window) and manages click events to provide a consistent
 * user experience across different spellbook renderer types.
 * 
 * This class is designed to be used as a component within spellbook renderers,
 * providing access to the renderer's state and metadata managers while
 * encapsulating all spell link-related functionality.
 * 
 * Key responsibilities:
 * - Configure and manage spell link opening behaviors
 * - Handle click events for spell links with appropriate navigation
 * - Provide context-aware spell link creation
 * - Integrate with Obsidian's workspace and pane management
 * - Support different user preferences and workflow patterns
 * 
 * Link behavior options:
 * - DEFAULT: Uses Obsidian's normal link handling (ctrl/cmd click for new tab)
 * - MAIN_PANE: Always opens in a new tab in the main pane
 * - CURRENT_PANE: Always opens in the current pane (replaces content)
 * - NEW_WINDOW: Always opens in a new window (desktop) or tab (mobile)
 * 
 * @example
 * ```javascript
 * // Create handler within a spellbook renderer
 * const linkHandler = new SpellLinkHandler(this);
 * 
 * // Configure behavior
 * linkHandler.setSpellLinkBehavior(SPELL_LINK_BEHAVIORS.MAIN_PANE);
 * 
 * // Use in spell rendering
 * const spellLink = linkHandler.createSpellLink(spell, spellLinkBehavior);
 * ```
 */
export class SpellLinkHandler {
    /**
     * Creates a new SpellLinkHandler instance.
     * 
     * @param {any} renderer - The spellbook renderer instance that owns this handler
     */
    constructor(renderer) {
        /**
         * Reference to the parent spellbook renderer
         * @type {any}
         * @private
         */
        this.renderer = renderer;
        
        /**
         * Current spell link behavior setting
         * @type {SpellLinkBehavior}
         * @private
         */
        this._spellLinkBehavior = SPELL_LINK_BEHAVIORS.DEFAULT;
    }
    
    /**
     * Sets the spell link behavior for this handler.
     * 
     * @param {SpellLinkBehavior} behavior - The behavior to use for spell links
     * @throws {Error} If the behavior is not a valid SPELL_LINK_BEHAVIORS value
     */
    setSpellLinkBehavior(behavior) {
        if (!behavior || typeof behavior !== 'string' || behavior.trim() === '') {
            console.warn(`Invalid spell link behavior type: ${typeof behavior}. Expected non-empty string.`);
            return;
        }
        
        if (!Object.values(SPELL_LINK_BEHAVIORS).includes(behavior)) {
            console.warn(`Invalid spell link behavior: "${behavior}". Valid options: ${Object.values(SPELL_LINK_BEHAVIORS).join(', ')}`);
            return;
        }
        
        const previousBehavior = this._spellLinkBehavior;
        this._spellLinkBehavior = behavior;
        
        if (previousBehavior !== behavior) {
            console.log(`Spell link behavior changed from "${previousBehavior}" to "${behavior}"`);
        }
    }
    
    /**
     * Gets the current spell link behavior setting.
     * 
     * @returns {SpellLinkBehavior} The current behavior setting
     */
    getSpellLinkBehavior() {
        return this._spellLinkBehavior;
    }
    
    /**
     * Dispose of all resources managed by this handler instance
     * This method ensures proper cleanup to prevent memory leaks
     */
    dispose() {
        // No active resources to clean up at the moment
        // Event listeners are managed by the renderer's container cleanup
        // Future: could add cleanup for any persistent handlers here
    }
    
    /**
     * Get all available spell link behaviors
     * @returns {SpellLinkBehavior[]} Array of available behaviors
     */
    getAvailableSpellLinkBehaviors() {
        return Object.values(SPELL_LINK_BEHAVIORS);
    }
    
    /**
     * Validate a spell link behavior string
     * @param {any} behavior - Behavior to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidSpellLinkBehavior(behavior) {
        return typeof behavior === 'string' && behavior.trim() !== '' && Object.values(SPELL_LINK_BEHAVIORS).includes(/** @type {SpellLinkBehavior} */ (behavior));
    }
    
    /**
     * Get spell link behavior configuration info
     * @returns {Object} Configuration information
     */
    getSpellLinkBehaviorInfo() {
        return {
            current: this._spellLinkBehavior,
            available: this.getAvailableSpellLinkBehaviors(),
            descriptions: {
                [SPELL_LINK_BEHAVIORS.DEFAULT]: 'Uses Obsidian\'s default behavior (ctrl/cmd click for new tab)',
                [SPELL_LINK_BEHAVIORS.MAIN_PANE]: 'Always opens in a new tab in the main pane',
                [SPELL_LINK_BEHAVIORS.CURRENT_PANE]: 'Always opens in the current pane (replaces content)',
                [SPELL_LINK_BEHAVIORS.NEW_WINDOW]: 'Always opens in a new window (desktop) or tab (mobile)'
            }
        };
    }
    
    /**
     * Open a file using the current spell link behavior
     * @param {string} filePath - Path to the file to open
     * @param {SpellLinkBehavior} [overrideBehavior] - Optional behavior to override the current setting
     * @returns {Promise<void>}
     */
    async openFileWithBehavior(filePath, overrideBehavior = null) {
        const behavior = overrideBehavior || this._spellLinkBehavior;
        
        // Get the file object
        const spellFile = window.app.vault.getAbstractFileByPath(filePath);
        if (!spellFile) {
            console.warn(`File not found: ${filePath}`);
            return;
        }
        
        try {
            switch (behavior) {
                case SPELL_LINK_BEHAVIORS.MAIN_PANE: {
                    // Use the existing sophisticated logic for main pane
                    const targetLeaf = await this.findBestTargetLeaf(filePath, spellFile);
                    
                    if (!targetLeaf) {
                        console.warn('Could not find suitable target leaf, falling back to default behavior');
                        window.app.workspace.openLinkText(filePath, '', false);
                        return;
                    }
                    
                    try {
                        if (targetLeaf.parent && targetLeaf.parent.children) {
                            const newLeaf = window.app.workspace.createLeafInParent(
                                targetLeaf.parent,
                                targetLeaf.parent.children.indexOf(targetLeaf) + 1
                            );
                            await newLeaf.openFile(spellFile);
                        } else {
                            await targetLeaf.openFile(spellFile);
                        }
                    } catch (createError) {
                        console.warn('Failed to create new tab, opening in target leaf directly:', createError);
                        await targetLeaf.openFile(spellFile);
                    }
                    break;
                }
                
                case SPELL_LINK_BEHAVIORS.CURRENT_PANE: {
                    const currentLeaf = window.app.workspace.getLeaf(false);
                    if (currentLeaf) {
                        await currentLeaf.openFile(spellFile);
                    } else {
                        window.app.workspace.openLinkText(filePath, '', false);
                    }
                    break;
                }
                
                case SPELL_LINK_BEHAVIORS.NEW_WINDOW: {
                    const newWindowLeaf = window.app.workspace.getLeaf('window');
                    if (newWindowLeaf) {
                        await newWindowLeaf.openFile(spellFile);
                    } else {
                        window.app.workspace.openLinkText(filePath, '', false);
                    }
                    break;
                }
                
                case SPELL_LINK_BEHAVIORS.DEFAULT:
                default: {
                    // Use Obsidian's default behavior
                    window.app.workspace.openLinkText(filePath, '', false);
                    break;
                }
            }
        } catch (error) {
            console.error('Error opening file with behavior:', error);
            // Fallback to default
            window.app.workspace.openLinkText(filePath, '', false);
        }
    }
    
    /**
     * Set up click handlers for spell links to open in main pane
     * @param {HTMLElement} container - Container element with spell links
     */
    setupSpellLinkHandlers(container) {
        // Create the click handler function
        const handleSpellLinkClick = async (/** @type {Event} */ event) => {
            // Early exit if using default behavior
            if (this._spellLinkBehavior === SPELL_LINK_BEHAVIORS.DEFAULT) {
                return; // Let Obsidian handle it normally
            }
            
            // Check if clicked element is a spell link
            const target = /** @type {HTMLElement} */ (event.target);
            if (!target || !target.matches || !target.matches('a.internal-link.spell-link')) {
                return;
            }


            // Additional validation for spell links
            if (target.getAttribute('data-href') === null && target.getAttribute('href') === null) {
                console.warn('Spell link found but no href attribute present');
                return;
            }
            
            // Prevent default behavior for custom handling
            event.preventDefault();
            event.stopPropagation();
            
            // Get the spell path from data-href attribute with enhanced validation
            const spellPath = this.extractSpellPath(target);
            if (!spellPath) {
                console.warn('No valid spell path found in link');
                return;
            }
            
            // Get the spell file with enhanced validation
            const spellFile = await this.validateSpellFile(spellPath);
            if (!spellFile) {
                console.warn(`Spell file not found or invalid: ${spellPath}`);
                return;
            }
            
            try {
                switch (this._spellLinkBehavior) {
                    case SPELL_LINK_BEHAVIORS.MAIN_PANE: {
                        // Use enhanced leaf finding logic with robust edge case handling
                        const targetLeaf = await this.findBestTargetLeaf(spellPath, spellFile);
                        
                        if (!targetLeaf) {
                            console.warn('Could not find suitable target leaf after all attempts, falling back to default behavior');
                            // Fallback to default behavior
                            window.app.workspace.openLinkText(spellPath, '', false);
                            return;
                        }
                        
                        // Try to create a new tab in the target leaf's parent
                        try {
                            if (targetLeaf.parent && targetLeaf.parent.children) {
                                const newLeaf = window.app.workspace.createLeafInParent(
                                    targetLeaf.parent,
                                    targetLeaf.parent.children.indexOf(targetLeaf) + 1
                                );
                                await newLeaf.openFile(spellFile);
                            } else {
                                // If parent structure is invalid, open in the target leaf directly
                                await targetLeaf.openFile(spellFile);
                            }
                        } catch (createError) {
                            console.warn('Failed to create new tab, opening in target leaf directly:', createError);
                            try {
                                await targetLeaf.openFile(spellFile);
                            } catch (openError) {
                                console.error('Failed to open file in target leaf:', openError);
                                // Final fallback to default behavior
                                window.app.workspace.openLinkText(spellPath, '', false);
                            }
                        }
                        break;
                    }
                    
                    case SPELL_LINK_BEHAVIORS.CURRENT_PANE: {
                        // Open in the current active leaf with enhanced error handling
                        const currentLeaf = await this.findCurrentActiveLeaf(spellPath);
                        
                        if (!currentLeaf) {
                            console.warn('Could not find current active leaf, falling back to default behavior');
                            window.app.workspace.openLinkText(spellPath, '', false);
                            return;
                        }
                        
                        try {
                            await currentLeaf.openFile(spellFile);
                        } catch (openError) {
                            console.error('Failed to open file in current pane:', openError);
                            // Fallback to default behavior
                            window.app.workspace.openLinkText(spellPath, '', false);
                        }
                        break;
                    }
                    
                    case SPELL_LINK_BEHAVIORS.NEW_WINDOW: {
                        // Open in a new window (desktop only) with enhanced error handling
                        const success = await this.openInNewWindow(spellFile, spellPath);
                        
                        if (!success) {
                            console.warn('Failed to open in new window/tab, falling back to default behavior');
                            window.app.workspace.openLinkText(spellPath, '', false);
                        }
                        break;
                    }
                    
                    default:
                        console.warn(`Unknown spell link behavior: ${this._spellLinkBehavior}, falling back to default behavior`);
                        // Fallback to default Obsidian behavior
                        window.app.workspace.openLinkText(spellPath, '', false);
                        break;
                }
            } catch (error) {
                console.error('Error opening spell file:', error);
                // Fall back to Obsidian's default link handling
                try {
                    window.app.workspace.openLinkText(spellPath, '', false);
                } catch (fallbackError) {
                    console.error('Fallback link opening also failed:', fallbackError);
                    // Last resort: try to open in browser (probably won't work for vault files)
                    window.open(spellPath);
                }
            }
        };
        
        // Add event listener using event delegation
        container.addEventListener('click', handleSpellLinkClick);
        
        // Track the cleanup function for this container
        if (this.renderer && this.renderer.containerManager && typeof this.renderer.containerManager._trackContainerResource === 'function') {
            this.renderer.containerManager._trackContainerResource(container, () => {
                container.removeEventListener('click', handleSpellLinkClick);
            });
        }
    }
    
    /**
     * Enhanced leaf finding logic with robust edge case handling
     * 
     * This method implements Phase 3.1 of the spell link enhancement plan, providing
     * comprehensive edge case handling for various workspace scenarios:
     * 
     * - Better target leaf detection for main split vs sidebars
     * - Iteration through root leaves to find suitable targets  
     * - Mobile vs desktop platform differences
     * - Workspace API availability checks and fallback handling
     * - Multiple prioritization strategies (active > editable > any view)
     * - Graceful degradation when APIs are unavailable
     * - Comprehensive logging for debugging complex workspace states
     * 
     * @param {string} spellPath - Path to the spell file for logging
     * @param {any} spellFile - The spell file object
     * @returns {Promise<any|null>} The best target leaf or null if none found
     */
    async findBestTargetLeaf(spellPath, spellFile) {
        try {
            // Step 1: Try to get the most recent leaf (primary strategy)
            let targetLeaf = null;
            
            try {
                targetLeaf = window.app.workspace.getMostRecentLeaf();
                console.debug('Found most recent leaf:', targetLeaf?.view?.getViewType() || 'unknown');
            } catch (error) {
                console.debug('getMostRecentLeaf failed:', error);
            }
            
            // Step 2: Validate the leaf is in the main split (not sidebar)
            if (targetLeaf) {
                try {
                    const leafRoot = targetLeaf.getRoot();
                    const workspaceRoot = window.app.workspace.rootSplit;
                    
                    if (leafRoot === workspaceRoot) {
                        console.debug('Most recent leaf is in main split, using it');
                        return targetLeaf;
                    } else {
                        console.debug('Most recent leaf is in sidebar, need to find main split leaf');
                        targetLeaf = null; // Reset to search for better target
                    }
                } catch (error) {
                    console.debug('Error checking leaf root, will search for alternatives:', error);
                    targetLeaf = null;
                }
            }
            
            // Step 3: Iterate through root leaves to find a suitable target
            if (!targetLeaf) {
                try {
                    /** @type {any} */
                    let foundLeaf = null;
                    /** @type {any} */
                    let activeLeaf = null;
                    /** @type {any} */
                    let editableLeaf = null;
                    
                    // Check if iterateRootLeaves is available (might not be on all Obsidian versions)
                    if (typeof window.app.workspace.iterateRootLeaves === 'function') {
                        window.app.workspace.iterateRootLeaves((/** @type {any} */ leaf) => {
                            try {
                                // Prioritize active leaves
                                if (leaf === window.app.workspace.activeLeaf && !activeLeaf) {
                                    activeLeaf = leaf;
                                }
                                
                                // Look for leaves with editable views (markdown, canvas, etc.)
                                if (leaf.view && this.isEditableView(leaf.view) && !editableLeaf) {
                                    editableLeaf = leaf;
                                }
                                
                                // Any leaf with a view as last resort
                                if (leaf.view && !foundLeaf) {
                                    foundLeaf = leaf;
                                }
                            } catch (leafError) {
                                console.debug('Error checking leaf during iteration:', leafError);
                            }
                        });
                        
                        // Prioritize: active > editable > any with view
                        targetLeaf = activeLeaf || editableLeaf || foundLeaf;
                        
                        if (targetLeaf) {
                            console.debug('Found suitable leaf via iteration:', {
                                type: activeLeaf ? 'active' : editableLeaf ? 'editable' : 'generic',
                                viewType: targetLeaf.view?.getViewType() || 'unknown'
                            });
                        }
                    } else {
                        console.debug('iterateRootLeaves not available, trying alternative methods');
                    }
                } catch (error) {
                    console.debug('Error during root leaf iteration:', error);
                }
            }
            
            // Step 4: Try alternative methods if iteration failed
            if (!targetLeaf) {
                try {
                    // Try to get the active leaf directly
                    const activeLeaf = window.app.workspace.activeLeaf;
                    if (activeLeaf && activeLeaf.view) {
                        console.debug('Using active leaf as fallback');
                        targetLeaf = activeLeaf;
                    }
                } catch (error) {
                    console.debug('Could not get active leaf:', error);
                }
            }
            
            // Step 5: Mobile-specific handling
            if (!targetLeaf && window.app.isMobile) {
                try {
                    console.debug('Mobile device detected, using mobile-optimized leaf finding');
                    // On mobile, the workspace structure is different
                    // Try to get any available leaf
                    targetLeaf = window.app.workspace.getLeaf(false);
                    if (targetLeaf) {
                        console.debug('Found leaf via mobile fallback');
                    }
                } catch (error) {
                    console.debug('Mobile leaf finding failed:', error);
                }
            }
            
            // Step 6: Try workspace API alternatives (desktop fallbacks)
            if (!targetLeaf && !window.app.isMobile) {
                try {
                    // Try to get or create a new tab in the main workspace
                    console.debug('Desktop fallback: attempting to create new tab');
                    targetLeaf = window.app.workspace.getLeaf('tab');
                    
                    if (targetLeaf) {
                        console.debug('Created new tab as fallback');
                    }
                } catch (error) {
                    console.debug('Could not create new tab:', error);
                }
            }
            
            // Step 7: Final validation and workspace state checks
            if (targetLeaf) {
                try {
                    // Validate the leaf is functional
                    if (!targetLeaf.view) {
                        console.debug('Target leaf has no view, might be corrupted');
                        return null;
                    }
                    
                    // Check if the leaf's parent exists and is valid
                    if (targetLeaf.parent) {
                        if (!targetLeaf.parent.children || !Array.isArray(targetLeaf.parent.children)) {
                            console.debug('Target leaf parent has invalid children structure');
                            // Still return the leaf, but caller will handle parent issues
                        }
                    }
                    
                    console.debug('Successfully found and validated target leaf:', {
                        viewType: targetLeaf.view.getViewType(),
                        hasParent: !!targetLeaf.parent,
                        parentChildrenCount: targetLeaf.parent?.children?.length || 0
                    });
                    
                    return targetLeaf;
                } catch (validationError) {
                    console.warn('Target leaf validation failed:', validationError);
                    return null;
                }
            }
            
            console.warn('No suitable target leaf found after all attempts for:', spellPath);
            return null;
            
        } catch (criticalError) {
            console.error('Critical error in _findBestTargetLeaf:', criticalError);
            return null;
        }
    }
    
    /**
     * Check if a view is editable (good target for new content)
     * @param {any} view - The view to check
     * @returns {boolean} True if the view is editable
     */
    isEditableView(view) {
        try {
            const viewType = view.getViewType();
            // Prioritize views that are good for displaying new content
            const editableTypes = [
                'markdown',
                'canvas',
                'empty',
                'graph',
                'search',
                'file-explorer'
            ];
            
            return editableTypes.includes(viewType);
        } catch (error) {
            console.debug('Error checking view type:', error);
            return false;
        }
    }
    
    /**
     * Find the current active leaf with robust error handling
     * @param {string} spellPath - Path to the spell file for logging
     * @returns {Promise<any|null>} The active leaf or null if none found
     */
    async findCurrentActiveLeaf(spellPath) {
        try {
            // Step 1: Try the standard getLeaf method
            let currentLeaf = null;
            
            try {
                currentLeaf = window.app.workspace.getLeaf(false);
                if (currentLeaf && currentLeaf.view) {
                    console.debug('Found current leaf via getLeaf(false)');
                    return currentLeaf;
                }
            } catch (error) {
                console.debug('getLeaf(false) failed:', error);
            }
            
            // Step 2: Try to get the active leaf directly
            try {
                currentLeaf = window.app.workspace.activeLeaf;
                if (currentLeaf && currentLeaf.view) {
                    console.debug('Found current leaf via activeLeaf property');
                    return currentLeaf;
                }
            } catch (error) {
                console.debug('activeLeaf property access failed:', error);
            }
            
            // Step 3: Try to get the most recent leaf as fallback
            try {
                currentLeaf = window.app.workspace.getMostRecentLeaf();
                if (currentLeaf && currentLeaf.view) {
                    console.debug('Using most recent leaf as current leaf fallback');
                    return currentLeaf;
                }
            } catch (error) {
                console.debug('getMostRecentLeaf fallback failed:', error);
            }
            
            // Step 4: Mobile-specific handling
            if (window.app.isMobile) {
                try {
                    console.debug('Mobile device: trying mobile-specific leaf finding');
                    // On mobile, try to get any available leaf
                    currentLeaf = window.app.workspace.getLeaf('tab');
                    if (currentLeaf) {
                        console.debug('Found leaf via mobile tab creation');
                        return currentLeaf;
                    }
                } catch (error) {
                    console.debug('Mobile current leaf finding failed:', error);
                }
            }
            
            // Step 5: Last resort - try to create a new leaf
            try {
                console.debug('Last resort: creating new leaf for current pane behavior');
                currentLeaf = window.app.workspace.getLeaf('tab');
                if (currentLeaf) {
                    console.debug('Created new leaf as current leaf fallback');
                    return currentLeaf;
                }
            } catch (error) {
                console.debug('Could not create new leaf as fallback:', error);
            }
            
            console.warn('No current active leaf found after all attempts for:', spellPath);
            return null;
            
        } catch (criticalError) {
            console.error('Critical error in _findCurrentActiveLeaf:', criticalError);
            return null;
        }
    }
    
    /**
     * Open file in new window with robust error handling and mobile fallbacks
     * @param {any} spellFile - The spell file to open
     * @param {string} spellPath - Path to the spell file for logging
     * @returns {Promise<boolean>} True if successfully opened, false otherwise
     */
    async openInNewWindow(spellFile, spellPath) {
        try {
            // Step 1: Handle mobile devices (no new window support)
            if (window.app.isMobile) {
                console.debug('Mobile device detected, falling back to new tab instead of window');
                
                try {
                    const newLeaf = window.app.workspace.getLeaf('tab');
                    if (newLeaf) {
                        await newLeaf.openFile(spellFile);
                        console.debug('Successfully opened in new tab on mobile');
                        return true;
                    } else {
                        console.debug('Could not create new tab on mobile');
                        return false;
                    }
                } catch (mobileError) {
                    console.debug('Mobile new tab creation failed:', mobileError);
                    return false;
                }
            }
            
            // Step 2: Desktop - try to create new window
            try {
                console.debug('Desktop device: attempting to create new window');
                const newWindowLeaf = window.app.workspace.getLeaf('window');
                
                if (newWindowLeaf) {
                    await newWindowLeaf.openFile(spellFile);
                    console.debug('Successfully opened in new window');
                    return true;
                } else {
                    console.debug('New window creation returned null, trying fallbacks');
                }
            } catch (windowError) {
                console.debug('New window creation failed:', windowError);
            }
            
            // Step 3: Desktop fallback - try new tab
            try {
                console.debug('Desktop fallback: attempting to create new tab');
                const newTabLeaf = window.app.workspace.getLeaf('tab');
                
                if (newTabLeaf) {
                    await newTabLeaf.openFile(spellFile);
                    console.debug('Successfully opened in new tab as fallback');
                    return true;
                } else {
                    console.debug('New tab creation also returned null');
                }
            } catch (tabError) {
                console.debug('New tab fallback failed:', tabError);
            }
            
            // Step 4: Try alternative leaf creation methods
            try {
                console.debug('Trying alternative leaf creation methods');
                
                // Try to get or create any available leaf
                const fallbackLeaf = window.app.workspace.getLeaf(true); // Force new leaf
                
                if (fallbackLeaf) {
                    await fallbackLeaf.openFile(spellFile);
                    console.debug('Successfully opened using alternative leaf creation');
                    return true;
                }
            } catch (alternativeError) {
                console.debug('Alternative leaf creation failed:', alternativeError);
            }
            
            // Step 5: Check for workspace API availability issues
            if (!window.app.workspace.getLeaf) {
                console.warn('Workspace API getLeaf method not available - Obsidian version compatibility issue?');
                return false;
            }
            
            console.warn('All new window/tab creation methods failed for:', spellPath);
            return false;
            
        } catch (criticalError) {
            console.error('Critical error in _openInNewWindow:', criticalError);
            return false;
        }
    }
    
    /**
     * Extract spell path from link element with robust validation
     * @param {HTMLElement} linkElement - The link element to extract path from
     * @returns {string|null} The spell path or null if invalid
     */
    extractSpellPath(linkElement) {
        try {
            // Primary method: data-href attribute (preferred)
            let spellPath = linkElement.getAttribute('data-href');
            if (spellPath && this.isValidSpellPath(spellPath)) {
                console.debug('Found spell path via data-href:', spellPath);
                return spellPath;
            }
            
            // Fallback method: href attribute
            spellPath = linkElement.getAttribute('href');
            if (spellPath && this.isValidSpellPath(spellPath)) {
                console.debug('Found spell path via href:', spellPath);
                return spellPath;
            }
            
            // Alternative method: check for nested link elements
            const nestedLink = linkElement.querySelector('a[data-href], a[href]');
            if (nestedLink) {
                spellPath = nestedLink.getAttribute('data-href') || nestedLink.getAttribute('href');
                if (spellPath && this.isValidSpellPath(spellPath)) {
                    console.debug('Found spell path via nested link:', spellPath);
                    return spellPath;
                }
            }
            
            // Check parent elements for the path (in case event bubbled)
            let parentElement = linkElement.parentElement;
            let attempts = 0;
            while (parentElement && attempts < 3) { // Limit search depth
                if (parentElement.tagName === 'A') {
                    spellPath = parentElement.getAttribute('data-href') || parentElement.getAttribute('href');
                    if (spellPath && this.isValidSpellPath(spellPath)) {
                        console.debug('Found spell path via parent element:', spellPath);
                        return spellPath;
                    }
                }
                parentElement = parentElement.parentElement;
                attempts++;
            }
            
            console.debug('No valid spell path found in link element');
            return null;
            
        } catch (error) {
            console.error('Error extracting spell path:', error);
            return null;
        }
    }
    
    /**
     * Validate that a spell path looks correct
     * @param {string} path - The path to validate
     * @returns {boolean} True if the path appears valid
     */
    isValidSpellPath(path) {
        if (!path || typeof path !== 'string' || path.trim() === '') {
            return false;
        }
        
        // Remove leading/trailing whitespace
        path = path.trim();
        
        // Check for common invalid patterns
        if (path === '#' || path === 'javascript:void(0)' || path.startsWith('http')) {
            return false;
        }
        
        // Must end with .md for Obsidian files
        if (!path.endsWith('.md')) {
            return false;
        }
        
        // Should contain "spell" in the path (reasonable assumption for spell database)
        if (!path.toLowerCase().includes('spell')) {
            console.debug('Warning: path does not contain "spell":', path);
            // Don't reject, but log as it might be unexpected
        }
        
        return true;
    }
    
    /**
     * Validate and get spell file with enhanced error handling
     * @param {string} spellPath - Path to the spell file
     * @returns {Promise<any|null>} The spell file or null if invalid
     */
    async validateSpellFile(spellPath) {
        try {
            // Step 1: Basic validation
            if (!spellPath || typeof spellPath !== 'string') {
                console.debug('Invalid spell path type:', typeof spellPath);
                return null;
            }
            
            // Step 2: Check if vault is available
            if (!window.app.vault) {
                console.warn('Obsidian vault not available');
                return null;
            }
            
            // Step 3: Try to get the file
            let spellFile = null;
            try {
                spellFile = window.app.vault.getAbstractFileByPath(spellPath);
            } catch (error) {
                console.debug('getAbstractFileByPath failed:', error);
            }
            
            // Step 4: If not found, try normalizing the path
            if (!spellFile) {
                try {
                    // Try with different path normalization
                    const normalizedPath = spellPath.startsWith('./') ? spellPath.substring(2) : spellPath;
                    spellFile = window.app.vault.getAbstractFileByPath(normalizedPath);
                    
                    if (spellFile) {
                        console.debug('Found file with normalized path:', normalizedPath);
                    }
                } catch (error) {
                    console.debug('Normalized path attempt failed:', error);
                }
            }
            
            // Step 5: If still not found, try searching by name
            if (!spellFile) {
                try {
                    const fileName = spellPath.split('/').pop(); // Get just the filename
                    if (fileName) {
                        const allFiles = window.app.vault.getMarkdownFiles();
                        spellFile = allFiles.find((/** @type {any} */ file) => file.name === fileName);
                        
                        if (spellFile) {
                            console.debug('Found file by filename search:', fileName);
                        }
                    }
                } catch (error) {
                    console.debug('Filename search failed:', error);
                }
            }
            
            // Step 6: Validate the file is actually a file (not a folder)
            if (spellFile) {
                try {
                    // Check if it's a TFile (not TFolder)
                    if (spellFile.extension && spellFile.extension === 'md') {
                        console.debug('Successfully validated spell file:', spellFile.path);
                        return spellFile;
                    } else {
                        console.debug('File found but not a markdown file:', spellFile);
                        return null;
                    }
                } catch (error) {
                    console.debug('File validation failed:', error);
                    return null;
                }
            }
            
            console.debug('Spell file not found after all attempts:', spellPath);
            return null;
            
        } catch (criticalError) {
            console.error('Critical error in _validateSpellFile:', criticalError);
            return null;
        }
    }
}