---
level1SpellSlotsMax: 3
level1SpellSlotsCurrent: 3
panacheMax: 1
hpMax: 4
init: -5
layOnHandsMax: -5
lohAmount: 0
channelEnergyMax: -3
ceAmount: 0
smiteEvilMax: 1
weaponSongRoundsMax: -2
---
%% Config %%
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
if (!mb) { return "Meta Bind not enabled"; }

const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
const { createSpellbookRenderer } = rendererScript;

const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');

async function renderConfig() {
  await renderer.renderConfigView(container, component, context, engine);
}

await renderConfig();
```
 %% SLAs %%
```js-engine
   const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
  
  const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
  const { createSpellbookRenderer } = rendererScript;

  const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');

  // Render SLAs
  async function renderSLAs() {
    await renderer.renderSpellLikeAbilities(container, component, context, engine);
  }

  await renderSLAs();
renderer.setupLiveUpdates(renderSLAs, component, null, "sla");
```
 %% Level 0 Known %%
```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(0, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 0, "known");
 ```
 %% Level 1 Known %%
```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(1, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 1, "known");
 ```
  %% Level 2 Known %%
```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(2, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 2, "known");
 ```