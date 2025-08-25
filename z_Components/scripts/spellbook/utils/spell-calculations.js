/**
 * Pure calculation functions for spells
 * These functions have no dependencies on Meta Bind or DOM manipulation
 */

import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 */

/**
 * Calculate spell DC based on spell level and casting stat bonus
 * @param {SpellLevel} spellLevel - The level of the spell
 * @param {number} castingStatBonus - The casting stat bonus
 * @returns {number} - The spell DC
 */
export function calculateSpellDC(spellLevel, castingStatBonus) {
    return 10 + spellLevel + castingStatBonus;
}

/**
 * Get metamagic level adjustment for a metamagic feat
 * @param {string} metamagic - The metamagic feat name
 * @returns {number} - Level adjustment (0 if not found)
 */
export function getMetamagicLevelAdjustment(metamagic) {
    /** @type {Record<string, number>} */
    const adjustments = {
        'Still Spell (+1 level)': 1,
        'Silent Spell (+1 level)': 1,
        'Extend Spell (+1 level)': 1,
        'Empower Spell (+2 levels)': 2,
        'Maximize Spell (+3 levels)': 3
    };
    return adjustments[metamagic] || 0;
}

/**
 * Calculate range based on range type and caster level
 * @param {string} rangeType - Range type (Close, Medium, Long)
 * @param {number} casterLevel - Caster level
 * @returns {string} - Calculated range in feet
 */
export function calculateSpellRange(rangeType, casterLevel) {
    if (!rangeType) return "";
    
    const type = rangeType.toLowerCase();
    
    // Calculate based on range type
    if (type === 'close') {
        // Close: 25 feet + 5 feet for every two full caster levels
        const additionalRange = Math.floor(casterLevel / 2) * 5;
        return `${25 + additionalRange} ft.`;
    } else if (type === 'medium') {
        // Medium: 100 feet + 10 feet per caster level
        return `${100 + (casterLevel * 10)} ft.`;
    } else if (type === 'long') {
        // Long: 400 feet + 40 feet per caster level
        return `${400 + (casterLevel * 40)} ft.`;
    } else if (type === 'personal') {
        return 'Personal';
    } else if (type === 'touch') {
        return 'Touch';
    } else if (type === 'unlimited' || type === 'unlimited range') {
        return 'Unlimited';
    } else {
        // Return the original range string for custom ranges
        return rangeType;
    }
}

/**
 * Get the save type abbreviation for a spell
 * @param {Spell} spell - The spell object
 * @returns {string} - Save type (F, R, W, or "")
 */
export function getSpellSaveType(spell) {
    // Return empty string for spells explicitly marked with "none" save type
    if (spell.saveType && spell.saveType.toLowerCase() === 'none') {
        return "";
    }
    
    // First check if the spell has a saveType property
    if (spell.saveType) {
        // Convert to abbreviation if needed
        const saveType = spell.saveType.toLowerCase();
        if (saveType.startsWith('f')) return 'F';
        if (saveType.startsWith('r')) return 'R';
        if (saveType.startsWith('w')) return 'W';
        return spell.saveType.substring(0, 1).toUpperCase(); // First character
    }
    
    // As a fallback, check if there's a save property with the type
    if (spell.save) {
        const save = spell.save.toLowerCase();
        if (save.includes('fort')) return 'F';
        if (save.includes('ref')) return 'R';
        if (save.includes('will')) return 'W';
        if (save.includes('none')) return "";
    }
    
    // Default to no save if we can't determine
    return "";
}

/**
 * Get the settings key for a spell level
 * @param {number} level - The spell level
 * @returns {string} - The settings key
 */
/**
 * Get spell level key for frontmatter access
 * @param {SpellLevel} level - The spell level
 * @returns {string} - Level key (e.g., "level1")
 */
export function getSpellLevelKey(level) {
    return `level${level}`;
}

/**
 * Calculate total metamagic adjustment for an array of metamagics
 * @param {string[]} metamagics - Array of metamagic feat names
 * @returns {number} - Total level adjustment
 */
export function calculateTotalMetamagicAdjustment(metamagics) {
    return metamagics.reduce((total, metamagic) => {
        return total + getMetamagicLevelAdjustment(metamagic);
    }, 0);
}