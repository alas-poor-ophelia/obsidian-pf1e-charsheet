/**
 * Concrete implementation for prepared casters (Wizard, Cleric, Druid, etc.)
 */

import { SpellbookRenderer } from '../core/spellbook.js';
import { getSpellsPerLevel } from '../utils/spell-slots-lookup.js';
import { getSpellLevelKey, getMetamagicLevelAdjustment } from '../utils/spell-calculations.js';
import { createSpellLink, createSpellInfoRow } from '../utils/spell-ui-components.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').Preparation} Preparation
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').JSEngine} JSEngine
 * @typedef {import('../types/types.js').JSEngineContext} JSEngineContext
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 */

/**
 * Prepared spellcaster renderer (extends SpellbookRenderer)
 * This class EXTENDS SpellbookRenderer and contains the exact logic from PreparedOld
 */
export class PreparedSpellbookRenderer extends SpellbookRenderer {
    /**
     * Render known spells for a specific level with preparation functionality
     * @param {SpellLevel} level - Spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     */
    async renderKnownSpellsByLevel(level, container, component, context, engine) {
        if (!this.containerManager._setupContainerForRender(container, component)) {
            return; // Already rendered, skip
        }

        const levelSpells = this.getSpellsByLevel(level);
        const knownSpells = levelSpells.filter(spell => spell.known);

        // Early return if no known spells for this level
        if (knownSpells.length === 0) {
            return;
        }

        // Create callout wrapper
        const calloutContent = await this.calloutManager._createCalloutWrapper(`Level ${level}`, container, context, engine, component, "collapse-clean", false, "known");

        await this.createMetamagicSelector(level, calloutContent, component, context, engine);

        const activeMetamagics = this.getActiveMetamagics(level);

        for (const spell of knownSpells) {
            if (!spell.id) {
                console.error(`Spell ${spell.name} missing required id field`);
                continue;
            }

            const totalLevelAdjustment = activeMetamagics.reduce((total, metamagic) => {
                return total + getMetamagicLevelAdjustment(metamagic);
            }, 0);

            const adjustedLevel = /** @type {SpellLevel} */ (spell.baseLevel + totalLevelAdjustment);
            const spellContainer = calloutContent.createDiv();

            // Always allow preparation - no more slot checking here
            this.uiFactory._createSpellRow(spell, spell.id, adjustedLevel, activeMetamagics, true, spellContainer, component);
        }
    }

    /**
     * Render prepared spells for a specific adjusted level
     * @param {SpellLevel} targetLevel - Target spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     */
    async renderPreparedSpellsByLevel(targetLevel, container, component, context, engine) {
        if (!this.containerManager._setupContainerForRender(container, component)) {
            return; // Already rendered, skip
        }

        // Check if there are any prepared spells for this level
        const preparations = this.getPreparationsForLevel(targetLevel);
        const hasSpells = preparations.length > 0;

        // Check if there are remaining spell slots for this level
        const remainingSlots = this.getRemainingSpellSlots(targetLevel);
        const hasRemainingSlots = (remainingSlots ?? 0) > 0;

        // Early return only if no prepared spells AND no remaining slots
        if (!hasSpells && !hasRemainingSlots) {
            return;
        }

        // Create callout wrapper
        const calloutContent = await this.calloutManager._createCalloutWrapper(`Level ${targetLevel}`, container, context, engine, component, "collapse-clean", false, "prepared");

        // Add spell slots tracker
        if (targetLevel > 0) {
            this.createSpellSlotsTracker(targetLevel, calloutContent, component);
        }

        // Check for over-preparation and show warning
        const maxSlots = this.getAvailableSpellSlots(targetLevel);
        const totalPrepared = this.countPreparedSpellsForLevel(targetLevel);
        this.uiFactory._createOverPreparationWarning(targetLevel, maxSlots, totalPrepared, calloutContent);

        // Render each preparation
        for (let prepIndex = 0; prepIndex < preparations.length; prepIndex++) {
            const preparation = preparations[prepIndex];
            const spell = this.getSpellById(preparation.spellId);
            
            if (!spell) {
                console.error(`Could not find spell with ID ${preparation.spellId}`);
                continue;
            }

            this.preparationManager._createPreparedSpellEntry(spell, preparation.spellId, prepIndex, preparation, calloutContent, component);
        }
    }

