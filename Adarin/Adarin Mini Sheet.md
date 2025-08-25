---
paladinLevel: 4
skaldLevel: 3
monkunchainedLevel: 2
str: 8
dex: 22
con: 14
int: 12
wis: 8
cha: 20
sizeMod: 0
hp: 71
hpMax: 73
hpMod: 0
tmpHp: ""
hpEditable: false
showCMBCMD: true
layOnHandsCurrent: 2
layOnHandsMax: 7
lohAmount: 2
channelEnergyCurrent: 1
channelEnergyMax: 3
ceAmount: 2
smiteEvilCurrent: 2
smiteEvilMax: 2
weaponSongRoundsMax: 12
weaponSongRoundsCurrent: 2
plumeOfPanacheMax: 1
plumeofPanacheCurrent: 1
quickrunnersMax: 1
quickrunnersCurrent: 1
resistanceEnhancement: 1
meleeWeaponEnhancement: 1
rangedWeaponEnhancement: 0
naturalAC: 2
dodgeAC: 1
deflectionAC: 1
energyRes:
  cold: 5
smiteEvil: false
smiteEvilOutsider: false
charging: false
powerAttack: true
rangedAttackStyle: Shuriken
fightingDefensively: false
craneStyle: true
agileWeapon: true
flanking: false
versatilePerformance: true
flurryOfBlows: true
weaponSong: Off
weaponSongEnhancement: enhancement
panachePoints: 3
panacheMax: 5
preciseStrike: true
doublePreciseStrike: false
init: 14
initFamilarBonus: 4
initOther: 4
atkAdjust: 0
dmgAdjust: 
acAdjust: 0
initAdjust: 0
strAdjust: 
dexAdjust: 
conAdjust: 0
intAdjust: 0
wisAdjust: 0
chaAdjust: 0
dexDrain: 
dexDamage: 
strDrain: 
strDamage: 
skillAdjust: 0
skills:
  Acrobatics:
    - dex
    - 4
    - true
  Appraise:
    - int
    - 0
    - true
  Bluff:
    - cha
    - 0
    - true
  Climb:
    - str
    - 0
    - true
  Craft (any):
    - int
    - 0
    - true
  Diplomacy:
    - cha
    - 5
    - true
  Disable Device:
    - dex
    - 0
    - false
  Disguise:
    - cha
    - 0
    - true
  Escape Artist:
    - dex
    - 0
    - false
  Fly:
    - dex
    - 0
    - false
  Handle Animal:
    - cha
    - 0
    - true
  Heal:
    - wis
    - 1
    - true
  Intimidate:
    - cha
    - 7
    - true
  Knowledge (arcana):
    - int
    - 1
    - true
  Knowledge (religion):
    - int
    - 1
    - true
  Linguistics:
    - int
    - 2
    - true
  Perception:
    - wis
    - 8
    - true
  Perform (Sing):
    - cha
    - 7
    - true
  Perform (Stringed):
    - cha
    - 7
    - true
  Profession (any):
    - wis
    - 0
    - true
  Ride:
    - dex
    - 0
    - true
  Sense Motive:
    - wis
    - 0
    - true
  Sleight of Hand:
    - dex
    - 0
    - false
  Spellcraft:
    - int
    - 1
    - true
  Stealth:
    - dex
    - 1
    - true
  Survival:
    - wis
    - 0
    - false
  Swim:
    - str
    - 0
    - true
  Use Magic Device:
    - cha
    - 3
    - true
negativeLevels: 
conditions: []
buffs:
  - mage armor
  - blessing of fervor
conditionEffects:
  meleeAtkAdjust: 0
  rangedAtkAdjust: 0
  extraAttacks:
    - 0
  cmb: 0
  cmd: 0
  acAdjust: 4
  touchAcAdjust: 0
  ffAcAdjust: 4
  fortAdjust: 0
  refAdjust: 0
  willAdjust: 0
  hpMaxAdjust: 0
  strAdjust: 0
  dexAdjust: 0
  conAdjust: 0
  intAdjust: 0
  wisAdjust: 0
  chaAdjust: 0
  conSkillAdjust: 0
  intSkillAdjust: 0
  wisSkillAdjust: 0
  chaSkillAdjust: 0
  skillAdjust: 0
  levelAdjust: 0
  perceptionAdjust: 0
  strSkillAdjust: 0
  dexSkillAdjust: 0
  movementAdjust: 1
  sizeAdjust: 0
  naturalArmorAdjust: 0
  damageAdjust: 0
  reachAdjust: 0
  canAct: true
  canFullRound: true
  canStandard: true
  canMove: true
  canAttack: true
  canCast: true
  miss50: false
  helpless: false
  flatFooted: false
  loseDexToAC: false
  conditionNotes: ""
  buffNotes: |-
    - Mage Armor: +4 armor bonus to AC (does not apply to touch AC)
    - Blessing of Fervor:
    `INPUT\[inlineSelect(option(+30ft. Speed), option(Stand as Swift), option(Extra Attack), option(+2 Atk/AC/Reflex), option(Free Metamagic)):bofChoice\]`
    Current Effect: One extra attack at highest base attack bonus. Does not stack with haste.
