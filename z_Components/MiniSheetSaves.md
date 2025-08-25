```meta-bind-js-view
{AdarinMiniSheetConfig#conMod} as conMod
{AdarinMiniSheetConfig#dexMod} as dexMod
{AdarinMiniSheetConfig#wisMod} as wisMod
{AdarinMiniSheetConfig#chaMod} as chaMod
{monkunchainedLevel} as monkLevel
{paladinLevel} as paladinLevel
{skaldLevel} as skaldLevel
{resistanceEnhancement} as resistanceEnhancement
{conditionEffects} as conditionEffects
save to {AdarinMiniSheetConfig#saves}
hidden
---
// Get ability modifiers from memory
const conMod = context.bound.conMod || 0;
const dexMod = context.bound.dexMod || 0;
const wisMod = context.bound.wisMod || 0;
const chaMod = context.bound.chaMod || 0;

const conditionEffects = context.bound.conditionEffects || { fortAdjust: 0, refAdjust: 0, willAdjust: 0 };

// Parse class levels
const monkLevel = parseInt(context.bound.monkLevel) || 0;
const paladinLevel = parseInt(context.bound.paladinLevel) || 0;
const skaldLevel = parseInt(context.bound.skaldLevel) || 0;

// Get resistance enhancement bonus
const resistanceEnhancement = parseInt(context.bound.resistanceEnhancement) || 0;

// Helper function to calculate base save bonus by level and progression type
const calcBaseSave = (level, isGood) => {
  if (level === 0) return 0;
  
  // Good saves start at +2 for level 1 and increase by 1 every 2 levels
  // Poor saves start at 0 for level 1 and increase by 1 every 3 levels
  if (isGood) {
    return 2 + Math.floor(level / 2);
  } else {
    return Math.floor(level / 3);
  }
};

// Calculate base save bonuses for each class
// Monk: Good Fort and Ref, Poor Will
const monkFort = calcBaseSave(monkLevel, true);
const monkRef = calcBaseSave(monkLevel, true);
const monkWill = calcBaseSave(monkLevel, false);
// Paladin: Good Fort and Will, Poor Ref
const paladinFort = calcBaseSave(paladinLevel, true);
const paladinRef = calcBaseSave(paladinLevel, false);
const paladinWill = calcBaseSave(paladinLevel, true);

// Skald: Good Fort and Will, Poor Ref
const skaldFort = calcBaseSave(skaldLevel, true);
const skaldRef = calcBaseSave(skaldLevel, false);
const skaldWill = calcBaseSave(skaldLevel, true);

// Calculate total base save bonuses
const baseFort = monkFort + paladinFort + skaldFort;
const baseRef = monkRef + paladinRef + skaldRef;
const baseWill = monkWill + paladinWill + skaldWill;

// Add Divine Grace bonus if character has Paladin levels (adds Cha mod to all saves)
const divineGraceBonus = paladinLevel > 0 ? chaMod : 0;

// Calculate final save values
const fortSave = baseFort + conMod + divineGraceBonus + resistanceEnhancement + (conditionEffects.fortAdjust || 0);
const refSave = baseRef + dexMod + divineGraceBonus + resistanceEnhancement + (conditionEffects.refAdjust || 0);
const willSave = baseWill + wisMod + divineGraceBonus + resistanceEnhancement + (conditionEffects.willAdjust || 0);

// Create notes as arrays for each save
const feyFoundlingNote = "- +2 against death effects";
const fortSaveNotesArray = [feyFoundlingNote];
const refSaveNotesArray = [feyFoundlingNote, "- Evasion"];
const willSaveNotesArray = [feyFoundlingNote];

// Create the object to store in memory
const saves = {
  fort: {
    value: fortSave,
    notes: fortSaveNotesArray.join('\n')
  },
  ref: {
    value: refSave,
    notes: refSaveNotesArray.join('\n')
  },
  will: {
    value: willSave,
    notes: willSaveNotesArray.join('\n')
  }
};

// Return the object to be stored in memory
return saves;
```

`VIEW[{AdarinMiniSheetConfig#saves.fort.value}][text(class(fort-save))]` `VIEW[{AdarinMiniSheetConfig#saves.fort.notes}][text(renderMarkdown, class(save-note fort))]`  `VIEW[{AdarinMiniSheetConfig#saves.ref.value}][text(class(ref-save))]` `VIEW[{AdarinMiniSheetConfig#saves.ref.notes}][text(renderMarkdown, class(save-note ref))]` `VIEW[{AdarinMiniSheetConfig#saves.will.value}][text(class(will-save))]` `VIEW[{AdarinMiniSheetConfig#saves.will.notes}][text(renderMarkdown, class(save-note will))]`