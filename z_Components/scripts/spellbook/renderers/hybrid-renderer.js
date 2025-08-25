/**
 * Concrete implementation for hybrid casters (Arcanist, etc.)
 */

import { SpellbookRenderer } from '../core/spellbook.js';
import { getSpellsPerLevel, getArcanistCasts } from '../utils/spell-slots-lookup.js';
import { getSpellLevelKey, getMetamagicLevelAdjustment } from '../utils/spell-calculations.js';
import { createSpellLink, createSpellInfoRow } from '../utils/spell-ui-components.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').JSEngine} JSEngine
 * @typedef {import('../types/types.js').JSEngineContext} JSEngineContext
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').Preparation} Preparation
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 */

/**
 * Hybrid spellcaster renderer (extends SpellbookRenderer)
 * This class EXTENDS SpellbookRenderer and contains the exact logic from HybridOld
 */
export class HybridSpellbookRenderer extends SpellbookRenderer {
    /**
     * Render known spells for a specific level with preparation functionality (same as prepared)
     * @param {SpellLevel} level - The spell level to render
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle management
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     * @returns {Promise<void>}
     */
    async renderKnownSpellsByLevel(level, container, component, context, engine) {
        if (!this.containerManager._setupContainerForRender(container, component)) {
            return; // Already rendered, skip
        }

        const levelSpells = this.getSpellsByLevel(level);
        const knownSpells = levelSpells.filter((/** @type {Spell} */ spell) => spell.known);

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
            this._createHybridSpellRow(spell, spell.id, adjustedLevel, activeMetamagics, true, spellContainer, component);
        }
    }

    /**
     * Render prepared spells for hybrid casters (with global metamagic support)
     * @param {SpellLevel} targetLevel - The spell level to render
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle management
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     * @returns {Promise<void>}
     */
    async renderPreparedSpellsByLevel(targetLevel, container, component, context, engine) {
        if (!this.containerManager._setupContainerForRender(container, component)) {
            return; // Already rendered, skip
        }

        // Get global metamagics 
        const globalMetamagics = this.getGlobalActiveMetamagics();

        // Check if there are any prepared spells for this level (accounting for global metamagics)
        const preparations = this._getPreparationsForLevelWithGlobalMetamagics(targetLevel, globalMetamagics);
        const hasSpells = preparations.length > 0;

        // Check if there are remaining spell slots or casts for this level
        const remainingSlots = this.getRemainingSpellSlots(targetLevel);
        const remainingCasts = this.getRemainingSpellCasts(targetLevel);
        const hasRemainingSlots = (remainingSlots ?? 0) > 0;
        const hasRemainingCasts = (remainingCasts ?? 0) > 0;

        // Early return only if no prepared spells AND no remaining slots AND no remaining casts
        if (!hasSpells && !hasRemainingSlots && !hasRemainingCasts) {
            return;
        }

        // Create callout wrapper
        const calloutContent = await this.calloutManager._createCalloutWrapper(`Level ${targetLevel}`, container, context, engine, component, "collapse-clean", false, "prepared");

        // Create a shared parent div for both trackers
        const trackersContainer = calloutContent.createDiv();
        trackersContainer.classList.add('hybrid-trackers-container'); // Optional class for CSS targeting

        // Add spell slots tracker (for preparation)
        this.createSpellSlotsTracker(targetLevel, trackersContainer, component);

        // Add spell casts tracker (for casting)
        this.createSpellCastsTracker(targetLevel, trackersContainer, component);

        // Check for over-preparation and show warning (using original preparation level)
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

            // Create a modified preparation object that includes global metamagics for display
            const nonDuplicateGlobals = this._getNonDuplicateGlobalMetamagics(preparation, globalMetamagics);
            const displayPreparation = {
                ...preparation,
                adjustedLevel: /** @type {SpellLevel} */ (this._calculateFinalLevel(preparation, globalMetamagics, targetLevel)),
                metamagic: [...nonDuplicateGlobals, ...preparation.metamagic] // Combine non-duplicate global and per-level
            };

            this._createHybridPreparedSpellEntryWithGlobal(spell, preparation.spellId, prepIndex, preparation, displayPreparation, targetLevel, calloutContent, component);
        }
    }

    /**
     * Reset method for hybrid casters
     */
    resetAllPreparationCounts(resetMetamagics = false, resetPreparations = false, resetSLAs = true) {
        const updates = [];

        // Get class info from frontmatter
        const castingClass = this.getCastingClass();
        const casterLevel = this.getCasterLevel();
        const castingStatBonus = this.getCastingStatBonus();

        // Reset totalRemaining to max slots (for preparation) and totalCastsRemaining to max casts
        for (let level = 0; level <= 9; level++) {
            const levelKey = getSpellLevelKey(/** @type {SpellLevel} */ (level));
            const maxSlots = getSpellsPerLevel(castingClass, casterLevel, level, castingStatBonus);
            const maxCasts = getArcanistCasts(castingClass, casterLevel, level, castingStatBonus);

            updates.push({
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${levelKey}.totalRemaining`,
                evaluate: false,
                value: maxSlots > 0 ? maxSlots : null
            });

            updates.push({
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${levelKey}.totalCastsRemaining`,
                evaluate: false,
                value: maxCasts > 0 ? maxCasts : null
            });

            if (resetMetamagics) {
                // Clear per-level metamagics
                updates.push({
                    type: "updateMetadata",
                    bindTarget: `spellLevelSettings.${levelKey}.activeMetamagics`,
                    evaluate: false,
                    value: []
                });
            }
        }

        if (resetMetamagics) {
            // Clear global metamagics for hybrid casters
            updates.push({
                type: "updateMetadata",
                bindTarget: "spellLevelSettings.globalActiveMetamagics",
                evaluate: false,
                value: []
            });
        }

        if (resetPreparations) {
            // Clear all spell preparations
            for (let level = 0; level <= 9; level++) {
                updates.push({
                    type: "updateMetadata",
                    bindTarget: `spellPreparations.level${level}`,
                    evaluate: false,
                    value: []
                });
            }
        }

        // Add SLA reset if requested
        if (resetSLAs) {
            updates.push(...this.getSLAResetUpdates());
        }

        return updates;
    }

    // ==================== HYBRID CASTER SPECIFIC METHODS ====================

    /**
     * Calculate final level for a preparation, avoiding duplicate metamagics
     * @param {Preparation} preparation - The preparation object
     * @param {string[]} globalMetamagics - Array of global metamagics
     * @param {import('../types/types.js').SpellLevel} targetLevel - The level where preparation is stored
     * @returns {number} Final calculated level
     */
    _calculateFinalLevel(preparation, globalMetamagics, targetLevel) {
        const nonDuplicateGlobals = this._getNonDuplicateGlobalMetamagics(preparation, globalMetamagics);
        const globalAdjustment = nonDuplicateGlobals.reduce((total, metamagic) => {
            return total + getMetamagicLevelAdjustment(metamagic);
        }, 0);
        return targetLevel + globalAdjustment;
    }

    /**
     * Get global metamagics that aren't already applied to this preparation
     * @param {Preparation} preparation - The preparation object
     * @param {string[]} globalMetamagics - Array of global metamagics
     * @returns {string[]} Non-duplicate global metamagics
     */
    _getNonDuplicateGlobalMetamagics(preparation, globalMetamagics) {
        const prepMetamagics = preparation.metamagic || [];
        return globalMetamagics.filter(globalMeta => {
            // Check if this global metamagic is already in the preparation's metamagics
            return !prepMetamagics.some((/** @type {any} */ prepMeta) => prepMeta === globalMeta);
        });
    }

    /**
     * Get preparations for target level accounting for global metamagics
     * @param {import('../types/types.js').SpellLevel} targetLevel - The level to display
     * @param {string[]} globalMetamagics - Array of global metamagics
     * @returns {Preparation[]} Array of preparations from the correct storage level
     */
    _getPreparationsForLevelWithGlobalMetamagics(targetLevel, globalMetamagics) {
        // Calculate global metamagic adjustment
        const globalAdjustment = globalMetamagics.reduce((total, metamagic) => {
            return total + getMetamagicLevelAdjustment(metamagic);
        }, 0);
        
        // Storage level = target level - global adjustment
        const storageLevel = targetLevel - globalAdjustment;
        
        // Fetch from the single storage level
        if (storageLevel >= 0 && storageLevel <= 9) {
            return this.getPreparationsForLevel(/** @type {import('../types/types.js').SpellLevel} */(storageLevel));
        }
        
        return [];
    }

    /**
     * Get global active metamagics for hybrid casters
     * @returns {import('../types/types.js').MetamagicType[]} Array of active global metamagics
     */
    getGlobalActiveMetamagics() {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.globalActiveMetamagics`, this.spellbookFile.path);
        return this.mb.getMetadata(settingsTarget) || [];
    }

    // Helper method to calculate global metamagic level adjustment
    getGlobalMetamagicAdjustment() {
        const globalMetamagics = this.getGlobalActiveMetamagics();
        return globalMetamagics.reduce((/** @type {number} */ total, /** @type {string} */ metamagic) => {
            return total + getMetamagicLevelAdjustment(metamagic);
        }, 0);
    }

    /**
     * Get remaining spell casts for a level
     * @param {SpellLevel} spellLevel - The spell level
     * @returns {number | null} Remaining casts
     */
    getRemainingSpellCasts(spellLevel) {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.${getSpellLevelKey(spellLevel)}.totalCastsRemaining`, this.spellbookFile.path);
        return this.mb.getMetadata(settingsTarget);
    }

    /**
     * Create spell casts tracker for a level (Arcanist's second resource)
     * @param {SpellLevel} spellLevel - The spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    createSpellCastsTracker(spellLevel, container, component) {
        const castsContainer = container.createDiv();
        castsContainer.style.marginBottom = '10px';

        const levelKey = getSpellLevelKey(spellLevel);
        const maxCasts = this.getAvailableSpellCasts(spellLevel);
        const remainingCasts = this.getRemainingSpellCasts(spellLevel);
        const displayRemaining = remainingCasts ?? maxCasts;

        if (maxCasts > 0) {
            // Add label
            const label = castsContainer.createEl('label', { text: 'Spell Casts Remaining:' });
            label.style.fontSize = '0.9em';
            label.style.fontWeight = '600';
            label.style.marginRight = '8px';

            this._createCastsSelect(levelKey, maxCasts, displayRemaining, castsContainer, component);
        }

        return castsContainer;
    }

    /**
     * Helper: Create casts select element
     * @param {string} levelKey - Spell level key
     * @param {number} maxCasts - Maximum casts
     * @param {number} displayRemaining - Display remaining casts
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createCastsSelect(levelKey, maxCasts, /** @type {number} */ displayRemaining, container, component) {
        const selectConfig = {
            renderChildType: 'block',
            declaration: {
                inputFieldType: 'select',
                bindTarget: this.mb.parseBindTarget(`spellLevelSettings.${levelKey}.totalCastsRemaining`, this.spellbookFile.path),
                arguments: [
                    // Options from 1 to maxCasts (just like the slots select)
                    ...Array.from({ length: maxCasts }, (_, i) => ({
                        name: 'option',
                        value: [`${i + 1}`]
                    })),
                    { name: 'class', value: ['tracker spellbook-hybrid-casts'] }
                ]
            }
        };

    
        const castsSelect = this.mb.createInputFieldMountable(this.spellbookFile.path, selectConfig);
        this.mb.wrapInMDRC(castsSelect, container, component);
        
        // Register cleanup for the Meta Bind component
        this.containerManager._registerComponentCleanup(component, () => {
            // Meta Bind components should be cleaned up automatically by MDRC wrapper
        });
    }

    /**
     * Get available spell casts for a level (Arcanist's second resource pool)
     * @param {SpellLevel} spellLevel - The spell level
     * @returns {number} Available spell casts
     */
    getAvailableSpellCasts(spellLevel) {
        const castingClass = this.getCastingClass();
        const casterLevel = this.getCasterLevel();
        const castingStatBonus = this.getCastingStatBonus();

        return getArcanistCasts(castingClass, casterLevel, spellLevel, castingStatBonus) || 0;
    }

    /**
     * Create hybrid spell row
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {number} adjustedLevel - Adjusted spell level
     * @param {string[]} activeMetamagics - Active metamagics
     * @param {boolean} canPrepareMore - Can prepare more
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createHybridSpellRow(/** @type {Spell} */ spell, /** @type {number} */ spellId, /** @type {SpellLevel} */ adjustedLevel, /** @type {MetamagicType[]} */ activeMetamagics, /** @type {boolean} */ canPrepareMore, /** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const spellRowContainer = this.uiFactory._createSpellRowContainer(container);

        if (canPrepareMore) {
            this._createHybridPrepareButton(spell, spellId, adjustedLevel, activeMetamagics, spellRowContainer, component);
        } else {
            this.uiFactory._createDisabledButton(spellRowContainer);
        }

        this.uiFactory._createStyledSpellName(spell, adjustedLevel, activeMetamagics, spellRowContainer, container, component);
    }

    /**
     * Create spell row container
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
     * Create prepare button for hybrid casters
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {MetamagicType[]} activeMetamagics - Active metamagic types
     * @param {HTMLElement} spellRowContainer - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createHybridPrepareButton(spell, spellId, adjustedLevel, activeMetamagics, spellRowContainer, component) {
        // Get global metamagics for level calculation only - DON'T store them in the preparation
        const globalMetamagics = this.getGlobalActiveMetamagics();

        // Calculate final adjusted level avoiding duplicate metamagics
        const tempPreparation = { spellId: spell.id, metamagic: activeMetamagics, count: 1, adjustedLevel: /** @type {SpellLevel} */ (adjustedLevel) };
        const finalAdjustedLevel = this._calculateFinalLevel(tempPreparation, globalMetamagics, adjustedLevel);

        const prepareSpellBtnConfig = {
            label: "+",
            class: "spellbook-prepare-btn",
            id: `${spell.name}-${spellId}-prepare-hybrid`,
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
                        
                        // For hybrid casters, check if this exact preparation already exists
                        const existingIndex = preparations.findIndex(prep => 
                            prep.spellId === spellId &&
                            JSON.stringify(prep.metamagic.sort()) === JSON.stringify(metamagic.sort())
                        );
                        
                        if (existingIndex < 0) {
                            return [...preparations, {
                                spellId: spellId,
                                metamagic: metamagic,
                                count: 1
                            }];
                        }
                        
                        return preparations;
                    })()`
                },
                // Second action: Decrement totalRemaining (preparation slots) at the FINAL level
                {
                    type: "updateMetadata",
                    bindTarget: `spellLevelSettings.${getSpellLevelKey(/** @type {import('../types/types.js').SpellLevel} */(finalAdjustedLevel))}.totalRemaining`,
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

    /**
     * Create prepared spell entry with global metamagic support
     */
    /**
     * Create prepared spell entry with global metamagic support
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {number} prepIndex - Preparation index
     * @param {Preparation} originalPreparation - Original preparation object
     * @param {Preparation} displayPreparation - Display preparation object
     * @param {import('../types/types.js').SpellLevel} targetLevel - Target level being rendered
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createHybridPreparedSpellEntryWithGlobal(spell, spellId, prepIndex, originalPreparation, displayPreparation, targetLevel, container, component) {
        const spellContainer = container.createDiv();
        spellContainer.style.display = 'flex';
        spellContainer.style.alignItems = 'flex-start';
        spellContainer.style.gap = '10px';
        spellContainer.style.marginBottom = '5px';
        spellContainer.style.padding = '5px';
        spellContainer.style.borderRadius = '5px';

        // Create buttons container
        const buttonsContainer = spellContainer.createDiv();
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '5px';
        buttonsContainer.style.flexShrink = '0';
        buttonsContainer.style.minWidth = 'auto';

        this._createHybridCastAndRemoveButtonsWithGlobal(spell, spellId, prepIndex, originalPreparation, displayPreparation, targetLevel, buttonsContainer, component);
        this._createHybridPreparedSpellInfo(spell, displayPreparation, spellContainer);
    }

    /**
     * Create cast and remove buttons with global metamagic awareness
     */
    /**
     * Create cast and remove buttons with global metamagic awareness
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {number} prepIndex - Preparation index
     * @param {Preparation} originalPreparation - Original preparation object
     * @param {Preparation} displayPreparation - Display preparation object
     * @param {import('../types/types.js').SpellLevel} targetLevel - Target level being rendered
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createHybridCastAndRemoveButtonsWithGlobal(spell, spellId, prepIndex, originalPreparation, displayPreparation, targetLevel, container, component) {
        // Check if this is a 0-level spell (cantrip)
        const isCantrip = targetLevel === 0;
        
        // Calculate storage level (where the preparation is actually stored)
        // targetLevel includes global metamagic, storage level is where it was originally prepared
        const globalMetamagics = this.getGlobalActiveMetamagics();
        const globalAdjustment = globalMetamagics.reduce((total, metamagic) => {
            return total + getMetamagicLevelAdjustment(metamagic);
        }, 0);
        const storageLevel = targetLevel - globalAdjustment;
        
        // Special handling for cantrips - they often don't use spell slots
        // so we need a different action for them
        const castBtnConfig = {
            label: "Cast",
            class: "spellbook-cast-btn",
            id: `${spell.name.replace(/\s+/g, '-')}-${spellId}-level${targetLevel}-${prepIndex}-cast-hybrid-global`,
            style: "primary",
            action: isCantrip ? {
                // For cantrips, we don't reduce spell slots but might track usage differently
                type: "inlineJS",
                code: `console.log("Casting cantrip: ${spell.name}");`
            } : {
                // ONLY decrement spell casts remaining, preparation stays in list
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${getSpellLevelKey(targetLevel)}.totalCastsRemaining`,
                evaluate: true,
                value: `(() => {
                    const current = x;
                    if ((current ?? 0) <= 1) {
                        return null;
                    }
                    return current - 1;
                })()`
            }
        };
    
        const removeBtnConfig = {
            label: "Remove",
            class: "spellbook-remove-btn",
            id: `${spell.name.replace(/\s+/g, '-')}-${spellId}-level${targetLevel}-${prepIndex}-remove-hybrid-global`,
            style: "destructive",
            action: {
                type: "updateMetadata",
                bindTarget: `spellPreparations.level${storageLevel}`,
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
    
        // Create and mount the buttons with proper error handling
        try {
            const castBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
                declaration: castBtnConfig,
                isPreview: false,
            });
    
            const removeBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
                declaration: removeBtnConfig,
                isPreview: false,
            });
    
            // Only mount the cast button if it's not a 0-level spell or if we specifically want to show it for cantrips
            if (!isCantrip || true) { // Change to "!isCantrip" if you want to hide cast buttons for cantrips
                this.mb.wrapInMDRC(castBtn, container, component);
            }
            
            this.mb.wrapInMDRC(removeBtn, container, component);
    
            // Create a button group with proper error handling
            const buttonGroup = this.mb.createButtonGroupMountable(this.spellbookFile.path, {
                declaration: {
                    referencedButtonIds: [castBtnConfig.id, removeBtnConfig.id],
                },
                renderChildType: 'inline',
            });
    
            this.mb.wrapInMDRC(buttonGroup, container, component);
        } catch (error) {
            console.error(`Error creating hybrid buttons for ${spell.name}:`, error);
        }
    }

    /**
     * Create hybrid prepared spell info display
     * @param {Spell} spell - The spell object
     * @param {Preparation} preparation - Preparation object
     * @param {HTMLElement} container - Container element
     */
    _createHybridPreparedSpellInfo(spell, preparation, container) {
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
    
        // No dots for hybrid casters since they don't have counts > 1
    }

    /**
     * Create global metamagic selector for hybrid casters
     */
    /**
     * Create global metamagic selector for hybrid casters
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     * @returns {Promise<HTMLElement>} Callout content element
     */
    async createGlobalMetamagicSelector(container, component, context, engine) {
        if (!this.containerManager._setupContainerForRender(container, component)) {
            return /** @type {HTMLElement} */ (/** @type {any} */ (undefined)); // Already rendered, skip
        }

        const activeMetamagics = this.getGlobalActiveMetamagics();
        const hasActiveMetamagics = activeMetamagics && activeMetamagics.length > 0;

        const calloutContent = await this.calloutManager._createCalloutWrapper(
            "Hybrid Metamagic",
            container,
            context,
            engine,
            component,
            "collapse-clean|sub",
            !hasActiveMetamagics
        );

        this._createGlobalMetamagicDropdownSection(calloutContent, component);
        this._createGlobalActiveMetamagicsSection(calloutContent, component);

        return calloutContent;
    }

    // ==================== GLOBAL METAMAGIC HELPER METHODS ====================

    /**
     * Create global metamagic dropdown section
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createGlobalMetamagicDropdownSection(/** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const dropdownSection = container.createDiv();
        dropdownSection.style.display = 'flex';
        dropdownSection.style.alignItems = 'center';
        dropdownSection.style.gap = '8px';
        dropdownSection.style.marginBottom = '10px';
        dropdownSection.style.flexWrap = 'wrap';

        this._createGlobalMetamagicSelect(dropdownSection, component);
        this._createAddGlobalMetamagicButton(dropdownSection, component);
    }

    /**
     * Create global metamagic select dropdown
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createGlobalMetamagicSelect(/** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const selectContainer = container.createDiv();
        const metamagicSelectConfig = {
            renderChildType: 'inline',
            declaration: {
                inputFieldType: 'inlineSelect',
                bindTarget: this.mb.parseBindTarget(`spellLevelSettings.selectedGlobalMetamagic`, this.spellbookFile.path),
                arguments: [
                    { name: 'option', value: [''] },
                    { name: 'option', value: ['Still Spell (+1 level)'] },
                    { name: 'option', value: ['Silent Spell (+1 level)'] },
                    { name: 'option', value: ['Extend Spell (+1 level)'] },
                    { name: 'option', value: ['Empower Spell (+2 levels)'] },
                    { name: 'option', value: ['Maximize Spell (+3 levels)'] },
                    { name: 'defaultValue', value: [''] }
                ]
            }
        };

        const metamagicSelect = this.mb.createInputFieldMountable(this.spellbookFile.path, metamagicSelectConfig);
        this.mb.wrapInMDRC(metamagicSelect, selectContainer, component);
        
        // Register cleanup for the Meta Bind component
        this.containerManager._registerComponentCleanup(component, () => {
            // Meta Bind components should be cleaned up automatically by MDRC wrapper
        });
    }

    /**
     * Create add global metamagic button
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createAddGlobalMetamagicButton(/** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const buttonContainer = container.createDiv();

        const addBtnConfig = {
            label: "+",
            id: `add-global-metamagic-btn`,
            style: "primary",
            cssClass: "width: 20px !important;",
            action: {
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.globalActiveMetamagics`,
                evaluate: true,
                value: `(() => {
                    const selected = app.metadataCache.getFileCache(app.vault.getAbstractFileByPath('${this.spellbookFile.path}'))?.frontmatter?.spellLevelSettings?.selectedGlobalMetamagic;
                    const current = x || [];
                    if (selected && selected !== '' && !current.includes(selected)) {
                        return [...current, selected];
                    }
                    return current;
                })()`
            }
        };

        const addBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
            declaration: addBtnConfig,
            isPreview: false,
        });
        this.mb.wrapInMDRC(addBtn, buttonContainer, component);
        
        // Register cleanup for the Meta Bind button component
        this.containerManager._registerComponentCleanup(component, () => {
            // Meta Bind button components should be cleaned up automatically by MDRC wrapper
        });
    }

    _createGlobalActiveMetamagicsSection(/** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const activeContainer = container.createDiv();
        const label = activeContainer.createEl('label', { text: 'Active Metamagics:' });
        label.style.fontSize = '0.85em';
        label.style.fontWeight = '600';
        label.style.color = '#fff';
        activeContainer.style.marginTop = '8px';

        const activeMetamagics = this.getGlobalActiveMetamagics();

        if (activeMetamagics.length === 0) {
            this.uiFactory._createNoActiveMetamagicsMessage(activeContainer);
        } else {
            this._createGlobalMetamagicPills(activeMetamagics, activeContainer, component);
        }
    }

    _createGlobalMetamagicPills(/** @type {MetamagicType[]} */ activeMetamagics, /** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const metamagicsRow = container.createDiv();
        metamagicsRow.style.display = 'flex';
        metamagicsRow.style.flexWrap = 'wrap';
        metamagicsRow.style.gap = '6px';
        metamagicsRow.style.marginTop = '6px';

        for (let i = 0; i < activeMetamagics.length; i++) {
            this._createGlobalMetamagicPill(activeMetamagics[i], i, metamagicsRow, component);
        }
    }

    _createGlobalMetamagicPill(/** @type {MetamagicType} */ metamagic, /** @type {number} */ index, /** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const metamagicPill = container.createDiv();
        metamagicPill.style.display = 'flex';
        metamagicPill.style.alignItems = 'center';
        metamagicPill.style.gap = '4px';
        metamagicPill.style.padding = '3px 6px';
        metamagicPill.style.backgroundColor = 'rgba(80, 80, 80, 0.2)';
        metamagicPill.style.borderRadius = '10px';
        metamagicPill.style.fontSize = '0.8em';
        metamagicPill.style.whiteSpace = 'nowrap';
        metamagicPill.style.border = '1px solid rgba(100, 100, 100, 0.3)';

        const nameSpan = metamagicPill.createEl('span', {
            text: metamagic,
            cls: 'metamagic-name'
        });
        nameSpan.style.color = '#fff';

        this._createRemoveGlobalMetamagicButton(metamagicPill, index, component);
    }

    _createRemoveGlobalMetamagicButton(/** @type {HTMLElement} */ container, /** @type {number} */ index, /** @type {Component} */ component) {
        const removeBtnContainer = container.createDiv();
        removeBtnContainer.style.display = 'flex';
        removeBtnContainer.style.alignItems = 'center';

        const removeBtnConfig = {
            label: "✕",
            id: `remove-global-metamagic-${index}`,
            style: "destructive",
            action: {
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.globalActiveMetamagics`,
                evaluate: true,
                value: `x.filter((_, index) => index !== ${index})`
            }
        };

        const removeBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
            declaration: removeBtnConfig,
            isPreview: false,
        });
        this.mb.wrapInMDRC(removeBtn, removeBtnContainer, component);
        
        // Register cleanup for the Meta Bind button component
        this.containerManager._registerComponentCleanup(component, () => {
            // Meta Bind button components should be cleaned up automatically by MDRC wrapper
        });
    }

    _createNoActiveMetamagicsMessage(/** @type {HTMLElement} */ container) {
        const noActiveMsg = container.createEl('div', {
            text: 'No active metamagics',
            cls: 'no-active-metamagics'
        });
        noActiveMsg.style.fontStyle = 'italic';
        noActiveMsg.style.color = 'gray';
        noActiveMsg.style.fontSize = '0.85em';
    }

}