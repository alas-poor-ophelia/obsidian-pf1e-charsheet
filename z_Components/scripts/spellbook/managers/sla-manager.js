/**
 * Spell-Like Abilities (SLA) management class
 * Handles all SLA-related functionality including tracking, rendering, and usage management
 */

import { createSpellLink } from '../utils/spell-ui-components.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').SpellLikeAbility} SpellLikeAbility
 * @typedef {import('../types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('../types/types.js').Component} Component
 * @typedef {import('../types/types.js').JSEngine} JSEngine
 * @typedef {import('../types/types.js').JSEngineContext} JSEngineContext
 * @typedef {import('../types/types.js').SpellMetadataManager} SpellMetadataManager
 */

/**
 * Manages Spell-Like Abilities for the spellbook
 */
export class SLAManager {
    /** @type {MetaBindAPI} */
    mb;
    /** @type {string} */
    spellbookFilePath;
    /** @type {SpellMetadataManager} */
    metadataManager;
    
    /**
     * @param {MetaBindAPI} mb - Meta Bind API instance
     * @param {string} spellbookFilePath - Path to spellbook file
     * @param {SpellMetadataManager} metadataManager - Metadata manager instance
     */
    constructor(mb, spellbookFilePath, metadataManager) {
        this.mb = mb;
        this.spellbookFilePath = spellbookFilePath;
        this.metadataManager = metadataManager;
    }

    /**
     * Get all SLA entries from spellPreparations.sla
     * @returns {import('../types/domain.js').SLAEntry[]} Array of SLA entries
     */
    getSpellLikeAbilities() {
        try {
            const slaTarget = this.mb.parseBindTarget('spellPreparations.sla', this.spellbookFilePath);
            const slaEntries = this.mb.getMetadata(slaTarget) || [];
            
            return slaEntries;
        } catch (error) {
            console.error('Error getting SLAs:', error);
            return [];
        }
    }

    /**
     * Get SLA entry by spell ID
     * @param {number} spellId - The spell ID
     * @returns {import('../types/domain.js').SLAEntry|null} SLA entry or null if not found
     */
    getSLAEntryBySpellId(spellId) {
        const slaEntries = this.getSpellLikeAbilities();
        return slaEntries.find(entry => entry.spellId === spellId) || null;
    }

    /**
     * Get the number of casts for an SLA entry
     * @param {import('../types/domain.js').SLAEntry} slaEntry - The SLA entry object
     * @returns {number} Number of casts (0 for unlimited)
     */
    getSLACasts(slaEntry) {
        return slaEntry?.casts || 0;
    }

    /**
     * Get the remaining casts for an SLA entry
     * @param {import('../types/domain.js').SLAEntry} slaEntry - The SLA entry object
     * @returns {number | undefined} Remaining casts (undefined if not initialized)
     */
    getSLARemainingCasts(slaEntry) {
        return slaEntry?.castsRemaining;
    }

    /**
     * Create a usage tracker for an SLA
     * @param {import('../types/domain.js').SLAEntry} slaEntry - The SLA entry object
     * @param {number} slaIndex - Index of the SLA in the sla array
     * @param {HTMLElement} container - Container to render in
     * @param {Component} component - Component for cleanup
     */
    createSLAUsageTracker(slaEntry, slaIndex, container, component) {
        const maxCasts = this.getSLACasts(slaEntry);

        // If unlimited (0), display "At Will" instead of a tracker
        if (maxCasts === 0) {
            const atWillLabel = container.createEl('span', {
                text: 'At Will',
                cls: 'sla-at-will'
            });
            atWillLabel.style.fontStyle = 'italic';
            atWillLabel.style.color = '#6366f1';
            atWillLabel.style.fontSize = `12px`;
            atWillLabel.style.fontWeight = '600';
            atWillLabel.style.marginLeft = '10px';
            return;
        }

        // Get remaining casts
        const remainingCasts = this.getSLARemainingCasts(slaEntry);

        // Create select tracker container
        const trackerContainer = container.createDiv();
        trackerContainer.style.marginLeft = '10px';

        const selectConfig = {
            renderChildType: 'block',
            declaration: {
                inputFieldType: 'select',
                bindTarget: this.mb.parseBindTarget(`spellPreparations.sla[${slaIndex}].castsRemaining`, this.spellbookFilePath),
                arguments: [
                    // Options from 1 to maxCasts
                    ...Array.from({ length: maxCasts }, (_, i) => ({
                        name: 'option',
                        value: [`${i + 1}`]
                    })),
                    // Only set defaultValue if remainingCasts is defined and > 0
                    ...(remainingCasts && remainingCasts > 0 ? [{ name: 'defaultValue', value: [`${remainingCasts}`] }] : []),
                    { name: 'class', value: ['tracker sla-tracker'] }
                ]
            }
        };

        const selectElement = this.mb.createInputFieldMountable(this.spellbookFilePath, selectConfig);
        this.mb.wrapInMDRC(selectElement, trackerContainer, component);
    }

    /**
     * Create a cast button for an SLA
     * @param {import('../types/domain.js').SLAEntry} slaEntry - The SLA entry object
     * @param {number} slaIndex - Index of the SLA in the sla array
     * @param {HTMLElement} container - Container to render in
     * @param {Component} component - Component for cleanup
     */
    createSLACastButton(slaEntry, slaIndex, container, component) {
        const maxCasts = this.getSLACasts(slaEntry);
        const buttonContainer = container.createDiv();

        // If unlimited, create a MetaBind button with no action
        if (maxCasts === 0) {
            const unlimitedBtnConfig = {
                label: "Cast",
                id: `${slaEntry.spellName}-${slaIndex}-cast-sla-unlimited`,
                style: "primary",
                class: "spellbook-cast-btn at-will",
                action: {
                    type: "inlineJS",
                    bindTarget: ``,
                    evaluate: false,
                    code: ``
                }
                // No action for unlimited casts
            };

            try {
                const buttonOpts = {
                    declaration: unlimitedBtnConfig,
                    isPreview: false
                };
                const castBtn = this.mb.createButtonMountable(this.spellbookFilePath, buttonOpts);
                this.mb.wrapInMDRC(castBtn, buttonContainer, component);
            } catch (error) {
                console.error("Error creating unlimited SLA cast button:", error);
            }

            return;
        }

        // For limited casts, keep the working version with actions array
        const castBtnConfig = {
            label: "Cast",
            id: `${slaEntry.spellName}-${slaIndex}-cast-sla`,
            style: "primary",
            class: "spellbook-cast-btn",
            actions: [
                {
                    type: "updateMetadata",
                    bindTarget: `spellPreparations.sla[${slaIndex}].castsRemaining`,
                    evaluate: true,
                    value: `(() => {
                    const current = x;
                    if (current == null) {
                        return null;
                    }
                    if (current <= 1) {
                        return null; // Return null when uses drop to 0
                    }
                    return current - 1;
                })()`
                }
            ]
        };

        // Try to create the button with this config
        try {
            const buttonOpts = {
                declaration: castBtnConfig,
                isPreview: false
            };
            const castBtn = this.mb.createButtonMountable(this.spellbookFilePath, buttonOpts);
            this.mb.wrapInMDRC(castBtn, buttonContainer, component);
        } catch (error) {
            console.error("Error creating limited SLA cast button:", error);
        }
    }

    /**
     * Render SLA entry row
     * @param {import('../types/domain.js').SLAEntry} slaEntry - The SLA entry object
     * @param {number} slaIndex - Index of the SLA in the sla array
     * @param {HTMLElement} container - Container to render in
     * @param {Component} component - Component for cleanup
     */
    renderSLAEntry(slaEntry, slaIndex, container, component) {
        const slaContainer = container.createDiv();
        slaContainer.style.display = 'flex';
        slaContainer.style.alignItems = 'center';
        slaContainer.style.padding = '5px';
        slaContainer.style.marginBottom = '5px';
        slaContainer.style.borderRadius = '4px';
        slaContainer.setAttribute('data-sla-index', String(slaIndex));

        // Add cast button first
        const buttonContainer = slaContainer.createDiv();
        buttonContainer.style.marginRight = '10px';
        this.createSLACastButton(slaEntry, slaIndex, buttonContainer, component);

        // Add spell name
        const nameContainer = slaContainer.createDiv();
        nameContainer.style.flex = '1';

        const spellLink = createSpellLink(slaEntry.spellName, 'sla-spell-name');
        nameContainer.appendChild(spellLink);

        // Add SLA info (casts per day)
        const casts = this.getSLACasts(slaEntry);
        if (casts > 0) {
            const castsInfo = nameContainer.createEl('span', { 
                text: ` (${casts}/day)` 
            });
            castsInfo.style.color = '#888';
            castsInfo.style.fontSize = '0.85em';
        }

        // Add usage tracker last
        this.createSLAUsageTracker(slaEntry, slaIndex, slaContainer, component);
    }

    /**
     * Render all SLAs in a callout section
     * @param {HTMLElement} container - Container to render in
     * @param {Component} component - Component for cleanup
     * @param {JSEngineContext} context - Context for callout rendering
     * @param {JSEngine} engine - Engine for callout rendering
     * @param {Function} createCalloutWrapperFn - Function to create callout wrapper
     */
    async renderSLAs(container, component, context, engine, createCalloutWrapperFn) {
        const slaEntries = this.getSpellLikeAbilities();

        // Early return if no SLAs
        if (slaEntries.length === 0) {
            return;
        }

        // Create callout wrapper for SLAs
        const calloutContent = await createCalloutWrapperFn(
            "Spell-Like Abilities",
            container,
            context,
            engine,
            component,
            "collapse-clean",
            false // Not collapsed by default
        );

        // Render each SLA
        for (let i = 0; i < slaEntries.length; i++) {
            const slaEntry = slaEntries[i];
            this.renderSLAEntry(slaEntry, i, calloutContent, component);
        }
    }

    /**
     * Create a button to reset all SLA uses
     * @param {HTMLElement} container - Container to render in
     * @param {Component} component - Component for cleanup
     */
    createResetSLAsButton(/** @type {HTMLElement} */ container, /** @type {Component} */ component) {
        const buttonContainer = container.createDiv();
        buttonContainer.style.marginTop = '10px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';

        const resetBtnConfig = {
            label: "Reset SLAs",
            class: "spellbook-reset-btn sla-reset-btn",
            id: `reset-all-slas`,
            style: "destructive",
            action: {
                type: "updateMetadata",
                bindTarget: `spellPreparations.sla`,
                evaluate: true,
                value: `x.map(slaEntry => ({
                    ...slaEntry,
                    castsRemaining: slaEntry.casts
                }))`
            }
        };

        const buttonOpts = { declaration: resetBtnConfig, isPreview: false };
        const resetBtn = this.mb.createButtonMountable(this.spellbookFilePath, buttonOpts);

        this.mb.wrapInMDRC(resetBtn, buttonContainer, component);
    }

    /**
     * Get MetadataUpdate objects for resetting all SLA uses to their maximum daily values
     * @returns {import('../types/domain.js').MetadataUpdate[]} Array of metadata updates
     */
    getSLAResetUpdates() {
        const slaEntries = this.getSpellLikeAbilities();
        const updates = [];

        for (let i = 0; i < slaEntries.length; i++) {
            const slaEntry = slaEntries[i];
            if (slaEntry.casts > 0) {
                // Reset to maximum daily uses
                updates.push({
                    type: /** @type {"updateMetadata"} */ ("updateMetadata"),
                    bindTarget: `spellPreparations.sla[${i}].castsRemaining`,
                    evaluate: false,
                    value: slaEntry.casts
                });
            }
        }

        return updates;
    }

    /**
     * Reset all SLA uses to their maximum daily values
     * @returns {Promise<void>} Promise that resolves when reset is complete
     */
    resetAllSLAs() {
        return new Promise((/** @type {() => void} */ resolve) => {
            try {
                const slaEntries = this.getSpellLikeAbilities();
                const updates = [];

                for (let i = 0; i < slaEntries.length; i++) {
                    const slaEntry = slaEntries[i];
                    if (slaEntry.casts > 0) {
                        // Reset to maximum daily uses
                        const target = this.mb.parseBindTarget(`spellPreparations.sla[${i}].castsRemaining`, this.spellbookFilePath);
                        updates.push(this.mb.setMetadata(target, /** @type {any} */ (slaEntry.casts)));
                    }
                }

                Promise.all(updates).then(() => {
                    console.log('All SLAs reset successfully');
                    resolve();
                }).catch(error => {
                    console.error('Error resetting SLAs:', error);
                    resolve();
                });
            } catch (error) {
                console.error('Error in resetAllSLAs:', error);
                resolve();
            }
        });
    }

    /**
     * Dispose of any resources held by this manager
     * Currently this manager doesn't hold any subscriptions or event listeners,
     * but we implement dispose() for consistency and future-proofing
     */
    dispose() {
        // Clear references to help garbage collection
        this.mb = /** @type {any} */ (null);
        this.spellbookFilePath = /** @type {any} */ (null);
        this.metadataManager = /** @type {any} */ (null);
    }
}