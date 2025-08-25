---
cssClasses:
  - hide-title
classes:
  - Skald
  - Paladin
  - Monk (Unchained)
raceChoice: Tiefling
race:
  stat_adjustments: +2 Dex, +2 Int, -2 Cha
  base_speed: "30"
  size: Medium
  type: Outsider (Native)
strOffsets: 0
strMod: -1
dexOffsets: 0
dexMod: 6
conOffsets: 0
conMod: 2
intOffsets: 0
intMod: 1
wisOffsets: 0
wisMod: -1
chaOffsets: 0
chaMod: 5
panacheMax: 5
totalLevel: 9
adarinBab: 8
attackStrings:
  waveblade: |-
    **Standard Attack:** +12 (1d6+17) (19-20/x2)
    **Full Attack:** +12/+12/+12/+7 (1d6+17) (19-20/x2)
  ranged: |-
    **Standard Attack:** +11 (1d2+9) (20/x2)
    **Full Attack:** +11/+11/+11/+6 (1d2+9) (20/x2)
  unarmed: |-
    **Standard Attack:** +11 (1d6+9) (20/x2)
    **Full Attack:** +11/+11/+11/+6 (1d6+9) (20/x2)
saves:
  fort:
    value: 18
    notes: "- +2 against death effects"
  ref:
    value: 17
    notes: |-
      - +2 against death effects
      - Evasion
  will:
    value: 12
    notes: "- +2 against death effects"
isUpdating: false
previousValues:
  - 2
  - 1
  - 1
  - 
inventory:
  - id: item_k53epi9ks
    name: Headband of Charisma +2
    count: 1
    weight: 1
    value: 4000
    type: Magic Item
  - id: item_6x26wv13d
    name: +1 Agile Waveblade
    count: 1
    weight: 3
    value: 8000
    type: Weapon
    containerId: 
    note: monk weapon
  - id: item_em40dc3nz
    name: Amulet of Natural Armor +1
    count: 1
    weight: 0
    value: 1000
    type: Magic Item
  - id: item_1th406nyd
    name: Belt of Dexterity +2
    count: 1
    weight: 1
    value: 4000
    type: Magic Item
  - id: item_bljf1k1rf
    name: Cloak of Resistance +1
    count: 1
    weight: 0
    value: 1000
    type: Magic Item
  - id: item_d40zw9an2
    name: Plume of Panache
    count: 1
    weight: 0
    value: 1000
    type: Magic Item
  - id: item_cnk9ecdg3
    name: Ring of Protection +1
    count: 1
    weight: 0
    value: 2000
    type: Magic Item
  - id: item_e0kfi7am6
    name: Quick Runner’s Shirt
    count: 1
    weight: 0
    value: 1000
    type: Magic Item
  - id: item_ippo22a24
    name: Masterwork Violin
    count: 1
    weight: 3
    value: 100
    type: Other
    containerId: item_h87fwlzhl
    note: 
  - id: item_ztmq6kney
    name: Masterwork Hand Harp
    count: 1
    weight: 3
    value: 100
    type: Other
  - id: item_h87fwlzhl
    name: Backpack
    count: 1
    weight: 1
    value: 1
    type: Container
    containerId: 
  - id: item_95gekrao6
    name: Bedroll
    count: 1
    weight: 2
    value: 0
    type: Other
    containerId: item_h87fwlzhl
  - id: item_9700qafdr
    name: Blankets
    count: 1
    weight: 2
    value: 0
    type: Other
    containerId: item_h87fwlzhl
    note: assorted, from the D'ziriak
  - id: item_048ost3b0
    name: Basic Rations
    count: 5
    weight: 5
    value: 0
    type: Other
    containerId: item_h87fwlzhl
  - id: item_whp5602e9
    name: Basic robes
    count: 1
    weight: 0
    value: 0
    type: Clothing
    containerId: 
currency:
  copper: 0
  silver: 0
  gold: 930
  platinum: 0
xp: 88585
---


