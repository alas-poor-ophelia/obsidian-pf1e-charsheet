---
masterLevel: 9
str: 3
dex: 16
con: 9
int: 7
wis: 12
cha: 5
sizeMod: 2
hp: 36.5
hpMax: 36.5
hpMod: 0
tmpHp: ""
hpEditable: false
showCMBCMD: false
layOnPawsCurrent: 1
layOnPawsMax: 3
channelEnergyCurrent: 
channelEnergyMax: 1
resistanceEnhancement: 0
meleeWeaponEnhancement: 1
rangedWeaponEnhancement: 0
naturalAC: 2
smiteEvil: false
smiteEvilOutsider: false
charging: false
powerAttack: false
fightingDefensively: false
hasted: false
init: 3
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
conditionEffects:
  meleeAtkAdjust: 0
  rangedAtkAdjust: 0
  extraAttacks: []
  cmb: 0
  cmd: 0
  acAdjust: 0
  touchAcAdjust: 0
  ffAcAdjust: 0
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
  skillAdjust: 0
  levelAdjust: 0
  perceptionAdjust: 0
  strSkillAdjust: 0
  dexSkillAdjust: 0
  conSkillAdjust: 0
  intSkillAdjust: 0
  wisSkillAdjust: 0
  chaSkillAdjust: 0
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
  buffNotes: ""
cssclasses:
  - hide-title
  - keep-loaded
banner-height: 180
content-start: 90
banner-fade: -85
banner-radius: 0
banner-display: 100%
banner-x: 50
banner-y: 29
selectedTab: 1
---
<br>

