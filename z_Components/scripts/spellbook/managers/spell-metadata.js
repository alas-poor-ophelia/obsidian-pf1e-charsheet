/**
 * Meta Bind data access functions for spell and caster metadata
 * These functions handle all interactions with Meta Bind for retrieving spell and caster data
 */

import { getSpellsPerLevel } from '../utils/spell-slots-lookup.js';
import { getSpellLevelKey } from '../utils/spell-calculations.js';
import '../types/types.js'; // Import type definitions

/**
 * @typedef {import('../types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('../types/types.js').Spell} Spell
 * @typedef {import('../types/types.js').Preparation} Preparation
 * @typedef {import('../types/types.js').SpellLevel} SpellLevel
 * @typedef {import('../types/types.js').CastingClass} CastingClass
 * @typedef {import('../types/types.js').MetamagicType} MetamagicType
 */

/**
 * Spell metadata access class
 * Provides methods for accessing spell and caster data through Meta Bind
 */
export class SpellMetadataManager {
    /** @type {MetaBindAPI} */
    mb;
    /** @type {string} */
    spellbookFilePath;
    
    /**
     * @param {MetaBindAPI} mb - Meta Bind API instance
     * @param {string} spellbookFilePath - Path to spellbook file
     */
    constructor(mb, spellbookFilePath) {
        this.mb = mb;
        this.spellbookFilePath = spellbookFilePath;
    }

