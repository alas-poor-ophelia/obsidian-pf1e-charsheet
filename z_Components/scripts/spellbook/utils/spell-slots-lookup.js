import '../types/types.js';

/**
 * @typedef {import('../types/types.js').CasterInfo} CasterInfo
 * @typedef {import('../types/types.js').SpellProgressionSummary} SpellProgressionSummary
 */

class SpellSlotsLookup {
  constructor() {
    /** @type {Record<string, (number|null)[][]>} */
    this.spellTables;
    /** @type {Record<number, number[]>} */
    this.bonusSpellsTable;
    /** @type {Record<string, string>} */
    this.classAliases;
    /** @type {Record<string, CasterInfo>} */
    this.casterTypes;
    // Spell progression tables for each caster class
    // Format: [level0, level1, level2, level3, level4, level5, level6, level7, level8, level9]
    // null means the spell level is not available at that class level

    this.spellTables = {
      // Full Casters (9th level spells)
      wizard: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 2, 1, null, null, null, null, null, null, null],    // Level 3
        [4, 3, 2, null, null, null, null, null, null, null],    // Level 4
        [4, 3, 2, 1, null, null, null, null, null, null],       // Level 5
        [4, 3, 3, 2, null, null, null, null, null, null],       // Level 6
        [4, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
        [4, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
        [4, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
        [4, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
        [4, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
        [4, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
        [4, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
        [4, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
        [4, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
        [4, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
        [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
        [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
        [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
      ],

      cleric: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 2, 1, null, null, null, null, null, null, null],    // Level 3
        [4, 3, 2, null, null, null, null, null, null, null],    // Level 4
        [4, 3, 2, 1, null, null, null, null, null, null],       // Level 5
        [4, 3, 3, 2, null, null, null, null, null, null],       // Level 6
        [4, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
        [4, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
        [4, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
        [4, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
        [4, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
        [4, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
        [4, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
        [4, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
        [4, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
        [4, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
        [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
        [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
        [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
      ],

      druid: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 2, 1, null, null, null, null, null, null, null],    // Level 3
        [4, 3, 2, null, null, null, null, null, null, null],    // Level 4
        [4, 3, 2, 1, null, null, null, null, null, null],       // Level 5
        [4, 3, 3, 2, null, null, null, null, null, null],       // Level 6
        [4, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
        [4, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
        [4, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
        [4, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
        [4, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
        [4, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
        [4, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
        [4, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
        [4, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
        [4, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
        [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
        [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
        [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
      ],

      witch: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 2, 1, null, null, null, null, null, null, null],    // Level 3
        [4, 3, 2, null, null, null, null, null, null, null],    // Level 4
        [4, 3, 2, 1, null, null, null, null, null, null],       // Level 5
        [4, 3, 3, 2, null, null, null, null, null, null],       // Level 6
        [4, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
        [4, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
        [4, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
        [4, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
        [4, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
        [4, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
        [4, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
        [4, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
        [4, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
        [4, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
        [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
        [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
        [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
      ],

      sorcerer: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 2, 1, null, null, null, null, null, null, null],    // Level 3
        [4, 3, 2, null, null, null, null, null, null, null],    // Level 4
        [4, 3, 2, 1, null, null, null, null, null, null],       // Level 5
        [4, 3, 3, 2, null, null, null, null, null, null],       // Level 6
        [4, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
        [4, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
        [4, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
        [4, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
        [4, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
        [4, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
        [4, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
        [4, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
        [4, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
        [4, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
        [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
        [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
        [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
      ],

      oracle: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 2, 1, null, null, null, null, null, null, null],    // Level 3
        [4, 3, 2, null, null, null, null, null, null, null],    // Level 4
        [4, 3, 2, 1, null, null, null, null, null, null],       // Level 5
        [4, 3, 3, 2, null, null, null, null, null, null],       // Level 6
        [4, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
        [4, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
        [4, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
        [4, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
        [4, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
        [4, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
        [4, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
        [4, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
        [4, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
        [4, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
        [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
        [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
        [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
      ],

      arcanist: [
        [4, 2, null, null, null, null, null, null, null, null],     // Level 1
        [5, 2, null, null, null, null, null, null, null, null],     // Level 2
        [5, 3, null, null, null, null, null, null, null, null],     // Level 3
        [6, 3, 1, null, null, null, null, null, null, null],        // Level 4
        [6, 4, 2, null, null, null, null, null, null, null],        // Level 5
        [7, 4, 2, 1, null, null, null, null, null, null],           // Level 6
        [7, 5, 3, 2, null, null, null, null, null, null],           // Level 7
        [8, 5, 3, 2, 1, null, null, null, null, null],              // Level 8
        [8, 5, 4, 3, 2, null, null, null, null, null],              // Level 9
        [9, 5, 4, 3, 2, 1, null, null, null, null],                 // Level 10
        [9, 5, 5, 4, 3, 2, null, null, null, null],                 // Level 11
        [9, 5, 5, 4, 3, 2, 1, null, null, null],                    // Level 12
        [9, 5, 5, 4, 4, 3, 2, null, null, null],                    // Level 13
        [9, 5, 5, 4, 4, 3, 2, 1, null, null],                       // Level 14
        [9, 5, 5, 4, 4, 4, 3, 2, null, null],                       // Level 15
        [9, 5, 5, 4, 4, 4, 3, 2, 1, null],                          // Level 16
        [9, 5, 5, 4, 4, 4, 3, 3, 2, null],                          // Level 17
        [9, 5, 5, 4, 4, 4, 3, 3, 2, 1],                             // Level 18
        [9, 5, 5, 4, 4, 4, 3, 3, 3, 2],                             // Level 19
        [9, 5, 5, 4, 4, 4, 3, 3, 3, 3]                              // Level 20
      ],

      summoner: [
        [3, 1, null, null, null, null, null, null, null, null], // Level 1
        [4, 2, null, null, null, null, null, null, null, null], // Level 2
        [4, 3, null, null, null, null, null, null, null, null], // Level 3
        [4, 3, 1, null, null, null, null, null, null, null],    // Level 4
        [4, 4, 2, null, null, null, null, null, null, null],    // Level 5
        [5, 4, 3, null, null, null, null, null, null, null],    // Level 6
        [5, 5, 3, 1, null, null, null, null, null, null],       // Level 7
        [6, 5, 4, 2, null, null, null, null, null, null],       // Level 8
        [6, 6, 4, 3, null, null, null, null, null, null],       // Level 9
        [6, 6, 5, 3, 1, null, null, null, null, null],          // Level 10
        [6, 6, 6, 4, 2, null, null, null, null, null],          // Level 11
        [6, 6, 6, 4, 3, null, null, null, null, null],          // Level 12
        [6, 6, 6, 5, 3, 1, null, null, null, null],             // Level 13
        [6, 6, 6, 6, 4, 2, null, null, null, null],             // Level 14
        [6, 6, 6, 6, 4, 3, null, null, null, null],             // Level 15
        [6, 6, 6, 6, 5, 3, 1, null, null, null],                // Level 16
        [6, 6, 6, 6, 6, 4, 2, null, null, null],                // Level 17
        [6, 6, 6, 6, 6, 4, 3, null, null, null],                // Level 18
        [6, 6, 6, 6, 6, 5, 3, 1, null, null],                   // Level 19
        [6, 6, 6, 6, 6, 6, 4, 2, null, null]                    // Level 20
      ],

      bard: [
        [null, 1, null, null, null, null, null, null, null, null], // Level 1
        [null, 2, null, null, null, null, null, null, null, null], // Level 2
        [null, 3, null, null, null, null, null, null, null, null], // Level 3
        [null, 3, 1, null, null, null, null, null, null, null],    // Level 4
        [null, 4, 2, null, null, null, null, null, null, null],    // Level 5
        [null, 4, 3, null, null, null, null, null, null, null],    // Level 6
        [null, 4, 3, 1, null, null, null, null, null, null],       // Level 7
        [null, 4, 4, 2, null, null, null, null, null, null],       // Level 8
        [null, 5, 4, 3, null, null, null, null, null, null],       // Level 9
        [null, 5, 4, 3, 1, null, null, null, null, null],          // Level 10
        [null, 5, 5, 4, 2, null, null, null, null, null],          // Level 11
        [null, 6, 5, 4, 3, null, null, null, null, null],          // Level 12
        [null, 6, 5, 4, 3, 1, null, null, null, null],             // Level 13
        [null, 6, 6, 5, 4, 2, null, null, null, null],             // Level 14
        [null, 6, 6, 5, 4, 3, null, null, null, null],             // Level 15
        [null, 6, 6, 5, 4, 3, 1, null, null, null],                // Level 16
        [null, 6, 6, 6, 5, 4, 2, null, null, null],                // Level 17
        [null, 6, 6, 6, 5, 4, 3, null, null, null],                // Level 18
        [null, 6, 6, 6, 5, 5, 4, null, null, null],                // Level 19
        [null, 6, 6, 6, 6, 5, 5, null, null, null]                 // Level 20
      ],
	  
	  skald: [
        [null, 1, null, null, null, null, null, null, null, null], // Level 1
        [null, 2, null, null, null, null, null, null, null, null], // Level 2
        [null, 3, null, null, null, null, null, null, null, null], // Level 3
        [null, 3, 1, null, null, null, null, null, null, null],    // Level 4
        [null, 4, 2, null, null, null, null, null, null, null],    // Level 5
        [null, 4, 3, null, null, null, null, null, null, null],    // Level 6
        [null, 4, 3, 1, null, null, null, null, null, null],       // Level 7
        [null, 4, 4, 2, null, null, null, null, null, null],       // Level 8
        [null, 5, 4, 3, null, null, null, null, null, null],       // Level 9
        [null, 5, 4, 3, 1, null, null, null, null, null],          // Level 10
        [null, 5, 5, 4, 2, null, null, null, null, null],          // Level 11
        [null, 6, 5, 4, 3, null, null, null, null, null],          // Level 12
        [null, 6, 5, 4, 3, 1, null, null, null, null],             // Level 13
        [null, 6, 6, 5, 4, 2, null, null, null, null],             // Level 14
        [null, 6, 6, 5, 4, 3, null, null, null, null],             // Level 15
        [null, 6, 6, 5, 4, 3, 1, null, null, null],                // Level 16
        [null, 6, 6, 6, 5, 4, 2, null, null, null],                // Level 17
        [null, 6, 6, 6, 5, 4, 3, null, null, null],                // Level 18
        [null, 6, 6, 6, 5, 5, 4, null, null, null],                // Level 19
        [null, 6, 6, 6, 6, 5, 5, null, null, null]                 // Level 20
      ],

      // Half Casters (4th level spells max)
      paladin: [
        [null, null, null, null, null], // Level 1
        [null, null, null, null, null], // Level 2
        [null, null, null, null, null], // Level 3
        [null, 1, null, null, null],    // Level 4
        [null, 1, null, null, null],    // Level 5
        [null, 1, null, null, null],    // Level 6
        [null, 1, 1, null, null],       // Level 7
        [null, 1, 1, null, null],       // Level 8
        [null, 2, 1, null, null],       // Level 9
        [null, 2, 1, 1, null],          // Level 10
        [null, 2, 1, 1, null],          // Level 11
        [null, 2, 2, 1, null],          // Level 12
        [null, 3, 2, 1, 1],             // Level 13
        [null, 3, 2, 1, 1],             // Level 14
        [null, 3, 2, 2, 1],             // Level 15
        [null, 3, 3, 2, 1],             // Level 16
        [null, 4, 3, 2, 1],             // Level 17
        [null, 4, 3, 2, 2],             // Level 18
        [null, 4, 3, 3, 2],             // Level 19
        [null, 4, 4, 3, 3]              // Level 20
      ],

      ranger: [
        [null, null, null, null, null], // Level 1
        [null, null, null, null, null], // Level 2
        [null, null, null, null, null], // Level 3
        [null, 1, null, null, null],    // Level 4
        [null, 1, null, null, null],    // Level 5
        [null, 1, null, null, null],    // Level 6
        [null, 1, 1, null, null],       // Level 7
        [null, 1, 1, null, null],       // Level 8
        [null, 2, 1, null, null],       // Level 9
        [null, 2, 1, 1, null],          // Level 10
        [null, 2, 1, 1, null],          // Level 11
        [null, 2, 2, 1, null],          // Level 12
        [null, 3, 2, 1, 1],             // Level 13
        [null, 3, 2, 1, 1],             // Level 14
        [null, 3, 2, 2, 1],             // Level 15
        [null, 3, 3, 2, 1],             // Level 16
        [null, 4, 3, 2, 1],             // Level 17
        [null, 4, 3, 2, 2],             // Level 18
        [null, 4, 3, 3, 2],             // Level 19
        [null, 4, 4, 3, 3]              // Level 20
      ],

      // Prepared Arcane 6th level caster
      magus: [
        [null, 1, null, null, null, null, null], // Level 1
        [null, 2, null, null, null, null, null], // Level 2
        [null, 3, null, null, null, null, null], // Level 3
        [null, 3, 1, null, null, null, null],    // Level 4
        [null, 4, 2, null, null, null, null],    // Level 5
        [null, 4, 3, null, null, null, null],    // Level 6
        [null, 4, 3, 1, null, null, null],       // Level 7
        [null, 4, 4, 2, null, null, null],       // Level 8
        [null, 5, 4, 3, null, null, null],       // Level 9
        [null, 5, 4, 3, 1, null, null],          // Level 10
        [null, 5, 5, 4, 2, null, null],          // Level 11
        [null, 6, 5, 4, 3, null, null],          // Level 12
        [null, 6, 5, 4, 3, 1, null],             // Level 13
        [null, 6, 6, 5, 4, 2, null],             // Level 14
        [null, 6, 6, 5, 4, 3, null],             // Level 15
        [null, 6, 6, 5, 4, 3, 1],                // Level 16
        [null, 6, 6, 6, 5, 4, 2],                // Level 17
        [null, 6, 6, 6, 5, 4, 3],                // Level 18
        [null, 6, 6, 6, 5, 5, 4],                // Level 19
        [null, 6, 6, 6, 6, 5, 5]                 // Level 20
      ]
    };

    this.bonusSpellsTable = {
      // statModifier: [level1, level2, level3, level4, level5, level6, level7, level8, level9]
      // (no bonus spells for level 0 cantrips)
      0: [0, 0, 0, 0, 0, 0, 0, 0, 0],    // +0 mod (10-11 ability score)
      1: [1, 0, 0, 0, 0, 0, 0, 0, 0],    // +1 mod (12-13 ability score)
      2: [1, 1, 0, 0, 0, 0, 0, 0, 0],    // +2 mod (14-15 ability score)
      3: [1, 1, 1, 0, 0, 0, 0, 0, 0],    // +3 mod (16-17 ability score)
      4: [1, 1, 1, 1, 0, 0, 0, 0, 0],    // +4 mod (18-19 ability score)
      5: [2, 1, 1, 1, 1, 0, 0, 0, 0],    // +5 mod (20-21 ability score)
      6: [2, 2, 1, 1, 1, 1, 0, 0, 0],    // +6 mod (22-23 ability score)
      7: [2, 2, 2, 1, 1, 1, 1, 0, 0],    // +7 mod (24-25 ability score)
      8: [2, 2, 2, 2, 1, 1, 1, 1, 0],    // +8 mod (26-27 ability score)
      9: [3, 2, 2, 2, 2, 1, 1, 1, 1],    // +9 mod (28-29 ability score)
      10: [3, 3, 2, 2, 2, 2, 1, 1, 1],   // +10 mod (30-31 ability score)
      11: [3, 3, 3, 2, 2, 2, 2, 1, 1],   // +11 mod (32-33 ability score)
      12: [3, 3, 3, 3, 2, 2, 2, 2, 1],   // +12 mod (34-35 ability score)
      13: [4, 3, 3, 3, 3, 2, 2, 2, 2],   // +13 mod (36-37 ability score)
      14: [4, 4, 3, 3, 3, 3, 2, 2, 2],   // +14 mod (38-39 ability score)
      15: [4, 4, 4, 3, 3, 3, 3, 2, 2],   // +15 mod (40-41 ability score)
      16: [4, 4, 4, 4, 3, 3, 3, 3, 2],   // +16 mod (42-43 ability score)
      17: [5, 4, 4, 4, 4, 3, 3, 3, 3]    // +17 mod (44-45 ability score)
      // Continue pattern for higher modifiers as needed
    };

    // Supported class aliases for convenience
    this.classAliases = {
      'wiz': 'wizard',
      'sorc': 'sorcerer',
      'cler': 'cleric',
      'clr': 'cleric',
      'brd': 'bard',
      'pal': 'paladin',
      'rng': 'ranger',
      'rgr': 'ranger',
      'drd': 'druid',
      'orc': 'oracle',
      'arc': 'arcanist',
      'sum': 'summoner',
      'smn': 'summoner',
      'mag': 'magus'
    };

    // Caster type definitions matching your CasterType constants
    this.casterTypes = {
      // Full Casters (9th level spells)
      wizard: { type: 'prepared', maxSpellLevel: 9, usesSpellbook: true },
      cleric: { type: 'prepared', maxSpellLevel: 9, usesSpellbook: false, domainSlots: true },
      druid: { type: 'prepared', maxSpellLevel: 9, usesSpellbook: false },
      witch: { type: 'prepared', maxSpellLevel: 9, usesSpellbook: true, usesPatrons: true },
      sorcerer: { type: 'spontaneous', maxSpellLevel: 9, usesSpellbook: false },
      oracle: { type: 'spontaneous', maxSpellLevel: 9, usesSpellbook: false },
      arcanist: { type: 'hybrid', maxSpellLevel: 9, usesSpellbook: true },
      summoner: { type: 'spontaneous', maxSpellLevel: 6, usesSpellbook: false, unique: true },
      
      // 6th Level Casters
      bard: { type: 'spontaneous', maxSpellLevel: 6, usesSpellbook: false },
      magus: { type: 'prepared', maxSpellLevel: 6, usesSpellbook: true },
      
      // Half Casters (4th level spells)
      paladin: { type: 'prepared', maxSpellLevel: 4, usesSpellbook: false },
      ranger: { type: 'prepared', maxSpellLevel: 4, usesSpellbook: false }
    };
  }

  getBonusSpells(/** @type {number} */ castingStatModifier, /** @type {number} */ spellLevel) {
    // No bonus spells for cantrips
    if (spellLevel === 0) return 0;

    // No bonus if modifier is too low or negative
    if (castingStatModifier < 1) return 0;

    // Check if we have data for this modifier
    if (!this.bonusSpellsTable[castingStatModifier]) return 0;

    // Get bonus spells for this spell level (array is 0-indexed for spell levels 1-9)
    return this.bonusSpellsTable[castingStatModifier][spellLevel - 1] || 0;
  }

  /**
   * Get the number of spells per level that can be prepared for a given class and level
   * @param {string} className - The name of the class (e.g., "wizard", "cleric")
   * @param {number} classLevel - The level in that class (1-20)
   * @returns {Record<number, number>} An object with spell levels as keys and spell counts as values
   */
  getSpellsPerLevel(className, classLevel) {
    // Normalize class name
    const normalizedClass = this.normalizeClassName(className);

    // Validate inputs
    if (!(/** @type {any} */ (this.spellTables))[normalizedClass]) {
      throw new Error(`Unknown caster class: ${className}. Supported classes: ${Object.keys(this.spellTables).join(', ')}`);
    }

    if (classLevel < 1 || classLevel > 20) {
      throw new Error('Class level must be between 1 and 20');
    }

    // Get the spell progression for this class and level
    const spellProgression = this.spellTables[normalizedClass][classLevel - 1];

    // Convert array to object with spell levels as keys
    /** @type {Record<number, number>} */
    const spellsPerLevel = {};

    for (let spellLevel = 0; spellLevel < spellProgression.length; spellLevel++) {
      const spellCount = spellProgression[spellLevel];
      if (spellCount !== null) {
        spellsPerLevel[spellLevel] = spellCount;
      }
    }

    return spellsPerLevel;
  }

  /**
   * Get spell slots for a specific spell level (including bonus spells)
   * @param {string} className - The name of the class
   * @param {number} classLevel - The level in that class
   * @param {number} spellLevel - The spell level to check
   * @param {number} castingStatModifier - The casting stat modifier
   * @returns {number} Total spell slots available
   */
  getSpellSlots(className, classLevel, spellLevel, castingStatModifier = 0) {
    const spellsPerLevel = this.getSpellsPerLevel(className, classLevel);
    const baseSlots = spellsPerLevel[spellLevel] || 0;
    const bonusSlots = this.getBonusSpells(castingStatModifier, spellLevel);
    return baseSlots + bonusSlots;
  }

  /**
   * Get spell casts per day for Arcanist (different from spell slots)
   * Arcanists get fewer casts but can use them flexibly across prepared spells
   * @param {string} className - The name of the class
   * @param {number} classLevel - The level in that class
   * @param {number} spellLevel - The spell level to check
   * @param {number} castingStatModifier - The casting stat modifier
   * @returns {number} Total spell casts available per day
   */
  getArcanistCasts(className, classLevel, spellLevel, castingStatModifier = 0) {
    const normalizedClass = this.normalizeClassName(className);
    
    // Only Arcanist uses this method
    if (normalizedClass !== 'arcanist') {
      return this.getSpellSlots(className, classLevel, spellLevel, castingStatModifier);
    }

    // Arcanist spell casts per day (reduced from normal spell slots)
    const arcanistCastsTable = [
      [null, 1, null, null, null, null, null, null, null, null], // Level 1
      [null, 2, null, null, null, null, null, null, null, null], // Level 2
      [null, 2, 1, null, null, null, null, null, null, null],    // Level 3
      [null, 3, 2, null, null, null, null, null, null, null],    // Level 4
      [null, 3, 2, 1, null, null, null, null, null, null],       // Level 5
      [null, 3, 3, 2, null, null, null, null, null, null],       // Level 6
      [null, 4, 3, 2, 1, null, null, null, null, null],          // Level 7
      [null, 4, 3, 3, 2, null, null, null, null, null],          // Level 8
      [null, 4, 4, 3, 2, 1, null, null, null, null],             // Level 9
      [null, 4, 4, 3, 3, 2, null, null, null, null],             // Level 10
      [null, 4, 4, 4, 3, 2, 1, null, null, null],                // Level 11
      [null, 4, 4, 4, 3, 3, 2, null, null, null],                // Level 12
      [null, 4, 4, 4, 4, 3, 2, 1, null, null],                   // Level 13
      [null, 4, 4, 4, 4, 3, 3, 2, null, null],                   // Level 14
      [null, 4, 4, 4, 4, 4, 3, 2, 1, null],                      // Level 15
      [null, 4, 4, 4, 4, 4, 3, 3, 2, null],                      // Level 16
      [null, 4, 4, 4, 4, 4, 4, 3, 2, 1],                         // Level 17
      [null, 4, 4, 4, 4, 4, 4, 3, 3, 2],                         // Level 18
      [null, 4, 4, 4, 4, 4, 4, 4, 3, 3],                         // Level 19
      [null, 4, 4, 4, 4, 4, 4, 4, 4, 4]                          // Level 20
    ];

    if (classLevel < 1 || classLevel > 20) {
      throw new Error('Class level must be between 1 and 20');
    }

    const castsProgression = arcanistCastsTable[classLevel - 1];
    const baseCasts = castsProgression[spellLevel] || 0;
    const bonusCasts = this.getBonusSpells(castingStatModifier, spellLevel);
    
    return baseCasts + bonusCasts;
  }

  /**
   * Get caster information for a class
   * @param {string} className - The name of the class
   * @returns {CasterInfo | null} Object containing caster type information
   */
  getCasterInfo(className) {
    const normalizedClass = this.normalizeClassName(className);
    return this.casterTypes[normalizedClass] || null;
  }

  /**
   * Check if a class is a prepared caster
   * @param {string} className - The name of the class
   * @returns {boolean} True if the class is a prepared caster
   */
  isPreparedCaster(className) {
    const info = this.getCasterInfo(className);
    return info ? info.type === 'prepared' : false;
  }

  /**
   * Check if a class is a spontaneous caster
   * @param {string} className - The name of the class
   * @returns {boolean} True if the class is a spontaneous caster
   */
  isSpontaneousCaster(className) {
    const info = this.getCasterInfo(className);
    return info ? info.type === 'spontaneous' : false;
  }

  /**
   * Check if a class is a hybrid caster (like Arcanist)
   * @param {string} className - The name of the class
   * @returns {boolean} True if the class is a hybrid caster
   */
  isHybridCaster(className) {
    const info = this.getCasterInfo(className);
    return info ? info.type === 'hybrid' : false;
  }

  /**
   * Get the maximum spell level a class can cast
   * @param {string} className - The name of the class
   * @returns {number} Maximum spell level (0-9)
   */
  getMaxSpellLevel(className) {
    const info = this.getCasterInfo(className);
    return info ? info.maxSpellLevel : 0;
  }

  /**
   * Check if a class uses a spellbook
   * @param {string} className - The name of the class
   * @returns {boolean} True if the class uses a spellbook
   */
  usesSpellbook(className) {
    const info = this.getCasterInfo(className);
    return info ? info.usesSpellbook : false;
  }

  /**
   * Check if a class has domain slots (like Clerics)
   * @param {string} className - The name of the class
   * @returns {boolean} True if the class has domain slots
   */
  hasDomainSlots(className) {
    const info = this.getCasterInfo(className);
    return info ? (info.domainSlots || false) : false;
  }

  /**
   * Get all spell levels available to a class at a given level
   * @param {string} className - The name of the class
   * @param {number} classLevel - The level in that class
   * @returns {number[]} Array of available spell levels
   */
  getAvailableSpellLevels(className, classLevel) {
    const spellsPerLevel = this.getSpellsPerLevel(className, classLevel);
    return Object.keys(spellsPerLevel).map(level => parseInt(level)).sort((a, b) => a - b);
  }

  /**
   * Normalize class name (handle case sensitivity and aliases)
   * @param {string} className - The class name to normalize
   * @returns {string} The normalized class name
   */
  normalizeClassName(className) {
    const lowerClassName = className.toLowerCase();
    return this.classAliases[lowerClassName] || lowerClassName;
  }

  /**
   * Get a list of all supported caster classes
   * @returns {string[]} Array of supported class names
   */
  getSupportedClasses() {
    return Object.keys(this.spellTables);
  }

  /**
   * Check if a class is a supported caster
   * @param {string} className - The class name to check
   * @returns {boolean} True if the class is supported
   */
  isValidClass(className) {
    const normalizedClass = this.normalizeClassName(className);
    return this.spellTables.hasOwnProperty(normalizedClass);
  }

  /**
   * Get spell progression summary for a class
   * @param {string} className - The name of the class
   * @param {number} classLevel - The level in that class (optional, defaults to all levels)
   * @returns {SpellProgressionSummary} Summary of spell progression
   */
  getSpellProgressionSummary(className, classLevel = 1) {
    const normalizedClass = this.normalizeClassName(className);
    
    if (!this.isValidClass(normalizedClass)) {
      throw new Error(`Unknown caster class: ${className}`);
    }

    const casterInfo = this.getCasterInfo(normalizedClass);
    if (!casterInfo) {
      throw new Error(`No caster info found for class: ${className}`);
    }
    
    /** @type {SpellProgressionSummary} */
    const summary = {
      className: normalizedClass,
      casterType: casterInfo.type,
      maxSpellLevel: casterInfo.maxSpellLevel,
      usesSpellbook: casterInfo.usesSpellbook
    };

    if (classLevel !== null) {
      summary.classLevel = classLevel;
      summary.spellsPerLevel = this.getSpellsPerLevel(normalizedClass, classLevel);
      summary.availableSpellLevels = this.getAvailableSpellLevels(normalizedClass, classLevel);
    } else {
      summary.fullProgression = this.spellTables[normalizedClass];
    }

    return summary;
  }
}

// Lazy initialization to prevent memory leak on Obsidian reload
// The singleton is created on first use rather than at module load time
/** @type {SpellSlotsLookup|null} */
let spellSlotsLookup = null;

/**
 * Get or create the singleton instance
 * @returns {SpellSlotsLookup} The spell slots lookup instance
 */
function getSpellSlotsLookupInstance() {
  if (!spellSlotsLookup) {
    spellSlotsLookup = new SpellSlotsLookup();
  }
  return spellSlotsLookup;
}

/**
 * Convenience function for quick access - matches your expected signature
 * @param {string} className - Casting class name
 * @param {number} classLevel - Class level
 * @param {number} spellLevel - Spell level
 * @param {number} castingStatModifier - Casting stat modifier
 * @returns {number} Number of spell slots
 */
function getSpellsPerLevel(className, classLevel, spellLevel, castingStatModifier = 0) {
  return getSpellSlotsLookupInstance().getSpellSlots(className, classLevel, spellLevel, castingStatModifier);
}

/**
 * Convenience function for Arcanist spell casts
 * @param {string} className - Casting class name
 * @param {number} classLevel - Class level
 * @param {number} spellLevel - Spell level
 * @param {number} castingStatModifier - Casting stat modifier
 * @returns {number} Number of spell casts
 */
function getArcanistCasts(className, classLevel, spellLevel, castingStatModifier = 0) {
  return getSpellSlotsLookupInstance().getArcanistCasts(className, classLevel, spellLevel, castingStatModifier);
}

export { SpellSlotsLookup, getSpellsPerLevel, getArcanistCasts };