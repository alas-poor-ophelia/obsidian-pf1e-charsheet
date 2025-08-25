/**
 * Caster type definitions and configurations for different Pathfinder 1e casting classes
 * This module contains constants and utility functions for determining caster behavior
 */

/**
 * Caster Type Definitions
 */
export const CasterType = {
    // Prepared Casters
    WIZARD: 'wizard',
    CLERIC: 'cleric',
    DRUID: 'druid',
    PALADIN: 'paladin',
    RANGER: 'ranger',

    // Spontaneous Casters
    SORCERER: 'sorcerer',
    BARD: 'bard',
    ORACLE: 'oracle',
    SKALD: 'skald',

    // Hybrid Casters
    ARCANIST: 'arcanist',

    // Other special cases
    WITCH: 'witch',
    SUMMONER: 'summoner',
    MAGUS: 'magus',
    ALCHEMIST: 'alchemist',
    BLOODRAGER: 'bloodrager'
};

/**
 * Configuration for different caster types
 */
const CASTER_CONFIGS = {
    [CasterType.WIZARD]: {
        type: 'prepared',
        usesSpellbook: true,
        spontaneousCasting: false
    },
    [CasterType.CLERIC]: {
        type: 'prepared',
        usesSpellbook: false,
        spontaneousCasting: true, // Domain spells
        domainSlots: true
    },
    [CasterType.DRUID]: {
        type: 'prepared',
        usesSpellbook: false,
        spontaneousCasting: true // Summon Nature's Ally
    },
    [CasterType.PALADIN]: {
        type: 'prepared',
        usesSpellbook: false,
        spontaneousCasting: false
    },
    [CasterType.RANGER]: {
        type: 'prepared',
        usesSpellbook: false,
        spontaneousCasting: false
    },
    [CasterType.SORCERER]: {
        type: 'spontaneous',
        usesSpellbook: false,
        spontaneousCasting: true
    },
    [CasterType.BARD]: {
        type: 'spontaneous',
        usesSpellbook: false,
        spontaneousCasting: true
    },
    [CasterType.ORACLE]: {
        type: 'spontaneous',
        usesSpellbook: false,
        spontaneousCasting: true
    },
    [CasterType.SKALD]: {
        type: 'spontaneous',
        usesSpellbook: false,
        spontaneousCasting: true
    },
    [CasterType.ARCANIST]: {
        type: 'hybrid',
        usesSpellbook: true,
        spontaneousCasting: true
    },
    [CasterType.WITCH]: {
        type: 'prepared',
        usesSpellbook: true,
        spontaneousCasting: false,
        usesPatrons: true
    },
    [CasterType.SUMMONER]: {
        type: 'spontaneous',
        usesSpellbook: false,
        spontaneousCasting: true
    },
    [CasterType.MAGUS]: {
        type: 'prepared',
        usesSpellbook: true,
        spontaneousCasting: false
    },
    [CasterType.ALCHEMIST]: {
        type: 'prepared',
        usesSpellbook: false,
        spontaneousCasting: false
    },
    [CasterType.BLOODRAGER]: {
        type: 'spontaneous',
        usesSpellbook: false,
        spontaneousCasting: true
    }
};

/**
 * Get caster configuration
 * @param {string} castingClass - The casting class name
 * @returns {{type: string, usesSpellbook: boolean, spontaneousCasting: boolean}} The caster configuration
 */
export function getCasterConfig(castingClass) {
    // Handle null, undefined, or non-string values
    if (!castingClass || typeof castingClass !== 'string') {
        return CASTER_CONFIGS[CasterType.WIZARD];
    }
    const normalizedClass = castingClass.toLowerCase();
    return CASTER_CONFIGS[normalizedClass] || CASTER_CONFIGS[CasterType.WIZARD];
}

/**
 * Check if a caster type is prepared
 * @param {string} castingClass - The casting class name
 * @returns {boolean} True if the caster is a prepared caster
 */
export function isPreparedCaster(castingClass) {
    const config = getCasterConfig(castingClass);
    return config.type === 'prepared';
}

/**
 * Check if a caster type is spontaneous
 * @param {string} castingClass - The casting class name
 * @returns {boolean} True if the caster is a spontaneous caster
 */
export function isSpontaneousCaster(castingClass) {
    const config = getCasterConfig(castingClass);
    return config.type === 'spontaneous';
}

/**
 * Check if a caster type is hybrid
 * @param {string} castingClass - The casting class name
 * @returns {boolean} True if the caster is a hybrid caster
 */
export function isHybridCaster(castingClass) {
    const config = getCasterConfig(castingClass);
    return config.type === 'hybrid';
}

/**
 * Get the recommended renderer type for a casting class
 * @param {string} castingClass - The casting class name
 * @returns {string} The renderer type ('prepared', 'spontaneous', or 'hybrid')
 */
export function getRendererType(castingClass) {
    const config = getCasterConfig(castingClass);
    return config.type;
}