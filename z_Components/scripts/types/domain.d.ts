/**
 * Domain-specific TypeScript definitions for the Pathfinder 1e Spellbook system
 * 
 * These types represent the core data structures used throughout the spellbook system,
 * based on the actual YAML frontmatter structure and business logic.
 */

import type { SpellLevel, CastingClass, CastingStat, MetamagicType } from './foundation.js';

// ===================== CORE SPELLBOOK TYPES =====================

/**
 * Root spellbook configuration object (frontmatter)
 */
export interface SpellbookData {
    castingClass: CastingClass;
    castingStat: CastingStat;
    casterLevel: number;
    castingStatBonus: number;
    spellLevelSettings: SpellLevelSettings;
    spells: Spell[];
    selectedMetamagic?: string; // Legacy field
}

/**
 * Configuration for all spell levels and global settings
 */
export interface SpellLevelSettings {
    level0: SpellLevelConfig;
    level1: SpellLevelConfig;
    level2: SpellLevelConfig;
    level3: SpellLevelConfig;
    level4: SpellLevelConfig;
    level5: SpellLevelConfig;
    level6: SpellLevelConfig;
    level7: SpellLevelConfig;
    level8: SpellLevelConfig;
    level9: SpellLevelConfig;
    selectedGlobalMetamagic: string;
    globalActiveMetamagics: MetamagicType[];
}

/**
 * Configuration for a specific spell level
 */
export interface SpellLevelConfig {
    selectedMetamagic?: string;
    activeMetamagics?: MetamagicType[];
    totalRemaining?: number | string; // "" represents no slots
    totalCastsRemaining?: number | string; // For hybrid casters (arcanist)
    spellSlots?: number; // Sometimes present in data
    totalPrepared?: number; // Sometimes present in data
}

/**
 * Main spell object - represents the actual data structure from YAML frontmatter
 * This is the single source of truth for spell data in the application
 */
export interface Spell {
    name: string;
    baseLevel: number; // Comes as number from YAML parsing (0-9)
    known: boolean;
    prepared: boolean;
    preparations?: Preparation[]; // May be undefined initially
    
    // Optional spell details (from YAML)
    range?: string;
    castingTime?: string;
    components?: string;
    saveType?: string;
    save?: string; // Alternative save property format
    sr?: boolean; // Spell resistance
    
    // Spell-Like Ability data (if present)
    sla?: SpellLikeAbility;
}

/**
 * A prepared instance of a spell with specific metamagic applications
 */
export interface Preparation {
    adjustedLevel: number;
    metamagic: MetamagicType[];
    count: number;
}

/**
 * Spell-Like Ability configuration
 */
export interface SpellLikeAbility {
    casts: number; // 0 = unlimited, otherwise max casts per day
    castsRemaining?: number; // Current remaining casts (undefined = not initialized yet)
}

/**
 * Type guard to check if a spell has SLA data
 */
export declare function isSpellWithSLA(spell: Spell): spell is Spell & { sla: SpellLikeAbility };

/**
 * Condition and buff effects object structure
 */
export interface ConditionEffects {
    meleeAtkAdjust: number;
    rangedAtkAdjust: number;
    extraAttacks: number[];
    cmb: number;
    cmd: number;
    acAdjust: number;
    touchAcAdjust: number;
    ffAcAdjust: number;
    fortAdjust: number;
    refAdjust: number;
    willAdjust: number;
    hpMaxAdjust: number;
    strAdjust: number;
    dexAdjust: number;
    conAdjust: number;
    intAdjust: number;
    wisAdjust: number;
    chaAdjust: number;
    skillAdjust: number;
    levelAdjust: number;
    perceptionAdjust: number;
    strSkillAdjust: number;
    dexSkillAdjust: number;
    conSkillAdjust: number;
    intSkillAdjust: number;
    wisSkillAdjust: number;
    chaSkillAdjust: number;
    movementAdjust: number;
    sizeAdjust: number;
    naturalArmorAdjust: number;
    damageAdjust: number;
    reachAdjust: number;
    canAct: boolean;
    canFullRound: boolean;
    canStandard: boolean;
    canMove: boolean;
    canAttack: boolean;
    canCast: boolean;
    miss50: boolean;
    helpless: boolean;
    flatFooted: boolean;
    loseDexToAC: boolean;
    conditionNotes: string;
    buffNotes: string;
}

