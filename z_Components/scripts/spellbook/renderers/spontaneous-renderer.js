/**
 * Concrete implementation for spontaneous casters (Sorcerer, Bard, Oracle, etc.)
 */

import { SpellbookRenderer } from '../core/spellbook.js';
import { getSpellsPerLevel } from '../utils/spell-slots-lookup.js';
import { getSpellLevelKey, getMetamagicLevelAdjustment } from '../utils/spell-calculations.js';
import { createSpellLink, createSpellInfoRow } from '../utils/spell-ui-components.js';
import { createNoActiveMetamagicsMessage } from '../utils/metamagic-utils.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').JSEngine} JSEngine
 * @typedef {import('../types/types.js').MetadataUpdate} MetadataUpdate
 * @typedef {import('../types/types.js').JSEngineContext} JSEngineContext
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 */

/**
 * Spontaneous spellcaster renderer (extends SpellbookRenderer)
 * This class EXTENDS SpellbookRenderer and contains the exact logic from SpontaneousOld
 */
export class SpontaneousSpellbookRenderer extends SpellbookRenderer {
    /**
     * Get global active metamagics for spontaneous casters
     * @returns {import('../types/types.js').MetamagicType[]} Array of active global metamagics
     */
    getGlobalActiveMetamagics() {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.globalActiveMetamagics`, this.spellbookFile.path);
        return this.mb.getMetadata(settingsTarget) || [];
    }

    /**
     * Create global metamagic selector for spontaneous casters
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle management
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     * @returns {Promise<HTMLElement>} The selector container
     */
    async createGlobalMetamagicSelector(container, component, context, engine) {
        if (!this.containerManager._setupContainerForRender(container, component)) {
            return container; // Already rendered, skip
        }

        const activeMetamagics = this.getGlobalActiveMetamagics();
        const hasActiveMetamagics = activeMetamagics && activeMetamagics.length > 0;

        const calloutContent = await this.calloutManager._createCalloutWrapper(
            "Spontaneous Metamagic",
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

    /**
     * Render known spells for spontaneous casters - shows spells at adjusted level
     * @param {SpellLevel} targetLevel - Target spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     * @param {JSEngineContext} context - Engine context
     * @param {JSEngine} engine - JS Engine instance
     */
    async renderKnownSpellsByLevel(targetLevel, container, component, context, engine) {
		if (!this.containerManager._setupContainerForRender(container, component)) {
			return; // Already rendered, skip
        }

        // Get global metamagics
        const globalMetamagics = this.getGlobalActiveMetamagics();
        const totalLevelAdjustment = globalMetamagics.reduce((total, metamagic) => {
            return total + getMetamagicLevelAdjustment(metamagic);
        }, 0);

        // Find all known spells whose adjusted level equals our target level
        const spellsTarget = this.mb.parseBindTarget("spells", this.spellbookFile.path);
        const allSpells = this.mb.getMetadata(spellsTarget) || [];

        const relevantSpells = allSpells.filter((/** @type {Spell} */ spell) => {
            if (!spell.known) return false;
            const adjustedLevel = /** @type {SpellLevel} */ (spell.baseLevel + totalLevelAdjustment);
            return adjustedLevel === targetLevel;
        });

        // Early return if no spells for this adjusted level
        if (relevantSpells.length === 0) {
            return;
        }

        // Create callout wrapper
        const calloutContent = await this.calloutManager._createCalloutWrapper(`Level ${targetLevel}`, container, context, engine, component, "collapse-clean", false, "known");

        // Add spell slots tracker
        if (targetLevel > 0) {
            this.createSpellSlotsTracker(targetLevel, calloutContent, component);
        }

        // Render each spell with cast button
        for (const spell of relevantSpells) {
            if (!spell.id) {
                console.error(`Spell ${spell.name} missing required id field`);
                continue;
            }

            const adjustedLevel = /** @type {SpellLevel} */ (spell.baseLevel + totalLevelAdjustment);
            const spellContainer = calloutContent.createDiv();

            this._createSpontaneousSpellRow(spell, spell.id, adjustedLevel, globalMetamagics, spellContainer, component);
        }
    }

    /**
     * Render prepared spells - returns empty for spontaneous casters
     * @param {SpellLevel} _targetLevel - Target spell level
     * @param {HTMLElement} container - Container element
     * @param {Component} _component - Component for lifecycle
     * @param {JSEngineContext} _context - Engine context
     * @param {JSEngine} _engine - JS Engine instance
     */
    async renderPreparedSpellsByLevel(_targetLevel, container, _component, _context, _engine) {
        if (!this.containerManager._setupContainerForRender(container, _component)) {
            return; // Already rendered, skip
        }
        // Spontaneous casters don't prepare spells, so this is intentionally empty
        return;
    }

    /**
     * Reset method for spontaneous casters
     * @param {boolean} resetMetamagics - Whether to reset metamagics
     * @param {boolean} _resetPreparations - Whether to reset preparations (unused for spontaneous casters)
     * @param {boolean} resetSLAs - Whether to reset SLAs
     * @returns {MetadataUpdate[]} Array of update actions
     */
    resetAllPreparationCounts(resetMetamagics = false, _resetPreparations = false, resetSLAs = true) {
        const updates = [];

        // Get class info from frontmatter
        const castingClass = this.getCastingClass();
        const casterLevel = this.getCasterLevel();
        const castingStatBonus = this.getCastingStatBonus();

        // Reset totalRemaining to max spells per day for all spell levels
        for (let level = 0; level <= 9; level++) {
            const levelKey = getSpellLevelKey(/** @type {SpellLevel} */ (level));
            const maxSlots = getSpellsPerLevel(castingClass, casterLevel, level, castingStatBonus);

            updates.push({
                type: /** @type {"updateMetadata"} */ ("updateMetadata"),
                bindTarget: `spellLevelSettings.${levelKey}.totalRemaining`,
                evaluate: false,
                value: maxSlots > 0 ? maxSlots : null
            });
        }

        if (resetMetamagics) {
            // Clear global metamagics for spontaneous casters
            updates.push({
                type: /** @type {"updateMetadata"} */ ("updateMetadata"),
                bindTarget: "spellLevelSettings.globalActiveMetamagics",
                evaluate: false,
                value: []
            });
        }

        // Add SLA reset if requested
        if (resetSLAs) {
            updates.push(...this.getSLAResetUpdates());
        }

        return updates;
    }

    // ==================== SPONTANEOUS CASTER SPECIFIC METHODS ====================

    /**
     * Create a row for a spontaneous spell
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {string[]} globalMetamagics - Global metamagics
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    _createSpontaneousSpellRow(spell, spellId, adjustedLevel, globalMetamagics, container, component) {
        const spellRowContainer = this.uiFactory._createSpellRowContainer(container);

        this._createCastButton(spell, spellId, adjustedLevel, spellRowContainer, component);

        this._createSpontaneousSpellName(spell, adjustedLevel, globalMetamagics, spellRowContainer, container, component);
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
     * Create cast button for spontaneous spell
     * @param {Spell} spell - The spell object
     * @param {number} spellId - Spell ID
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {HTMLElement} spellRowContainer - Row container
     * @param {Component} component - Component for lifecycle
     */
    _createCastButton(spell, spellId, adjustedLevel, spellRowContainer, component) {
        const castSpellBtnConfig = {
            label: "Cast",
            class: adjustedLevel > 0 ? "spellbook-cast-btn" : "spellbook-cast-btn at-will",
            id: `${spell.name}-${spellId}-cast-spontaneous`,
            style: "primary",
            action: {
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${getSpellLevelKey(adjustedLevel)}.totalRemaining`,
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

        const buttonOpts = { declaration: castSpellBtnConfig, isPreview: false };
        const castSpellBtn = this.mb.createButtonMountable(this.spellbookFile.path, buttonOpts);

        const castButtonContainer = spellRowContainer.createDiv();
        castButtonContainer.style.flexShrink = '0';
        castButtonContainer.style.minWidth = 'auto';

        this.mb.wrapInMDRC(castSpellBtn, castButtonContainer, component);

        const castButtonGroup = this.mb.createButtonGroupMountable(this.spellbookFile.path, {
            declaration: { referencedButtonIds: [castSpellBtnConfig.id] },
            renderChildType: 'inline',
        });

        this.mb.wrapInMDRC(castButtonGroup, castButtonContainer, component);
        // Meta Bind components cleanup handled automatically by wrapInMDRC()
    }

