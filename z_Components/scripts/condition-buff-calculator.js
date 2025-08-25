import './spellbook/types/types.js'; // Import type definitions

/**
* Given a list of active buffs or status conditions, calculates a list of numeric
* bonuses to each stat, etc, as well as a short note on what that status or condition
* does. 
*
* These bonuses can then be applied in appropriate spots (i.e. AC, attacks, etc) by reading in the effects arrays.
*/ 

/**
 * @typedef {import('./spellbook/types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('./spellbook/types/types.js').Component} Component
 * @typedef {import('./spellbook/types/types.js').ConditionEffects} ConditionEffects
 */
export class ConditionBuffCalculator {
    /** @type {MetaBindAPI} */
    mb;
    /** @type {string} */
    filePath;
    
    /**
     * @param {MetaBindAPI} mb - Meta Bind API instance
     * @param {string} filePath - Path to the character file
     */
    constructor(mb, filePath) {
        this.mb = mb;
        this.filePath = filePath;
        this.initializeEffectMaps();
    }

    initializeEffectMaps() {
        this.conditionEffectsMap = {
            "prone": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 4;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 4; 
                effects.acAdjust = (effects.acAdjust || 0) - 4;
                effects.touchAcAdjust = (effects.touchAcAdjust || 0) - 4;
                effects.ffAcAdjust = (effects.ffAcAdjust || 0) - 4;
                notes.push("- Prone: +4 AC vs ranged attacks, -4 vs melee; can't use ranged except crossbows");
            },
            
            "blinded": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.acAdjust = (effects.acAdjust || 0) - 2;
                effects.loseDexToAC = true;
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 4;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 4;
                effects.strSkillAdjust = (effects.strSkillAdjust || 0) - 4;
                effects.dexSkillAdjust = (effects.dexSkillAdjust || 0) - 4;
                effects.perceptionAdjust = (effects.perceptionAdjust || 0) - 4;
                effects.miss50 = true;
                effects.movementAdjust = 0.5;
                notes.push("- Blinded: All sight-based checks auto-fail, 50% miss chance, half speed");
            },
            