bofChoice: Extra Attack
selectedTab: 1
cssclasses:
  - hide-title
  - hide-properties
  - keep-loaded
  - hide-sidebar-header
panacheCurrent: 5
level1SpellSlotsCurrent: 4
selectedResourceTab: 1
selectedTabResources: 1
selectedAdventuringTab: 1
---
<br>

> [!banner]
> ![[90 - Data/11 - Images/Adarin.png]]
```meta-bind-button
style: default
label: 🐇
class: sheet-swap-btn hwayoung 
action:
    type: open
    link: Hwayoung Mini Sheet
```
```meta-bind
VIEW[({strAdjust} ? {strAdjust} : 0) + ({conditionEffects.strAdjust} ? {conditionEffects.strAdjust} : 0) - ({strDrain} ? {strDrain} : 0) - ({strDamage} ? {strDamage} : 0)][math(hidden):AdarinMiniSheetConfig#strOffsets]
```
```meta-bind
VIEW[floor((({str}+{AdarinMiniSheetConfig#strOffsets}) - 10) / 2)][math(hidden):AdarinMiniSheetConfig#strMod]
```
```meta-bind
VIEW[({dexAdjust} ? {dexAdjust} : 0) + ({conditionEffects.dexAdjust} ? {conditionEffects.dexAdjust} : 0) - ({dexDrain} ? {dexDrain} : 0) - ({dexDamage} ? {dexDamage} : 0)][math(hidden):AdarinMiniSheetConfig#dexOffsets]
```
```meta-bind
VIEW[floor((({dex}+{AdarinMiniSheetConfig#dexOffsets}) - 10) / 2)][math(hidden):AdarinMiniSheetConfig#dexMod]
```
```meta-bind
VIEW[({conAdjust} ? {conAdjust} : 0) + ({conditionEffects.conAdjust} ? {conditionEffects.conAdjust} : 0) - ({conDrain} ? {conDrain} : 0) - ({conDamage} ? {conDamage} : 0)][math(hidden):AdarinMiniSheetConfig#conOffsets]
```
```meta-bind
VIEW[floor((({con}+{AdarinMiniSheetConfig#conOffsets}) - 10) / 2)][math(hidden):AdarinMiniSheetConfig#conMod]
```
```meta-bind
VIEW[({intAdjust} ? {intAdjust} : 0) + ({conditionEffects.intAdjust} ? {conditionEffects.intAdjust} : 0) - ({intDrain} ? {intDrain} : 0) - ({intDamage} ? {intDamage} : 0)][math(hidden):AdarinMiniSheetConfig#intOffsets]
```
```meta-bind
VIEW[floor((({int}+{AdarinMiniSheetConfig#intOffsets}) - 10) / 2)][math(hidden):AdarinMiniSheetConfig#intMod]
```
```meta-bind
VIEW[({wisAdjust} ? {wisAdjust} : 0) + ({conditionEffects.wisAdjust} ? {conditionEffects.wisAdjust} : 0) - ({wisDrain} ? {wisDrain} : 0) - ({wisDamage} ? {wisDamage} : 0)][math(hidden):AdarinMiniSheetConfig#wisOffsets]
```
```meta-bind
VIEW[floor((({wis}+{AdarinMiniSheetConfig#wisOffsets}) - 10) / 2)][math(hidden):AdarinMiniSheetConfig#wisMod]
```
```meta-bind
VIEW[({chaAdjust} ? {chaAdjust} : 0) + ({conditionEffects.chaAdjust} ? {conditionEffects.chaAdjust} : 0) - ({chaDrain} ? {chaDrain} : 0) - ({chaDamage} ? {chaDamage} : 0)][math(hidden):AdarinMiniSheetConfig#chaOffsets]
```
```meta-bind
VIEW[floor((({cha}+{AdarinMiniSheetConfig#chaOffsets}) - 10) / 2)][math(hidden):AdarinMiniSheetConfig#chaMod]
```
```meta-bind
VIEW[max(1, {AdarinMiniSheetConfig#chaMod})][math(hidden):AdarinMiniSheetConfig#panacheMax]
```
```meta-bind
VIEW[ {paladinLevel} + {monkunchainedLevel} + {skaldLevel} ][math(hidden):AdarinMiniSheetConfig#totalLevel]
```
```meta-bind
VIEW[ {paladinLevel} + {monkunchainedLevel} + floor({skaldLevel} * 0.75) ][math(hidden):AdarinMiniSheetConfig#adarinBab]
```
```meta-bind
VIEW[floor(10 + {AdarinMiniSheetConfig#conMod} + ({paladinLevel} - 1) * (5.5 + {AdarinMiniSheetConfig#conMod}) + ({monkunchainedLevel} > 0 ? {monkunchainedLevel} * (5.5 + {AdarinMiniSheetConfig#conMod}) : 0) + ({skaldLevel} > 0 ? {skaldLevel} * (4.5 + {AdarinMiniSheetConfig#conMod}) : 0) + {paladinLevel})+{conditionEffects.hpMaxAdjust}+{buffEffects.hpMaxAdjust}][math(hidden):hpMax]
```
```meta-bind
VIEW[ max(1, floor(({cha} - 10) / 2) + ({chaAdjust} ? {chaAdjust} : 0)) ][math(hidden):AdarinMiniSheetConfig#panacheMax]
```
```meta-bind
VIEW[{AdarinMiniSheetConfig#dexMod}+{initFamilarBonus}+{initOther}+{initAdjust}][math(hidden):init]
```
```meta-bind
VIEW[floor({paladinLevel} / 2) + {AdarinMiniSheetConfig#chaMod}][math(hidden):layOnHandsMax]
```
```meta-bind
VIEW[1 + floor(({paladinLevel} - 1) / 2)][math(hidden):lohAmount]
```
```meta-bind
VIEW[floor({layOnHandsMax} /2)][math(hidden):channelEnergyMax]
```
```meta-bind
VIEW[1 + floor(({paladinLevel} - 1) / 3)][math(hidden):ceAmount]
```
```meta-bind
VIEW[floor({paladinLevel} / 3)+1][math(hidden):smiteEvilMax]
```
```meta-bind
VIEW[3 + {AdarinMiniSheetConfig#chaMod} + ({skaldLevel} > 1 ? ({skaldLevel} - 1) * 2 : 0)][math(hidden):weaponSongRoundsMax]
```
~~~meta-bind  
INPUT[select(  
option(1, 🗡️),
option(2, 🎯),
option(3, ⚡️),
option(4, 📚),
option(5, 🎚️),
option(6, ⚙️),  
class(tabbed mini-sheet)  
):selectedTab]  
~~~  
>[!tabbed-box]  
> >[!div]  
>> ```meta-bind  
> > INPUT[select(  
> > option(1, Adventuring),
> > option(2, Inventory),
> > class(tabbed ms-adventuring)  
> > ):selectedAdventuringTab]  
> > ```  
> > > [!tabbed-box|ms-adventuring]
> > > > [!div-m]
> > > >```meta-bind-embed
> > > >[[MiniSheetConditionNotes]]
> > > >```
> > > >```meta-bind-embed
> > > >[[MiniSheetAC]]
> > > >```
> > > >```meta-bind-embed
> > >>[[AdarinMiniSheetHP]]
> > > >```
> > > >```meta-bind-embed
> > > >[[AdarinMiniSheetEnergyRes]]
> > > >```
> > > >
> > > >`VIEW[{init}][text(renderMarkdown, class(initiative))]` `VIEW[{AdarinMiniSheetConfig#race.base_speed}ft][text(renderMarkdown, class(speed))]`
> > > > ``` meta-bind-embed
> > > > [[MiniSheetSaves]]
> > > >```
> > > > > [!crease]+
> > > > >```meta-bind-embed
> > > > >  [[AdarinMiniSheetResources]]
> > > > > ```
> > > > 
> > > > ```meta-bind-embed
> > > > [[AdarinMiniSheetAttacks]]
> > > > ```
> > > >> [!sheet-atk-block]- Waveblade
> > > >> `VIEW[{AdarinMiniSheetConfig#attackStrings["waveblade"]}][text(renderMarkdown)]`
> > > >
> > > >> [!sheet-atk-block]- Ranged
> > > >> ```meta-bind
> > > >> INPUT[select(option(Ray), option(Longbow), option(Shuriken), class(ranged-attack-type)):rangedAttackStyle]
> > > >>```
> > > >> `VIEW[{AdarinMiniSheetConfig#attackStrings["ranged"]}][text(renderMarkdown)]`
> > > > 
> > > >> [!sheet-atk-block]- Unarmed Strike
> > > >> `VIEW[{AdarinMiniSheetConfig#attackStrings["unarmed"]}][text(renderMarkdown)]`
> > > >
> > > > ```meta-bind-embed
> > > > [[AdarinCombatToggles]]
> > > >```
> > > 
> > > > [!div-m]
> > > >  ```meta-bind-embed
> > > >  [[AdarinMiniSheetInventory]]
> > > >  ```
>
> > [!div]
> > ```meta-bind-embed
> > [[MinISheetSkills]]
> >```
>
> > [!div]
> >```meta-bind-embed
> > [[AdarinMiniSheetSpells]]
> >```
>
> > [!div]
> > ```meta-bind-embed
> > [[AdarinMiniSheetReference]]
> > ```
>
>> [!div]
> > > [!sheet-adjustments] Adjustment Actions
> > > ```meta-bind-embed
> > > [[MiniSheetRestButton]]
> > > ```
> > 
> >  ```meta-bind-embed
> >  [[MiniSheetConditions]]
> > ```
> > 
> >> [!sheet-adjustments]- Combat Adjustments
> >> **Attack Adjustment**: `INPUT[number(placeholder(-)):atkAdjust]`
> >> **Damage Adjustment**: `INPUT[number(placeholder(-)):dmgAdjust]`
> >> **AC Adjustment**: `INPUT[number(placeholder(-)):acAdjust]`
>>
> >> [!sheet-adjustments|stat-adjust]- Stat Adjustments 
> >> **STR Adjustment:**
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):strAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):strDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):strDamage]`
> >> **DEX Adjustment:**
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):dexAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):dexDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):dexDamage]`
> >> **CON Adjustment:**
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):conAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):conDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):conDamage]`
> >> **INT Adjustment:**
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):intAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):intDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):intDamage]`
> >> **WIS Adjustment:** 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):wisAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):wisDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):wisDamage]`
> >> **CHA Adjustment:**
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):chaAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):cgaDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):chaDamage]`
> 
> > [!div]  
>>  ```datacorejsx
>>  const { XPTracker } = await dc.require("MiniSheet/z_Components/scripts/xptracker/XpTracker.jsx"); return <XPTracker bindTarget="xp" initialXP={0} />;
>>  ```
>>  
>>> [!blank-box|taroca]
> >>**STR**: `INPUT[number(class(stat-input)):str]`  
> >>**DEX**: `INPUT[number(class(stat-input)):dex]`  
> >>**CON**: `INPUT[number(class(stat-input)):con]` 
> >>**INT**: `INPUT[number(class(stat-input)):int]` 
> >>**WIS**: `INPUT[number(class(stat-input)):wis]` 
> >>**CHA**: `INPUT[number(class(stat-input)):cha]` 
> >
> >
>>Crane Style: `INPUT[toggle:craneStyle]`  Agile: `INPUT[toggle:agileWeapon]` 
> > ```meta-bind-js-view
> > {AdarinMiniSheetConfig#classes} as classes
> > ---
> > const classes = context.bound.classes || [];
> > 
> > if (classes && Array.isArray(classes) && classes.length > 0) {
> >     const classInputs = classes.map(className => {
> >         // Create a safe property name by removing spaces, parentheses, and making lowercase
> >         const safeName = className.toLowerCase()
> >             .replace(/\s+/g, '')
> >             .replace(/[()]/g, '')
> >             .replace(/unchained/g, 'unchained');
> >         
> >         // Create the level property name
> >         const levelProperty = `${safeName}Level`;
> >         
> >         // Create the markdown for this class level input
> >         return `**${className} Level**: \`INPUT[number:${levelProperty}]\``;
> >     });
> >     
> >     const content = classInputs.join('\n\n');
> >     const calloutContent = `> [!blank-box|taroca]\n> ${content.replace(/\n/g, '')}`;
> >     
> >     return engine.markdown.create(calloutContent);
> > } else {
> >     const content = "*No classes selected. Please select classes first.*";
> >     const calloutContent = `> [!blank-box|taroca]\n> ${content}`;
> >     
> >     return engine.markdown.create(calloutContent);
> > }
> > ```