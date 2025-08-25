/**
 * Factory functions to create the appropriate spellbook renderer
 */

import { SpellbookRenderer } from './spellbook.js';
import { PreparedSpellbookRenderer } from '../renderers/prepared-renderer.js';
import { SpontaneousSpellbookRenderer } from '../renderers/spontaneous-renderer.js';
import { HybridSpellbookRenderer } from '../renderers/hybrid-renderer.js';
import { getCasterConfig } from '../utils/caster-configs.js';

/**
 * Factory function to create the appropriate spellbook renderer
 * Automatically detects the casting class from the spellbook's frontmatter
 * @param {import('../types/types.js').MetaBindAPI} mb - MetaBind instance
 * @param {string} spellbookNotePath - Path to the spellbook note
 * @returns {SpellbookRenderer} The appropriate renderer instance
 */
export function createSpellbookRenderer(mb, spellbookNotePath = 'MiniSheet/z_Components/spellbooks/SpellBookTest.md') {
    // Create a temporary instance to read the casting class from frontmatter
    const tempRenderer = new SpellbookRenderer(mb, spellbookNotePath);
    const castingClass = tempRenderer.getCastingClass();

    return createSpellbookRendererForClass(castingClass, mb, spellbookNotePath);
}

/**
 * Factory function to create the appropriate spellbook renderer
 * @param {string} castingClass - The casting class name
 * @param {import('../types/types.js').MetaBindAPI} mb - MetaBind instance
 * @param {string} spellbookNotePath - Path to the spellbook note
 * @returns {SpellbookRenderer} The appropriate renderer instance
 */
export function createSpellbookRendererForClass(castingClass, mb, spellbookNotePath) {
    // Handle null, undefined, non-strings, or empty/whitespace-only class names
    if (!castingClass || typeof castingClass !== 'string' || castingClass.trim() === '') {
        console.warn(`Unknown casting class: ${castingClass}. Defaulting to prepared caster.`);
        return new PreparedSpellbookRenderer(mb, spellbookNotePath);
    }

    const config = getCasterConfig(castingClass);
    
    // Check if this is an unknown class by comparing to the known classes
    // (castingClass is guaranteed to be a string here due to check above)
    const normalizedClass = castingClass.toLowerCase().trim();
    const knownClasses = ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard', 'oracle', 'skald', 'arcanist', 'witch', 'summoner', 'magus', 'alchemist', 'bloodrager'];
    
    if (!knownClasses.includes(normalizedClass)) {
        console.warn(`Unknown casting class: ${castingClass}. Defaulting to prepared caster.`);
        return new PreparedSpellbookRenderer(mb, spellbookNotePath);
    }

    switch (config.type) {
        case 'prepared':
            return new PreparedSpellbookRenderer(mb, spellbookNotePath);
        case 'spontaneous':
            return new SpontaneousSpellbookRenderer(mb, spellbookNotePath);
        case 'hybrid':
            return new HybridSpellbookRenderer(mb, spellbookNotePath);
        default:
            return new PreparedSpellbookRenderer(mb, spellbookNotePath);
    }
}