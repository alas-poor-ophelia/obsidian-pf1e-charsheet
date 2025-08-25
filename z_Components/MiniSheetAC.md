```meta-bind-js-view
{AdarinMiniSheetConfig#dexMod} as dexMod
{AdarinMiniSheetConfig#chaMod} as chaMod
{AdarinMiniSheetConfig#strMod} as strMod
{sizeMod} as sizeMod
{monkunchainedLevel} as monkLevel
{paladinLevel} as paladinLevel
{AdarinMiniSheetConfig#adarinBab} as bab
{naturalAC} as naturalAC
{dodgeAC} as dodgeAC
{deflectionAC} as deflectionAC
{fightingDefensively} as fightingDefensively
{craneStyle} as craneStyle
{hasted} as hasted
{acAdjust} as acAdjust
{charging} as charging
{showCMBCMD} as showCMBCMD
{conditionEffects} as conditionEffects
{weaponSong} as weaponSong
---
// Get the Meta Bind API
const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
if (!mb) {
    return "Meta Bind plugin not found";
}

// Import the AC display calculator
const calculatorScript = await engine.importJs("MiniSheet/z_Components/scripts/ac-renderer.js");
const { ACDisplayCalculator } = calculatorScript;

// Create calculator instance
const calculator = new ACDisplayCalculator(mb, context.file.path);

// Render AC display
calculator.renderACDisplay(context.bound, container, component);

return;
```