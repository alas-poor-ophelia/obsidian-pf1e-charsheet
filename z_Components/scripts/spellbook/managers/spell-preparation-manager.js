/**
 * @fileoverview SpellPreparationManager - Handles spell preparation logic and data access
 * 
 * This manager consolidates all spell preparation functionality including:
 * - Preparation creation and management
 * - Spell data access patterns
 * - Preparation counting and tracking
 * - Reset functionality
 * - UI component creation for prepared spells
 * 
 * @module spell-preparation-manager
 */

import { getSpellsPerLevel } from '../utils/spell-slots-lookup.js';
import { getSpellLevelKey } from '../utils/spell-calculations.js';
import {
    createSpellLink,
    createSpellInfoRow
} from '../utils/spell-ui-components.js';

/**
 * @typedef {import('../types/types.js').SpellbookRenderer} SpellbookRenderer
 * @typedef {import('../types/types.js').Spell} Spell|
 * @typedef {import('../types/types.js').Preparation} Preparation
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').SpellPreparation} SpellPreparation
 * @typedef {import('../types/types.js').MetaBindAPI} MetaBind
 * @typedef {import('../types/types.js').BindTarget} BindTarget
 */

/**
 * Manages spell preparation logic and data access for the spellbook system.
 * 
 * This class handles:
 * - Spell preparation workflows
 * - Preparation counting and tracking
 * - Spell data retrieval by various criteria
 * - Reset functionality for preparations
 * - UI component creation for prepared spells
 * 
 * @class SpellPreparationManager
 */
export class SpellPreparationManager {
    /**
     * Creates a new SpellPreparationManager instance.
     * 
     * @param {SpellbookRenderer} renderer - The parent renderer instance
     */
    constructor(renderer, spellbookFile) {
        /**
         * Reference to the parent renderer for accessing shared state
         * @type {SpellbookRenderer}
         * @private
         */
        this.renderer = renderer;
        this.spellbookFile = spellbookFile;
    }

    /**
     * Gets the metadata manager from the renderer.
     * @returns {import('../managers/spell-metadata.js').SpellMetadataManager}
     * @private
     */
    get metadataManager() {
        return this.renderer.metadataManager;
    }

    /**
     * Gets the Meta Bind instance from the renderer.
     * @returns {MetaBind}
     * @private
     */
    get mb() {
        return this.renderer.mb;
    }

    /**
     * Gets the metadata object from the metadata manager.
     * @returns {Object}
     * @private
     */
    get metadata() {
        return this.metadataManager.metadata;
    }

    // ========== Preparation Logic Methods ==========
    // These methods handle spell preparation workflows and UI creation

    /**
     * Gets prepared spells for a specific spell level.
     * 
     * @param {import('../types/types.js').SpellLevel} targetLevel - Target spell level
     * @returns {any[]} Prepared spells array
     */
    getPreparedSpellsByLevel(targetLevel) {
        return this.renderer.metadataManager.getPreparedSpellsByLevel(targetLevel);
    }

    /**
     * Helper: Create prepared spell entry with buttons and info
     * @param {import('../types/types.js').Spell} spell - The spell object
     * @param {number} spellIndex - Spell index
     * @param {number} prepIndex - Preparation index
     * @param {import('../types/types.js').Preparation} preparation - Preparation object
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle
     */
    _createPreparedSpellEntry(spell, spellIndex, prepIndex, preparation, container, component) {
        const spellContainer = container.createDiv();
        spellContainer.style.display = 'flex';
        spellContainer.style.alignItems = 'flex-start'; // Changed from 'center' to allow wrapping
        spellContainer.style.gap = '10px';
        spellContainer.style.marginBottom = '5px';
        spellContainer.style.padding = '5px';
        spellContainer.style.borderRadius = '5px';

        // Create buttons container with fixed width
        const buttonsContainer = spellContainer.createDiv();
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '5px';
        buttonsContainer.style.flexShrink = '0'; // Prevent buttons from shrinking
        buttonsContainer.style.minWidth = 'auto'; // Maintain natural button width

        this._createCastAndRemoveButtonsInContainer(spell, spellIndex, prepIndex, preparation, buttonsContainer, component);
        this._createPreparedSpellInfo(spell, preparation, spellContainer);
    }

