```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
if (!mb) { return "Meta Bind not enabled"; }

const syncScript = await engine.importJs("MiniSheet/z_Components/scripts/resource-sync.js");
const { ResourceSyncManager } = syncScript;

const syncManager = new ResourceSyncManager(mb, component);
await syncManager.renderHwayoungResources(container, context, engine);
```