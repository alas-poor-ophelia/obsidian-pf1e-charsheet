/**
 * @file ui-component-factory.js
 * @description Factory class for creating UI components in the spellbook renderer system.
 * Centralizes all UI component creation logic with proper Meta Bind integration.
 */

// Note: Additional imports will be added as more UI methods are extracted
// Currently only importing what's needed for spell slots UI

import { getSpellLevelKey } from '../utils/spell-calculations.js';
import {
    createNoActiveMetamagicsMessage,
    addMetamagicStyling
} from '../utils/metamagic-utils.js';
import {
    createSpellInfoRow,
    createSpellLink
} from '../utils/spell-ui-components.js';

/**
 * @typedef {import('../types/types.js').SpellbookRenderer} SpellbookRenderer
 * @typedef {import('../types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 * @typedef {import('../types/types.js').Component} Component
 */

/**
 * Factory class for creating UI components in the spellbook renderer.
 * Handles creation of spell slots UI, metamagic selectors, and spell row components.
 * 
 * @class UIComponentFactory
 */
export class UIComponentFactory {

    /**
     * Creates an instance of UIComponentFactory.
     * 
     * @param {SpellbookRenderer} renderer - Reference to the parent renderer instance
     */
    constructor(renderer) {
        /**
         * Reference to the parent renderer for accessing shared state and Meta Bind
         * @type {SpellbookRenderer}
         * @private
         */
        this.renderer = renderer;
    }

    /**
     * Gets the Meta Bind instance from the renderer
     * @returns {MetaBindAPI} Meta Bind plugin instance
     * @private
     */
    get mb() {
        return this.renderer.mb;
    }

    /**
     * Gets the spellbook file path from the renderer
     * @returns {string} Path to the spellbook file
     * @private
     */
    get spellbookPath() {
        return this.renderer.spellbookNotePath;
    }

    /**
     * Gets the spellbook file from the renderer
     * @returns {import('obsidian').TFile} The spellbook file
     * @private
     */
    get spellbookFile() {
        return this.renderer.spellbookFile;
    }

    /**
     * Dispose of any resources managed by this factory
     * Currently no resources need disposal, but method exists for interface consistency
     */
    dispose() {
        // No resources to clean up at this time
        // Method exists for interface consistency with other managers
    }

    // ===========================
    // Spell Slots UI Methods
    // ===========================

    /**
     * Create spell slots tracker for a level
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     * @returns {HTMLElement} The tracker container
     */
    createSpellSlotsTracker(spellLevel, container, component) {
        const slotsContainer = container.createDiv();
        slotsContainer.style.marginBottom = '15px';

        const levelKey = getSpellLevelKey(/** @type {import('../types/types.js').SpellLevel} */(spellLevel));
        const maxSlots = this.renderer.getAvailableSpellSlots(spellLevel);
        const remainingSlots = this.renderer.getRemainingSpellSlots(spellLevel);

        // If remainingSlots is null/undefined, initialize to maxSlots (default rested state)
        const displayRemaining = remainingSlots ?? maxSlots;

        if (maxSlots > 0) {
            this._createSlotsSelect(levelKey, maxSlots, displayRemaining, slotsContainer, component);
        } else {
            this._createNoSlotsMessage(slotsContainer);
        }

        return slotsContainer;
    }

    /**
     * Helper: Create slots select element
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {number} maxSlots - Maximum available slots
     * @param {number} remainingSlots - Currently remaining slots
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createSlotsSelect(levelKey, maxSlots, remainingSlots, container, component) {
        const selectConfig = {
            renderChildType: 'block',
            declaration: {
                inputFieldType: 'select',
                bindTarget: this.mb.parseBindTarget(`spellLevelSettings.${levelKey}.totalRemaining`, this.spellbookFile.path),
                arguments: [
                    // Options from 1 to maxSlots
                    ...Array.from({ length: maxSlots }, (_, i) => ({
                        name: 'option',
                        value: [`${i + 1}`]
                    })),
                    // Set default to remaining slots, or no default if null/0
                    ...(remainingSlots > 0 ? [{ name: 'defaultValue', value: [`${remainingSlots}`] }] : []),
                    { name: 'class', value: ['tracker spellbook-preps'] }
                ]
            }
        };
        const slotsSelect = this.mb.createInputFieldMountable(this.spellbookFile.path, selectConfig);
        const wrappedElement = this.mb.wrapInMDRC(slotsSelect, container, component);

        // Register cleanup for the Meta Bind component
        this.renderer._registerComponentCleanup(component, () => {
            // Meta Bind components should be cleaned up automatically by MDRC wrapper
            // but we track this for disposal monitoring
        });
    }

    /**
     * Helper: Create no slots available message
     * @param {HTMLElement} container - Container element
     */
    _createNoSlotsMessage(container) {
        const noSlotsMsg = container.createEl('div', {
            text: 'No spell slots available at this level',
            cls: 'no-spell-slots'
        });
        noSlotsMsg.style.fontStyle = 'italic';
        noSlotsMsg.style.color = 'gray';
    }