> [!banner|hwayoung]
> ![[Hwayoung.png]]"
```meta-bind-button
style: default
label: 🧝‍♀️
class: sheet-swap-btn adarin 
action:
    type: open
    link: Adarin Mini Sheet
```
```meta-bind
VIEW[({strAdjust} ? {strAdjust} : 0) + ({conditionEffects.strAdjust} ? {conditionEffects.strAdjust} : 0) - ({strDrain} ? {strDrain} : 0) - ({strDamage} ? {strDamage} : 0)][math(hidden):HwayoungMiniSheetConfig#strOffsets]
```
```meta-bind
VIEW[floor(({str} - 10) / 2) + {HwayoungMiniSheetConfig#strOffsets}][math(hidden):HwayoungMiniSheetConfig#strMod]
```
```meta-bind
VIEW[({dexAdjust} ? {dexAdjust} : 0) + ({conditionEffects.dexAdjust} ? {conditionEffects.dexAdjust} : 0) - ({dexDrain} ? {dexDrain} : 0) - ({dexDamage} ? {dexDamage} : 0)][math(hidden):HwayoungMiniSheetConfig#dexOffsets]
```
```meta-bind
VIEW[floor(({dex} - 10) / 2) + {HwayoungMiniSheetConfig#dexOffsets}][math(hidden):HwayoungMiniSheetConfig#dexMod]
```
```meta-bind
VIEW[({conAdjust} ? {conAdjust} : 0) + ({conditionEffects.conAdjust} ? {conditionEffects.conAdjust} : 0) - ({conDrain} ? {conDrain} : 0) - ({conDamage} ? {conDamage} : 0)][math(hidden):HwayoungMiniSheetConfig#conOffsets]
```
```meta-bind
VIEW[floor(({con} - 10) / 2) + {HwayoungMiniSheetConfig#conOffsets}][math(hidden):HwayoungMiniSheetConfig#conMod]
```
```meta-bind
VIEW[({intAdjust} ? {intAdjust} : 0) + ({conditionEffects.intAdjust} ? {conditionEffects.intAdjust} : 0) - ({intDrain} ? {intDrain} : 0) - ({intDamage} ? {intDamage} : 0)][math(hidden):HwayoungMiniSheetConfig#intOffsets]
```
```meta-bind
VIEW[floor(({int} - 10) / 2) + {HwayoungMiniSheetConfig#intOffsets}][math(hidden):HwayoungMiniSheetConfig#intMod]
```
```meta-bind
VIEW[({wisAdjust} ? {wisAdjust} : 0) + ({conditionEffects.wisAdjust} ? {conditionEffects.wisAdjust} : 0) - ({wisDrain} ? {wisDrain} : 0) - ({wisDamage} ? {wisDamage} : 0)][math(hidden):HwayoungMiniSheetConfig#wisOffsets]
```
```meta-bind
VIEW[floor(({wis} - 10) / 2) + {HwayoungMiniSheetConfig#wisOffsets}][math(hidden):HwayoungMiniSheetConfig#wisMod]
```
```meta-bind
VIEW[({chaAdjust} ? {chaAdjust} : 0) + ({conditionEffects.chaAdjust} ? {conditionEffects.chaAdjust} : 0) - ({chaDrain} ? {chaDrain} : 0) - ({chaDamage} ? {chaDamage} : 0)][math(hidden):HwayoungMiniSheetConfig#chaOffsets]
```
```meta-bind
VIEW[floor(({cha} - 10) / 2) + {HwayoungMiniSheetConfig#chaOffsets}][math(hidden):HwayoungMiniSheetConfig#chaMod]
```
```meta-bind
VIEW[{AdarinMiniSheetConfig#totalLevel}][math(hidden):masterLevel]
```
```meta-bind
VIEW[{AdarinMiniSheetConfig#adarinBab}][math(hidden):HwayoungMiniSheetConfig#bab]
```
```meta-bind
VIEW[{Adarin Mini Sheet#hpMax} / 2][math(hidden):hpMax]
```
```meta-bind
VIEW[{HwayoungMiniSheetConfig#dexMod}+{initFamilarBonus}+{initOther}+{initAdjust}][math(hidden):init]
```
```meta-bind-js-view
{Adarin Mini Sheet#skills} as skills
save to {skills}
hidden
---
return context.bound.skills;
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
> >```meta-bind-js-view
> >{conditions} as conditions
> >{conditionNotes} as conditionNotes
> >{negativeLevels} as negativeLevels
> >---
> >if (context.bound.conditions && context.bound.conditions.length !== 0 || context.bound.negativeLevels) {
> >	return engine.markdown.create(`\`INPUT[toggle(class(condition-icon))]\` \`VIEW[{conditionEffects.conditionNotes}][text(renderMarkdown, class(condition-notes))]\``);
> >} else {
> >	return "";
> >}
> >```
> >```meta-bind-embed
> >[[MiniSheetAC]]
> >```
> >```meta-bind-embed
>>[[HwayoungMiniSheetHP]]
> >```
> >
> >`VIEW[{init}][text(renderMarkdown, class(initiative))]` `VIEW[50ft][text(renderMarkdown, class(speed))]`
> > ``` meta-bind-embed
> > [[HwayoungMiniSheetSaves]]
> >```
> > > [!crease]+ 
> > > ```meta-bind-embed
> > > [[HwayoungMiniSheetResources]]
> > > ```
> > ```meta-bind-embed
> > [[HwayoungMiniSheetAttacks]]
> > ```
> >> [!sheet-atk-block]- Bite
> >> `VIEW[{HwayoungMiniSheetConfig#attackStrings["bite"]}][text(renderMarkdown)]`
> >
> >> [!sheet-atk-block]- Ranged
> >> `VIEW[{HwayoungMiniSheetConfig#attackStrings["ray"]}][text(renderMarkdown)]`
> 
> > [!div]
> > ```meta-bind-embed
> > [[MinISheetSkills]]
> >```
>
> > [!div]
>> ```meta-bind-embed
>> [[HwayoungMinISheetSpells]]
>>```
>
> > [!div]
> > ```meta-bind-embed
> > [[MiniSheetReference]]
> > ```
>
>> [!div]
> > > [!sheet-adjustments] Adjustment Actions
> > > ```meta-bind-button
> > > label: "Rest"
> > > hidden: false
> > > id: "rest"
> > > style: primary
> > > actions:
> > >   - type: updateMetadata
> > >     bindTarget: hp
> > >     evaluate: true
> > >     value: "Math.min(x + getMetadata('masterLevel'), getMetadata('hpMax'))"  
> > >   - type: updateMetadata
> > >     bindTarget: layOnPawsCurrent
> > >     evaluate: true
> > >     value: "getMetadata('layOnPawsMax')"
> > >   - type: updateMetadata
> > >     bindTarget: channelEnergyCurrent
> > >     evaluate: true
> > >     value: "getMetadata('channelEnergyMax')"
> > > ```
> > 
> > > [!sheet-adjustments]- Conditions
> > > ```meta-bind-embed
> > > [[MiniSheetConditions]]
> > >```
> > 
> >> [!sheet-adjustments]- Attack Adjustments
> >> **Attack Adjustment**: `INPUT[number:atkAdjust]`
> >> **Damage Adjustment**: `INPUT[number:dmgAdjust]`
>>
> >> [!sheet-adjustments]- Stat Adjustments 
> >> **STR Adjustment**: 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):strAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):strDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):strDamage]`
> >> **DEX Adjustment**: 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):dexAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):dexDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):dexDamage]`
> >> **CON Adjustment**: 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):conAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):conDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):conDamage]`
> >> **INT Adjustment**: 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):intAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):intDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):intDamage]`
> >> **WIS Adjustment**: 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):wisAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):wisDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):wisDamage]`
> >> **CHA Adjustment**: 
> >> `INPUT[number(class(stat-adjust), placeholder(Other)):chaAdjust]` `INPUT[number(class(stat-adjust), placeholder(Drain)):cgaDrain]` `INPUT[number(class(stat-adjust), placeholder(Dmg)):chaDamage]`
> 
> > [!div]  
>>**STR**: `INPUT[number(class(stat-input)):str]`  
>>**DEX**: `INPUT[number(class(stat-input)):dex]`  
>>**CON**: `INPUT[number(class(stat-input)):con]` 
>>**INT**: `INPUT[number(class(stat-input)):int]` 
>>**WIS**: `INPUT[number(class(stat-input)):wis]` 
>>**CHA**: `INPUT[number(class(stat-input)):cha]` 

