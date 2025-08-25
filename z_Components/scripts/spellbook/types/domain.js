/**
 * @fileoverview Domain-specific type definitions for the spellbook system
 * 
 * This file contains TypeScript-style JSDoc definitions for all spellbook
 * domain objects and data structures.
 */

// Import foundation types that are used in this file
/**
 * @typedef {import('./foundation.js').SpellLevel} SpellLevel
 * @typedef {import('./foundation.js').MetamagicType} MetamagicType
 * @typedef {import('./foundation.js').CastingClass} CastingClass
 * @typedef {import('./foundation.js').CastingStat} CastingStat
 * @typedef {import('./foundation.js').Component} Component
 * @typedef {import('./foundation.js').JSEngineContext} JSEngineContext
 * @typedef {import('./foundation.js').JSEngine} JSEngine
 */

/**
 * Core spell object with numeric ID and no preparation data
 * @typedef {object} Spell
 * @property {number} id - Unique numeric identifier for the spell
 * @property {string} name - The name of the spell
 * @property {SpellLevel} baseLevel - The base level of the spell (0-9)
 * @property {boolean} known - Whether the spell is known by the caster
 * @property {string} [range] - The range of the spell
 * @property {string} [castingTime] - The casting time of the spell
 * @property {string} [components] - The components required for the spell
 * @property {string} [saveType] - The type of saving throw required
 * @property {boolean} [sr] - Whether the spell allows spell resistance
 * @property {string} [save] - Save information for the spell
 * @property {object[]} [preparations] - Legacy preparations array (deprecated)
 */

/**
 * Spell preparation entry in the flattened structure
 * @typedef {object} SpellPreparation
 * @property {number} spellId - ID of the spell being prepared
 * @property {SpellLevel} adjustedLevel - The adjusted level after metamagic
 * @property {MetamagicType[]} metamagic - Array of metamagic feats applied
 * @property {number} count - Number of times this preparation exists
 */

/**
 * Spell-Like Ability entry in the flattened structure  
 * @typedef {object} SLAEntry
 * @property {number} spellId - ID of the spell with SLA
 * @property {string} spellName - Name of the spell (for display/debugging)
 * @property {number} casts - Maximum number of casts per day (0 = at-will)
 * @property {number} castsRemaining - Current remaining casts
 */

/**
 * Flattened spell preparations structure following spellLevelSettings pattern
 * @typedef {object} SpellPreparations
 * @property {SpellPreparation[]} level0 - Preparations at spell level 0
 * @property {SpellPreparation[]} level1 - Preparations at spell level 1
 * @property {SpellPreparation[]} level2 - Preparations at spell level 2
 * @property {SpellPreparation[]} level3 - Preparations at spell level 3
 * @property {SpellPreparation[]} level4 - Preparations at spell level 4
 * @property {SpellPreparation[]} level5 - Preparations at spell level 5
 * @property {SpellPreparation[]} level6 - Preparations at spell level 6
 * @property {SpellPreparation[]} level7 - Preparations at spell level 7
 * @property {SpellPreparation[]} level8 - Preparations at spell level 8
 * @property {SpellPreparation[]} level9 - Preparations at spell level 9
 * @property {SLAEntry[]} sla - Spell-like ability entries
 */

/**
 * @typedef {object} SpellLevelConfig
 * @property {string} [selectedMetamagic] - Currently selected metamagic
 * @property {MetamagicType[]} [activeMetamagics] - Currently active metamagics
 * @property {number} [totalRemaining] - Remaining spell slots
 * @property {number} [totalCastsRemaining] - Remaining casts for hybrid casters
 */

/**
 * @typedef {object} SpellLevelSettings
 * @property {SpellLevelConfig} level0 - Level 0 spell settings
 * @property {SpellLevelConfig} level1 - Level 1 spell settings
 * @property {SpellLevelConfig} level2 - Level 2 spell settings
 * @property {SpellLevelConfig} level3 - Level 3 spell settings
 * @property {SpellLevelConfig} level4 - Level 4 spell settings
 * @property {SpellLevelConfig} level5 - Level 5 spell settings
 * @property {SpellLevelConfig} level6 - Level 6 spell settings
 * @property {SpellLevelConfig} level7 - Level 7 spell settings
 * @property {SpellLevelConfig} level8 - Level 8 spell settings
 * @property {SpellLevelConfig} level9 - Level 9 spell settings
 * @property {string} [selectedGlobalMetamagic] - Global metamagic selection
 * @property {MetamagicType[]} [globalActiveMetamagics] - Global active metamagics
 */

/**
 * @typedef {object} SpellbookData
 * @property {CastingClass} castingClass - The spellcasting class
 * @property {CastingStat} castingStat - The primary casting stat
 * @property {number} casterLevel - The caster level
 * @property {number} castingStatBonus - The casting stat modifier bonus
 * @property {SpellLevelSettings} spellLevelSettings - Per-level spell settings
 * @property {Spell[]} spells - Array of spells
 * @property {SpellPreparations} spellPreparations - Flattened preparation data
 */

