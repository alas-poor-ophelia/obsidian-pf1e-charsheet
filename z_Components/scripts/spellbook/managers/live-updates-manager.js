import { getCasterConfig } from '../utils/caster-configs.js';
import { getSpellLevelKey } from '../utils/spell-calculations.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 */

/**
 * Manages Meta Bind subscriptions and live updates for spellbook components.
 * 
 * This class encapsulates all Meta Bind subscription logic, providing targeted
 * subscription optimization and proper cleanup management. It handles different
 * subscription patterns based on view type (known, prepared, SLA) and casting
 * class requirements (spontaneous, hybrid, prepared).
 * 
 * Key Features:
 * - Targeted subscriptions for better performance
 * - Automatic cleanup through Meta Bind component lifecycle
 * - View-specific subscription strategies
 * - Support for global metamagic subscriptions
 * - Error handling for subscription failures
 * 
 * @class LiveUpdatesManager
 */
export class LiveUpdatesManager {
    /**
     * @param {import('../types/types.js').SpellbookRenderer} renderer - The spellbook renderer instance
     */
    constructor(renderer) {
        /** @type {import('../types/types.js').SpellbookRenderer} */
        this.renderer = renderer;
        
        // Extract commonly used properties for convenience
        /** @type {MetaBindAPI} */
        this.mb = renderer.mb;
        /** @type {import('obsidian').TFile} */
        this.spellbookFile = renderer.spellbookFile;
        
        // Initialize disposal tracking
        this._disposables = new Set();
        this._disposed = false;
    }

    /**
     * Dispose of all resources managed by this live updates manager
     */
    dispose() {
        if (this._disposed) {
            return; // Already disposed
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
                console.warn('Error during LiveUpdatesManager disposal:', error);
            }
        }

        // Clear the disposables set
        this._disposables.clear();

