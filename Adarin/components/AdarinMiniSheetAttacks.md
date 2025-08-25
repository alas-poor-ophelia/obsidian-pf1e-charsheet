```meta-bind-js-view
{AdarinMiniSheetConfig#strMod} as strMod
{AdarinMiniSheetConfig#dexMod} as dexMod
{AdarinMiniSheetConfig#adarinBab} as bab
{AdarinMiniSheetConfig#chaMod} as chaMod
{meleeWeaponEnhancement} as meleeWeaponEnhancement  
{rangedWeaponEnhancement} as rangedWeaponEnhancement
{rangedAttackStyle} as rangedAttackStyle
{powerAttack} as powerAttack  
{fightingDefensively} as fightingDefensively  
{agileWeapon} as agileWeapon  
{flurryOfBlows} as flurryOfBlows  
{panachePoints} as panachePoints  
{preciseStrike} as preciseStrike  
{craneStyle} as craneStyle
{doublePreciseStrike} as doublePreciseStrike
{atkAdjust} as atkAdjust
{dmgAdjust} as dmgAdjust
{paladinLevel} as paladinLevel
{monkunchainedLevel} as monkLevel
{rangedAtkAdjust} as rangedAtkAdjust
{rangedDmgAdjust} as rangedDmgAdjust
{unarmedAtkAdjust} as unarmedAtkAdjust
{unarmedDmgAdjust} as unarmedDmgAdjust
{smiteEvil} as smiteEvil
{smiteEvilOutsider} as smiteEvilOutsider
{charging} as charging
{conditionEffects} as conditionEffects
{buffs} as buffs
{weaponSong} as weaponSong
{flanking} as flanking
save to {AdarinMiniSheetConfig#attackStrings}
hidden
---  
// Import the attack calculator
const calculatorScript = await engine.importJs("MiniSheet/z_Components/scripts/attack-calculator.js");
const { AttackCalculator } = calculatorScript;

// Create calculator instance
const calculator = new AttackCalculator();

// Calculate attack strings using all bound data
return calculator.calculateAttackStrings(context.bound);
```