    /**
     * Get active metamagics for a specific spell level
     * @param {SpellLevel} spellLevel - The spell level
     * @returns {MetamagicType[]} Array of active metamagic names
     */
    getActiveMetamagics(spellLevel) {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.${getSpellLevelKey(spellLevel)}.activeMetamagics`, this.spellbookFilePath);
        return this.mb.getMetadata(settingsTarget) || [];
    }

    /**
     * Get casting class from frontmatter
     * @returns {CastingClass} The casting class
     */
    getCastingClass() {
        const target = this.mb.parseBindTarget("castingClass", this.spellbookFilePath);
        return this.mb.getMetadata(target) || 'wizard';
    }

    /**
     * Get caster level from frontmatter
     * @returns {number} The caster level
     */
    getCasterLevel() {
        const target = this.mb.parseBindTarget("casterLevel", this.spellbookFilePath);
        return this.mb.getMetadata(target) || 1;
    }

    /**
     * Get casting stat bonus from frontmatter
     * @returns {number} The casting stat modifier
     */
    getCastingStatBonus() {
        const target = this.mb.parseBindTarget("castingStatBonus", this.spellbookFilePath);
        return this.mb.getMetadata(target) || 0;
    }

    /**
     * Get available spell slots for a level (base + bonus from stat)
     * @param {SpellLevel} spellLevel - The spell level to check
     * @returns {number} Total spell slots available
     */
    getAvailableSpellSlots(spellLevel) {
        const castingClass = this.getCastingClass();
        const casterLevel = this.getCasterLevel();
        const castingStatBonus = this.getCastingStatBonus();

        // The lookup function now handles both base and bonus slots
        // Arcanist's bonus spells only apply to casts, not preps, we just pass 0 as a workaround for now
        if (castingClass == "arcanist") {
            return getSpellsPerLevel(castingClass, casterLevel, spellLevel, 0);
        }
        return getSpellsPerLevel(castingClass, casterLevel, spellLevel, castingStatBonus) || 0;
    }

    /**
     * Get remaining spell slots for a level
     * @param {SpellLevel} spellLevel - The spell level
     * @returns {number} Remaining spell slots
     */
    getRemainingSpellSlots(spellLevel) {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.${getSpellLevelKey(spellLevel)}.totalRemaining`, this.spellbookFilePath);
        return this.mb.getMetadata(settingsTarget);
    }

    /**
     * Get spells of a specific base level
     * @param {SpellLevel} level - The spell level
     * @returns {Spell[]} Array of spells at the specified level
     */
    getSpellsByLevel(level) {
        const spellsTarget = this.mb.parseBindTarget("spells", this.spellbookFilePath);
        const allSpells = this.mb.getMetadata(spellsTarget) || [];
        return allSpells.filter((/** @type {Spell} */ spell) => spell.baseLevel === level);
    }

    /**
     * Find the index of a spell in the main spells array
     * @param {string} spellName - The name of the spell
     * @returns {number} Index of the spell (-1 if not found)
     */
    getSpellIndex(spellName) {
        const spellsTarget = this.mb.parseBindTarget("spells", this.spellbookFilePath);
        const allSpells = this.mb.getMetadata(spellsTarget) || [];
        return allSpells.findIndex((/** @type {Spell} */ spell) => spell.name === spellName);
    }

    /**
     * Get spell by ID from spells array
     * @param {number} spellId - ID of the spell to find
     * @returns {Spell|null} The spell object or null if not found
     */
    getSpellById(spellId) {
        const spellsTarget = this.mb.parseBindTarget("spells", this.spellbookFilePath);
        const allSpells = this.mb.getMetadata(spellsTarget) || [];
        return allSpells.find((/** @type {Spell} */ spell) => spell.id === spellId) || null;
    }

    /**
     * Get all spell preparations for a specific level
     * @param {SpellLevel} targetLevel - The target spell level
     * @returns {import('../types/types.js').SpellPreparation[]} Array of spell preparations
     */
    getPreparationsForLevel(targetLevel) {
        const levelKey = `level${targetLevel}`;
        const preparationsTarget = this.mb.parseBindTarget(`spellPreparations.${levelKey}`, this.spellbookFilePath);
        return this.mb.getMetadata(preparationsTarget) || [];
    }

    /**
     * Get all spells from frontmatter
     * @returns {Spell[]} Array of all spells
     */
    getAllSpells() {
        const spellsTarget = this.mb.parseBindTarget("spells", this.spellbookFilePath);
        return this.mb.getMetadata(spellsTarget) || [];
    }

    /**
     * Get global active metamagics (for spontaneous casters)
     * @returns {MetamagicType[]} Array of global active metamagic names
     */
    getGlobalActiveMetamagics() {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.globalActiveMetamagics`, this.spellbookFilePath);
        return this.mb.getMetadata(settingsTarget) || [];
    }

    /**
     * Get selected metamagic for a spell level
     * @param {SpellLevel} spellLevel - The spell level
     * @returns {string} Selected metamagic name
     */
    getSelectedMetamagic(spellLevel) {
        const settingsTarget = this.mb.parseBindTarget(`spellLevelSettings.${getSpellLevelKey(spellLevel)}.selectedMetamagic`, this.spellbookFilePath);
        return this.mb.getMetadata(settingsTarget) || '';
    }

    /**
     * Get global selected metamagic
     * @returns {string} Selected global metamagic name
     */
    getSelectedGlobalMetamagic() {
        const selectedMetamagicTarget = this.mb.parseBindTarget("selectedMetamagic", this.spellbookFilePath);
        return this.mb.getMetadata(selectedMetamagicTarget) || '';
    }

    /**
     * Count prepared spells for a specific level (calculated from actual preparations)
     * @param {SpellLevel} targetLevel - The target spell level
     * @returns {number} Number of prepared spells at the target level
     */
    countPreparedSpellsForLevel(targetLevel) {
        const levelKey = `level${targetLevel}`;
        const preparationsTarget = this.mb.parseBindTarget(`spellPreparations.${levelKey}`, this.spellbookFilePath);
        const preparations = this.mb.getMetadata(preparationsTarget) || [];
        
        let count = 0;
        for (const prep of preparations) {
            count += prep.count || 1;
        }

        return count;
    }

    /**
     * Get prepared spells filtered by adjusted level
     * @param {SpellLevel} targetLevel - The target spell level
     * @returns {import('../types/domain.js').SpellPreparation[]} Array of spell preparations at the target level
     */
    getPreparedSpellsByLevel(targetLevel) {
        return this.getPreparationsForLevel(targetLevel);
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
    }
}