/**
 * @typedef {'level0'|'level1'|'level2'|'level3'|'level4'|'level5'|'level6'|'level7'|'level8'|'level9'} SpellLevelKey
 */

/**
 * @typedef {'prepared'|'spontaneous'|'hybrid'} RendererType
 */

/**
 * @typedef {object} RendererMethodParams
 * @property {SpellLevel} level - The spell level
 * @property {HTMLElement} container - The container element
 * @property {Component} component - The component for lifecycle
 * @property {JSEngineContext} context - The JS engine context
 * @property {JSEngine} engine - The JS engine instance
 */

/**
 * @typedef {object} SpellCalculationContext
 * @property {number} casterLevel - The caster level
 * @property {number} castingStatBonus - The casting stat bonus
 * @property {CastingClass} castingClass - The casting class
 * @property {SpellLevel} spellLevel - The spell level
 */

/**
 * @typedef {object} MetadataUpdate
 * @property {string} type - The type of update ('updateMetadata')
 * @property {string} bindTarget - The bind target path
 * @property {boolean} evaluate - Whether to evaluate the value as code
 * @property {any} value - The value to set
 */

/**
 * @typedef {object} ConditionEffects
 * @property {number} [attackBonus] - Attack bonus modifier
 * @property {number} [damageBonus] - Damage bonus modifier
 * @property {number} [acBonus] - AC bonus modifier
 * @property {number} [saveBonus] - Save bonus modifier
 * @property {number} [meleeAtkAdjust] - Melee attack adjustment
 * @property {number} [rangedAtkAdjust] - Ranged attack adjustment
 * @property {number} [acAdjust] - AC adjustment
 * @property {number} [touchAcAdjust] - Touch AC adjustment
 * @property {number} [ffAcAdjust] - Flat-footed AC adjustment
 * @property {boolean} [loseDexToAC] - Lose dex bonus to AC
 * @property {boolean} [flatFooted] - Flat-footed condition
 * @property {number} [strSkillAdjust] - Strength skill adjustment
 * @property {number} [dexSkillAdjust] - Dexterity skill adjustment
 * @property {number} [perceptionAdjust] - Perception adjustment
 * @property {boolean} [miss50] - 50% miss chance
 * @property {number} [movementAdjust] - Movement adjustment
 * @property {boolean} [canAct] - Can take actions
 * @property {boolean} [canFullRound] - Can take full-round actions
 * @property {boolean} [canStandard] - Can take standard actions
 * @property {boolean} [canMove] - Can take move actions
 * @property {boolean} [canAttack] - Can attack
 * @property {boolean} [canCast] - Can cast spells
 * @property {number} [cmb] - Combat maneuver bonus
 * @property {number} [fortAdjust] - Fortitude save adjustment
 * @property {number} [refAdjust] - Reflex save adjustment
 * @property {number} [willAdjust] - Will save adjustment
 * @property {boolean} [helpless] - Helpless condition
 * @property {number} [strAdjust] - Strength adjustment
 * @property {number} [dexAdjust] - Dexterity adjustment
 * @property {number} [cmd] - Combat maneuver defense
 * @property {number} [skillAdjust] - General skill adjustment
 * @property {number} [intAdjust] - Intelligence adjustment
 * @property {number} [wisAdjust] - Wisdom adjustment
 * @property {number} [chaAdjust] - Charisma adjustment
 * @property {number} [conAdjust] - Constitution adjustment
 * @property {number} [conSkillAdjust] - Constitution skill adjustment
 * @property {number} [intSkillAdjust] - Intelligence skill adjustment
 * @property {number} [wisSkillAdjust] - Wisdom skill adjustment
 * @property {number} [chaSkillAdjust] - Charisma skill adjustment
 * @property {number[]} [extraAttacks] - Extra attacks per round (array of attack bonuses)
 * @property {number} [naturalArmorAdjust] - Natural armor adjustment
 * @property {number} [damageAdjust] - Damage adjustment
 * @property {number} [sizeAdjust] - Size adjustment
 * @property {number} [reachAdjust] - Reach adjustment
 * @property {number} [hpMaxAdjust] - Max HP adjustment
 * @property {number} [levelAdjust] - Level adjustment
 * @property {string} [conditionNotes] - Condition-related notes (joined string)
 * @property {string} [buffNotes] - Buff-related notes (joined string)
 */

// Legacy type definitions for backward compatibility during transition
// TODO: Remove these once all references are updated

/**
 * @deprecated Use SpellPreparation instead
 * @typedef {SpellPreparation} Preparation
 */

/**
 * @deprecated SLA data now in SpellPreparations.sla
 * @typedef {SLAEntry} SpellLikeAbility
 */

// Export empty object to make this a valid module
export {};