   /**
     * Create cast and remove buttons in container
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {number} prepIndex - Preparation index
     * @param {import('../types/types.js').SpellPreparation} preparation - Preparation object
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createCastAndRemoveButtonsInContainer(spell, spellId, prepIndex, preparation, container, component,) {
        const levelKey = `level${preparation.adjustedLevel}`;
        
        const castBtnConfig = {
            label: "Cast",
            class: "spellbook-cast-btn",
            id: `${spell.name}-${spellId}-${prepIndex}-cast`,
            style: "primary",
            action: {
                type: "updateMetadata",
                bindTarget: `spellPreparations.${levelKey}`,
                evaluate: true,
                value: `(() => {
                    const preparations = x || [];
                    const newPreparations = [...preparations];
                    const targetIndex = ${prepIndex};
                    
                    if (targetIndex >= 0 && targetIndex < newPreparations.length) {
                        const targetPrep = newPreparations[targetIndex];
                        if (targetPrep && targetPrep.count > 0) {
                            if (targetPrep.count === 1) {
                                // Remove the preparation entirely
                                newPreparations.splice(targetIndex, 1);
                            } else {
                                // Decrement the count
                                newPreparations[targetIndex] = {
                                    ...targetPrep,
                                    count: targetPrep.count - 1
                                };
                            }
                        }
                    }
                    
                    return newPreparations;
                })()`
            }
        };

        const removeBtnConfig = {
            label: "Remove",
            class: "spellbook-remove-btn",
            id: `${spell.name}-${spellId}-${prepIndex}-remove`,
            style: "destructive",
            action: {
                type: "updateMetadata",
                bindTarget: `spellPreparations.${levelKey}`,
                evaluate: true,
                value: `(() => {
                    const preparations = x || [];
                    const newPreparations = [...preparations];
                    const targetIndex = ${prepIndex};
                    
                    if (targetIndex >= 0 && targetIndex < newPreparations.length) {
                        // Remove the entire preparation
                        newPreparations.splice(targetIndex, 1);
                    }
                    
                    return newPreparations;
                })()`
            }
        };

        const castBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
            declaration: castBtnConfig,
            isPreview: false,
        });

        const removeBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
            declaration: removeBtnConfig,
            isPreview: false,
        });

        this.mb.wrapInMDRC(castBtn, container, component);
        this.mb.wrapInMDRC(removeBtn, container, component);

        const buttonGroup = this.mb.createButtonGroupMountable(this.spellbookFile.path, {
            declaration: {
                referencedButtonIds: [castBtnConfig.id, removeBtnConfig.id],
            },
            renderChildType: 'inline',
        });

        this.mb.wrapInMDRC(buttonGroup, container, component);
    }

    /**
     * Create prepared spell info display
     * @param {Spell} spell - The spell object
     * @param {Preparation} preparation - Preparation object
     * @param {HTMLElement} container - Container element
     */
    _createPreparedSpellInfo(spell, preparation, container) {
        const metamagicNames = preparation.metamagic.map((/** @type {MetamagicType} */ meta) => {
            return meta.replace(/\s*\([^)]*\)/, '').replace(/\s*Spell/, '');
        }).join(', ');
    
        const metamagicText = metamagicNames ? ` (${metamagicNames})` : '';
    
        const spellInfoContainer = container.createDiv();
        spellInfoContainer.style.display = 'flex';
        spellInfoContainer.style.alignItems = 'flex-start'; // Changed to allow for multi-line content
        spellInfoContainer.style.flex = '1';
        spellInfoContainer.style.minWidth = '0';
    
        const spellTextContainer = spellInfoContainer.createDiv();
        spellTextContainer.style.flex = '1';
        spellTextContainer.style.minWidth = '0';
    
        // First line: spell name with metamagic (as a link)
        const spellTextDiv = spellTextContainer.createEl('div', {
            cls: 'prepared-spell-info'
        });
        
        // Add the linked spell name
        const spellLink = createSpellLink(spell.name);
        spellTextDiv.appendChild(spellLink);
        