// ===================== UTILITY TYPES =====================

/**
 * Union type for all spell level keys
 */
export type SpellLevelKey = 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'level6' | 'level7' | 'level8' | 'level9';

/**
 * Renderer types supported by the system
 */
export type RendererType = 'prepared' | 'spontaneous' | 'hybrid';

/**
 * Parameters commonly passed to renderer methods
 */
export interface RendererMethodParams {
    level: SpellLevel;
    container: HTMLElement;
    component: Component;
    context: JSEngineContext;
    engine: JSEngine;
}

/**
 * Spell calculation context
 */
export interface SpellCalculationContext {
    spell: Spell;
    casterLevel: number;
    castingStatBonus: number;
    metamagics?: MetamagicType[];
}

/**
 * Button action update structure
 */
export interface MetadataUpdate {
    type: 'updateMetadata';
    bindTarget: string;
    evaluate: boolean;
    value: string | number | boolean | null | any[]; // Include arrays for metamagic lists, etc.
}

/**
 * Spell metadata manager interface
 */
export interface SpellMetadataManager {
    getAllSpells(): Spell[];
    getSpellIndex(spellName: string): number;
}

// ===================== TYPE GUARDS =====================

/**
 * Type guard to check if a spell has SLA data
 */
export function hasSpellLikeAbility(spell: Spell): spell is Spell & { sla: SpellLikeAbility } {
    return spell.sla !== undefined;
}

/**
 * Type guard to check if a value is a valid spell level
 */
export function isSpellLevel(value: unknown): value is SpellLevel {
    return typeof value === 'number' && value >= 0 && value <= 9 && Number.isInteger(value);
}

/**
 * Type guard to check if a string is a valid casting class
 */
export function isCastingClass(value: string): value is CastingClass {
    const validClasses: CastingClass[] = [
        'wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'ranger', 'paladin',
        'arcanist', 'oracle', 'witch', 'magus', 'alchemist', 'summoner',
        'inquisitor', 'antipaladin', 'bloodrager', 'hunter', 'shaman',
        'skald', 'warpriest', 'medium', 'mesmerist', 'occultist', 'psychic', 'spiritualist'
    ];
    return validClasses.includes(value as CastingClass);
}

// ===================== SPELL SLOTS & PROGRESSION TYPES =====================

/**
 * Caster information object returned by spell slots lookup
 */
export interface CasterInfo {
    type: 'prepared' | 'spontaneous' | 'hybrid';
    maxSpellLevel: number;
    usesSpellbook: boolean;
    domainSlots?: boolean;
    usesPatrons?: boolean;
    unique?: boolean;
}

/**
 * Spell progression summary with optional level-specific data
 */
export interface SpellProgressionSummary {
    className: string;
    casterType: string;
    maxSpellLevel: number;
    usesSpellbook: boolean;
    // Optional properties added when classLevel is provided
    classLevel?: number;
    spellsPerLevel?: Record<number, number>;
    availableSpellLevels?: number[];
    // Optional property added when no classLevel (full progression)
    fullProgression?: (number | null)[][];
}

// ===================== CONSTANTS =====================

/**
 * Available metamagic options
 */
export const METAMAGIC_OPTIONS: MetamagicType[] = [
    'Still Spell (+1 level)',
    'Silent Spell (+1 level)', 
    'Extend Spell (+1 level)',
    'Empower Spell (+2 levels)',
    'Maximize Spell (+3 levels)',
    'Heighten Spell (+? levels)',
    'Enlarge Spell (+1 level)',
    'Widen Spell (+3 levels)'
];

/**
 * Mapping of spell levels to their string keys
 */
export const SPELL_LEVEL_KEYS: Record<SpellLevel, SpellLevelKey> = {
    0: 'level0',
    1: 'level1', 
    2: 'level2',
    3: 'level3',
    4: 'level4',
    5: 'level5',
    6: 'level6',
    7: 'level7',
    8: 'level8',
    9: 'level9'
};

// Re-export foundation types for convenience
export type {
    MetaBindAPI,
    Component,
    JSEngine,
    JSEngineContext,
    SpellLevel,
    CastingClass,
    CastingStat,
    MetamagicType
} from './foundation.js';