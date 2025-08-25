---
castingClass: sorcerer
castingStat: cha
casterLevel: 5
castingStatBonus: 5
spellLevelSettings:
  level1:
    selectedMetamagic: Still Spell (+1 level)
    activeMetamagics:
      - Still Spell (+1 level)
    totalRemaining: 2
  level2:
    selectedMetamagic: Extend Spell (+1 level)
    activeMetamagics: []
    spellSlots: 1
    totalRemaining: 1
  level3:
    selectedMetamagic: ""
    activeMetamagics: []
    totalPrepared: 1
    totalRemaining: 2
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
  selectedGlobalMetamagic: Silent Spell (+1 level)
  globalActiveMetamagics: []
spells:
  - id: 1
    name: Detect Evil
    baseLevel: 0
    known: false
  - id: 2
    name: Read Magic
    baseLevel: 0
    known: false
  - id: 3
    name: Mage Armor
    baseLevel: 1
    known: true
  - id: 4
    name: Magic Missile
    baseLevel: 1
    known: true
  - id: 5
    name: Shield
    baseLevel: 1
    known: true
  - id: 6
    name: Silent Image
    baseLevel: 1
    known: true
  - id: 7
    name: Grease
    baseLevel: 1
    known: true
  - id: 8
    name: Enlarge Person
    baseLevel: 1
    known: true
  - id: 9
    name: Mirror Image
    baseLevel: 2
    known: true
  - id: 10
    name: Misdirection
    baseLevel: 2
    known: false
  - id: 11
    name: Scorching Ray
    baseLevel: 2
    known: true
  - id: 12
    name: Invisibility
    baseLevel: 2
    known: true
  - id: 13
    name: Glitterdust
    baseLevel: 2
    known: true
  - id: 14
    name: Web
    baseLevel: 2
    known: true
  - id: 15
    name: Acid Arrow
    baseLevel: 2
    known: true
  - id: 16
    name: Fireball
    baseLevel: 3
    known: true
  - id: 17
    name: Haste
    baseLevel: 3
    known: true
  - id: 18
    name: Dispel Magic
    baseLevel: 3
    known: false
  - id: 19
    name: Fly
    baseLevel: 3
    known: true
  - id: 20
    name: Stinking Cloud
    baseLevel: 3
    known: true
  - id: 21
    name: Slow
    baseLevel: 3
    known: true
  - id: 22
    name: Dimension Door
    baseLevel: 4
    known: true
  - id: 23
    name: Black Tentacles
    baseLevel: 4
    known: false
  - id: 24
    name: Greater Invisibility
    baseLevel: 4
    known: false
  - id: 25
    name: Stoneskin
    baseLevel: 4
    known: false
  - id: 26
    name: Phantasmal Killer
    baseLevel: 4
    known: false
  - id: 27
    name: Wall of Fire
    baseLevel: 4
    known: false
  - id: 28
    name: Teleport
    baseLevel: 5
    known: false
  - id: 29
    name: Wall of Force
    baseLevel: 5
    known: false
  - id: 30
    name: Cone of Cold
    baseLevel: 5
    known: false
  - id: 31
    name: Dominate Person
    baseLevel: 5
    known: false
  - id: 32
    name: Feeblemind
    baseLevel: 5
    known: false
  - id: 33
    name: Mage's Private Sanctum
    baseLevel: 5
    known: false
selectedMetamagic: ""
spellPreparations:
  level0: []
  level1:
    - spellId: 4
      adjustedLevel: 1
      metamagic: []
      count: 1
  level2:
    - spellId: 3
      adjustedLevel: 2
      metamagic:
        - Still Spell (+1 level)
      count: 1
    - spellId: 9
      adjustedLevel: 2
      metamagic: []
      count: 2
  level3: []
  level4: []
  level5: []
  level6: []
  level7: []
  level8: []
  level9: []
  sla:
    - spellId: 1
      spellName: Detect Evil
      casts: 0
      castsRemaining: 0
    - spellId: 2
      spellName: Read Magic
      casts: 0
      castsRemaining: 0
    - spellId: 10
      spellName: Misdirection
      casts: 1
      castsRemaining: 1
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