        // Add metamagic text if present
        if (metamagicText) {
            const metamagicSpan = document.createElement('span');
            metamagicSpan.textContent = metamagicText;
            metamagicSpan.style.fontStyle = 'italic';
            metamagicSpan.style.fontSize = '0.9em';
            metamagicSpan.style.opacity = '0.8';
            spellTextDiv.appendChild(metamagicSpan);
        }
        
        spellTextDiv.style.wordBreak = 'break-word';
        spellTextDiv.style.overflowWrap = 'anywhere';
    
        // Second line: spell info row
        const infoRow = createSpellInfoRow(spell, /** @type {import('../types/types.js').SpellLevel} */(preparation.adjustedLevel), this.getCastingStatBonus(), this.getCasterLevel());
        spellTextContainer.appendChild(infoRow);
    
        // Create dots with flex-shrink to prevent wrapping
        const dotsContainer = spellInfoContainer.createDiv();
        dotsContainer.style.display = 'flex';
        dotsContainer.style.gap = '3px';
        dotsContainer.style.marginLeft = '8px';
        dotsContainer.style.alignItems = 'center';
        dotsContainer.style.alignSelf = 'center'; // Center dots vertically
        dotsContainer.style.flexShrink = '0';
    
        for (let i = 0; i < preparation.count; i++) {
            const dot = dotsContainer.createDiv();
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.backgroundColor = '#ca9759';
            dot.style.borderRadius = '50%';
            dot.style.border = '2px solid white';
            dot.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.1)';
            dot.style.display = 'inline-block';
        }
    }

    getCastingStatBonus() {
         return this.metadataManager.getCastingStatBonus();
    }

    /**
     * Get caster level from frontmatter
     * @returns {number} The caster level
     */
    getCasterLevel() {
        return this.metadataManager.getCasterLevel();
    }


    /**
    * Get casting class from frontmatter
    * @returns {string} The casting class
    */
    getCastingClass() {
        return this.metadataManager.getCastingClass();
    }

    /**
     * Helper: Create "no prepared spells" message
     * @param {import('../types/types.js').SpellLevel} targetLevel - Target spell level
     * @param {HTMLElement} container - Container element
     */
    _createNoPreparedSpellsMessage(targetLevel, container) {
        const noSpellsMsg = container.createEl('p', {
            text: `No level ${targetLevel} spells are currently prepared.`,
            cls: 'no-prepared-spells'
        });
        noSpellsMsg.style.fontStyle = 'italic';
        noSpellsMsg.style.color = 'gray';
    }

    /**
     * Find or create a preparation for a spell with specific metamagic
     * @param {import('../types/types.js').Spell} spell - The spell object
     * @param {import('../types/types.js').SpellLevel} adjustedLevel - Adjusted spell level
     * @param {import('../types/types.js').MetamagicType[]} metamagicArray - Array of metamagic types
     * @returns {import('../types/types.js').Preparation|undefined} The found preparation or undefined
     */
    findOrCreatePreparation(spell, adjustedLevel, metamagicArray) {
        if (!spell.preparations) {
            spell.preparations = [];
        }

        const existing = (/** @type {import('../types/types.js').Preparation[]} */ (spell.preparations)).find((prep) =>
            prep.adjustedLevel === adjustedLevel &&
            JSON.stringify(prep.metamagic.sort()) === JSON.stringify(metamagicArray.sort())
        );

        return existing;
    }

    /**
     * Updated reset method that gets class info from frontmatter
     * @param {boolean} resetMetamagics - Whether to reset metamagics
     * @param {boolean} resetPreparations - Whether to reset preparations
     * @param {boolean} resetSLAs - Whether to reset SLAs
     * @returns {import('../types/domain.js').MetadataUpdate[]} Array of metadata updates
     */
    resetAllPreparationCounts(resetMetamagics = false, resetPreparations = false, resetSLAs = true) {
        const updates = [];

        // Get class info from frontmatter
        const castingClass = this.renderer.getCastingClass();
        const casterLevel = this.renderer.getCasterLevel();
        const castingStatBonus = this.renderer.getCastingStatBonus();

        // Reset totalRemaining to max slots (default rested state) for all spell levels
        for (let level = 0; level <= 9; level++) {
            const levelKey = getSpellLevelKey(/** @type {import('../types/types.js').SpellLevel} */(level));
            const maxSlots = getSpellsPerLevel(castingClass, casterLevel, level, castingStatBonus);

            updates.push({
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${levelKey}.totalRemaining`,
                evaluate: false,
                value: maxSlots > 0 ? maxSlots : null
            });

            if (resetMetamagics) {
                // Also clear active metamagics for the level
                updates.push({
                    type: "updateMetadata",
                    bindTarget: `spellLevelSettings.${levelKey}.activeMetamagics`,
                    evaluate: false,
                    value: []
                });
            }
        }

        if (resetPreparations) {
            // Clear all spell preparations
            updates.push({
                type: "updateMetadata",
                bindTarget: "spells",
                evaluate: true,
                value: `x.map((/** @type {import('../types/types.js').Spell} */ spell) => ({
                    ...spell,
                    prepared: false,
                    preparations: []
                }))`
            });
        }

        // Add SLA reset if requested
        if (resetSLAs) {
            updates.push(...this.renderer.getSLAResetUpdates());
        }

        return updates;
    }

    // ========== Data Access Methods ==========
    // These methods provide various ways to access spell data

    /**
     * Counts the number of prepared spells for a specific level.
     * 
     * @param {number} level - The spell level to count
     * @returns {number} The count of prepared spells
     */
    countPreparedSpellsForLevel(level) {
        return this.metadataManager.countPreparedSpellsForLevel(level);
    }

    /**
     * Gets the currently selected metamagic feats.
     * 
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @returns {string} Selected metamagic
     */
    getSelectedMetamagic(spellLevel) {
        return this.metadataManager.getSelectedMetamagic(spellLevel);
    }

    /**
     * Gets all spells of a specific level.
     * 
     * @param {import('../types/types.js').SpellLevel} level - The spell level
     * @returns {import('../types/types.js').Spell[]} Array of spells at that level
     */
    getSpellsByLevel(level) {
        return this.metadataManager.getSpellsByLevel(level);
    }

    /**
     * Gets the index of a spell in the spells array.
     * 
     * @param {string} spellName - The spell name
     * @returns {number} The spell index, or -1 if not found
     */
    getSpellIndex(spellName) {
        return this.metadataManager.getSpellIndex(spellName);
    }

    /**
     * Gets a spell by its ID.
     * 
     * @param {number} spellId - The spell ID
     * @returns {import('../types/types.js').Spell|null} The spell object or null if not found
     */
    getSpellById(spellId) {
        return this.metadataManager.getSpellById(spellId);
    }

    /**
     * Gets all preparations for a specific spell level.
     * 
     * @param {import('../types/types.js').SpellLevel} level - The spell level
     * @returns {import('../types/types.js').SpellPreparation[]} Array of preparations
     */
    getPreparationsForLevel(level) {
        return this.metadataManager.getPreparationsForLevel(level);
    }

    // ========== Utility Methods ==========
    // Additional utility methods for preparation management

    /**
     * Validates spell preparation data integrity.
     * 
     * @param {SpellPreparation} preparation - The preparation to validate
     * @returns {boolean} True if valid, false otherwise
     * @private
     */
    _validatePreparation(preparation) {
        return preparation &&
               typeof preparation.spellId === 'number' &&
               Array.isArray(preparation.metamagic) &&
               typeof preparation.count === 'number' &&
               preparation.count >= 0;
    }

    /**
     * Creates a Meta Bind update for preparation changes.
     * 
     * @param {string} path - The metadata path to update
     * @param {*} value - The new value
     * @returns {Promise<void>}
     * @private
     */
    async _updateMetadata(path, value) {
        const target = this.mb.parseBindTarget(path, this.metadataManager.filePath);
        await this.mb.updateMetadata(target, value);
    }

    /**
     * Dispose of any resources managed by this preparation manager.
     * Currently no specific resources to clean up, but provides
     * consistent interface for future resource management.
     */
    dispose() {
        // No specific resources to clean up currently
        // This method exists for consistency with other managers
        // and future resource management needs
    }
}