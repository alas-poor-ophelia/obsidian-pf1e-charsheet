```meta-bind-js-view
{conditions} as conditions
{buffs} as buffs
{negativeLevels} as negativeLevels
{conditionEffects} as conditionEffects
---
// Get the Meta Bind API
const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
if (!mb) {
    return "Meta Bind plugin not found";
}

// Import the external renderer script
const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/condition-notes-renderer.js");
const { ConditionBuffRenderer } = rendererScript;

// Create renderer instance
const renderer = new ConditionBuffRenderer(mb, context.file.path);

// Render conditions and buffs using the external script
renderer.renderConditionsAndBuffs(
    context.bound.conditions,
    context.bound.buffs,
    context.bound.negativeLevels,
    context.bound.conditionEffects,
    container,
    component
);

return;
```