/**
 * Pure UI component creation functions for spells
 * These functions create DOM elements but have no Meta Bind dependencies
 */

import { calculateSpellDC, calculateSpellRange, getSpellSaveType } from './spell-calculations.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 */

/**
 * Create styled spell count dots
 * @param {number} count - Number of dots to create
 * @param {HTMLElement} container - Container element to add dots to
 * @returns {HTMLElement} - Container with dots
 */
export function createSpellCountDots(count, container) {
    const dotsContainer = container.createDiv();
    dotsContainer.style.display = 'inline-flex';
    dotsContainer.style.gap = '3px';
    dotsContainer.style.marginLeft = '8px';
    dotsContainer.style.alignItems = 'center';

    for (let i = 0; i < count; i++) {
        const dot = dotsContainer.createDiv();
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.backgroundColor = '#ca9759';
        dot.style.borderRadius = '50%';
        dot.style.border = '2px solid white';
        dot.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.1)';
        dot.style.display = 'inline-block';
    }

    return dotsContainer;
}

/**
 * Create spell DC display for a spell
 * @param {SpellLevel} spellLevel - The level of the spell
 * @param {string} saveType - The save type (F, R, W)
 * @param {number} castingStatBonus - The casting stat bonus
 * @returns {HTMLDivElement} - The DC display element
 */
export function createSpellDCDisplay(spellLevel, saveType, castingStatBonus) {
    const container = document.createElement('div');
    container.style.fontSize = '0.7em';
    container.style.color = '#999';
    container.style.marginTop = '3px';

    const dc = calculateSpellDC(spellLevel, castingStatBonus);

    // Only display DC if there's a save type
    if (saveType) {
        container.textContent = `DC: ${dc} ${saveType}`;
    } else {
        container.textContent = 'No save';
        container.style.fontStyle = 'italic';
    }

    return container;
}

/**
 * Create a comprehensive spell info row with save DC, SR, range, components, and casting time
 * @param {Spell} spell - The spell object
 * @param {SpellLevel} spellLevel - The adjusted level of the spell
 * @param {number} castingStatBonus - The casting stat bonus
 * @param {number} casterLevel - The caster level
 * @returns {HTMLDivElement} - A div containing the formatted info row
 */
export function createSpellInfoRow(spell, spellLevel, castingStatBonus, casterLevel) {
    const container = document.createElement('div');
    container.style.fontSize = '0.68em';
    container.style.color = '#999';
    container.style.marginTop = '3px';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '3px';
    
    // Create an array to hold all the info segments
    const segments = [];
    
    // 1. DC and save type
    const saveType = getSpellSaveType(spell);
    if (saveType) {
        const dc = calculateSpellDC(spellLevel, castingStatBonus);
        segments.push(`DC: ${dc} ${saveType}`);
    } else if (spell.saveType && spell.saveType.toLowerCase() === 'none') {
        segments.push('No save');
    }
    
    // 2. Casting Time
    if (spell.castingTime) {
        segments.push(spell.castingTime);
    }
    
    // 3. Spell Resistance
    if (spell.sr === true) {
        segments.push('SR');
    }
    
    // 4. Range
    if (spell.range) {
        const calculatedRange = calculateSpellRange(spell.range, casterLevel);
        if (calculatedRange) {
            segments.push(calculatedRange);
        }
    }
    
    // 5. Components
    if (spell.components) {
        segments.push(spell.components);
    }
    
    // Build the info text with | separators, but only between segments that exist
    if (segments.length > 0) {
        container.textContent = segments.join(' | ');
    }
    
    return container;
}

/**
 * Create a native Obsidian internal link element for spell names
 * @param {string} spellName - The name of the spell
 * @param {string} additionalClasses - Optional additional CSS classes
 * @returns {HTMLAnchorElement} - An anchor element that creates a native Obsidian link
 */
export function createSpellLink(spellName, additionalClasses = '') {
    // Create the anchor element for native Obsidian linking
    const linkAnchor = document.createElement('a');
    
    // Build the spell path (relative to vault root) with .md extension
    const spellPath = `MiniSheet/z_Components/database/spells/${spellName}.md`;
    
    // Set required Obsidian link attributes
    linkAnchor.setAttribute('data-href', spellPath);
    linkAnchor.setAttribute('href', spellPath);
    linkAnchor.setAttribute('class', 'internal-link spell-link');
    linkAnchor.setAttribute('target', '_blank');
    linkAnchor.setAttribute('rel', 'noopener nofollow');
    linkAnchor.textContent = spellName;
    
    // Add any additional classes provided
    if (additionalClasses) {
        const currentClasses = linkAnchor.getAttribute('class') || '';
        const newClasses = additionalClasses.split(' ')
            .filter(cls => cls.trim())
            .join(' ');
        if (newClasses) {
            linkAnchor.setAttribute('class', `${currentClasses} ${newClasses}`);
        }
    }
    
    return linkAnchor;
}