> [!sheet-adjustments]- Skills
> ```meta-bind-js-view
> {Adarin Mini Sheet#skills} as skills
> {AdarinMiniSheetConfig#strMod} as strMod
> {AdarinMiniSheetConfig#dexMod} as dexMod
> {AdarinMiniSheetConfig#conMod} as conMod
> {AdarinMiniSheetConfig#intMod} as intMod
> {AdarinMiniSheetConfig#wisMod} as wisMod
> {AdarinMiniSheetConfig#chaMod} as chaMod
> {Adarin Mini Sheet#skillAdjust} as skillAdjust
> {Adarin Mini Sheet#strSkillAdjust} as strSkillAdjust
> {Adarin Mini Sheet#dexSkillAdjust} as dexSkillAdjust
> {Adarin Mini Sheet#conSkillAdjust} as conSkillAdjust
> {Adarin Mini Sheet#intSkillAdjust} as intSkillAdjust
> {Adarin Mini Sheet#wisSkillAdjust} as wisSkillAdjust
> {Adarin Mini Sheet#chaSkillAdjust} as chaSkillAdjust
> {Adarin Mini Sheet#versatilePerformance} as versatilePerformance
> {Adarin Mini Sheet#skaldLevel} as skaldLevel
> ---
> const abilityMods = {
>   str: context.bound.strMod || 0, dex: context.bound.dexMod || 0, con: context.bound.conMod || 0,
>   int: context.bound.intMod || 0, wis: context.bound.wisMod || 0, cha: context.bound.chaMod || 0
> };
> const abilitySkillAdjusts = {
>   str: context.bound.strSkillAdjust || 0, dex: context.bound.dexSkillAdjust || 0, con: context.bound.conSkillAdjust || 0,
>   int: context.bound.intSkillAdjust || 0, wis: context.bound.wisSkillAdjust || 0, cha: context.bound.chaSkillAdjust || 0
> };
> const globalSkillAdjust = context.bound.skillAdjust || 0;
> const skaldLevel = context.bound.skaldLevel || 0;
> const versatilePerformance = context.bound.versatilePerformance || false;
> const skills = context.bound.skills || {};
> 
> function calculateSkillBonus(skillData, skillName) {
>   if (!skillData || !Array.isArray(skillData) || skillData.length < 3) return 0;
>   
>   // Versatile Performance substitution
>   if (versatilePerformance && (skillName === 'Sense Motive' || skillName === 'Bluff')) {
>     const performSing = skills['Perform (Sing)'];
>     if (performSing && performSing.length >= 3) return calculateSkillBonus(performSing, 'Perform (Sing)');
>   }
>   
>   const [ability, ranks, isClassSkill] = skillData;
>   const abilityMod = abilityMods[ability.toLowerCase()] || 0;
>   const classBonus = (isClassSkill && ranks > 0) ? 3 : 0;
>   const adjustment = globalSkillAdjust + (abilitySkillAdjusts[ability.toLowerCase()] || 0);
>   const bardicBonus = skillName.startsWith('Knowledge') && skaldLevel > 0 ? Math.max(1, Math.ceil(skaldLevel / 2)) : 0;
>   
>   return ranks + abilityMod + classBonus + adjustment + bardicBonus;
> }
> 
> let output = '';
> Object.keys(skills).sort().forEach(skillName => {
>   const skillData = skills[skillName];
>   if (!skillData || !Array.isArray(skillData)) return;
>   
>   const usesPerform = versatilePerformance && (skillName === 'Sense Motive' || skillName === 'Bluff');
>   const displayData = usesPerform && skills['Perform (Sing)'] ? skills['Perform (Sing)'] : skillData;
>   
>   const [ability, ranks, isClassSkill] = skillData;
>   const abilityMod = abilityMods[ability.toLowerCase()] || 0;
>   const otherMod = globalSkillAdjust + (abilitySkillAdjusts[ability.toLowerCase()] || 0) + 
>     (skillName.startsWith('Knowledge') && skaldLevel > 0 ? Math.max(1, Math.ceil(skaldLevel / 2)) : 0);
>   
>   const total = calculateSkillBonus(skillData, skillName);
>   const totalSign = total >= 0 ? `+${total}` : `${total}`;
>   const abilitySign = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;
>   const otherSign = otherMod === 0 ? "0" : (otherMod > 0 ? `+${otherMod}` : `${otherMod}`);
>   
>   const modifiers = `Ranks: ${ranks} / ${ability.toUpperCase()}: ${abilitySign} / Other: ${otherSign}`;
>   const performText = usesPerform ? "(uses Perform)" : "";
>   
>   output += `> [!skill-item|${ability.toLowerCase()}] `;
>   
>   // Class skill checkbox (left edge) - index 2 in array (isClassSkill)
>   output += `\`INPUT[toggle:Adarin Mini Sheet#skills["${skillName}"][2]]\` `;
>   
>   // Editable ranks input (between icon and name) - index 1 in array
>   output += `\`INPUT[number:Adarin Mini Sheet#skills["${skillName}"][1]]\` `;
>   
>   // Skill name and total
>   output += `\`VIEW[${skillName}][text(class(skill-name))]\` \`VIEW[${totalSign}][text(class(skill-ranks))]\`\n`;
>   
>   // Class skill indicator and modifiers
>   output += `>\`VIEW[${modifiers}][text(class(skill-modifiers))]\`\n\n`;
> });
> 
> return engine.markdown.create(output);
> ```

> [!sheet-adjustments]- Classes
> ```meta-bind
> INPUT[multiSelect(option(Alchemist), option(Antipaladin), option(Arcanist), option(Barbarian), option('Barbarian (Unchained)'), option(Bard), option(Bloodrager), option(Brawler), option(Cavalier), option(Cleric), option(Druid), option(Fighter), option(Gunslinger), option(Hunter), option(Inquisitor), option(Investigator), option(Kineticist), option(Magus), option(Medium), option(Mesmerist), option(Monk), option('Monk (Unchained)'), option(Ninja), option(Occultist), option(Oracle), option(Paladin), option(Psychic), option(Ranger), option(Rogue), option('Rogue (Unchained)'), option(Samurai), option(Shaman), option(Shifter), option(Skald), option(Slayer), option(Sorcerer), option(Spiritualist), option(Summoner), option('Summoner (Unchained)'), option(Swashbuckler), option(Vigilante), option(Warpriest), option(Witch), option(Wizard)):classes]
> ```

> [!sheet-adjustments]- Race
> ```meta-bind
> INPUT[select(option(Aasimar), option(Catfolk), option(Dhampir), option(Drow), option(Dwarf), option(Elf), option(Fetchling), option(Gnome), option(Goblin), option(Half-Elf), option(Half-Orc), option(Halfling), option(Hobgoblin), option(Human), option(Ifrit), option(Kobold), option(Orc), option(Oread), option(Ratfolk), option(Sylph), option(Tengu), option(Tiefling), option(Undine)):raceChoice]
> ```
```meta-bind-js-view
{MiniSheetRacesDB#races} as races
{raceChoice} as raceChoice
save to {race}
hidden
---
return context.bound.races[context.bound.raceChoice];
```
