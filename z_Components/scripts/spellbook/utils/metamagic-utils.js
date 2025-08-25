/**
 * Utility functions for metamagic feat management and display
 * These functions handle styling, pill creation, and metamagic-related UI components
 */

import { getMetamagicLevelAdjustment } from './spell-calculations.js';

/**
 * Available metamagic options
 */
export const METAMAGIC_OPTIONS = [
    'Still Spell (+1 level)',
    'Silent Spell (+1 level)', 
    'Extend Spell (+1 level)',
    'Empower Spell (+2 levels)',
    'Maximize Spell (+3 levels)'
];

/**
 * Create styled metamagic container with consistent styling
 * @param {HTMLElement} container - Parent container
 * @returns {HTMLElement} - Styled metamagic container
 */
export function createMetamagicContainer(container) {
    const metamagicContainer = container.createDiv();
    metamagicContainer.style.marginBottom = '12px';
    metamagicContainer.style.padding = '8px';
    metamagicContainer.style.backgroundColor = 'rgba(60, 60, 60, 0.15)';
    metamagicContainer.style.borderRadius = '4px';
    metamagicContainer.style.fontSize = '0.9em';
    return metamagicContainer;
}

/**
 * Create a visual metamagic pill with consistent styling
 * @param {string} metamagic - The metamagic feat name
 * @param {HTMLElement} container - Container to add pill to
 * @returns {HTMLElement} - The created pill element
 */
export function createMetamagicPill(metamagic, container) {
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

    return metamagicPill;
}

/**
 * Create a flex container for metamagic pills
 * @param {HTMLElement} container - Parent container
 * @returns {HTMLElement} - Flex container for pills
 */
export function createMetamagicPillsContainer(container) {
    const metamagicsRow = container.createDiv();
    metamagicsRow.style.display = 'flex';
    metamagicsRow.style.gap = '5px';
    metamagicsRow.style.flexWrap = 'wrap';
    metamagicsRow.style.alignItems = 'center';
    return metamagicsRow;
}

/**
 * Create a dropdown section with consistent styling
 * @param {HTMLElement} container - Parent container
 * @returns {HTMLElement} - Styled dropdown section
 */
export function createMetamagicDropdownSection(container) {
    const dropdownSection = container.createDiv();
    dropdownSection.style.display = 'flex';
    dropdownSection.style.alignItems = 'center';
    dropdownSection.style.gap = '8px';
    dropdownSection.style.marginBottom = '10px';
    dropdownSection.style.flexWrap = 'wrap';
    return dropdownSection;
}

/**
 * Create "no active metamagics" message
 * @param {HTMLElement} container - Container to add message to
 */
export function createNoActiveMetamagicsMessage(container) {
    const noneText = container.createEl('span', { text: 'None' });
    noneText.style.color = '#666';
    noneText.style.fontStyle = 'italic';
    noneText.style.fontSize = '0.9em';
}

/**
 * Add metamagic styling to spell name element
 * @param {HTMLElement} spellNameSpan - Spell name element
 * @param {string[]} activeMetamagics - Array of active metamagic names
 */
export function addMetamagicStyling(spellNameSpan, activeMetamagics) {
    const metamagicNames = activeMetamagics.map(meta =>
        meta.split(' ')[0] + ' ' + meta.split(' ')[1] // "Still Spell", "Silent Spell", etc.
    );
    
    if (metamagicNames.length > 0) {
        const metamagicSpan = document.createElement('span');
        metamagicSpan.textContent = ` (${metamagicNames.join(', ')})`;
        metamagicSpan.style.color = '#ca9759';
        metamagicSpan.style.fontSize = '0.85em';
        metamagicSpan.style.fontWeight = '500';
        spellNameSpan.appendChild(metamagicSpan);
    }
}

/**
 * Add level adjustment indicator to spell name
 * @param {HTMLElement} spellNameSpan - Spell name element
 * @param {number} adjustedLevel - The adjusted spell level
 */
export function addLevelAdjustmentIndicator(spellNameSpan, adjustedLevel) {
    const levelSpan = document.createElement('span');
    levelSpan.textContent = ` [${adjustedLevel}]`;
    levelSpan.style.color = '#8a6914';
    levelSpan.style.fontSize = '0.8em';
    levelSpan.style.fontWeight = 'bold';
    levelSpan.style.marginLeft = '4px';
    spellNameSpan.appendChild(levelSpan);
}

/**
 * Calculate total metamagic level adjustment
 * @param {string[]} metamagics - Array of metamagic feat names
 * @returns {number} - Total level adjustment
 */
export function calculateMetamagicAdjustment(metamagics) {
    return metamagics.reduce((total, metamagic) => {
        return total + getMetamagicLevelAdjustment(metamagic);
    }, 0);
}

/**
 * Create active metamagics section header
 * @param {HTMLElement} container - Container to add header to
 * @param {string} labelText - Text for the label (default: 'Active Metamagics:')
 * @returns {HTMLElement} - The created header container
 */
export function createActiveMetamagicsHeader(container, labelText = 'Active Metamagics:') {
    const activeContainer = container.createDiv();
    activeContainer.style.marginTop = '8px';

    const label = activeContainer.createEl('label', { text: labelText });
    label.style.fontSize = '0.85em';
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '5px';
    label.style.display = 'block';

    return activeContainer;
}