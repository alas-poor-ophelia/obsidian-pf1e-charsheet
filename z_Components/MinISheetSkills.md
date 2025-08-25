---
skills:
  Acrobatics:
    - dex
    - 0
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
    - 1
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
    - 6
    - true
  Knowledge (arcana):
    - int
    - 0
    - true
  Knowledge (dungeon):
    - int
    - 0
    - true
  Knowledge (engineering):
    - int
    - 0
    - true
  Knowledge (geography):
    - int
    - 0
    - true
  Knowledge (history):
    - int
    - 0
    - true
  Knowledge (local):
    - int
    - 0
    - true
  Knowledge (nature):
    - int
    - 0
    - true
  Knowledge (nobility):
    - int
    - 0
    - true
  Knowledge (planes):
    - int
    - 0
    - true
  Knowledge (religion):
    - int
    - 1
    - true
  Linguistics:
    - int
    - 0
    - true
  Perception:
    - wis
    - 4
    - true
  Perform (Sing):
    - cha
    - 6
    - true
  Perform (Stringed):
    - cha
    - 6
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
    - 2
    - true
  Sleight of Hand:
    - dex
    - 0
    - false
  Spellcraft:
    - int
    - 0
    - true
  Stealth:
    - dex
    - 0
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
    - 1
    - true
panacheMax: 5
versatilePerformance: true
xp: 77825
---
```meta-bind-js-view
{Adarin Mini Sheet#skills} as skills
{AdarinMiniSheetConfig#strMod} as strMod
{AdarinMiniSheetConfig#dexMod} as dexMod
{AdarinMiniSheetConfig#conMod} as conMod
{AdarinMiniSheetConfig#intMod} as intMod
{AdarinMiniSheetConfig#wisMod} as wisMod
{AdarinMiniSheetConfig#chaMod} as chaMod
{skillAdjust} as skillAdjust
{strSkillAdjust} as strSkillAdjust
{dexSkillAdjust} as dexSkillAdjust
{conSkillAdjust} as conSkillAdjust
{intSkillAdjust} as intSkillAdjust
{wisSkillAdjust} as wisSkillAdjust
{chaSkillAdjust} as chaSkillAdjust
{versatilePerformance} as versatilePerformance
{skaldLevel} as skaldLevel
---
const abilityMods = {
  str: context.bound.strMod || 0, dex: context.bound.dexMod || 0, con: context.bound.conMod || 0,
  int: context.bound.intMod || 0, wis: context.bound.wisMod || 0, cha: context.bound.chaMod || 0
};
const abilitySkillAdjusts = {
  str: context.bound.strSkillAdjust || 0, dex: context.bound.dexSkillAdjust || 0, con: context.bound.conSkillAdjust || 0,
  int: context.bound.intSkillAdjust || 0, wis: context.bound.wisSkillAdjust || 0, cha: context.bound.chaSkillAdjust || 0
};
const globalSkillAdjust = context.bound.skillAdjust || 0;
const skaldLevel = context.bound.skaldLevel || 0;
const versatilePerformance = context.bound.versatilePerformance || false;
const skills = context.bound.skills || {};

function calculateSkillBonus(skillData, skillName) {
  if (!skillData || !Array.isArray(skillData) || skillData.length < 3) return 0;
  
  // Versatile Performance substitution
  if (versatilePerformance && (skillName === 'Sense Motive' || skillName === 'Bluff')) {
    const performSing = skills['Perform (Sing)'];
    if (performSing && performSing.length >= 3) return calculateSkillBonus(performSing, 'Perform (Sing)');
  }
  
  const [ability, ranks, otherBonus, isClassSkill] = skillData;
  const abilityMod = abilityMods[ability.toLowerCase()] || 0;
  const classBonus = (isClassSkill && ranks > 0) ? 3 : 0;
  const adjustment = globalSkillAdjust + (abilitySkillAdjusts[ability.toLowerCase()] || 0);
  const bardicBonus = skillName.startsWith('Knowledge') && skaldLevel > 0 ? Math.max(1, Math.ceil(skaldLevel / 2)) : 0;
  const otherBonusValue = otherBonus || 0;
  
  return ranks + abilityMod + classBonus + adjustment + bardicBonus + otherBonusValue;
}

let output = '';
Object.keys(skills).sort().forEach(skillName => {
  const skillData = skills[skillName];
  if (!skillData || !Array.isArray(skillData)) return;
  
  const usesPerform = versatilePerformance && (skillName === 'Sense Motive' || skillName === 'Bluff');
  const displayData = usesPerform && skills['Perform (Sing)'] ? skills['Perform (Sing)'] : skillData;
  
  const [ability, ranks, otherBonus, isClassSkill] = displayData;
  const abilityMod = abilityMods[ability.toLowerCase()] || 0;
  const otherBonusValue = otherBonus || 0;
  const otherMod = globalSkillAdjust + (abilitySkillAdjusts[ability.toLowerCase()] || 0) + 
    (skillName.startsWith('Knowledge') && skaldLevel > 0 ? Math.max(1, Math.ceil(skaldLevel / 2)) : 0) + 
    otherBonusValue;
  
  const total = calculateSkillBonus(skillData, skillName);
  const totalSign = total >= 0 ? `+${total}` : `${total}`;
  const abilitySign = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;
  const otherSign = otherMod === 0 ? "0" : (otherMod > 0 ? `+${otherMod}` : `${otherMod}`);
  
  const modifiers = `Ranks: ${ranks} / ${ability.toUpperCase()}: ${abilitySign} / Other: ${otherSign}`;
  const performText = usesPerform ? "(uses Perform)" : "";
  
  output += `> [!skill-item|${ability.toLowerCase()}] \`VIEW[${skillName}][text(class(skill-name))]\` \`VIEW[${totalSign}][text(class(skill-ranks))]\`\n`;
  output += `>\`VIEW[${isClassSkill ? "✓" : " "}][text(class(skill-class-skill))]\` \`VIEW[${modifiers}][text(class(skill-modifiers))]\`${usesPerform ? `\n>\`VIEW[${performText}][text(class(skill-modifiers 2nd-line))]\`` : ""}\n\n`;
});

return engine.markdown.create(output);
```

```meta-bind-js-view
{Adarin Mini Sheet#bardLevel} as bardLevels
{Adarin Mini Sheet#skaldLevel} as skaldLevels
---
const hasVersatilePerformance = (context.bound.bardLevels || 0) >= 2 || (context.bound.skaldLevels || 0) >= 2;

if (hasVersatilePerformance) {
  return engine.markdown.create('\`INPUT[toggle(showcase, class(vers-perf-fab)):versatilePerformance]\`'); 
} else {
 return " ";
}
```