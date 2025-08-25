// Core manager imports - these handle the heavy lifting
import { SpellMetadataManager } from '../managers/spell-metadata.js';
import { SLAManager } from '../managers/sla-manager.js';
import { SpellLinkHandler, SPELL_LINK_BEHAVIORS } from '../utils/spell-link-handler.js';
import { ContainerManager } from '../managers/container-manager.js';
import { UIComponentFactory } from '../ui/ui-component-factory.js';
import { SpellPreparationManager } from '../managers/spell-preparation-manager.js';
import { CalloutManager } from '../utils/callout-manager.js';
import { LiveUpdatesManager } from '../managers/live-updates-manager.js';
import { ConfigManager } from '../managers/config-manager.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {'default' | 'mainPane' | 'currentPane' | 'newWindow'} SpellLinkBehavior
 */

/**
 * @typedef {import('../types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').JSEngine} JSEngine
 * @typedef {import('../types/types.js').JSEngineContext} JSEngineContext
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').Preparation} Preparation
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 * @typedef {import('../types/types.js').CastingClass} CastingClass
 */

export class SpellbookRenderer {
    /** @type {MetaBindAPI} */
    mb;
    /** @type {string} */
    spellbookNotePath;
    /** @type {import('obsidian').TFile} */
    spellbookFile;
    /** @type {SpellMetadataManager} */
    metadataManager;
    /** @type {SLAManager} */
    slaManager;
    /** @type {SpellPreparationManager} */
    preparationManager;
    /** @type {ConfigManager} */
    configManager;

    /**
     * @param {MetaBindAPI} mb - Meta Bind API instance
     * @param {string} spellbookNotePath - Path to the spellbook file
     */
    constructor(mb, spellbookNotePath = 'MiniSheet/z_Components/spellbooks/SpellBookTest.md') {
        this.mb = mb;
        this.spellbookNotePath = spellbookNotePath;
        this.spellbookFile = window.app.vault.getAbstractFileByPath(spellbookNotePath);
        this.metadataManager = new SpellMetadataManager(mb, spellbookNotePath);
        this.slaManager = new SLAManager(mb, spellbookNotePath, this.metadataManager);
        this.preparationManager = new SpellPreparationManager(this, this.spellbookFile);
        this.spellLinkHandler = new SpellLinkHandler(this);
        this.containerManager = new ContainerManager(this);
        this.uiFactory = new UIComponentFactory(this);
        this.calloutManager = new CalloutManager(this);
        this.liveUpdatesManager = new LiveUpdatesManager(this);
        this.configManager = new ConfigManager(this);

        // Initialize spell link behavior configuration
        /** @type {SpellLinkBehavior} */
        this.spellLinkBehavior = SPELL_LINK_BEHAVIORS.MAIN_PANE;
        
        // Check for global configuration from Obsidian settings
        try {
            // Try to read from plugin settings first
            const globalBehavior = window.app.vault.getConfig('spellbook.linkBehavior');
            if (this.spellLinkHandler.isValidSpellLinkBehavior(globalBehavior)) {
                this.spellLinkBehavior = globalBehavior;
                this.spellLinkHandler.setSpellLinkBehavior(globalBehavior);
                console.debug(`Loaded global spell link behavior: ${globalBehavior}`);
            }
        } catch (e) {
            // Silently fall back to default if settings unavailable
            // This is expected behavior when no global setting is configured
        }
        
        // Alternative: Check for configuration in workspace settings
        try {
            const workspaceConfig = window.app.workspace.getConfig?.();
            if (workspaceConfig?.spellbook?.linkBehavior) {
                const workspaceBehavior = workspaceConfig.spellbook.linkBehavior;
                if (this.spellLinkHandler.isValidSpellLinkBehavior(workspaceBehavior)) {
                    this.spellLinkBehavior = workspaceBehavior;
                    this.spellLinkHandler.setSpellLinkBehavior(workspaceBehavior);
                    console.debug(`Loaded workspace spell link behavior: ${workspaceBehavior}`);
                }
            }
        } catch (e) {
            // Silently fall back to default if workspace settings unavailable
        }
        
        // Set the initial behavior in the handler
        this.spellLinkHandler.setSpellLinkBehavior(this.spellLinkBehavior);

        // Initialize disposal tracking
        this._disposables = new Set();
        this._disposed = false;

        if (!this.spellbookFile) {
            throw new Error(`Spellbook file "${spellbookNotePath}" not found`);
        }
    }

