---
hp: .nan
---
```meta-bind-button
label: "Rest"
hidden: false
id: "rest"
style: primary
class: rest-btn
actions:
  - type: updateMetadata
    bindTarget: hp
    evaluate: true
    value: "Math.min(x + getMetadata('AdarinMiniSheetConfig#totalLevel'), getMetadata('hpMax'))"
  - type: updateMetadata
    bindTarget: panachePoints
    evaluate: true
    value: "getMetadata('AdarinMiniSheetConfig#chaMod')"
  - type: updateMetadata
    bindTarget: smiteEvilCurrent
    evaluate: true
    value: "getMetadata('smiteEvilMax')"
  - type: updateMetadata
    bindTarget: layOnHandsCurrent
    evaluate: true
    value: "getMetadata('layOnHandsMax')"
  - type: updateMetadata
    bindTarget: channelEnergyCurrent
    evaluate: true
    value: "getMetadata('channelEnergyMax')"
  - type: updateMetadata
    bindTarget: weaponSongRoundsCurrent
    evaluate: true
    value: "getMetadata('weaponSongRoundsMax')"
  - type: inlineJS
    code: |
      (async () => {
          try {
              console.log('Starting rest...');
              
              const jsEngine = app.plugins.getPlugin('js-engine');
              if (!jsEngine) {
                  console.error('JS Engine plugin not found');
                  return;
              }
              
              const rendererModule = await jsEngine.api.importJs("MiniSheet/z_Components/scripts/spellbook/core/spellbook.js");
              const { createSpellbookRenderer } = rendererModule;
              
              const mb = app.plugins.getPlugin('obsidian-meta-bind-plugin')?.api;
              if (!mb) {
                  console.error('Meta Bind API not found');
                  return;
              }
              
              const targetFile = app.vault.getAbstractFileByPath('MiniSheet/z_Components/spellbooks/AdarinSpellBook.md');
              
              if (!targetFile) {
                  console.error('No target file found');
                  return;
              }
              
              // Use factory to get the correct renderer type
              const renderer = createSpellbookRenderer(mb, targetFile.path);
              
              const updates = renderer.resetAllPreparationCounts(false, false);
              
              console.log(`Applying ${updates.length} updates...`);
              
              for (const update of updates) {
                  console.log('Executing update for:', update.bindTarget);
                  
                  const bindTarget = mb.parseBindTarget(update.bindTarget, targetFile.path);
                  
                  if (update.evaluate) {
                      console.warn('Evaluated update not implemented in rest button');
                  } else {
                      mb.setMetadata(bindTarget, update.value);
                  }
              }
              
              console.log('Rest completed successfully');
          } catch (error) {
              console.error('Error during rest:', error);
          }
      })();
```