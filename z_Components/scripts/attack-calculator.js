import './spellbook/types/types.js'; // Import type definitions

/**
* Calculates dynamic and attack and damage strings for any number of melee or ranged
* attack, and writes to a frontmatter property for more convenient display (theoretically you can split up weapons however you want this way)
*
* Supports most common PF1e combat options (charge, power attack, fight defensively) 
* as well as many status conditions and buffs. 
*/

/**
 * @typedef {import('./spellbook/types/types.js').Component} Component
 */
export class AttackCalculator {
    constructor() {
        // Add memoization cache
        this.calculationCache = new Map();
        this.maxCacheSize = 50; // Reasonable limit to prevent memory issues
        
        this.weaponDatabase = {
            Ray: { name: "Ray", damageDie: "", critRange: "20", critMult: "2", damageStat: 0, touchAttack: true },
            Shuriken: { name: "Shuriken", damageDie: "1d2", critRange: "20", critMult: "2", damageStat: "str", touchAttack: false },
            Longbow: { name: "Longbow", damageDie: "1d8", critRange: "20", critMult: "3", damageStat: 0, touchAttack: false }
        };

        this.weaponSongEffects = {
            Enhancement: () => ({
                melee: { atkBonus: 1, dmgBonus: 1, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 1, dmgBonus: 1, dmgExtra: "", isCrit: false },
                notes: []
            }),
            Defending: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                notes: ["**Defending:** You can use the enhancement bonus as a bonus to your AC. Designate when the song begins."]
            }),
            Distance: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                notes: ["**Distance:** Doubles the range increment of your ranged weapon."]
            }),
            Flaming: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "+1d6 fire", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "+1d6 fire", isCrit: false },
                notes: []
            }),
            Frost: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "+1d6 cold", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "+1d6 cold", isCrit: false },
                notes: []
            }),
            "Ghost Touch": () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                notes: ["**Ghost Touch:** Your weapon can strike incorporeal creatures without miss chance and deals full damage to them."]
            }),
            Keen: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: true },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: true },
                notes: []
            }),
            "Mighty Cleaving": () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                notes: ["**Mighty Cleaving:** If you hit your target, you can make an additional attack against another opponent within reach at the same attack bonus."]
            }),
            Returning: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                notes: ["**Returning:** A thrown weapon returns to your hand immediately after it is thrown, allowing you to make a full attack with it."]
            }),
            Shock: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "+1d6 electricity", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "+1d6 electricity", isCrit: false },
                notes: []
            }),
            Seeking: () => ({
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                notes: ["**Seeking:** Negates the miss chance for concealment (not total concealment) for ranged attacks."]
            })
        };
    }

    /**
     * Create a cache key from the inputs that actually affect calculations
     * @param {any} boundData - Character bound data
     * @returns {string} Cache key
     */
    createCacheKey(boundData) {
        const key = {
            // Core stats
            strMod: boundData.strMod || 0,
            dexMod: boundData.dexMod || 0,
            chaMod: boundData.chaMod || 0,
            bab: boundData.bab || 0,
            
            // Levels
            paladinLevel: boundData.paladinLevel || 0,
            monkLevel: boundData.monkLevel || 0,
            
            // Adjustments
            atkAdjust: boundData.atkAdjust || 0,
            dmgAdjust: boundData.dmgAdjust || 0,
            rangedAtkAdjust: boundData.rangedAtkAdjust || 0,
            rangedDmgAdjust: boundData.rangedDmgAdjust || 0,
            unarmedAtkAdjust: boundData.unarmedAtkAdjust || 0,
            unarmedDmgAdjust: boundData.unarmedDmgAdjust || 0,
            
            // Enhancements
            meleeWeaponEnhancement: boundData.meleeWeaponEnhancement || 0,
            rangedWeaponEnhancement: boundData.rangedWeaponEnhancement || 0,
            
            // Flags
            smiteEvil: !!boundData.smiteEvil,
            smiteEvilOutsider: !!boundData.smiteEvilOutsider,
            charging: !!boundData.charging,
            flurryOfBlows: !!boundData.flurryOfBlows,
            fightingDefensively: !!boundData.fightingDefensively,
            craneStyle: !!boundData.craneStyle,
            powerAttack: !!boundData.powerAttack,
            agileWeapon: !!boundData.agileWeapon,
            preciseStrike: !!boundData.preciseStrike,
            doublePreciseStrike: !!boundData.doublePreciseStrike,
            flanking: !!boundData.flanking,
            
            // Options
            rangedAttackStyle: boundData.rangedAttackStyle || "Longbow",
            weaponSong: boundData.weaponSong || "Off",
            panachePoints: boundData.panachePoints || 0,
            
            // Condition effects (these are the key ones that change with enlarged)
            conditionEffects: {
                meleeAtkAdjust: boundData.conditionEffects?.meleeAtkAdjust || 0,
                rangedAtkAdjust: boundData.conditionEffects?.rangedAtkAdjust || 0,
                strAdjust: boundData.conditionEffects?.strAdjust || 0,
                dexAdjust: boundData.conditionEffects?.dexAdjust || 0,
                damageAdjust: boundData.conditionEffects?.damageAdjust || 0,
                sizeAdjust: boundData.conditionEffects?.sizeAdjust || 0,
                extraAttacks: (boundData.conditionEffects?.extraAttacks || []).slice() // Copy array
            }
        };
        
        return JSON.stringify(key);
    }

    // Manage cache size to prevent memory issues
    manageCacheSize() {
        if (this.calculationCache.size >= this.maxCacheSize) {
            // Remove oldest entries (first half of cache)
            const keysToDelete = Array.from(this.calculationCache.keys()).slice(0, Math.floor(this.maxCacheSize / 2));
            keysToDelete.forEach(key => this.calculationCache.delete(key));
        }
    }
	
    /**
     * Get enlarged damage die based on size adjustment
     * @param {any} originalDie - Original damage die
     * @param {any} sizeAdjust - Size adjustment
     * @returns {string} Enlarged damage die
     */
    getEnlargedDamageDie(originalDie, sizeAdjust) {
        if (sizeAdjust <= 0) return originalDie;
        
        const sizeLookup = {
            "1d2": ["1d3", "1d4", "1d6"],
            "1d3": ["1d4", "1d6", "1d8"], 
            "1d4": ["1d6", "1d8", "2d6"],
            "1d6": ["1d8", "2d6", "3d6"],
            "1d8": ["2d6", "3d6", "4d6"],
            "2d6": ["3d6", "4d6", "6d6"],
            "2d8": ["3d8", "4d8", "6d8"],
            "3d6": ["4d6", "6d6", "8d6"],
            "3d8": ["4d8", "6d8", "8d8"],
            "4d6": ["6d6", "8d6", "12d6"],
            "4d8": ["6d8", "8d8", "12d8"]
        };
        
        const adjustments = (/** @type {any} */ (sizeLookup))[originalDie];
        if (!adjustments) return originalDie;
        
        const index = Math.min(sizeAdjust - 1, adjustments.length - 1);
        return adjustments[index];
    }
	
    /**
     * Parse input data for attack calculations
     * @param {any} boundData - Character bound data
     * @returns {any} Parsed input data
     */
    parseInputs(boundData) {
        const stats = {
            str: boundData.strMod || 0,
            dex: boundData.dexMod || 0,
            cha: boundData.chaMod || 0,
            bab: boundData.bab || 0
        };

        const levels = {
            paladin: parseInt(boundData.paladinLevel) || 0,
            monk: parseInt(boundData.monkLevel) || 0
        };

        const adjustments = {
            atk: parseInt(boundData.atkAdjust) || 0,
            dmg: parseInt(boundData.dmgAdjust) || 0,
            rangedAtk: parseInt(boundData.rangedAtkAdjust) || 0,
            rangedDmg: parseInt(boundData.rangedDmgAdjust) || 0,
            unarmedAtk: parseInt(boundData.unarmedAtkAdjust) || 0,
            unarmedDmg: parseInt(boundData.unarmedDmgAdjust) || 0
        };

        const enhancements = {
            melee: parseInt(boundData.meleeWeaponEnhancement) || 0,
            ranged: parseInt(boundData.rangedWeaponEnhancement) || 0
        };

        const flags = {
            smiteEvil: boundData.smiteEvil || false,
            smiteEvilOutsider: boundData.smiteEvilOutsider || false,
            charging: boundData.charging || false,
            flurry: boundData.flurryOfBlows || false,
            defending: boundData.fightingDefensively || false,
            craneStyle: boundData.craneStyle || false,
            powerAttack: boundData.powerAttack || false,
            agileWeapon: boundData.agileWeapon || false,
            preciseStrike: boundData.preciseStrike || false,
            doublePrecise: boundData.doublePreciseStrike || false,
            flanking: boundData.flanking || false
        };

        const options = {
            rangedStyle: boundData.rangedAttackStyle || "Longbow",
            weaponSong: boundData.weaponSong || "Off",
            panachePoints: boundData.panachePoints || 0
        };

        const conditionEffects = boundData.conditionEffects || { 
            meleeAtkAdjust: 0, 
            rangedAtkAdjust: 0,
            strAdjust: 0,
            dexAdjust: 0,
            damageAdjust: 0,
            sizeAdjust: 0,
            extraAttacks: []
        };

        return { stats, levels, adjustments, enhancements, flags, options, conditionEffects };
    }
	
    /**
     * Get ranged weapon properties
     * @param {any} attackStyle - Attack style
     * @param {any} adjustedStats - Adjusted stats
     * @returns {any} Weapon properties
     */
    getRangedWeaponProperties(attackStyle, adjustedStats) {
        const weapon = (/** @type {any} */ (this.weaponDatabase))[attackStyle] || this.weaponDatabase.Longbow;
        
        // Handle damage stat reference
        let damageStat = weapon.damageStat;
        if (damageStat === "str") {
            damageStat = adjustedStats.str;
        }
        
        return { ...weapon, damageStat };
    }
	
    /**
     * Get power attack values
     * @param {any} bab - Base attack bonus
     * @param {any} hasPowerAttack - Has power attack
     * @returns {any} Power attack values
     */
    getPowerAttackValues(bab, hasPowerAttack) {
        if (!hasPowerAttack) return { penalty: 0, bonus: 0 };
        const penalty = -1 - Math.floor(bab / 4);
        const bonus = 2 + Math.floor(bab / 4) * 2;
        return { penalty, bonus };
    }
	
    /**
     * Get defensive penalty
     * @param {any} isDefending - Is defending
     * @param {any} hasCraneStyle - Has crane style
     * @returns {number} Defensive penalty
     */
    getDefensivePenalty(isDefending, hasCraneStyle) {
        return isDefending ? (hasCraneStyle ? -2 : -4) : 0;
    }
	
    /**
     * Get smite evil values
     * @param {any} isSmiteEvil - Is smite evil
     * @param {any} isOutsider - Is outsider
     * @param {any} paladinLvl - Paladin level
     * @param {any} chaMod - Charisma modifier
     * @returns {any} Smite evil values
     */
    getSmiteEvilValues(isSmiteEvil, isOutsider, paladinLvl, chaMod) {
        if (!isSmiteEvil || paladinLvl <= 0) return { atkBonus: 0, dmgBonus: 0, description: "" };
        return {
            atkBonus: chaMod,
            dmgBonus: isOutsider ? paladinLvl * 2 : paladinLvl,
            description: isOutsider ? " (2x vs outsider)" : ""
        };
    }
	
    /**
     * Get precise strike damage
     * @param {any} hasPreciseStrike - Has precise strike
     * @param {any} hasDoublePrecise - Has double precise
     * @param {any} paladinLvl - Paladin level
     * @param {any} panachePoints - Panache points
     * @returns {any} Precise strike damage
     */
    getPreciseStrikeDamage(hasPreciseStrike, hasDoublePrecise, paladinLvl, panachePoints) {
        if (!hasPreciseStrike || parseInt(panachePoints) <= 0) return 0;
        let damage = paladinLvl;
        if (hasDoublePrecise) damage *= 2;
        return damage;
    }

    /**
     * Get monk unarmed damage die based on level
     * @param {number} monkLvl - Monk level
     * @returns {string} Damage die (e.g., "1d6")
     */
    getMonkUnarmedDie(monkLvl) {
        if (monkLvl <= 0) return "1d3";
        if (monkLvl >= 12) return "2d8";
        if (monkLvl >= 8) return "2d6";
        if (monkLvl >= 4) return "1d8";
        return "1d6";
    }

    /**
     * Format attack bonus with + or - sign
     * @param {number} bonus - Attack bonus value
     * @returns {string} Formatted bonus (e.g., "+5" or "-2")
     */
    formatAttackBonus(bonus) {
        return bonus >= 0 ? `+${bonus}` : `${bonus}`;
    }

    /**
     * Calculate all attacks for full attack action
     * @param {number} baseAttackBonus - Base attack bonus
     * @param {boolean} hasFlurry - Whether character has flurry of blows
     * @param {number} monkLvl - Monk level
     * @param {number} bab - Base attack bonus (alternative parameter)
     * @param {number[]} extraAttacks - Extra attacks from spells/abilities
     * @param {boolean} canFlurry - Whether flurry can be used
     * @returns {number[]} Array of attack bonuses
     */
    calculateAttacks(baseAttackBonus, hasFlurry, monkLvl, bab, extraAttacks = [], canFlurry = true) {
        let attacks = [];
        
        // Add extra attacks from spells/abilities (like haste, blessing of fervor)
        extraAttacks.forEach(penalty => {
            attacks.push(baseAttackBonus - penalty);
        });
        
        if (hasFlurry && monkLvl > 0 && canFlurry) {
            attacks.push(baseAttackBonus, baseAttackBonus);
            if (monkLvl >= 11) attacks.push(baseAttackBonus);
        } else {
            attacks.push(baseAttackBonus);
        }
        
        // Add iterative attacks
        for (let i = 6; i <= bab; i += 5) {
            attacks.push(baseAttackBonus - (i - 1));
        }
        
        return attacks;
    }

    /**
     * Format attack strings for display
     * @param {number} standardBonus - Standard attack bonus
     * @param {string} damageString - Damage string
     * @param {string} critInfo - Critical hit information
     * @param {number[]} attacks - Array of attack bonuses
     * @param {boolean} touchAttack - Whether this is a touch attack
     * @returns {{standard: string, full: string}} Formatted attack strings
     */
    formatAttackStrings(standardBonus, damageString, critInfo, attacks, touchAttack = false) {
        const touchText = touchAttack ? " (touch)" : "";
        const damageText = damageString ? ` (${damageString})` : "";
        const standardAttack = `${this.formatAttackBonus(standardBonus)}${touchText}${damageText}${critInfo}`;
        const fullAttackString = attacks.map(bonus => this.formatAttackBonus(bonus)).join('/');
        const fullAttack = `${fullAttackString}${touchText}${damageText}${critInfo}`;
        
        return { standard: standardAttack, full: fullAttack };
    }

    // Process weapon song effects
    processWeaponSong(/** @type {string} */ weaponSong) {
        if (weaponSong === "Off" || !(/** @type {any} */ (this.weaponSongEffects))[weaponSong]) {
            return {
                notes: [],
                melee: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false },
                ranged: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false }
            };
        }

        return (/** @type {any} */ (this.weaponSongEffects))[weaponSong]();
    }

    // Create weapon attack calculation
    createWeaponAttack(/** @type {any} */ params) {
        const attackBonus = params.baseAttackBonus + params.attackStat + params.powerAttackValues.penalty + 
                          params.defensivePenalty + params.enhancementBonus + params.conditionAttackBonus + 
                          params.atkAdjust + params.smiteEvilValues.atkBonus + params.chargeBonus + params.flankingBonus +
                          params.conditionAdjust + params.weaponSongValues.atkBonus;
        
        const damageBonus = params.damageStat + params.powerAttackValues.bonus + params.preciseStrikeDamage + 
                           params.enhancementBonus + params.dmgAdjust + params.smiteEvilValues.dmgBonus + 
                           params.weaponSongValues.dmgBonus + params.conditionDamageBonus;
        
        // Create damage string
        let damageString;
        if (params.damageDie === "") {
            // For rays, show only bonus damage if any exists
            const totalBonus = damageBonus + (params.smiteEvilValues.dmgBonus > 0 ? params.smiteEvilValues.dmgBonus : 0);
            const hasAnyDamage = totalBonus > 0 || params.smiteEvilValues.description || params.weaponSongValues.dmgExtra;
            damageString = hasAnyDamage ? 
                (totalBonus > 0 ? `+${totalBonus}${params.smiteEvilValues.description}${params.weaponSongValues.dmgExtra ? ' ' + params.weaponSongValues.dmgExtra : ''}` : 
                 `${params.smiteEvilValues.description}${params.weaponSongValues.dmgExtra ? params.weaponSongValues.dmgExtra : ''}`) : "";
        } else {
            damageString = `${params.damageDie}+${damageBonus}${params.smiteEvilValues.description}${params.weaponSongValues.dmgExtra ? ' ' + params.weaponSongValues.dmgExtra : ''}`;
        }
        
        // Calculate crit range with keen effects
        const isCrit = params.weaponSongValues.isCrit;
        let critInfo;
        if (isCrit) {
            // Keen doubles the threat range
            const rangeParts = params.critRange.split('-');
            if (rangeParts.length === 2) {
                // Range like "19-20" becomes "17-20"
                const baseRange = parseInt(rangeParts[0]);
                const topRange = parseInt(rangeParts[1]);
                const threatRange = topRange - baseRange + 1; // e.g., 20-19+1 = 2
                const newBaseRange = topRange - (threatRange * 2) + 1; // e.g., 20-(2*2)+1 = 17
                critInfo = ` (${newBaseRange}-${topRange}/x${params.critMultiplier})`;
            } else {
                // Range like "20" becomes "19-20"
                const baseRange = parseInt(rangeParts[0]);
                critInfo = ` (${baseRange-1}-${baseRange}/x${params.critMultiplier})`;
            }
        } else {
            critInfo = ` (${params.critRange}/x${params.critMultiplier})`;
        }
        
        return { attackBonus, damageString, critInfo };
    }

    // Main calculation method with memoization
    calculateAttackStrings(/** @type {any} */ boundData) {
        // Create cache key from inputs
        const cacheKey = this.createCacheKey(boundData);
        
        // Check if we have a cached result
        if (this.calculationCache.has(cacheKey)) {
            return this.calculationCache.get(cacheKey);
        }
        
        // Perform the actual calculation
        const result = this.performCalculation(boundData);
        
        // Cache the result
        this.calculationCache.set(cacheKey, result);
        this.manageCacheSize();
        
        return result;
    }

    // Separated calculation logic for caching
    performCalculation(/** @type {any} */ boundData) {
        const { stats, levels, adjustments, enhancements, flags, options, conditionEffects } = this.parseInputs(boundData);
        
        // Get condition effects
        const sizeAdjust = conditionEffects.sizeAdjust || 0;
        
        // Calculate common values
        const { notes: weaponSongNotes, melee: meleeSong, ranged: rangedSong } = this.processWeaponSong(options.weaponSong);
        const powerAttackValues = this.getPowerAttackValues(stats.bab, flags.powerAttack);
        const defensivePenalty = this.getDefensivePenalty(flags.defending, flags.craneStyle);
		console.log(`defense penalty: ${defensivePenalty}`);
        const smiteEvilValues = this.getSmiteEvilValues(flags.smiteEvil, flags.smiteEvilOutsider, levels.paladin, stats.cha);
        const preciseStrikeDamage = this.getPreciseStrikeDamage(flags.preciseStrike, flags.doublePrecise, levels.paladin, options.panachePoints);
        const chargeBonus = flags.charging ? 2 : 0;
        const flankingBonus = flags.flanking ? 2 : 0;

        // Common attack parameters
        const baseParams = {
            baseAttackBonus: stats.bab,
            powerAttackValues,
            defensivePenalty,
            smiteEvilValues,
            preciseStrikeDamage
        };

        // MELEE ATTACK (WAVEBLADE)
        const meleeAttackStat = flags.agileWeapon && stats.dex > stats.str ? stats.dex : stats.str;
        const meleeDamageStat = flags.agileWeapon && stats.dex > stats.str ? stats.dex : stats.str;

        const meleeAttack = this.createWeaponAttack({
            ...baseParams,
            damageDie: this.getEnlargedDamageDie("1d6", sizeAdjust),
            critRange: "19-20",
            critMultiplier: "2",
            attackStat: meleeAttackStat,
            damageStat: meleeDamageStat,
            enhancementBonus: enhancements.melee,
            atkAdjust: adjustments.atk,
            dmgAdjust: adjustments.dmg,
            chargeBonus,
            flankingBonus,
            conditionAdjust: conditionEffects.meleeAtkAdjust || 0,
            conditionAttackBonus: conditionEffects.meleeAtkAdjust || 0,
            conditionDamageBonus: conditionEffects.damageAdjust || 0,
            weaponSongValues: meleeSong
        });

        const meleeAttacks = this.calculateAttacks(
            meleeAttack.attackBonus, 
            flags.flurry, 
            levels.monk, 
            stats.bab, 
            conditionEffects.extraAttacks || [],
            true
        );
        const meleeAttackStrings = this.formatAttackStrings(meleeAttack.attackBonus, meleeAttack.damageString, meleeAttack.critInfo, meleeAttacks);

        // RANGED ATTACK
        const rangedWeaponProps = this.getRangedWeaponProperties(options.rangedStyle, stats);
        const canUseFlurryForRanged = options.rangedStyle === "Shuriken";

        const rangedAttack = this.createWeaponAttack({
            ...baseParams,
            damageDie: this.getEnlargedDamageDie(rangedWeaponProps.damageDie, sizeAdjust),
            critRange: rangedWeaponProps.critRange,
            critMultiplier: rangedWeaponProps.critMult,
            attackStat: stats.dex,
            damageStat: rangedWeaponProps.damageStat,
            enhancementBonus: enhancements.ranged,
            atkAdjust: adjustments.rangedAtk,
            dmgAdjust: adjustments.rangedDmg,
            chargeBonus: 0,
            flankingBonus: 0,
            conditionAdjust: conditionEffects.rangedAtkAdjust || 0,
            conditionAttackBonus: conditionEffects.rangedAtkAdjust || 0,
            conditionDamageBonus: conditionEffects.damageAdjust || 0,
            preciseStrikeDamage: canUseFlurryForRanged ? preciseStrikeDamage : 0,
            weaponSongValues: rangedSong
        });

        const rangedAttacks = this.calculateAttacks(
            rangedAttack.attackBonus, 
            flags.flurry && canUseFlurryForRanged, 
            canUseFlurryForRanged ? levels.monk : 0, 
            stats.bab, 
            conditionEffects.extraAttacks || [],
            canUseFlurryForRanged
        );
        const rangedAttackStrings = this.formatAttackStrings(rangedAttack.attackBonus, rangedAttack.damageString, 
                                                          rangedAttack.critInfo, rangedAttacks, rangedWeaponProps.touchAttack);

        // UNARMED ATTACK
        const unarmedAttack = this.createWeaponAttack({
            ...baseParams,
            damageDie: this.getEnlargedDamageDie(this.getMonkUnarmedDie(levels.monk), sizeAdjust),
            critRange: "20",
            critMultiplier: "2",
            attackStat: stats.dex,
            damageStat: stats.str,
            enhancementBonus: 0,
            atkAdjust: adjustments.unarmedAtk,
            dmgAdjust: adjustments.unarmedDmg,
            chargeBonus,
            flankingBonus,
            conditionAdjust: conditionEffects.meleeAtkAdjust || 0,
            conditionAttackBonus: conditionEffects.meleeAtkAdjust || 0,
            conditionDamageBonus: conditionEffects.damageAdjust || 0,
            weaponSongValues: { atkBonus: 0, dmgBonus: 0, dmgExtra: "", isCrit: false }
        });

        const unarmedAttacks = this.calculateAttacks(
            unarmedAttack.attackBonus, 
            flags.flurry, 
            levels.monk, 
            stats.bab, 
            conditionEffects.extraAttacks || []
        );
        const unarmedAttackStrings = this.formatAttackStrings(unarmedAttack.attackBonus, unarmedAttack.damageString, unarmedAttack.critInfo, unarmedAttacks);

        // Format output
        const weaponSongNotesText = weaponSongNotes.length > 0 && options.weaponSong !== "Off" ? 
            "\n\n**Weapon Song Effects:**\n" + weaponSongNotes.join("\n") : "";

        const formatWeaponOutput = (/** @type {any} */ attackStrings, /** @type {string} */ additionalNotes = "") => 
            `**Standard Attack:** ${attackStrings.standard}\n**Full Attack:** ${attackStrings.full}${additionalNotes}`;

        return {
            waveblade: formatWeaponOutput(meleeAttackStrings) + weaponSongNotesText,
            ranged: formatWeaponOutput(rangedAttackStrings) + weaponSongNotesText,
            unarmed: formatWeaponOutput(unarmedAttackStrings)
        };
    }
}