    /**
     * Dispose of all resources managed by this renderer instance
     * This method ensures proper cleanup to prevent memory leaks
     */
    dispose() {
        if (this._disposed) {
            return; // Already disposed
        }

        // Dispose sub-managers first
        if (this.metadataManager && typeof this.metadataManager.dispose === 'function') {
            try {
                this.metadataManager.dispose();
            } catch (error) {
                console.warn('Error disposing metadataManager:', error);
            }
        }

        if (this.slaManager && typeof this.slaManager.dispose === 'function') {
            try {
                this.slaManager.dispose();
            } catch (error) {
                console.warn('Error disposing slaManager:', error);
            }
        }

        if (this.spellLinkHandler && typeof this.spellLinkHandler.dispose === 'function') {
            try {
                this.spellLinkHandler.dispose();
            } catch (error) {
                console.warn('Error disposing spellLinkHandler:', error);
            }
        }

        if (this.containerManager && typeof this.containerManager.dispose === 'function') {
            try {
                this.containerManager.dispose();
            } catch (error) {
                console.warn('Error disposing containerManager:', error);
            }
        }

        if (this.uiFactory && typeof this.uiFactory.dispose === 'function') {
            try {
                this.uiFactory.dispose();
            } catch (error) {
                console.warn('Error disposing uiFactory:', error);
            }
        }

        if (this.preparationManager && typeof this.preparationManager.dispose === 'function') {
            try {
                this.preparationManager.dispose();
            } catch (error) {
                console.warn('Error disposing preparationManager:', error);
            }
        }

        if (this.calloutManager && typeof this.calloutManager.cleanup === 'function') {
            try {
                this.calloutManager.cleanup();
            } catch (error) {
                console.warn('Error disposing calloutManager:', error);
            }
        }

        if (this.liveUpdatesManager && typeof this.liveUpdatesManager.dispose === 'function') {
            try {
                this.liveUpdatesManager.dispose();
            } catch (error) {
                console.warn('Error disposing liveUpdatesManager:', error);
            }
        }

        if (this.configManager && typeof this.configManager.dispose === 'function') {
            try {
                this.configManager.dispose();
            } catch (error) {
                console.warn('Error disposing configManager:', error);
            }
        }

        // Execute all registered cleanup functions
        for (const disposable of this._disposables) {
            try {
                if (typeof disposable === 'function') {
                    disposable();
                } else if (disposable && typeof disposable.dispose === 'function') {
                    disposable.dispose();
                }
            } catch (error) {
                console.warn('Error during disposal:', error);
            }
        }

        // Clear the disposables set
        this._disposables.clear();


        // Mark as disposed
        this._disposed = true;
    }

    // Container management is now handled internally by managers
    
    /**
     * Helper to register cleanup with component lifecycle and track it
     * @param {Component} component - Component for lifecycle management
     * @param {() => void} cleanupFn - Cleanup function to register
     */
    _registerComponentCleanup(component, cleanupFn) {
        return this.containerManager._registerComponentCleanup(component, cleanupFn);
    }

    // Spell link handling is now managed internally by SpellLinkHandler

    /**
     * Set the behavior for how spell links are opened
     * @param {SpellLinkBehavior} behavior - The desired link behavior
     */
    setSpellLinkBehavior(behavior) {
        this.spellLinkHandler.setSpellLinkBehavior(behavior);
        // Also update our instance variable for backward compatibility
        this.spellLinkBehavior = behavior;
    }

    /**
     * Get the current spell link behavior
     * @returns {SpellLinkBehavior} The current link behavior
     */
    getSpellLinkBehavior() {
        return this.spellLinkBehavior;
    }
    
    /**
     * Get all available spell link behaviors
     * @returns {SpellLinkBehavior[]} Array of available behaviors
     */
    getAvailableSpellLinkBehaviors() {
        return this.spellLinkHandler.getAvailableSpellLinkBehaviors();
    }
    
    /**
     * Validate a spell link behavior string
     * @param {string} behavior - Behavior to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidSpellLinkBehavior(behavior) {
        return this.spellLinkHandler.isValidSpellLinkBehavior(behavior);
    }
    
    /**
     * Get spell link behavior configuration info
     * @returns {Object} Configuration information
     */
    getSpellLinkBehaviorInfo() {
        return this.spellLinkHandler.getSpellLinkBehaviorInfo();
    }

    /**
     * Setup container for rendering - handle re-renders properly
     * This is kept as public API for renderer subclasses
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle management
     * @returns {boolean} True if should proceed with rendering
     */
    _setupContainerForRender(container, component) {
        return this.containerManager._setupContainerForRender(container, component);
    }

    /**
     * Get active metamagics for a specific spell level
     * @param {SpellLevel} spellLevel - The spell level to check
     * @returns {import('../types/types.js').MetamagicType[]} Array of active metamagics
     */
    getActiveMetamagics(spellLevel) {
        return this.metadataManager.getActiveMetamagics(spellLevel);
    }