    // ===========================
    // Metamagic UI Methods
    // ===========================

    /**
     * Create metamagic selector for a spell level
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     * @param {import('../types/types.js').JSEngineContext} context - Engine context
     * @param {import('../types/types.js').JSEngine} engine - JS Engine instance
     * @returns {Promise<HTMLElement>} The metamagic selector container
     */
    async createMetamagicSelector(spellLevel, container, component, context, engine) {
        // Check if there are active metamagics for this spell level
        const activeMetamagics = this.renderer.getActiveMetamagics(spellLevel);
        const hasActiveMetamagics = activeMetamagics && activeMetamagics.length > 0;

        // Create metamagic callout wrapper - expand if there are active metamagics
        const calloutContent = await this.renderer._createCalloutWrapper(
            "Metamagic",
            container,
            context,
            engine,
            component,
            "collapse-clean|sub",
            !hasActiveMetamagics, // collapsed = true if NO active metamagics
            `level${spellLevel}` // Use level as context for unique metamagic callouts
        );

        const levelKey = getSpellLevelKey(/** @type {import('../types/types.js').SpellLevel} */(spellLevel));

        this._createMetamagicDropdownSection(levelKey, calloutContent, component);
        this._createActiveMetamagicsSection(spellLevel, calloutContent, levelKey, component);

        return calloutContent;
    }

    /**
     * Helper: Create metamagic container with base styling
     * @param {HTMLElement} container - Container element
     * @returns {HTMLElement} The metamagic container
     */
    _createMetamagicContainer(container) {
        const metamagicContainer = container.createDiv();
        metamagicContainer.style.marginBottom = '12px'; // Reduced from 15px
        metamagicContainer.style.padding = '8px'; // Reduced from 10px
        metamagicContainer.style.backgroundColor = 'rgba(60, 60, 60, 0.15)'; // Dark gray instead of blue
        metamagicContainer.style.borderRadius = '4px'; // Slightly smaller radius
        metamagicContainer.style.fontSize = '0.9em'; // Slightly smaller text
        return metamagicContainer;
    }