        // Mark as disposed
        this._disposed = true;
    }

    /**
     * Register a disposable resource or cleanup function
     * @param {(() => void)|{dispose: () => void}} disposable - Function to call or object with dispose() method
     */
    _registerDisposable(disposable) {
        if (this._disposed) {
            console.warn('Attempting to register disposable on disposed LiveUpdatesManager');
            return;
        }
        this._disposables.add(disposable);
    }

    /**
     * Set up live updates for spell rendering with targeted subscriptions
     * 
     * This method implements the core subscription logic for spellbook live updates.
     * It supports different view types and provides targeted subscriptions for
     * optimal performance.
     * 
     * Subscription Strategy:
     * - View-specific: Subscribe only to relevant data paths based on view type
     * - Level-specific: When spell level provided, subscribe to specific level settings
     * - Global fallback: Subscribe to broader paths when specific level not available
     * - Caster-specific: Add global metamagic subscriptions for hybrid/spontaneous casters
     * 
     * @param {Function} renderFunction - Function to call on updates
     * @param {Component} component - Component for lifecycle management
     * @param {number|null|'sla'} spellLevel - Optional specific spell level to watch (null watches all)
     * @param {string} viewType - Type of view ("known", "prepared", "sla")
     */
    setupLiveUpdates(renderFunction, component, spellLevel = null, viewType = "foo") {
        try {
            // Subscribe based on view type
            if (viewType === "prepared") {
                // Prepared spells view - subscribe to preparations for this level
                if (spellLevel !== null && typeof spellLevel === 'number' && spellLevel >= 0 && spellLevel <= 9) {
                    const preparationsTarget = this.mb.parseBindTarget(`spellPreparations.level${spellLevel}`, this.spellbookFile.path);
                    this.mb.subscribeToMetadata(preparationsTarget, component, () => {
                        try {
                            renderFunction();
                        } catch (error) {
                            console.warn('Error in prepared spells render function:', error);
                        }
                    });
                }
            } else if (viewType === "sla") {
                // SLA view - subscribe to SLA preparations
                const slaTarget = this.mb.parseBindTarget("spellPreparations.sla", this.spellbookFile.path);
                this.mb.subscribeToMetadata(slaTarget, component, () => {
                    try {
                        renderFunction();
                    } catch (error) {
                        console.warn('Error in SLA render function:', error);
                    }
                });
				return;
            } else {
                // Known spells view (default) - subscribe to spells array
                const spellsTarget = this.mb.parseBindTarget("spells", this.spellbookFile.path);
                this.mb.subscribeToMetadata(spellsTarget, component, () => {
                    try {
                        renderFunction();
                    } catch (error) {
                        console.warn('Error in known spells render function:', error);
                    }
                });
            }

            // Subscribe to spell level settings (all views need this)
            if (viewType === "prepared" && spellLevel !== null && typeof spellLevel === 'number' && spellLevel >= 0 && spellLevel <= 9) {
				console.log('Hit has spell level branch. Spell level: $spellLevel');
                // Subscribe to specific spell level settings only
                const levelKey = getSpellLevelKey(/** @type {import('../types/types.js').SpellLevel} */(spellLevel));
                const levelTarget = this.mb.parseBindTarget(`spellLevelSettings.${levelKey}.activeMetamagics`, this.spellbookFile.path);
                this.mb.subscribeToMetadata(levelTarget, component, () => {
                    try {
                        renderFunction();
                    } catch (error) {
                        console.warn('Error in spell level settings render function:', error);
                    }
                });
            } else if (viewType === "known" && spellLevel !== null && typeof spellLevel === 'number' && spellLevel >= 0 && spellLevel <= 9) {
            	const metamagicTarget = this.mb.parseBindTarget("spellLevelSettings.globalActiveMetamagics", this.spellbookFile.path);
				this.mb.subscribeToMetadata(metamagicTarget, component, () => {
                    try {
                        renderFunction();
                    } catch (error) {
                        console.warn('Error in spell level settings render function:', error);
                    }
                });
            } else {
				console.log("Hit no spell level block, about to register for all spell level changes.");
                // Subscribe to all spell level settings
                const settingsTarget = this.mb.parseBindTarget("spellLevelSettings", this.spellbookFile.path);
                this.mb.subscribeToMetadata(settingsTarget, component, () => {
                    try {
                        renderFunction();
                    } catch (error) {
                        console.warn('Error in spell level settings render function:', error);
                    }
                });
		
            }

            // Subscribe to casting class and stat changes
            const castingClassTarget = this.mb.parseBindTarget("castingClass", this.spellbookFile.path);
            this.mb.subscribeToMetadata(castingClassTarget, component, () => {
                try {
                    renderFunction();
                } catch (error) {
                    console.warn('Error in casting class render function:', error);
                }
            });

            const castingStatTarget = this.mb.parseBindTarget("castingStat", this.spellbookFile.path);
            this.mb.subscribeToMetadata(castingStatTarget, component, () => {
                try {
                    renderFunction();
                } catch (error) {
                    console.warn('Error in casting stat render function:', error);
                }
            });

            // Subscribe to caster level and bonus changes
            const casterLevelTarget = this.mb.parseBindTarget("casterLevel", this.spellbookFile.path);
            this.mb.subscribeToMetadata(casterLevelTarget, component, () => {
                try {
                    renderFunction();
                } catch (error) {
                    console.warn('Error in caster level render function:', error);
                }
            });

            const castingStatBonusTarget = this.mb.parseBindTarget("castingStatBonus", this.spellbookFile.path);
            this.mb.subscribeToMetadata(castingStatBonusTarget, component, () => {
                try {
                    renderFunction();
                } catch (error) {
                    console.warn('Error in casting stat bonus render function:', error);
                }
            });

            // Subscribe to global active metamagics for hybrid and spontaneous casters
            const castingClass = this.renderer.getCastingClass();
            const casterConfig = getCasterConfig(castingClass);
            
            if (casterConfig.type === 'spontaneous' || casterConfig.type === 'hybrid') {
                const globalMetamagicsTarget = this.mb.parseBindTarget("spellLevelSettings.globalActiveMetamagics", this.spellbookFile.path);
                this.mb.subscribeToMetadata(globalMetamagicsTarget, component, () => {
                    try {
                        renderFunction();
                    } catch (error) {
                        console.warn('Error in global metamagics render function:', error);
                    }
                });
            }

            // Note: Meta Bind automatically handles cleanup when the component is destroyed
            // No need for manual cleanup registration

        } catch (error) {
            console.warn('Error setting up live updates:', error);
            // Don't re-throw - allow component to continue functioning even if live updates fail
        }
    }
}