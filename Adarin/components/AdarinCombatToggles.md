---
preciseStrike: true
smiteEvil: false
smiteEvilOutsider: false
doublePreciseStrike: false
flurryOfBlows: false
powerAttack: false
---
||||||
|:---:|:---:|:---:|:---:|
| Risky Strike: `INPUT[toggle(class(combat-toggle risky-strike)):powerAttack]` | Fight Defensively: `INPUT[toggle(class(combat-toggle fight-defensively)):fightingDefensively]` |Charge`INPUT[toggle(class(combat-toggle charging)):charging]`  | Flanking: `INPUT[toggle(class(combat-toggle flanking)):flanking]`| 
| Flurry: `INPUT[toggle(class(combat-toggle flurry)):flurryOfBlows]`|Weapon Song: `INPUT[inlineSelect(class(combat-toggle weapon-song-ct), option(Off), option(Enhancement), option(Defending), option(Distance), option(Flaming), option(Frost), option(Ghost Touch), option(Keen), option(Mighty Cleaving), option(Returning), option(Shock), option(Seeking)):weaponSong]` |`INPUT[toggle(class(prec-str invisible)):preciseStrike]` `INPUT[toggle(class(prec-str-double invisible)):doublePreciseStrike]` `BUTTON[precise-strike, precise-double, precise-off]` | `INPUT[toggle(class(smite invisible)):smiteEvil]` `INPUT[toggle(class(smite-double invisible)):smiteEvilOutsider]` `BUTTON[smite, smite-outsider, smite-off]` |

 ```meta-bind-button
 style: default
 label: Smite
 id: smite
 class: combat-toggle smite-evil
 hidden: true
 action:
     type: updateMetadata
     bindTarget: smiteEvil
     evaluate: true
     value: true
 ```
 ```meta-bind-button
 style: default
 label: Smite (2x)
 id: smite-outsider 
 class: combat-toggle smite-outsider
 hidden: true
 action:
     type: updateMetadata
     bindTarget: smiteEvilOutsider
     evaluate: true
     value: true
 ```
 ```meta-bind-button
 style: default
 label: Smite Off
 id: smite-off
 class: combat-toggle smite-off
 hidden: true
 actions:
     - type: updateMetadata
       bindTarget: smiteEvil
       evaluate: true
       value: false
     - type: updateMetadata
       bindTarget: smiteEvilOutsider
       evaluate: true
       value: false
 ```
```meta-bind-button
style: default
label: Precise Strike
id: precise-strike
class: combat-toggle precise-strike
hidden: true
action:
    type: updateMetadata
    bindTarget: preciseStrike
    evaluate: true
    value: true
```
```meta-bind-button
style: default
label: Smite (2x)
id: precise-double
class: combat-toggle precise-double
hidden: true
action:
    type: updateMetadata
    bindTarget: doublePreciseStrike
    evaluate: true
    value: true
```
```meta-bind-button
style: default
label: Precise Off
id: precise-off
class: combat-toggle precise-off
hidden: true
actions:
    - type: updateMetadata
      bindTarget: preciseStrike
      evaluate: true
      value: false
    - type: updateMetadata
      bindTarget: doublePreciseStrike
      evaluate: true
      value: false
```