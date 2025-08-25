---
cssclasses:
  - hide-title
castingClass: skald
castingStat: cha
casterLevel: 2
castingStatBonus: 5
spellLevelSettings:
  level1:
    selectedMetamagic: Still Spell (+1 level)
    activeMetamagics:
      - Still Spell (+1 level)
    totalRemaining: 3
  level2:
    selectedMetamagic: Extend Spell (+1 level)
    activeMetamagics: []
    spellSlots: 1
    totalRemaining: 1
  level3:
    selectedMetamagic: ""
    activeMetamagics: []
    totalPrepared: 1
    totalRemaining: 1
  level4:
    selectedMetamagic: ""
    activeMetamagics: []
    totalRemaining: 1
  level5:
    selectedMetamagic: ""
    activeMetamagics: []
    totalRemaining: 1
  level0:
    totalRemaining:
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
    name: Read Magic
    baseLevel: 0
    known: false
    range: Personal
    castingTime: 1 std
    components: V, S, F
    saveType: none
    sr: false
  - id: 2
    name: Detect Evil
    baseLevel: 0
    known: false
    range: 60 ft
    castingTime: 1 std
    components: V, S, DF
    saveType: none
    sr: false
  - id: 3
    name: Misdirection
    baseLevel: 2
    known: false
    range: Close
    castingTime: 1 std
    components: V, S
    saveType: Will
    sr: false
  - id: 4
    name: Detect Magic
    baseLevel: 0
    known: true
    range: 60 ft
    castingTime: 1 std
    components: V, S
    saveType: none
    sr: false
  - id: 5
    name: Mage Hand
    baseLevel: 0
    known: true
    range: Close
    castingTime: 1 std
    components: V, S
    saveType: none
    sr: false
  - id: 6
    name: Prestidigitation
    baseLevel: 0
    known: true
    range: 10 ft
    castingTime: 1 std
    components: V, S
    saveType: none
    sr: false
  - id: 7
    name: Summon Instrument
    baseLevel: 0
    known: true
    range: Personal
    castingTime: 1 round
    components: V, S
    saveType: none
    sr: false
  - id: 8
    name: Light
    baseLevel: 0
    known: true
    range: Touch
    castingTime: 1 std
    components: V, M/DF
    saveType: none
    sr: false
  - id: 9
    name: Silent Image
    baseLevel: 1
    known: true
    range: Long
    castingTime: 1 std
    components: V, S, F
    saveType: Will
    sr: false
  - id: 10
    name: Unseen Servant
    baseLevel: 1
    known: true
    range: Close
    castingTime: 1 std
    components: V, S, M
    saveType: none
    sr: false
  - id: 11
    name: Darting Duplicate
    baseLevel: 1
    known: true
    range: 5 ft
    castingTime: 1 swift
    components: V, S
    saveType: Will
    sr: true
  - id: 12
    name: Saving Finale
    baseLevel: 1
    known: true
    range: Close
    castingTime: 1 immediate
    components: V, S
    saveType: Will
    sr: true
  - id: PFRPGC_436
    originalId: PFRPGC_436
    name: Remove Fear
    baseLevel: 1
    classes: []
    known: true
    range: close
    castingTime: 1 std
    components: V, S
    saveType: Will negates (harmless)
    sr: yes (harmless)
    duration: 10 minutes; see text
    school: abjuration
    source: PFRPG Core
  - id: APG_240_L0_bardmesmerist
    originalId: APG_240
    name: Unwitting Ally
    baseLevel: 0
    classes:
      - bard
      - mesmerist
    known: true
    range: close
    castingTime: 1 std
    components: V, S
    saveType: Will negates
    sr: yes
    duration: 1 round
    school: enchantment
    source: APG
selectedMetamagic: ""
calloutStates:
  Level 1: false
  Level 2: false
  Level_1_known: false
  Level_2_known: false
  Spontaneous_Metamagic: false
  SpellLike_Abilities: false
  Level_0_known: false
testProp: test-value
spellPreparations:
  level0: []
  level1: []
  level2: []
  level3: []
  level4: []
  level5: []
  level6: []
  level7: []
  level8: []
  level9: []
  sla:
    - spellId: 2
      spellName: Detect Evil
      casts: 0
      castsRemaining: 0
    - spellId: 1
      spellName: Read Magic
      casts: 0
      castsRemaining: 0
    - spellId: 3
      spellName: Misdirection
      casts: 1
      castsRemaining: 1
xp: 0
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
const castingStatTargetExternalName = `AdarinMiniSheetConfig#${castingStat}Mod`;
const castingStatTargetExternal = mb.parseBindTarget(castingStatTargetExternalName, myMiniSheetNote.path);
const castingStatBonus = mb.getMetadata(castingStatTargetExternal) || 0;
const castingStatTargetInternal = mb.parseBindTarget("castingStatBonus", currentFile.path);

mb.setMetadata(castingStatTargetInternal, castingStatBonus); %%

return;
```
~~~datacorejsx
const { SpellDatabase } = await dc.require("MiniSheet/z_Components/scripts/spelldatabase/SpellGenerator.jsx");

return <SpellDatabase />;
~~~