    /**
     * Helper: Create metamagic dropdown and add button section
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createMetamagicDropdownSection(levelKey, container, component) {
        const dropdownSection = container.createDiv();
        dropdownSection.style.display = 'flex';
        dropdownSection.style.alignItems = 'center';
        dropdownSection.style.gap = '8px'; // Reduced from 10px
        dropdownSection.style.marginBottom = '10px'; // Reduced from 15px
        dropdownSection.style.flexWrap = 'wrap';

        this._createMetamagicSelect(levelKey, dropdownSection, component);
        this._createAddMetamagicButton(levelKey, dropdownSection, component);
    }

    /**
     * Helper: Create metamagic select dropdown
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createMetamagicSelect(levelKey, container, component) {
        const selectContainer = container.createDiv();
        const metamagicSelectConfig = {
            renderChildType: 'inline',
            declaration: {
                inputFieldType: 'inlineSelect',
                bindTarget: this.mb.parseBindTarget(`spellLevelSettings.${levelKey}.selectedMetamagic`, this.spellbookFile.path),
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
        this.renderer._registerComponentCleanup(component, () => {
            // Meta Bind components should be cleaned up automatically by MDRC wrapper
        });
    }

    /**
     * Helper: Create add metamagic button
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createAddMetamagicButton(levelKey, container, component) {
        const buttonContainer = container.createDiv();
        const spellLevel = levelKey.replace('level', '');

        const addBtnConfig = {
            label: "+",
            id: `add-metamagic-btn-${spellLevel}`,
            style: "primary",
            cssClass: "width: 20px !important;",
            action: {
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${levelKey}.activeMetamagics`,
                evaluate: true,
                value: `(() => {
                    const selected = app.metadataCache.getFileCache(app.vault.getAbstractFileByPath('${this.spellbookFile.path}'))?.frontmatter?.spellLevelSettings?.${levelKey}?.selectedMetamagic;
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
    }

    /**
     * Helper: Create active metamagics display section
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {HTMLElement} container - Container element
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createActiveMetamagicsSection(spellLevel, container, levelKey, component) {
        const activeContainer = container.createDiv();
        const label = activeContainer.createEl('label', { text: 'Active Metamagics:' });
        label.style.fontSize = '0.85em'; // Smaller label
        label.style.fontWeight = '600';
        label.style.color = '#fff'; // Much darker for better contrast
        activeContainer.style.marginTop = '8px'; // Reduced from 10px

        const activeMetamagics = this.renderer.getActiveMetamagics(spellLevel);

        if (activeMetamagics.length === 0) {
            createNoActiveMetamagicsMessage(activeContainer);
        } else {
            this._createMetamagicPills(activeMetamagics, activeContainer, levelKey, spellLevel, component);
        }
    }

    /**
     * Helper: Create metamagic pills with remove buttons
     * @param {string[]} activeMetamagics - Array of active metamagics
     * @param {HTMLElement} container - Container element
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createMetamagicPills(activeMetamagics, container, levelKey, spellLevel, component) {
        const metamagicsRow = container.createDiv();
        metamagicsRow.style.display = 'flex';
        metamagicsRow.style.flexWrap = 'wrap';
        metamagicsRow.style.gap = '6px'; // Reduced from 8px
        metamagicsRow.style.marginTop = '6px'; // Reduced from 8px

        for (let i = 0; i < activeMetamagics.length; i++) {
            this._createMetamagicPill(activeMetamagics[i], i, metamagicsRow, levelKey, spellLevel, component);
        }
    }

    /**
     * Helper: Create individual metamagic pill
     * @param {string} metamagic - The metamagic name
     * @param {number} index - Index of the metamagic
     * @param {HTMLElement} container - Container element
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createMetamagicPill(metamagic, index, container, levelKey, spellLevel, component) {
        const metamagicPill = container.createDiv();
        metamagicPill.style.display = 'flex';
        metamagicPill.style.alignItems = 'center';
        metamagicPill.style.gap = '4px'; // Reduced from 5px
        metamagicPill.style.padding = '3px 6px'; // Reduced from 4px 8px
        metamagicPill.style.backgroundColor = 'rgba(80, 80, 80, 0.2)'; // Dark gray instead of black
        metamagicPill.style.borderRadius = '10px'; // Slightly smaller
        metamagicPill.style.fontSize = '0.8em'; // Smaller text
        metamagicPill.style.whiteSpace = 'nowrap';
        metamagicPill.style.border = '1px solid rgba(100, 100, 100, 0.3)'; // Subtle dark border

        const nameSpan = metamagicPill.createEl('span', {
            text: metamagic,
            cls: 'metamagic-name'
        });
        nameSpan.style.color = '#fff'; // Much darker text for better readability

        this._createRemoveMetamagicButton(metamagicPill, levelKey, spellLevel, index, component);
    }

    /**
     * Helper: Create remove metamagic button
     * @param {HTMLElement} container - Container element
     * @param {string} levelKey - The level key (e.g., "level1")
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {number} index - Index of the metamagic to remove
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createRemoveMetamagicButton(container, levelKey, spellLevel, index, component) {
        const removeBtnContainer = container.createDiv();
        removeBtnContainer.style.display = 'flex';
        removeBtnContainer.style.alignItems = 'center';

        const removeBtnConfig = {
            label: "✕",
            id: `remove-metamagic-${spellLevel}-${index}`,
            style: "destructive",
            action: {
                type: "updateMetadata",
                bindTarget: `spellLevelSettings.${levelKey}.activeMetamagics`,
                evaluate: true,
                value: `x.filter((_, index) => index !== ${index})`
            }
        };

        const removeBtn = this.mb.createButtonMountable(this.spellbookFile.path, {
            declaration: removeBtnConfig,
            isPreview: false,
        });
        this.mb.wrapInMDRC(removeBtn, removeBtnContainer, component);
    }

    /**
    * Add metamagic styling to spell name element
    * @param {HTMLElement} spellNameSpan - Spell name element
    * @param {string[]} activeMetamagics - Array of active metamagic names
    */
    _addMetamagicStyling(spellNameSpan, activeMetamagics) {
        addMetamagicStyling(spellNameSpan, activeMetamagics)
    }

