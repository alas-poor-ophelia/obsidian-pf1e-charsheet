---
hpEditable: false
hpMod: 0
hp: 60
hpMax: 60
tmpHp: 10
---
 `VIEW[{hp}+{conditionEffects.hpAdjust}][math(class(blood-droplet-view))]` `VIEW[{tmpHp}][text(class(temp-hp))]` `INPUT[number(class(blood-droplet-input), placeholder(⠀)):hpMod]` `INPUT[toggle(showcase, class(invisible-input)):hpEditable]` `BUTTON[add-hp, sub-hp, temp-hp]`
 ```meta-bind-button
 style: primary
 label: +
 class: mod-hp-button
 hidden: true
 id: add-hp
 actions:
   - type: updateMetadata
     bindTarget: hp
     evaluate: true
     value: "Math.min(x + getMetadata('hpMod'), getMetadata('hpMax'))"
   - type: updateMetadata
     bindTarget: hpMod
     evaluate: false
     value: 0
   - type: updateMetadata
     bindTarget: hpEditable
     evaluate: false
     value: false
 ```
 ```meta-bind-button
style: destructive
class: mod-hp-button
label: "-"
hidden: true
id: sub-hp
actions:
  - type: inlineJS
    code: |
      const api = engine.getPlugin('obsidian-meta-bind-plugin')?.api;
      if (!api) return;
      
      // Create proper bind target declarations
      const hpTarget = api.parseBindTarget('hp', context.file.path);
      const tempHpTarget = api.parseBindTarget('tmpHp', context.file.path);
      const hpModTarget = api.parseBindTarget('hpMod', context.file.path);
      const hpEditableTarget = api.parseBindTarget('hpEditable', context.file.path);
      
      // Get the current values
      const hpMod = api.getMetadata(hpModTarget) || 0;
      let tempHp = api.getMetadata(tempHpTarget) || 0;
      let hp = api.getMetadata(hpTarget) || 0;
      let remainingDamage = hpMod;
      
      // First apply damage to tempHp
      if (tempHp > 0) {
        if (tempHp >= remainingDamage) {
          tempHp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= tempHp;
          tempHp = 0;
        }
      }
      
      // Apply any remaining damage to hp
      if (remainingDamage > 0) {
        hp -= remainingDamage;
      }
      
      // Set tempHp to empty string if it's 0
      if (tempHp === 0) {
        tempHp = "";
      }
      
      // Update the values
      api.setMetadata(hpTarget, hp);
      api.setMetadata(tempHpTarget, tempHp);
      api.setMetadata(hpModTarget, 0);
      api.setMetadata(hpEditableTarget, false);
 ```
```meta-bind-button
style: default
label: "~"
class: mod-hp-button temp-hp
hidden: true
id: temp-hp
actions:
  - type: updateMetadata
    bindTarget: tmpHp
    evaluate: true
    value: "x ? x + getMetadata('hpMod') : getMetadata('hpMod')"
  - type: updateMetadata
    bindTarget: hpMod
    evaluate: false
    value: 0
  - type: updateMetadata
    bindTarget: hpEditable
    evaluate: false
    value: false
```