---
conditionEffects:
  meleeAtkAdjust: -2
  rangedAtkAdjust: -2
  extraAttacks: []
  cmb: -2
  cmd: -2
  acAdjust: 0
  touchAcAdjust: 0
  ffAcAdjust: 0
  fortAdjust: -2
  refAdjust: -2
  willAdjust: -2
  hpMaxAdjust: -10
  strAdjust: 0
  dexAdjust: 0
  conAdjust: 0
  intAdjust: 0
  wisAdjust: 0
  chaAdjust: 0
  skillAdjust: -2
  levelAdjust: 2
  perceptionAdjust: 0
  strSkillAdjust: -2
  dexSkillAdjust: -2
  conSkillAdjust: -2
  intSkillAdjust: -2
  wisSkillAdjust: -2
  chaSkillAdjust: -2
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
  conditionNotes: "- Negative Levels (2): -2 penalty on all d20 rolls, -10 HP, and -1 to effective level per negative level"
  buffNotes: ""
conditions: []
panacheMax: 5
negativeLevels: 2
hp: -450
---
> [!sheet-adjustments]- Conditions
> ```meta-bind
> INPUT[multiSelect(option(blinded),option(confused),option(dazed),option(deafened),option(entangled),option(exhausted),option(fatigued),option(flat-footed),option(frightened),option(grappled),option(helpless),option(nauseated),option(panicked),option(paralyzed),option(prone),option(shaken),option(sickened),option(staggered),option(stunned),class(conditionsSelector)):conditions]
> ```
> **Negative Levels: **`INPUT[number:negativeLevels]`

> [!sheet-adjustments]- Buffs
> ```meta-bind
> INPUT[multiSelect(option(enlarged), option(haste), option('blessing of fervor'), option('bull\'s strength'), option('cat\'s grace'), option('bear\'s endurance'), option('fox\'s cunning'), option('owl\'s wisdom'), option('eagle\'s splendor'), option(bless), option(barkskin), option('magic weapon'), option(shield), option('mage armor'), class(conditionsSelector)):buffs]
>```

```meta-bind-js-view
{conditions} as conditions
{buffs} as buffs
{bofChoice} as bofChoice
{negativeLevels} as negativeLevels
save to {conditionEffects}
hidden
---
// Get the Meta Bind API
const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
if (!mb) return;

// Import the condition buff calculator
const calculatorScript = await engine.importJs("MiniSheet/z_Components/scripts/condition-buff-calculator.js");
const { ConditionBuffCalculator } = calculatorScript;

// Create calculator instance
const calculator = new ConditionBuffCalculator(mb, context.file.path);

// Calculate condition effects using all bound data
return calculator.calculateConditionEffects(context.bound);
```