    /**
     * Get available spell slots for a level (base + bonus from stat)
     * @param {number} spellLevel - The spell level to check
     * @returns {number} Total spell slots available
     */
    getAvailableSpellSlots(spellLevel) {
        return this.metadataManager.getAvailableSpellSlots(/** @type {import('../types/types.js').SpellLevel} */(spellLevel));
    }

    /**
     * Get remaining spell slots for a level
     * @param {SpellLevel} spellLevel - The spell level to check
     * @returns {number|null} Remaining spell slots
     */
    getRemainingSpellSlots(spellLevel) {
        return this.metadataManager.getRemainingSpellSlots(spellLevel);
    }

    /**
    * Get casting class from frontmatter
    * @returns {string} The casting class
    */
    getCastingClass() {
        return this.metadataManager.getCastingClass();
    }

    /**
     * Get caster level from frontmatter
     * @returns {number} The caster level
     */
    getCasterLevel() {
        return this.metadataManager.getCasterLevel();
    }

    /**
     * Get casting stat bonus from frontmatter
     * @returns {number} The casting stat modifier
     */
    getCastingStatBonus() {
        return this.metadataManager.getCastingStatBonus();
    }

    /**
     * Count prepared spells for a specific level (calculated from actual preparations)
     * @param {SpellLevel} targetLevel - The spell level to count
     * @returns {number} Number of prepared spells
     */
    countPreparedSpellsForLevel(targetLevel) {
        return this.preparationManager.countPreparedSpellsForLevel(targetLevel);
    }

    /**
     * Create spell slots tracker for a level
     * @param {SpellLevel} spellLevel - The spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle management
     * @returns {HTMLElement} The tracker container
     */
    createSpellSlotsTracker(spellLevel, container, component) {
        return this.uiFactory.createSpellSlotsTracker(spellLevel, container, component);
    }

    /**
     * Create metamagic selector for a spell level
     * @param {SpellLevel} spellLevel - The spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle management
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     * @returns {Promise<HTMLElement>} The metamagic selector container
     */
    async createMetamagicSelector(spellLevel, container, component, context, engine) {
        // Delegate to UIComponentFactory for metamagic UI creation
        return await this.uiFactory.createMetamagicSelector(spellLevel, container, component, context, engine);
    }

    /**
     * Create over-preparation warning message
     * @param {SpellLevel} spellLevel - The spell level
     * @param {number} maxSlots - Maximum available slots
     * @param {number} totalPrepared - Total prepared spells
     * @param {HTMLElement} container - Container element
     */
    _createOverPreparationWarning(spellLevel, maxSlots, totalPrepared, container) {
        return this.uiFactory._createOverPreparationWarning(spellLevel, maxSlots, totalPrepared, container);
    }

    /**
     * Get spells for a specific level
     * @param {SpellLevel} level - The spell level
     * @returns {Spell[]} Array of spells
     */
    getSpellsByLevel(level) {
        return this.preparationManager.getSpellsByLevel(level);
    }

    /**
     * Get index of spell by name
     * @param {string} spellName - Name of the spell
     * @returns {number} Index of the spell (-1 if not found)
     */
    getSpellIndex(spellName) {
        return this.preparationManager.getSpellIndex(spellName);
    }

    /**
     * Get spell by ID from the spells array
     * @param {number} spellId - ID of the spell
     * @returns {Spell|null} The spell object or null if not found
     */
    getSpellById(spellId) {
        return this.preparationManager.getSpellById(spellId);
    }

    /**
     * Get all spell preparations for a specific level
     * @param {SpellLevel} targetLevel - The target spell level
     * @returns {import('../types/types.js').SpellPreparation[]} Array of spell preparations
     */
    getPreparationsForLevel(targetLevel) {
        return this.preparationManager.getPreparationsForLevel(targetLevel);
    }

    /**
     * Get prepared spells filtered by adjusted level
     * @param {SpellLevel} targetLevel - Target spell level
     * @returns {any[]} Prepared spells array
     */
    getPreparedSpellsByLevel(targetLevel) {
        return this.preparationManager.getPreparedSpellsByLevel(targetLevel);
    }

    findOrCreatePreparation(/** @type {Spell} */ spell, /** @type {SpellLevel} */ adjustedLevel, /** @type {MetamagicType[]} */ metamagicArray) {
        return this.preparationManager.findOrCreatePreparation(spell, adjustedLevel, metamagicArray);
    }

    /**
     * Reset all preparation counts - Updated reset method that gets class info from frontmatter
     */
    resetAllPreparationCounts(resetMetamagics = false, resetPreparations = false, resetSLAs = true) {
        return this.preparationManager.resetAllPreparationCounts(resetMetamagics, resetPreparations, resetSLAs);
    }

