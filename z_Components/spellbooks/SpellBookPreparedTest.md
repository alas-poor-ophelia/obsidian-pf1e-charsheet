---
castingClass: wizard
castingStat: int
casterLevel: 5
castingStatBonus: 5
spellLevelSettings:
  level1:
    selectedMetamagic: Silent Spell (+1 level)
    activeMetamagics: []
    totalRemaining: 3
  level2:
    selectedMetamagic: Still Spell (+1 level)
    activeMetamagics: []
    spellSlots: 1
    totalRemaining: 3
  level3:
    selectedMetamagic: ""
    activeMetamagics: []
    totalPrepared: 1
    totalRemaining: 
  level4:
    selectedMetamagic: ""
    activeMetamagics: []
    totalRemaining: 1
  level5:
    selectedMetamagic: ""
    activeMetamagics: []
    totalRemaining: 
  level0:
    totalRemaining: 4
  level6:
    totalRemaining: 
  level7:
    totalRemaining: 
  level8:
    totalRemaining: 
  level9:
    totalRemaining: 
spells:
  - id: 1
    name: Mage Armor
    baseLevel: 1
    known: true
  - id: 2
    name: Magic Missile
    baseLevel: 1
    known: true
    prepared: true
    preparations:
      - adjustedLevel: 2
        metamagic:
          - Silent Spell (+1 level)
        count: 1
      - adjustedLevel: 1
        metamagic: []
        count: 3
  - id: 3
    name: Shield
    baseLevel: 1
    known: true
  - id: 4
    name: Silent Image
    baseLevel: 1
    known: true
    prepared: true
    preparations:
      - adjustedLevel: 1
        metamagic: []
        count: 1
  - id: 5
    name: Grease
    baseLevel: 1
    known: true
    prepared: true
    preparations:
      - adjustedLevel: 1
        metamagic: []
        count: 1
  - id: 6
    name: Enlarge Person
    baseLevel: 1
    known: true
    prepared: true
    preparations:
      - adjustedLevel: 1
        metamagic: []
        count: 1
  - id: 7
    name: Mirror Image
    baseLevel: 2
    known: true
  - id: 8
    name: Scorching Ray
    baseLevel: 2
    known: true
  - id: 9
    name: Invisibility
    baseLevel: 2
    known: true
  - id: 10
    name: Glitterdust
    baseLevel: 2
    known: true
  - id: 11
    name: Web
    baseLevel: 2
    known: true
  - id: 12
    name: Acid Arrow
    baseLevel: 2
    known: true
  - id: 13
    name: Fireball
    baseLevel: 3
    known: true
  - id: 14
    name: Haste
    baseLevel: 3
    known: true
  - id: 15
    name: Dispel Magic
    baseLevel: 3
    known: false
  - id: 16
    name: Fly
    baseLevel: 3
    known: true
  - id: 17
    name: Stinking Cloud
    baseLevel: 3
    known: true
  - id: 18
    name: Slow
    baseLevel: 3
    known: true
  - id: 19
    name: Dimension Door
    baseLevel: 4
    known: true
  - id: 20
    name: Black Tentacles
    baseLevel: 4
    known: false
  - id: 21
    name: Greater Invisibility
    baseLevel: 4
    known: false
  - id: 22
    name: Stoneskin
    baseLevel: 4
    known: false
  - id: 23
    name: Phantasmal Killer
    baseLevel: 4
    known: false
  - id: 24
    name: Wall of Fire
    baseLevel: 4
    known: false
  - id: 25
    name: Teleport
    baseLevel: 5
    known: false
  - id: 26
    name: Wall of Force
    baseLevel: 5
    known: false
  - id: 27
    name: Cone of Cold
    baseLevel: 5
    known: false
  - id: 28
    name: Dominate Person
    baseLevel: 5
    known: false
  - id: 29
    name: Feeblemind
    baseLevel: 5
    known: false
  - id: 30
    name: Mage's Private Sanctum
    baseLevel: 5
    known: false
selectedMetamagic: ""
spellPreparations:
  level0: []
  level1: []
  level2: []
  level3:
    - spellId: 9
      adjustedLevel: 3
      metamagic:
        - Extend Spell (+1 level)
      count: 1
    - spellId: 10
      adjustedLevel: 3
      metamagic:
        - Extend Spell (+1 level)
      count: 1
    - spellId: 7
      adjustedLevel: 3
      metamagic:
        - Extend Spell (+1 level)
      count: 2
    - spellId: 7
      adjustedLevel: 3
      metamagic:
        - Still Spell (+1 level)
      count: 1
  level4: []
  level5: []
  level6: []
  level7: []
  level8: []
  level9: []
  sla: []
testProp: test-value
testSimple: simple-test-value
testCastingClass: sorcerer
testCasterLevel: 5
testMalformedSpells:
  - 
  - 
  - name: Incomplete Spell
  - name: Bad Level Spell
    baseLevel: not-a-number
  - name: Bad Prep Spell
    preparations: not-an-array
  - {}
  - not-an-object
calloutStates:
  Level_1_prepared: false
  Metamagic_level2: false
  Metamagic_level1: false
  Level_2_prepared: false
---
```meta-bind-js-view
{castingClass} as castingClass
{castingStat} as castingStat
hidden
---
// Get the Meta Bind API
const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
if (!mb) return;

const castingClass = context.bound.castingClass || "";
const castingStat = context.bound.castingStat || "";

const myMiniSheetNote = app.vault.getAbstractFileByPath('MiniSheet/Adarin/Adarin Mini Sheet.md');
const currentFile = app.workspace.getActiveFile();

%% // Handle caster level
const casterLevelTargetExternalName = `${castingClass}Level`;
const casterLevelTargetExternal = mb.parseBindTarget(casterLevelTargetExternalName, myMiniSheetNote.path);
const casterLevel = mb.getMetadata(casterLevelTargetExternal) || 0;
const casterLevelTargetInternal = mb.parseBindTarget("casterLevel", currentFile.path);
mb.setMetadata(casterLevelTargetInternal, casterLevel);

// Handle casting stat bonus
const castingStatTargetExternalName = `memory^${castingStat}Mod`;
const castingStatTargetExternal = mb.parseBindTarget(castingStatTargetExternalName, myMiniSheetNote.path);
const castingStatBonus = mb.getMetadata(castingStatTargetExternal) || 0;
const castingStatTargetInternal = mb.parseBindTarget("castingStatBonus", currentFile.path);

mb.setMetadata(castingStatTargetInternal, castingStatBonus); %%

return;
```