            "dazed": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.canAct = false;
                effects.canFullRound = false;
                effects.canStandard = false;
                effects.canMove = false;
                effects.canAttack = false;
                effects.canCast = false;
                notes.push("- Dazed: Cannot take actions, no penalty to AC");
            },
            
            "staggered": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.canFullRound = false;
                notes.push("- Staggered: Can take only a single move OR standard action each round");
            },
            
            "stunned": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.canAct = false;
                effects.canFullRound = false;
                effects.canStandard = false;
                effects.canMove = false;
                effects.canAttack = false;
                effects.canCast = false;
                effects.acAdjust = (effects.acAdjust || 0) - 2;
                effects.touchAcAdjust = (effects.touchAcAdjust || 0) - 2;
                effects.ffAcAdjust = (effects.ffAcAdjust || 0) - 2;
                effects.loseDexToAC = true;
                effects.flatFooted = true;
                notes.push("- Stunned: Drop items, can't act, -2 AC, lose Dex to AC. Attackers get +4 to CMB");
            },
            
            "shaken": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 2;
                effects.cmb = (effects.cmb || 0) - 2;
                effects.fortAdjust = (effects.fortAdjust || 0) - 2;
                effects.refAdjust = (effects.refAdjust || 0) - 2;
                effects.willAdjust = (effects.willAdjust || 0) - 2;
                effects.skillAdjust = (effects.skillAdjust || 0) - 2;
                notes.push("- Shaken: -2 penalty on attacks, saves, skills, and ability checks");
            },
            
            "paralyzed": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.canAct = false;
                effects.canFullRound = false;
                effects.canStandard = false;
                effects.canMove = false;
                effects.canAttack = false;
                effects.canCast = false;
                effects.helpless = true;
                effects.strAdjust = (effects.strAdjust || 0) - 10;
                effects.dexAdjust = (effects.dexAdjust || 0) - 10;
                notes.push("- Paralyzed: Frozen in place, helpless, cannot move, STR & DEX = 0; mental actions only");
            },
            
            "grappled": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.dexAdjust = (effects.dexAdjust || 0) - 4;
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 2;
                effects.cmb = (effects.cmb || 0) - 2;
                effects.cmd = (effects.cmd || 0) - 2;
                effects.movementAdjust = 0;
                notes.push("- Grappled: -2 attacks, -4 DEX, can't move, no stealth, can't cast with somatic components unless concentration check");
            },
            
            "flat-footed": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.flatFooted = true;
                effects.loseDexToAC = true;
                notes.push("- Flat-Footed: Lose DEX bonus to AC, cannot make AoO (unless Combat Reflexes)");
            },
            
            "nauseated": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.canAttack = false;
                effects.canCast = false;
                effects.canFullRound = false;
                effects.canStandard = false;
                effects.canMove = true;
                notes.push("- Nauseated: Can't attack, cast, concentrate, or do anything requiring attention. Only a single move action per turn");
            },

            "sickened": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 2;
                effects.fortAdjust = (effects.fortAdjust || 0) - 2;
                effects.refAdjust = (effects.refAdjust || 0) - 2;
                effects.willAdjust = (effects.willAdjust || 0) - 2;
                effects.skillAdjust = (effects.skillAdjust || 0) - 2;
                notes.push("- Sickened: -2 penalty on attack rolls, weapon damage rolls, saving throws, skill checks, and ability checks");
            },

            "frightened": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 2;
                effects.cmb = (effects.cmb || 0) - 2;
                effects.fortAdjust = (effects.fortAdjust || 0) - 2;
                effects.refAdjust = (effects.refAdjust || 0) - 2;
                effects.willAdjust = (effects.willAdjust || 0) - 2;
                effects.skillAdjust = (effects.skillAdjust || 0) - 2;
                notes.push("- Frightened: -2 penalty on attacks, saves, skills, and ability checks; must flee from fear source if possible");
            },

            "panicked": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 2;
                effects.cmb = (effects.cmb || 0) - 2;
                effects.fortAdjust = (effects.fortAdjust || 0) - 2;
                effects.refAdjust = (effects.refAdjust || 0) - 2;
                effects.willAdjust = (effects.willAdjust || 0) - 2;
                effects.skillAdjust = (effects.skillAdjust || 0) - 2;
                notes.push("- Panicked: -2 penalty on attacks, saves, skills, and ability checks; drop held items, flee randomly from all dangers");
            },

            "deafened": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                notes.push("- Deafened: -4 initiative checks, auto-fail Listen checks, 20% spell failure for verbal components");
            },

            "exhausted": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.strAdjust = (effects.strAdjust || 0) - 6;
                effects.dexAdjust = (effects.dexAdjust || 0) - 6;
                effects.movementAdjust = 0.5;
                effects.canFullRound = false;
                notes.push("- Exhausted: -6 STR and DEX, half speed, can't run or charge; 1 hour rest makes fatigued");
            },

            "fatigued": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.strAdjust = (effects.strAdjust || 0) - 2;
                effects.dexAdjust = (effects.dexAdjust || 0) - 2;
                effects.canFullRound = false;
                notes.push("- Fatigued: -2 STR and DEX, can't run or charge; doing fatiguing activity makes exhausted");
            },

            "entangled": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 2;
                effects.dexAdjust = (effects.dexAdjust || 0) - 4;
                effects.movementAdjust = 0.5;
                effects.canFullRound = false;
                notes.push("- Entangled: -2 attack rolls, -4 DEX, half speed, can't run/charge; concentration check DC 15+spell level to cast");
            },

            "helpless": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.helpless = true;
                effects.dexAdjust = (effects.dexAdjust || 0) - 10;
                effects.loseDexToAC = true;
                notes.push("- Helpless: DEX = 0, attackers get +4 melee bonus, subject to coup de grace, rogues can sneak attack");
            },

            "confused": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                notes.push("- Confused: Roll d% each turn: 01-10 attack caster, 11-20 act normal, 21-50 babble, 51-70 flee, 71-100 attack nearest creature");
            }
        };

        this.buffEffectsMap = {
            "enlarged": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes, /** @type {string[]} */ buffs, /** @type {string} */ bofChoice) => {
                this.processEnlarged(effects, notes);
            },
            
            "enlarge person": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes, /** @type {string[]} */ buffs, /** @type {string} */ bofChoice) => {
                this.processEnlarged(effects, notes);
            },
            
            "bull's strength": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.strAdjust = (effects.strAdjust || 0) + 4;
                notes.push("- Bull's Strength: +4 enhancement bonus to Strength");
            },
            
            "cat's grace": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.dexAdjust = (effects.dexAdjust || 0) + 4;
                notes.push("- Cat's Grace: +4 enhancement bonus to Dexterity");
            },
            
            "bear's endurance": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.conAdjust = (effects.conAdjust || 0) + 4;
                notes.push("- Bear's Endurance: +4 enhancement bonus to Constitution");
            },
            
            "fox's cunning": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.intAdjust = (effects.intAdjust || 0) + 4;
                notes.push("- Fox's Cunning: +4 enhancement bonus to Intelligence");  
            },
            
            "owl's wisdom": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.wisAdjust = (effects.wisAdjust || 0) + 4;
                notes.push("- Owl's Wisdom: +4 enhancement bonus to Wisdom");
            },
            
            "eagle's splendor": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.chaAdjust = (effects.chaAdjust || 0) + 4;
                notes.push("- Eagle's Splendor: +4 enhancement bonus to Charisma");
            },
            
            "bless": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) + 1;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) + 1;
                effects.fortAdjust = (effects.fortAdjust || 0) + 1;
                effects.refAdjust = (effects.refAdjust || 0) + 1;
                effects.willAdjust = (effects.willAdjust || 0) + 1;
                notes.push("- Bless: +1 morale bonus on attack rolls and saving throws against fear effects");
            },

            "blessing of fervor": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes, /** @type {string[]} */ buffs, /** @type {string} */ bofChoice) => {
                this.processBlessingOfFervor(effects, notes, buffs, bofChoice);
            },
            
            "haste": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes, /** @type {string[]} */ buffs) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) + 1;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) + 1;
                effects.acAdjust = (effects.acAdjust || 0) + 1;
                effects.touchAcAdjust = (effects.touchAcAdjust || 0) + 1;
                effects.refAdjust = (effects.refAdjust || 0) + 1;
                effects.movementAdjust = 1.5;
                
                // Add extra attack at full BAB (0 penalty), only if not already under effect of an extra attack from another source that won't stack.
                if(!buffs.includes("blessing of fervor")) {
                    effects.extraAttacks = effects.extraAttacks || [];
                    effects.extraAttacks.push(0);
                } 
                
                notes.push("- Haste: +1 attack/AC/Ref, +30ft speed, extra attack at full BAB");
            },
            
            "barkskin": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.naturalArmorAdjust = (effects.naturalArmorAdjust || 0) + 2;
                // Natural armor bonus applies to normal AC and flat-footed AC, but NOT touch AC
                effects.acAdjust = (effects.acAdjust || 0) + 2;
                effects.ffAcAdjust = (effects.ffAcAdjust || 0) + 2;
                // Explicitly do NOT add to touchAcAdjust since natural armor doesn't apply to touch AC
                notes.push("- Barkskin: +2 enhancement bonus to natural armor (does not apply to touch AC)");
            },
            
            "magic weapon": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) + 1;
                effects.damageAdjust = (effects.damageAdjust || 0) + 1;
                notes.push("- Magic Weapon: +1 enhancement bonus to weapon attacks and damage");
            },
            
            "shield": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                // Shield provides shield bonus - applies to normal AC and flat-footed AC, but NOT touch AC
                effects.acAdjust = (effects.acAdjust || 0) + 4;
                effects.ffAcAdjust = (effects.ffAcAdjust || 0) + 4;
                // Explicitly do NOT add to touchAcAdjust since shield bonuses don't apply to touch AC
                notes.push("- Shield: +4 shield bonus to AC (does not apply to touch AC)");
            },
            
            "mage armor": (/** @type {ConditionEffects} */ effects, /** @type {string[]} */ notes) => {
                // Mage armor provides armor bonus - applies to normal AC and flat-footed AC, but NOT touch AC
                effects.acAdjust = (effects.acAdjust || 0) + 4;
                effects.ffAcAdjust = (effects.ffAcAdjust || 0) + 4;
                // Explicitly do NOT add to touchAcAdjust since armor bonuses don't apply to touch AC
                notes.push("- Mage Armor: +4 armor bonus to AC (does not apply to touch AC)");
            }
        };
    }

    /**
     * Helper function to avoid code duplication for enlarge effects
     * @param {ConditionEffects} effects - Effects object
     * @param {string[]} notes - Notes array
     */
    processEnlarged(effects, notes) {
        effects.sizeAdjust = (effects.sizeAdjust || 0) + 1;
        effects.strAdjust = (effects.strAdjust || 0) + 2;
        effects.dexAdjust = (effects.dexAdjust || 0) - 2;
        effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - 1;
        effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - 1;
        effects.acAdjust = (effects.acAdjust || 0) - 1;
        effects.touchAcAdjust = (effects.touchAcAdjust || 0) - 1;
        effects.ffAcAdjust = (effects.ffAcAdjust || 0) - 1;
        effects.cmb = (effects.cmb || 0) + 1;
        effects.cmd = (effects.cmd || 0) + 1;
        effects.reachAdjust = (effects.reachAdjust || 0) + 5;
        notes.push("- Enlarged: +2 STR, -2 DEX, -1 attack/AC, +1 CMB/CMD, reach +5ft, -4 Stealth, larger weapon damage");
    }

    /**
     * Process blessing of fervor buff effects
     * @param {ConditionEffects} effects - Effects object
     * @param {string[]} notes - Notes array
     * @param {string[]} buffs - Active buffs array
     * @param {string} bofChoice - Blessing of fervor choice
     */
    processBlessingOfFervor(effects, notes, buffs, bofChoice) {
        // Base blessing of fervor note
        let bofNote = "- Blessing of Fervor:\n`INPUT\\[inlineSelect(option(+30ft. Speed), option(Stand as Swift), option(Extra Attack), option(+2 Atk/AC/Reflex), option(Free Metamagic)):bofChoice\\]`";

        // Check if haste is already active to prevent stacking
        const hasHaste = buffs.includes("haste") || buffs.includes("hasted");
        
        // Apply effects and add specific notes based on choice
        switch(bofChoice) {
            case "+30ft. Speed":
                effects.movementAdjust = (effects.movementAdjust || 0) + 0.5; // Adds 30ft to base speed
                bofNote += "\nCurrent Effect: +30 feet enhancement bonus to speed";
                break;
                
            case "Stand as Swift":
                // No mechanical effect needed - this is a special action
                bofNote += "\nCurrent Effect: Can stand from prone as a swift action";
                break;
                
            case "Extra Attack":
                // Extra attack does not stack with haste
                if (!hasHaste) {
                    effects.extraAttacks = effects.extraAttacks || [];
                    effects.extraAttacks.push(0);      
                }
                bofNote += "\nCurrent Effect: One extra attack at highest base attack bonus. Does not stack with haste.";
                break;
                
            case "+2 Atk/AC/Reflex":
                effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) + 2;
                effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) + 2;
                effects.acAdjust = (effects.acAdjust || 0) + 2;
                effects.touchAcAdjust = (effects.touchAcAdjust || 0) + 2;
                effects.refAdjust = (effects.refAdjust || 0) + 2;
                bofNote += "Current Effect: +2 competence bonus to attack rolls, AC, and Reflex saves";
                break;
                
            case "Free Metamagic":
                // No mechanical effect - this affects spellcasting
                bofNote += "Current Effect: Apply metamagic (enlarged, extended, silent, or still) to 2nd level or lower spell for free.";
                break;
                
            default:
                if (bofChoice) {
                    bofNote += `\n  - Current Effect: ${bofChoice} (effect not recognized)`;
                }
                break;
        }
        
        notes.push(bofNote);
    }

    /**
     * Create default effects object
     * @returns {ConditionEffects} Default effects object
     */
    createDefaultEffects() {
        return {
            meleeAtkAdjust: 0,
            rangedAtkAdjust: 0,
            extraAttacks: [],
            cmb: 0, 
            cmd: 0,
            acAdjust: 0,
            touchAcAdjust: 0,
            ffAcAdjust: 0,
            fortAdjust: 0,
            refAdjust: 0,
            willAdjust: 0,
            hpMaxAdjust: 0,
            strAdjust: 0,
            dexAdjust: 0,
            conAdjust: 0,
            intAdjust: 0,
            wisAdjust: 0,
            chaAdjust: 0,
            conSkillAdjust: 0,
            intSkillAdjust: 0,
            wisSkillAdjust: 0,
            chaSkillAdjust: 0,
            skillAdjust: 0,
            levelAdjust: 0,
            perceptionAdjust: 0,
            strSkillAdjust: 0,
            dexSkillAdjust: 0,
            movementAdjust: 1.0,
            sizeAdjust: 0,
            naturalArmorAdjust: 0,
            damageAdjust: 0,
            reachAdjust: 0,
            canAct: true,
            canFullRound: true,
            canStandard: true,
            canMove: true,
            canAttack: true,
            canCast: true,
            miss50: false,
            helpless: false,
            flatFooted: false,
            loseDexToAC: false,
            conditionNotes: "",
            buffNotes: ""
        };
    }

    /**
     * Process negative levels
     * @param {ConditionEffects} effects - Effects object
     * @param {string[]} conditionNotes - Condition notes array
     * @param {number} negativeLevels - Number of negative levels
     */
    processNegativeLevels(/** @type {ConditionEffects} */ effects, /** @type {string[]} */ conditionNotes, /** @type {number} */ negativeLevels) {
        if (negativeLevels <= 0) return;

        effects.meleeAtkAdjust = (effects.meleeAtkAdjust || 0) - negativeLevels;
        effects.rangedAtkAdjust = (effects.rangedAtkAdjust || 0) - negativeLevels;
        effects.cmb = (effects.cmb || 0) - negativeLevels;
        effects.cmd = (effects.cmd || 0) - negativeLevels;
        effects.fortAdjust = (effects.fortAdjust || 0) - negativeLevels;
        effects.refAdjust = (effects.refAdjust || 0) - negativeLevels;
        effects.willAdjust = (effects.willAdjust || 0) - negativeLevels;
        effects.skillAdjust = (effects.skillAdjust || 0) - negativeLevels;
        effects.strSkillAdjust = (effects.strSkillAdjust || 0) - negativeLevels;
        effects.dexSkillAdjust = (effects.dexSkillAdjust || 0) - negativeLevels;
        effects.conSkillAdjust = (effects.conSkillAdjust || 0) - negativeLevels;
        effects.intSkillAdjust = (effects.intSkillAdjust || 0) - negativeLevels;
        effects.wisSkillAdjust = (effects.wisSkillAdjust || 0) - negativeLevels;
        effects.chaSkillAdjust = (effects.chaSkillAdjust || 0) - negativeLevels;
        
        const hpPenalty = negativeLevels * 5;
        effects.hpMaxAdjust = (effects.hpMaxAdjust || 0) - hpPenalty;
        
        // Update HP directly
        const hpTarget = this.mb.parseBindTarget('hp', this.filePath);
        let currentHP = this.mb.getMetadata(hpTarget) || 0;
        currentHP -= hpPenalty;
        this.mb.setMetadata(hpTarget, currentHP);
        
        conditionNotes.push(`- Negative Levels (${negativeLevels}): -${negativeLevels} penalty on all d20 rolls, -${hpPenalty} HP, and -1 to effective level per negative level`);
        effects.levelAdjust = negativeLevels;
    }

    /**
     * Main calculation method
     * @param {any} boundData - Bound data from form
     * @returns {ConditionEffects} Calculated effects
     */
    calculateConditionEffects(/** @type {any} */ boundData) {
        // Initialize arrays or use empty arrays
        const conditions = boundData.conditions || [];
        const buffs = boundData.buffs || [];
        const negativeLevels = boundData.negativeLevels || 0;
        const bofChoice = boundData.bofChoice || '';

        // Create a new effects object with default values
        const effects = this.createDefaultEffects();

        // Separate notes arrays
        /** @type {string[]} */
        const conditionNotes = [];
        /** @type {string[]} */
        const buffNotes = [];

        // Process conditions using O(1) lookups
        conditions.forEach((/** @type {string} */ condition) => {
            const handler = (/** @type {any} */ (this.conditionEffectsMap))[condition];
            if (handler) {
                handler(effects, conditionNotes);
            }
        });

        // Process buffs using O(1) lookups  
        buffs.forEach((/** @type {string} */ buff) => {
            const handler = (/** @type {any} */ (this.buffEffectsMap))[buff];
            if (handler) {
                handler(effects, buffNotes, buffs, bofChoice);
            }
        });

        // Process negative levels
        this.processNegativeLevels(effects, conditionNotes, negativeLevels);

        // Convert notes to strings
        effects.conditionNotes = conditionNotes.join("\n");
        effects.buffNotes = buffNotes.join("\n");

        return effects;
    }
}