/**
 * @fileoverview Type validation utilities and examples
 * 
 * This file demonstrates proper usage of the type system and provides
 * runtime validation helpers.
 */

import '../spellbook/types/types.js';

/**
 * Example of properly typed spell object
 * @type {import('../spellbook/types/domain.js').Spell}
 */
const exampleSpell = {
    id: 1,
    name: "Magic Missile",
    baseLevel: 1,
    known: true,
    range: "Medium",
    castingTime: "1 std",
    components: "V, S",
    saveType: "none",
    sr: true
};

/**
 * Example of properly typed spell preparation
 * @type {import('../spellbook/types/domain.js').SpellPreparation}
 */
const examplePreparation = {
    spellId: 1,
    adjustedLevel: 2,
    metamagic: ["Still Spell (+1 level)"],
    count: 1
};

/**
 * Example of properly typed SLA entry
 * @type {import('../spellbook/types/domain.js').SLAEntry}
 */
const exampleSLA = {
    spellId: 2,
    spellName: "Detect Magic",
    casts: 3,
    castsRemaining: 2
};

/**
 * Validates a spell object structure
 * @param {any} obj - Object to validate
 * @returns {obj is import('../spellbook/types/domain.js').Spell} True if valid spell
 */
function isValidSpell(obj) {
    return obj &&
        typeof obj.id === 'number' &&
        obj.id > 0 &&
        typeof obj.name === 'string' &&
        typeof obj.baseLevel === 'number' &&
        obj.baseLevel >= 0 && obj.baseLevel <= 9 &&
        typeof obj.known === 'boolean';
}

/**
 * Validates a spell preparation object structure
 * @param {any} obj - Object to validate
 * @returns {obj is import('../spellbook/types/domain.js').SpellPreparation} True if valid preparation
 */
function isValidSpellPreparation(obj) {
    return obj &&
        typeof obj.spellId === 'number' &&
        obj.spellId > 0 &&
        typeof obj.adjustedLevel === 'number' &&
        obj.adjustedLevel >= 0 && obj.adjustedLevel <= 9 &&
        Array.isArray(obj.metamagic) &&
        typeof obj.count === 'number' &&
        obj.count > 0;
}

/**
 * Validates an SLA entry object structure
 * @param {any} obj - Object to validate
 * @returns {obj is import('../spellbook/types/domain.js').SLAEntry} True if valid SLA entry
 */
function isValidSLAEntry(obj) {
    return obj &&
        typeof obj.spellId === 'number' &&
        obj.spellId > 0 &&
        typeof obj.spellName === 'string' &&
        typeof obj.casts === 'number' &&
        obj.casts >= 0 &&
        typeof obj.castsRemaining === 'number' &&
        obj.castsRemaining >= 0;
}

export { 
    exampleSpell, 
    examplePreparation, 
    exampleSLA,
    isValidSpell, 
    isValidSpellPreparation,
    isValidSLAEntry
};