    /**
     * Create spell name with metamagic styling for spontaneous casters
     * @param {Spell} spell - The spell object
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {string[]} globalMetamagics - Global metamagics
     * @param {HTMLElement} rowContainer - Row container
     * @param {HTMLElement} spellContainer - Spell container
     * @param {Component} component - Component for lifecycle
     */
    _createSpontaneousSpellName(spell, adjustedLevel, globalMetamagics, rowContainer, spellContainer, component) {
        const spellNameContainer = rowContainer.createDiv();
        spellNameContainer.style.flex = '1';
        spellNameContainer.style.minWidth = '0';
        spellNameContainer.style.lineHeight = '1.2';
    
        const spellNameSpan = spellNameContainer.createEl('span', { cls: 'spell-name-display' });
    
        // Add linked spell name
        const spellLink = createSpellLink(spell.name, 'spell-base-name');
        spellNameSpan.appendChild(spellLink);
    
        // Add metamagic styling if present (spontaneous style - no level indicator)
        if (globalMetamagics.length > 0) {
            this.uiFactory._addMetamagicStyling(spellNameSpan, /** @type {MetamagicType[]} */ (globalMetamagics));
        }
    
        spellNameSpan.dataset.spellName = spell.name;
        spellNameSpan.dataset.adjustedLevel = adjustedLevel.toString();
    
        // Add spell info row
        const infoRow = createSpellInfoRow(spell, adjustedLevel, this.getCastingStatBonus(), this.getCasterLevel());
        spellNameContainer.appendChild(infoRow);
    
        // Apply static spacing (spontaneous spells always have 2 lines)
        spellContainer.style.marginBottom = '10px';
        spellContainer.style.paddingBottom = '5px';
    }
    

    /**
     * Add spontaneous metamagic styling to spell name
     * @param {HTMLElement} spellNameSpan - Spell name span element
     * @param {MetamagicType[]} globalMetamagics - Global metamagic types
     */
    _addSpontaneousMetamagicStyling(spellNameSpan, globalMetamagics) {
        const metamagicNames = globalMetamagics.map((/** @type {MetamagicType} */ meta) =>
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
        // Meta Bind component cleanup handled automatically by wrapInMDRC()
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
        // Meta Bind component cleanup handled automatically by wrapInMDRC()
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
        // Meta Bind component cleanup handled automatically by wrapInMDRC()
    }

    _createNoActiveMetamagicsMessage(/** @type {HTMLElement} */ container) {
        createNoActiveMetamagicsMessage(container);
    }
}