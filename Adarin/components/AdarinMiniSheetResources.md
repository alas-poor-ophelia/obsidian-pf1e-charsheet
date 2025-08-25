---
selectedTab: 1
selectedTabResources: 1
---
~~~meta-bind  
INPUT[select(  
option(1, 🗡️),
option(2, 👜),
class(tabbed mini-sheet-resources)  
):selectedTabResources]  
~~~
> [!tabbed-box]
> > [!div-m]
> > ```js-engine
> > const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
> > if (!mb) { return "Meta Bind not enabled"; }
> > 
> > const syncScript = await engine.importJs("MiniSheet/z_Components/scripts/resource-sync.js");
> > const { ResourceSyncManager } = syncScript;
> > 
> > const syncManager = new ResourceSyncManager(mb, component);
> > await syncManager.renderAdarinResources(container, context, engine);
> > ```
> 
> > [!div-m]
> > ```js-engine
> > const mb = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
> > if (!mb) { return "Meta Bind not enabled"; }
> > 
> > const syncScript = await engine.importJs("MiniSheet/z_Components/scripts/resource-sync.js");
> > const { ResourceSyncManager } = syncScript;
> > 
> > const syncManager = new ResourceSyncManager(mb, component);
> > await syncManager.renderAdarinItemResources(container, context, engine);
> > ```