    /**
    * Create "no active metamagics" message
    * @param {HTMLElement} container - Container to add message to
    */
   _createNoActiveMetamagicsMessage(container) {
        createNoActiveMetamagicsMessage(container)
   }

    // ===========================
    // Spell Row UI Methods
    // ===========================

    /**
     * Create spell row with preparation button
     * @param {import('../types/types.js').Spell} spell - The spell object
     * @param {number} spellIndex - Index of the spell
     * @param {SpellLevel} adjustedLevel - Adjusted spell level
     * @param {string[]} activeMetamagics - Active metamagics
     * @param {boolean} canPrepareMore - Whether more can be prepared
     * @param {HTMLElement} container - Container element
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _createSpellRow(spell, spellIndex, adjustedLevel, activeMetamagics, canPrepareMore, container, component) {
        const spellRowContainer = this._createSpellRowContainer(container);

        if (canPrepareMore) {
            this._createPrepareButton(spell, spellIndex, adjustedLevel, activeMetamagics, spellRowContainer, component);
        } else {
            this._createDisabledButton(spellRowContainer);
        }

        this._createStyledSpellName(spell, adjustedLevel, activeMetamagics, spellRowContainer, container, component);
    }

    /**
     * Create spell row container with styling
     * @param {HTMLElement} container - Parent container
     * @returns {HTMLElement} Styled row container
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
     * Create styled spell name with metamagic indicators
     * @param {import('../types/types.js').Spell} spell - The spell object
     * @param {number} adjustedLevel - Adjusted spell level
     * @param {string[]} activeMetamagics - Active metamagics
     * @param {HTMLElement} rowContainer - Row container
     * @param {HTMLElement} spellContainer - Spell container
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
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
            addMetamagicStyling(spellNameSpan, activeMetamagics);
        }

        // Add level adjustment indicator if changed
        if (activeMetamagics.length > 0 && adjustedLevel !== spell.baseLevel) {
            this._addLevelAdjustmentIndicator(spellNameSpan, adjustedLevel);
        }

        spellNameSpan.dataset.spellName = spell.name;
        spellNameSpan.dataset.adjustedLevel = adjustedLevel.toString();

        // Add spell info row
        const infoRow = createSpellInfoRow(spell, /** @type {import('../types/types.js').SpellLevel} */(adjustedLevel), this.renderer.getCastingStatBonus(), this.renderer.getCasterLevel());
        spellNameContainer.appendChild(infoRow);

        // this._setupDynamicSpacing(spellNameContainer, spellContainer, component);
    }

    /**
     * Add level adjustment indicator to spell name
     * @param {HTMLElement} spellNameSpan - Spell name span element
     * @param {number} adjustedLevel - Adjusted spell level
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
     * Helper: Setup dynamic spacing based on text wrapping
     * @param {HTMLElement} spellNameContainer - Spell name container
     * @param {HTMLElement} spellContainer - Spell container
     * @param {import('../types/types.js').Component} component - Component for lifecycle
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
        this.renderer.containerManager._trackContainerResource(spellContainer, () => {
            window.removeEventListener('resize', resizeHandler);
        });

        if (component && component.register) {
            component.register(() => {
                window.removeEventListener('resize', resizeHandler);
            });
        }
    }

    /**
     * Create over-preparation warning message
     * @param {import('../types/types.js').SpellLevel} spellLevel - The spell level
     * @param {number} maxSlots - Maximum available slots
     * @param {number} totalPrepared - Total prepared spells
     * @param {HTMLElement} container - Container element
     */
    _createOverPreparationWarning(spellLevel, maxSlots, totalPrepared, container) {
        if (totalPrepared > maxSlots) {
            const warningContainer = container.createDiv();
            warningContainer.style.backgroundColor = 'rgba(255, 165, 0, 0.2)'; // Orange warning
            warningContainer.style.border = '1px solid #ff8c00';
            warningContainer.style.borderRadius = '4px';
            warningContainer.style.padding = '8px';
            warningContainer.style.marginBottom = '10px';

            const warningText = warningContainer.createEl('div', {
                text: `⚠️: ${totalPrepared}/${maxSlots} spells prepared`,
                cls: 'over-preparation-warning'
            });
            warningText.style.color = '#d2691e';
            warningText.style.fontWeight = 'bold';
            warningText.style.fontSize = '0.9em';

            return warningContainer;
        }
        return null;
    }

    /**
     * Helper: Create disabled button (used by all renderer types)
     * @param {HTMLElement} spellRowContainer - The container to add the disabled button to
     * @returns {HTMLElement} The disabled button container
     */
    _createDisabledButton(spellRowContainer) {
        const disabledButtonContainer = spellRowContainer.createDiv();
        disabledButtonContainer.style.flexShrink = '0';
        disabledButtonContainer.style.minWidth = '28px';
        disabledButtonContainer.style.height = '28px';
        disabledButtonContainer.style.backgroundColor = '#ccc';
        disabledButtonContainer.style.border = '1px solid #999';
        disabledButtonContainer.style.borderRadius = '3px';
        disabledButtonContainer.style.opacity = '0.5';
        return disabledButtonContainer;
    }



    /**
     * Create a spellbook navigation button for the config menu
     * @param {Function} onClick - Click handler for navigation
     * @returns {HTMLButtonElement}
     */
    createSpellbookNavigationButton(onClick) {
        const btn = document.createElement('button');
        btn.className = 'spellbook-nav-btn';
        btn.title = 'Open Spellbook in Main Pane';
        btn.type = 'button';
        btn.innerHTML = '<span class="spellbook-nav-icon" aria-hidden="true">📖</span> <span class="spellbook-nav-label">Open Spellbook</span>';
        btn.addEventListener('click', (ev) => onClick(ev));
        return btn;
    }

    /**
     * Create save loadout button for the config flyout menu
     * @param {Function} onClick - Click handler function
     * @returns {HTMLButtonElement}
     */
    createSaveLoadoutButton(onClick) {
        const btn = document.createElement('button');
        btn.className = 'spellbook-save-btn';
        btn.title = 'Save Current Spell Setup';
        btn.type = 'button';
        btn.innerHTML = '<span class="spellbook-save-icon" aria-hidden="true">💾</span> <span class="spellbook-save-label">Save Current Setup</span>';
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            onClick(ev);
        });
        return btn;
    }

    /**
     * Create load loadout button for the config flyout menu
     * @param {Function} onClick - Click handler function
     * @param {boolean} [disabled=false] - Whether button should be disabled
     * @returns {HTMLButtonElement}
     */
    createLoadLoadoutButton(onClick, disabled = false) {
        const btn = document.createElement('button');
        btn.className = 'spellbook-load-btn';
        btn.title = disabled ? 'No saved loadouts available' : 'Load Selected Setup';
        btn.type = 'button';
        btn.disabled = disabled;
        
        const icon = disabled ? '📂' : '📁';
        const label = disabled ? 'No Loadouts' : 'Load Selected Setup';
        
        btn.innerHTML = `<span class="spellbook-load-icon" aria-hidden="true">${icon}</span> <span class="spellbook-load-label">${label}</span>`;
        
        // Always add click handler, but check disabled state before executing
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            // Only execute if button is not disabled
            if (!btn.disabled) {
                onClick(ev);
            }
        });
        
        return btn;
    }

    /**
     * Update load button state based on available loadouts
     * @param {HTMLButtonElement} loadBtn - The load button element
     * @param {boolean} hasLoadouts - Whether loadouts are available
     */
    updateLoadButtonState(loadBtn, hasLoadouts) {
        loadBtn.disabled = !hasLoadouts;
        loadBtn.title = hasLoadouts ? 'Load Selected Setup' : 'No saved loadouts available';
        
        const icon = loadBtn.querySelector('.spellbook-load-icon');
        const label = loadBtn.querySelector('.spellbook-load-label');
        
        if (icon && label) {
            icon.textContent = hasLoadouts ? '📁' : '📂';
            label.textContent = hasLoadouts ? 'Load Selected Setup' : 'No Loadouts';
        }
        
        loadBtn.className = hasLoadouts ? 'spellbook-load-btn' : 'spellbook-load-btn disabled';
    }

    /**
     * Create loadout selector dropdown using Meta Bind for reactivity
     * @param {Array<import('../managers/config-manager.js').LoadoutData>} loadouts - Available loadouts
     * @param {HTMLElement} container - Container element to mount selector
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     * @returns {HTMLElement} - The selector container element
     */
    createLoadoutSelector(loadouts, container, component) {
        const selectorContainer = container.createDiv('spellbook-loadout-selector-container');

        // Label
        const label = selectorContainer.createEl('label', {
            text: 'Select Loadout:',
            cls: 'spellbook-loadout-selector-label'
        });

        // Dropdown container
        const dropdownContainer = selectorContainer.createDiv('spellbook-loadout-dropdown-container');

        if (loadouts.length === 0) {
            // No loadouts available - show message
            const noLoadoutsMsg = dropdownContainer.createDiv('spellbook-no-loadouts-message');
            noLoadoutsMsg.innerHTML = '<span class="spellbook-no-loadouts-icon">📂</span> No saved loadouts';
            return selectorContainer;
        }

        // Create Meta Bind inlineSelect configuration
        const selectConfig = {
            renderChildType: 'inline',
            declaration: {
                inputFieldType: 'inlineSelect',
                bindTarget: this.mb.parseBindTarget('selectedLoadout', this.spellbookFile.path),
                arguments: this._generateLoadoutSelectOptions(loadouts)
            }
        };

        // Create Meta Bind select component
        const loadoutSelect = this.mb.createInputFieldMountable(this.spellbookFile.path, selectConfig);
        this.mb.wrapInMDRC(loadoutSelect, dropdownContainer, component);

        // Register cleanup for the Meta Bind component
        this.renderer._registerComponentCleanup(component, () => {
            // Meta Bind components should be cleaned up automatically by MDRC wrapper
        });

        // Add description display area that will update based on current selection
        const descriptionArea = selectorContainer.createDiv('spellbook-loadout-description');
        this._setupLoadoutDescriptionDisplay(descriptionArea, loadouts, component);

        return selectorContainer;
    }

    /**
     * Generate Meta Bind select options from loadouts array
     * @private
     * @param {Array<import('../managers/config-manager.js').LoadoutData>} loadouts - Available loadouts
     * @returns {Array} - Meta Bind arguments array for inlineSelect
     */
    _generateLoadoutSelectOptions(loadouts) {
        const options = [
            { name: 'option', value: [''] }, // Empty option for "no selection"
            { name: 'defaultValue', value: [''] }
        ];

        // Add each loadout as an option
        loadouts.forEach(loadout => {
            options.splice(-1, 0, { name: 'option', value: [loadout.name] });
        });

        return options;
    }

    /**
     * Setup description display that watches for selection changes
     * @private
     * @param {HTMLElement} descriptionArea - Area to display description
     * @param {Array<import('../managers/config-manager.js').LoadoutData>} loadouts - Available loadouts
     * @param {import('../types/types.js').Component} component - Component for lifecycle management
     */
    _setupLoadoutDescriptionDisplay(descriptionArea, loadouts, component) {
        // Create a Meta Bind view that watches the selectedLoadout field
        const viewConfig = {
            renderChildType: 'inline',
            declaration: {
                inputFieldType: 'view',
                bindTarget: this.mb.parseBindTarget('selectedLoadout', this.spellbookFile.path)
            }
        };

        // Since we can't directly watch for changes in Meta Bind view,
        // we'll implement a polling approach to update descriptions
        let lastSelection = '';
        
        const updateDescription = async () => {
            try {
                const target = this.mb.parseBindTarget('selectedLoadout', this.spellbookFile.path);
                const currentSelection = await this.mb.getMetadata(target);
                
                if (currentSelection !== lastSelection) {
                    lastSelection = currentSelection;
                    
                    if (!currentSelection || currentSelection.trim() === '') {
                        descriptionArea.innerHTML = '';
                        descriptionArea.style.display = 'none';
                    } else {
                        const loadout = loadouts.find(l => l.name === currentSelection);
                        if (loadout && loadout.description) {
                            descriptionArea.innerHTML = `<span class="spellbook-loadout-desc-label">Description:</span> ${loadout.description}`;
                            descriptionArea.style.display = 'block';
                        } else {
                            descriptionArea.innerHTML = '';
                            descriptionArea.style.display = 'none';
                        }
                    }
                }
            } catch (error) {
                // Ignore errors in polling
            }
        };

        // Poll for changes every 500ms
        const pollInterval = setInterval(updateDescription, 500);
        
        // Register cleanup
        this.renderer._registerComponentCleanup(component, () => {
            clearInterval(pollInterval);
        });

        // Initial update
        updateDescription();
    }

}