---
castingClass: arcanist
castingStat: cha
casterLevel: 8
castingStatBonus: 6
spellLevelSettings:
  level1:
    selectedMetamagic: Still Spell (+1 level)
    activeMetamagics: []
    totalRemaining: 
    totalCastsRemaining: 6
  level2:
    selectedMetamagic: Extend Spell (+1 level)
    activeMetamagics: []
    spellSlots: 1
    totalRemaining: 
    totalCastsRemaining: 
  level3:
    selectedMetamagic: ""
    activeMetamagics: []
    totalPrepared: 1
    totalRemaining: 
    totalCastsRemaining: 3
  level4:
    selectedMetamagic: ""
    activeMetamagics: []
    totalRemaining: 3
    totalCastsRemaining: 3
  level5:
    selectedMetamagic: ""
    activeMetamagics: []
    totalRemaining: 1
    totalCastsRemaining: 1
  level0:
    totalRemaining: 2
    totalCastsRemaining: 
  level6:
    totalRemaining: 
    totalCastsRemaining: 
  level7:
    totalRemaining: 
    totalCastsRemaining: 
  level8:
    totalRemaining: 
    totalCastsRemaining: 
  level9:
    totalRemaining: 
    totalCastsRemaining: 
  selectedGlobalMetamagic: Still Spell (+1 level)
  globalActiveMetamagics: []
spells:
  - id: 1
    name: Mage Armor
    baseLevel: 1
    known: true
  - id: 2
    name: Magic Missile
    baseLevel: 1
    known: true
  - id: 3
    name: Shield
    baseLevel: 1
    known: true
  - id: 4
    name: Silent Image
    baseLevel: 1
    known: true
  - id: 5
    name: Grease
    baseLevel: 1
    known: true
  - id: 6
    name: Enlarge Person
    baseLevel: 1
    known: true
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
  - id: ARG_83
    name: Aboleth's Lung
    baseLevel: 2
    known: true
  - id: PFRPGC_2
    name: Acid Splash
    baseLevel: 0
    known: true
  - id: UC_4
    name: Adoration
    baseLevel: 1
    known: true
selectedMetamagic: ""
spellPreparations:
  level0:
    - spellId: PFRPGC_2
      metamagic: []
      count: 1
  level1:
    - spellId: 4
      metamagic: []
      count: 1
    - spellId: 5
      metamagic: []
      count: 1
    - spellId: UC_4
      metamagic: []
      count: 1
  level2:
    - spellId: ARG_83
      metamagic: []
      count: 1
  level3:
    - spellId: 17
      metamagic: []
      count: 1
    - spellId: 16
      metamagic: []
      count: 1
  level4: []
  level5: []
  level6: []
  level7: []
  level8: []
  level9: []
  sla: []
calloutStates:
  Level 1: false
  Level 2: false
  Metamagic: false
  Level_1_prepared: false
  Level_2_prepared: true
  Metamagic_level1: false
  Level_1_known: false
  Hybrid_Metamagic: false
  Metamagic_level0: true
  Level_0_prepared: false
  Level_3_prepared: true
  Metamagic_level2: true
loadouts:
  - name: Combat
    description: desc
    createdDate: 2025-07-11T05:26:18.196Z
    lastUsed: 2025-07-11T15:33:40.342Z
    spellPreparations:
      level0: []
      level1:
        - spellId: 1
          metamagic: []
          count: 1
        - spellId: 2
          metamagic: []
          count: 1
      level2:
        - spellId: 5
          metamagic:
            - Still Spell (+1 level)
          count: 1
      level3:
        - spellId: 1
          adjustedLevel: 3
          metamagic:
            - Extend Spell (+1 level)
            - Silent Spell (+1 level)
          count: 1
        - spellId: 16
          adjustedLevel: 3
          metamagic: []
          count: 1
      level4: []
      level5: []
      level6: []
      level7: []
      level8: []
      level9: []
      sla: []
  - name: Test 2
    description: desc
    createdDate: 2025-07-11T15:21:28.204Z
    lastUsed: 2025-07-11T15:21:28.204Z
    spellPreparations:
      level0: []
      level1: []
      level2:
        - spellId: 5
          metamagic:
            - Still Spell (+1 level)
          count: 1
      level3: []
      level4: []
      level5: []
      level6: []
      level7: []
      level8: []
      level9: []
      sla: []
  - name: My new Loadout
    description: My loadout has a description.
    createdDate: 2025-07-11T15:47:55.166Z
    lastUsed: 2025-07-11T16:04:32.251Z
    spellPreparations:
      level0: []
      level1:
        - spellId: 1
          metamagic: []
          count: 1
        - spellId: 2
          metamagic: []
          count: 1
      level2:
        - spellId: 5
          metamagic:
            - Still Spell (+1 level)
          count: 1
      level3:
        - spellId: 1
          adjustedLevel: 3
          metamagic:
            - Extend Spell (+1 level)
            - Silent Spell (+1 level)
          count: 1
        - spellId: 16
          adjustedLevel: 3
          metamagic: []
          count: 1
      level4: []
      level5: []
      level6: []
      level7: []
      level8: []
      level9: []
      sla: []
selectedLoadout: My new Loadout
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
~~~datacorejsx
const { SpellDatabase } = await dc.require("MiniSheet/z_Components/scripts/spelldatabase/SpellGenerator.jsx");

return <SpellDatabase />;
~~~