    /**
     * Helper method to create callout wrapper with persistent state
     * This is kept for renderer subclasses that need callout functionality
     * @param {string} title - Title for the callout
     * @param {HTMLElement} container - Container element
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     * @param {Component} component - Component for lifecycle management
     * @param {string} calloutType - Type of callout
     * @param {boolean} defaultCollapsed - Default collapsed state if not stored
     * @param {string} contextKey - Additional context for unique identification
     * @returns {Promise<HTMLElement>} The callout content element
     */
    async _createCalloutWrapper(title, container, context, engine, component, calloutType = "collapse-clean", defaultCollapsed = false, contextKey = '') {
        return await this.calloutManager._createCalloutWrapper(title, container, context, engine, component, calloutType, defaultCollapsed, contextKey);
    }

    /**
     * Set up live updates for spell rendering
     * @param {Function} renderFunction - Function to call on updates
     * @param {Component} component - Component for lifecycle management
     * @param {number|null|'sla'} spellLevel - Optional specific spell level to watch (null watches all)
     * @param {string} viewType - Type of view ("known", "prepared", "sla")
     */
    setupLiveUpdates(renderFunction, component, spellLevel = null, viewType = "known") {
        return this.liveUpdatesManager.setupLiveUpdates(renderFunction, component, spellLevel, viewType);
    }


    /**
     * Render Spell-Like Abilities section
     * @param {HTMLElement} container - Container to render in
     * @param {import('../types/types.js').Component} component - Component for cleanup
     * @param {import('../types/types.js').JSEngineContext} context - Rendering context
     * @param {import('../types/types.js').JSEngine} engine - Markdown engine
     */
    async renderSpellLikeAbilities(container, component, context, engine) {
        if (!this._setupContainerForRender(container, component)) {
            return; // Already rendered, skip
        }

        // Delegate to the SLAManager for proper modular rendering
        await this.slaManager.renderSLAs(container, component, context, engine, this._createCalloutWrapper.bind(this));
    }

    /**
     * Render ConfigManager view (gear icon and flyout menu)
     * @param {HTMLElement} container - Container to render in
     * @param {import('../types/types.js').Component} component - Component for cleanup
     * @param {import('../types/types.js').JSEngineContext} context - Rendering context
     * @param {import('../types/types.js').JSEngine} engine - Markdown engine
     */
    async renderConfigView(container, component, context, engine) {
        if (!this._setupContainerForRender(container, component)) {
            return; // Already rendered, skip
        }
        if (this.configManager && typeof this.configManager.createGearIcon === 'function') {
            // Store the component for Meta Bind usage
            this.configManager.setRenderComponent(component);
            this.configManager.createGearIcon(container);
        }
    }

    /**
     * Reset all SLA uses to their maximum daily values
     * @returns {Promise<void>} Promise that resolves when reset is complete
     */
    /**
     * Get SLA reset updates
     * @returns {import('../types/domain.js').MetadataUpdate[]} Array of SLA reset updates
     */
    getSLAResetUpdates() {
        return this.slaManager.getSLAResetUpdates();
    }

    resetAllSLAs() {
        return this.slaManager.resetAllSLAs();
    }

    // Abstract methods that must be implemented by subclasses
    /**
     * Render known spells for a specific level - must be implemented by subclass
     * @param {SpellLevel} _level - Spell level
     * @param {HTMLElement} _container - Container element
     * @param {Component} _component - Component object
     * @param {JSEngineContext} _context - Context object
     * @param {JSEngine} _engine - Engine object
     * @returns {Promise<void>}
     */
    async renderKnownSpellsByLevel(_level, _container, _component, _context, _engine) {
        throw new Error('renderKnownSpellsByLevel must be implemented by concrete renderer subclass');
    }

    /**
     * Render prepared spells for a specific level - must be implemented by subclass
     * @param {SpellLevel} _level - Spell level
     * @param {HTMLElement} _container - Container element
     * @param {Component} _component - Component object
     * @param {JSEngineContext} _context - Context object
     * @param {JSEngine} _engine - Engine object
     * @returns {Promise<void>}
     */
    async renderPreparedSpellsByLevel(_level, _container, _component, _context, _engine) {
        throw new Error('renderPreparedSpellsByLevel must be implemented by concrete renderer subclass');
    }
}

/**
 * Factory function to create a SpellbookRenderer instance
 * @param {MetaBindAPI} _mb - MetaBind instance
 * @param {string} _spellbookNotePath - Path to the spellbook file
 * @returns {SpellbookRenderer} Configured SpellbookRenderer instance
 * @deprecated Use renderer-factory.js createSpellbookRenderer instead
 */
export function createSpellbookRenderer(_mb, _spellbookNotePath) {
    throw new Error('Use renderer-factory.js createSpellbookRenderer instead of spellbook.js createSpellbookRenderer');
}

// Re-export SPELL_LINK_BEHAVIORS for backward compatibility
export { SPELL_LINK_BEHAVIORS };
