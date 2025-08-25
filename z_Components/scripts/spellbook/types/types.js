/**
 * @fileoverview Type imports and JSDoc type definitions for the spellbook module
 * 
 * This file serves as a central location for importing TypeScript definitions
 * and provides JSDoc type annotations for better IDE support in JavaScript files.
 */

// JSDoc type definitions - importing types for IDE support

/**
 * @typedef {import('./foundation.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('./foundation.js').Component} Component
 * @typedef {import('./foundation.js').JSEngine} JSEngine
 * @typedef {import('./foundation.js').JSEngineContext} JSEngineContext
 * @typedef {import('./foundation.js').SpellLevel} SpellLevel
 * @typedef {import('./foundation.js').CastingClass} CastingClass
 * @typedef {import('./foundation.js').CastingStat} CastingStat
 * @typedef {import('./foundation.js').MetamagicType} MetamagicType
 */

/**
 * @typedef {import('./domain.js').SpellbookData} SpellbookData
 * @typedef {import('./domain.js').SpellLevelSettings} SpellLevelSettings
 * @typedef {import('./domain.js').SpellLevelConfig} SpellLevelConfig
 * @typedef {import('./domain.js').Spell} Spell
 * @typedef {import('./domain.js').Preparation} Preparation
 * @typedef {import('./domain.js').SpellPreparation} SpellPreparation
 * @typedef {import('./domain.js').SpellLikeAbility} SpellLikeAbility
 * @typedef {import('./domain.js').SpellLevelKey} SpellLevelKey
 * @typedef {import('./domain.js').RendererType} RendererType
 * @typedef {import('./domain.js').RendererMethodParams} RendererMethodParams
 * @typedef {import('./domain.js').SpellCalculationContext} SpellCalculationContext
 * @typedef {import('./domain.js').MetadataUpdate} MetadataUpdate
 * @typedef {import('./domain.js').ConditionEffects} ConditionEffects
 */

/**
 * @typedef {import('../managers/spell-metadata.js').SpellMetadataManager} SpellMetadataManager
 */

// Missing types that need to be defined
/**
 * @typedef {object} CasterInfo
 * @property {string} [castingClass] - The casting class
 * @property {number} [casterLevel] - The caster level
 * @property {string} type - The caster type
 * @property {number} maxSpellLevel - Maximum spell level
 * @property {boolean} usesSpellbook - Whether uses spellbook
 * @property {boolean} [domainSlots] - Whether has domain slots
 * @property {boolean} [usesPatrons] - Whether uses patrons
 * @property {boolean} [unique] - Whether is unique
 */

/**
 * @typedef {object} SpellProgressionSummary
 * @property {string} className - The class name
 * @property {string} casterType - The caster type
 * @property {number} maxSpellLevel - Maximum spell level
 * @property {boolean} usesSpellbook - Whether uses spellbook
 * @property {number} [classLevel] - The class level (optional)
 * @property {object} [spellsPerLevel] - Spells per level data (optional)
 * @property {number[]} [availableSpellLevels] - Available spell levels (optional)
 * @property {object} [fullProgression] - Full progression data (optional)
 */

// Export empty object to make this a valid module
export {};