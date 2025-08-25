## SLAs
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


## Spontaneus
### Known
  ```js-engine
  const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
  if (!mb) { return "Meta Bind not enabled"; }

  const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
  const { createSpellbookRenderer } = rendererScript;

  const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');

  // Render Global Metamagic Selector for Spontaneous Casters
  async function renderGlobalMetamagic() {
    await renderer.createGlobalMetamagicSelector(container, component, context, engine);
  }

  await renderGlobalMetamagic();
  renderer.setupLiveUpdates(renderGlobalMetamagic, component, null, "known");
``` 
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
 
 ## Hybrid 
 ### Prepared
  ```js-engine
  const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
  if (!mb) { return "Meta Bind not enabled"; }

  const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
  const { createSpellbookRenderer } = rendererScript;

  const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookHybridTest.md');

  // Render Global Metamagic Selector for Spontaneous Casters
  async function renderGlobalMetamagic() {
    await renderer.createGlobalMetamagicSelector(container, component, context, engine);
  }

  await renderGlobalMetamagic();
  renderer.setupLiveUpdates(renderGlobalMetamagic, component, null, "known");
```  
   ```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookHybridTest.md');
 
 async function renderPreparedSpells() {
   await renderer.renderPreparedSpellsByLevel(1, container, component, context, engine);
 }
 
 await renderPreparedSpells();
 renderer.setupLiveUpdates(renderPreparedSpells, component, 1, "prepared");
 ```

   ```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookHybridTest.md');
 
 async function renderPreparedSpells() {
   await renderer.renderPreparedSpellsByLevel(2, container, component, context, engine);
 }
 
 await renderPreparedSpells();
 renderer.setupLiveUpdates(renderPreparedSpells, component, 2, "prepared");
 ```
 
 ### Known
 
   ```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookHybridTest.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(1, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 1, "known");
 ```
 
```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookHybridTest.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(2, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 2, "known");
```

## Prepared
 ### Prepared
   ```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookPreparedTest.md');
 
 async function renderPreparedSpells() {
   await renderer.renderPreparedSpellsByLevel(1, container, component, context, engine);
 }
 
 await renderPreparedSpells();
 renderer.setupLiveUpdates(renderPreparedSpells, component, 1, "prepared");
 ```

   ```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookPreparedTest.md');
 
 async function renderPreparedSpells() {
   await renderer.renderPreparedSpellsByLevel(2, container, component, context, engine);
 }
 
 await renderPreparedSpells();
 renderer.setupLiveUpdates(renderPreparedSpells, component, 2, "prepared");
 ```
 
 ### Known
 
   ```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookPreparedTest.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(1, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 1, "known");
 ```
 
```js-engine
 const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
 if (!mb) { return "Meta Bind not enabled"; }
 
 const rendererScript = await engine.importJs("MiniSheet/z_Components/scripts/spellbook/core/renderer-factory.js");
 const { createSpellbookRenderer } = rendererScript;
 
 const renderer = createSpellbookRenderer(mb, 'MiniSheet/z_Components/spellbooks/SpellBookPreparedTest.md');
 
 async function renderKnownSpells() {
   await renderer.renderKnownSpellsByLevel(2, container, component, context, engine);
 }
 
 await renderKnownSpells();
 renderer.setupLiveUpdates(renderKnownSpells, component, 2, "known");
```