    /**
     * Reset method for prepared casters
     */
    resetAllPreparationCounts(resetMetamagics = false, resetPreparations = false, resetSLAs = true) {
        const updates = [];

        // Get class info from frontmatter
        const castingClass = this.getCastingClass();
        const casterLevel = this.getCasterLevel();
        const castingStatBonus = this.getCastingStatBonus();

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
                value: `x.map(spell => ({
                ...spell,
                prepared: false,
                preparations: []
            }))`
            });
        }

        // Add SLA reset if requested
        if (resetSLAs) {
            updates.push(...this.getSLAResetUpdates());
        }

        return updates;
    }

    // ==================== PREPARED CASTER SPECIFIC METHODS ====================

    /**
     * Create spell row for prepared caster
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {import('../types/types.js').MetamagicType[]} activeMetamagics - Active metamagics
     * @param {boolean} canPrepareMore - Whether can prepare more
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createSpellRow(spell, spellId, adjustedLevel, activeMetamagics, canPrepareMore, container, component) {
        const spellRowContainer = this.uiFactory._createSpellRowContainer(container);

        if (canPrepareMore) {
            this.uiFactory._createPrepareButton(spell, spellId, adjustedLevel, activeMetamagics, spellRowContainer, component);
        } else {
            this.uiFactory._createDisabledButton(spellRowContainer);
        }

        this.uiFactory._createStyledSpellName(spell, adjustedLevel, activeMetamagics, spellRowContainer, container, component);
    }

    /**
     * Create container for spell row
     * @param {HTMLElement} container - Parent container
     * @returns {HTMLDivElement} Row container
     */
    _createSpellRowContainer(container) {
        const spellRowContainer = container.createDiv();
        spellRowContainer.style.display = 'flex';
        spellRowContainer.style.alignItems = 'flex-start';
        spellRowContainer.style.gap = '8px';
        spellRowContainer.style.flexWrap = 'nowrap';
        return spellRowContainer;
    }

    /**
     * Create prepare button for prepared casters
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID (not index)
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {MetamagicType[]} activeMetamagics - Active metamagic types
     * @param {HTMLElement} spellRowContainer - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createPrepareButton(spell, spellId, adjustedLevel, activeMetamagics, spellRowContainer, component) {
        const prepareSpellBtnConfig = {
            label: "+",
            class: "spellbook-prepare-btn",
            id: `${spell.name}-${spellId}-prepare`,
            style: "primary",
            actions: [
                // First action: Add the preparation to spellPreparations.levelX
                {
                    type: "updateMetadata",
                    bindTarget: `spellPreparations.level${adjustedLevel}`,
                    evaluate: true,
                    value: `(() => {
                        const preparations = x || [];
                        const metamagic = ${JSON.stringify(activeMetamagics)};
                        const spellId = ${JSON.stringify(spellId)};
                        const adjustedLevel = ${adjustedLevel};
                        
                        const existingIndex = preparations.findIndex(prep => 
                            prep.spellId === spellId &&
                            prep.adjustedLevel === adjustedLevel && 
                            JSON.stringify(prep.metamagic.sort()) === JSON.stringify(metamagic.sort())
                        );
                        
                        if (existingIndex >= 0) {
                            const newPreparations = [...preparations];
                            newPreparations[existingIndex] = {
                                ...newPreparations[existingIndex],
                                count: newPreparations[existingIndex].count + 1
                            };
                            return newPreparations;
                        } else {
                            return [...preparations, {
                                spellId: spellId,
                                adjustedLevel: adjustedLevel,
                                metamagic: metamagic,
                                count: 1
                            }];
                        }
                    })()`
                },
                // Second action: Decrement totalRemaining (or set to null if would reach 0)
                {
                    type: "updateMetadata",
                    bindTarget: `spellLevelSettings.${getSpellLevelKey(/** @type {import('../types/types.js').SpellLevel} */(adjustedLevel))}.totalRemaining`,
                    evaluate: true,
                    value: `(() => {
                        const current = x;
                        if ((current ?? 0) <= 1) {
                            return null;
                        }
                        return current - 1;
                    })()`
                }
            ]
        };

        const buttonOpts = { declaration: prepareSpellBtnConfig, isPreview: false };
        const prepareSpellBtn = this.mb.createButtonMountable(this.spellbookFile.path, buttonOpts);

        const prepareButtonContainer = spellRowContainer.createDiv();
        prepareButtonContainer.style.flexShrink = '0';
        prepareButtonContainer.style.minWidth = 'auto';

        this.mb.wrapInMDRC(prepareSpellBtn, prepareButtonContainer, component);

        const prepareButtonGroup = this.mb.createButtonGroupMountable(this.spellbookFile.path, {
            declaration: { referencedButtonIds: [prepareSpellBtnConfig.id] },
            renderChildType: 'inline',
        });

        this.mb.wrapInMDRC(prepareButtonGroup, prepareButtonContainer, component);
    }

    /**
     * Create styled spell name display
     * @param {Spell} spell - The spell object
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {MetamagicType[]} activeMetamagics - Active metamagic types
     * @param {HTMLElement} rowContainer - Row container element
     * @param {HTMLElement} spellContainer - Spell container element
     * @param {Component} component - Component for lifecycle
     */
    _createStyledSpellName(spell, adjustedLevel, activeMetamagics, rowContainer, spellContainer, component) {
        const spellNameContainer = rowContainer.createDiv();
        spellNameContainer.style.flex = '1';
        spellNameContainer.style.minWidth = '0';
        spellNameContainer.style.lineHeight = '1.2';
    
        // Create spell name link container
        const spellNameSpan = spellNameContainer.createEl('span', { cls: 'spell-name-display' });
    
        // Add linked spell name
        const spellLink = createSpellLink(spell.name, 'spell-base-name');
        spellNameSpan.appendChild(spellLink);
    
        // Add metamagic styling if present
        if (activeMetamagics.length > 0) {
            this.uiFactory._addMetamagicStyling(spellNameSpan, activeMetamagics);
        }
    
        // Add level adjustment indicator if changed
        if (activeMetamagics.length > 0 && adjustedLevel !== spell.baseLevel) {
            this.uiFactory._addLevelAdjustmentIndicator(spellNameSpan, adjustedLevel);
        }
    
        spellNameSpan.dataset.spellName = spell.name;
        spellNameSpan.dataset.adjustedLevel = adjustedLevel.toString();
    
        // Add spell info row
        const infoRow = createSpellInfoRow(spell, adjustedLevel, this.getCastingStatBonus(), this.getCasterLevel());
        spellNameContainer.appendChild(infoRow);
    
        this.uiFactory._setupDynamicSpacing(spellNameContainer, spellContainer, component);
    }
    

    /**
     * Add metamagic styling to spell name
     * @param {HTMLElement} spellNameSpan - Spell name span element
     * @param {MetamagicType[]} activeMetamagics - Active metamagic types
     */
    _addMetamagicStyling(spellNameSpan, activeMetamagics) {
        const metamagicNames = activeMetamagics.map((/** @type {MetamagicType} */ meta) =>
            meta.replace(/\s*\([^)]*\)/, '').replace(/\s*Spell/, '')
        ).join(', ');

        const metamagicSpan = spellNameSpan.createEl('span', {
            text: ` (${metamagicNames})`,
            cls: 'spell-metamagic'
        });
        metamagicSpan.style.fontStyle = 'italic';
        metamagicSpan.style.fontSize = '0.9em';
        metamagicSpan.style.opacity = '0.8';
    }

    /**
     * Add level adjustment indicator
     * @param {HTMLElement} spellNameSpan - Spell name span element
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     */
    _addLevelAdjustmentIndicator(spellNameSpan, adjustedLevel) {
        const levelSpan = spellNameSpan.createEl('span', { cls: 'spell-level-adjustment' });
        levelSpan.style.marginLeft = '4px';

        const arrowSpan = levelSpan.createEl('span', {
            text: '↑',
            cls: 'level-arrow'
        });
        arrowSpan.style.color = '#6366f1';
        arrowSpan.style.fontWeight = 'bold';

        levelSpan.createEl('span', {
            text: adjustedLevel.toString(),
            cls: 'level-number'
        });
        levelSpan.style.fontSize = '0.9em';
        levelSpan.style.fontWeight = '600';
    }

    /**
     * Setup dynamic spacing for spell display
     * @param {HTMLElement} spellNameContainer - Spell name container
     * @param {HTMLElement} spellContainer - Spell container
     * @param {Component} component - Component for lifecycle
     */
    _setupDynamicSpacing(spellNameContainer, spellContainer, component) {
        const checkAndAdjustSpacing = () => {
            const containerHeight = spellNameContainer.offsetHeight;
            const lineHeight = parseFloat(getComputedStyle(spellNameContainer).lineHeight);
            const isWrapping = containerHeight > (lineHeight * 1.5);

            if (isWrapping) {
                spellContainer.style.marginBottom = '10px';
                spellContainer.style.paddingBottom = '5px';
            } else {
                spellContainer.style.marginBottom = '5px';
                spellContainer.style.paddingBottom = '0px';
            }
        };

        setTimeout(checkAndAdjustSpacing, 0);

        const resizeHandler = () => checkAndAdjustSpacing();
        window.addEventListener('resize', resizeHandler);

        // Track this event listener for container cleanup
        this.containerManager._trackContainerResource(spellContainer, () => {
            window.removeEventListener('resize', resizeHandler);
        });

        if (component && component.register) {
            component.register(() => {
                window.removeEventListener('resize', resizeHandler);
            });
        }
    }

}