# The Project
**tl;dr**: This is a highly automated Pathfinder 1e character sheet solution which runs entirely in Obsidian. It is not complete. It probably never will be complete. It is 100% adaptable to your needs if you spend a bit of time.  

This is a **Pathfinder 1e** automated character sheet/VTT-style live-tracker designed to run in Obsidian. Specifically it is ”optimized” to run in the sidebar of the tablet version of Obsidian, alongside other notes. It should also run just fine (visually, at least) on mobile phones. Not much real testing has been done on that front, so YMMV.

First off, although the framework of the sheet is quite flexible, **this is not a complete representation of Pathfinder 1e.** I am supporting the characters I (or close friends) play. Although I will be doing my best to document usage here, and much of the “code” is at least somewhat commented, you will need to get your hands dirty. This will not work as an easy out of the box solution. It also may not be as hard as you think.

The code isn't bug free either

## “is”s and “Isn’t”s
### What this project is
- A working example of a fully functional and automated character sheet in Obsidian
- Hopefully an adaptive learning experience for those curious about complex coding projects in Obsidian.
- An example of _a lot_ of Meta Bind JS/JS Engine code. Like… A lot. If you’re wanting examples on Meta Binds API layer, its probably in here
- My way of giving back to the community, even if its not great.
- Actually, a very complete Pathfinder “Spellbook” spell manager for Obsidian. If anything is at least mostly _feature_ complete, it’s the spell section.

### What this project isn’t
- Complete. Pathfinder 1e has…. Entirely too many build features and exceptions and rules, and exceptions to the rules. I will not be writing support for those, at least at this time. It supports what it supports, and hopefully that’s helpful to someone looking to modify it.
- “Good code”. I’ve got like at least 3 different ways I’m doing things. Although there has been some attempts to clean up and make the code more consistent, it is far from complete. You’ll see just fully inline Meta Bind in some places, Meta Bind JS views with all the code living in the notes, and JS Engine views importing thousands of lines of external JavaScript. It all works, but it’s not pretty. I may clean this up overtime as to be more unified/clean up leftover LLM cruft, but I may never get to all of it.

# On AI
LLMs were used in the creation of this project. It was a "throw myself in the deep end and see what happens" kind of project, and LLMs were quite helpful for prototyping certain parts.

There is also lots of contributions from community members, and I would like to say that I learned a lot over the course of this, and put in real thought and effort.

Ultimately while I do own any mistakes or issues or bad code in the project, I am also presenting it as is. Just wanted to get that out of the way.

# Requirements:
Because I don't want to deal with keeping things up to date, or mess with people's download metrics, all external themes, css, plugins are **NOT** included, and must be installed manually.


### Theme
This character sheet is built around the ITS Pathfinder theme. Fonts and colors may look odd or broken if you don't. Of course, you're free to tweak the CSS however you want.

### Other CSS snippets
This character sheet relies heavily on @sailKite's Tabs for Obsidian CSS. 

### Plugins
All of these (except for Datacore) are available in the Community Plugin store. Datacore can be installed via BRAT, which is available in the Community Plugin store.
- Meta Bind 
	- **ENABLE JS EXECUTION IN SETTINGS**
- JS Engine
- Style Settings (to select ITS Pathfinder theme)
- BRAT (only for Datacore)
- Datacore (must install via BRAT at this point in time)

# Features/Functionality
####  **THE SHEET IS ONLY DESIGNED TO WORK IN READ MODE. DO NOT TRY TO USE IT IN LIVE PREVIEW**

The project is broken up into multiple sections, represented by tabs. Those sections are:

- **Adventuring**: Contains all your on the go stats you may need. AC, HP, attacks, limited resources, etc. It also contains a sub tab for an inventory. 
- **Skills**: List of your characters skills
- **Spells**: This sheet has a full "spell book", which runs out of the Spells tab. This offers support for spontaneous, prepared, and even hybrid casters. 
- **Reference**: Just a place to store any rules references you may want. Honestly the least polished tab of the sheet.
- **Adjustments**: Apply ongoing buffs and conditions (i.e. "Mage Armor" or "Blinded"), as well as having spots to adjust stats/attack/ac etc on the fly (for custom/on the fly buffs conditions or whatever)
- **Settings/Other**: Just anything else. Has ability scores, class levels, an XP tracker, any misc checkboxes.
  
There are also two additional/supplementary notes you may use:
- **MiniSheetConfig**: Mostly a catch all/frontmatter property dump, but allows you to select your character race, class(es), and edit skill points.
- **Spellbook**: If your character is a caster (or has SLAs), you define spell casting stuff here.
  
Other capabilities worth calling out:
- Character portrait as banner
- Familiar support (a separate sheet that you can link to the master, including resources that calculate off of the same shared pool).
- Full-ish inventory support. Supports adding items, filtering items, container support, etc.


## Adventuring
The Adventuring tab is divided up into two broad tabs, "Adventuring", and "Inventory".

### Adventuring
The Adventuring section is divided up into its own sections:

#### Defenses
##### AC Shield
Features:
- Displays current AC, and Touch/Flat Footed off to the side.
- Tapping/clicking the shield will change the side display to CMB/CMD.
  
Visually in the same part of the sheet, though maybe conceptually separate, any active buffs or conditions will show up here via two little clickable icons.

**Is it auto calculated?** Yes, although some work may be involved if your character has class abilities which modify AC. Bonuses from items will need to be added in, but have distinct existing properties (i.e. dodge bonus, etc). (see "Editing and Customization")

##### HP
Features:
- Tracks current HP (capped against Max)
- Tapping/clicking the "blood drop" will toggle to a display where you can edit HP. You may input a number and either add or subtract that from your current total.
- Temp HP is also supported.

**Is it auto calculated?** Yes, mostly. You'll still need to input your character's appropriate class hit die (see "Editing and Customization").

##### Energy Resistances
- Display of any energy resistances, with their amount and an icon to indicate the element.
- Supported types:
	- Fire
	- Cold
	- Lightning
	- Acid

**Is it auto calculated?** No. You'll need to manually edit frontmatter to get these to show up.

##### Speed/Movement
**Initiative value**. Is somewhat auto calculated off of dex. You will need to add any class or feat or whatever specific bonuses/penalties.

**Movement speed**: Base movement speed. It should auto populate from the race you select in the config. It can also be declared manually. _Does not currently support adjustments via buffs or penalties. That is coming soon._

##### Saves
Fort/Ref/Will displayed with icons.

Supports customizable tooltips to display any conditional information on hovering a save (i.e. +2 against death effects, Evasion etc).

**Is it auto calculated?** Yes, mostly. You'll still need to input your character's appropriate saves strengths (which saves are good or poor), as well as enter any manual adjustments. (see "Editing and Customization").


#### Resources
The next section of the Adventuring tab. Tracks limited use but renewable, non-spell resources, i.e. a Paladin's Lay on Hands, or an item with 1 use a day, etc. 

Has two tabs, one for "class" abilities, and one for items. This is a mostly arbitrary decision just to keep the Resources section from getting too long.

_NOTE: It is recommended that Wands not be tracked here. This section is intended for things that restore after a rest. There is Wand charge tracking in the inventory._

**Is it auto calculated?** Not really. You'll need to declare your own calculations for each resource pool, if you want them autocalculated. You'll also need to edit Javascript to change what resources get displayed, and edit CSS to get your labels showing up. (see "Editing and Customization").


#### Combat
Two sections.

##### Attacks
Displays collapsible blocks for all of your characters attacks. Once setup, will display number of attacks and their bonuses, as well as damage.

Support for multiple types of ranged attacks (i.e. Ray vs Light Crossbow) within the Ranged block, and unarmed strike.

**Is it auto calculated?** Adjustments are, setup isn't. Some basic stuff like Ray and Unarmed will be supported, but you'll need to declare any specific weapons yourself, and this will involve editing Javascript. However once you have a weapon declared, any buffs or penalties will be auto calculated. This includes attacks from BAB, extra attacks from buffs like Haste, size changes, etc. (as always, see "Editing and Customization").

##### Toggles
Any commonly used ability which you want to be able to turn on or off in combat. This includes stuff like Power Attack, Fight Defensively, Charge, etc, but can also support arbitrary controls for things like Smite Evil, etc.

_NOTE: Resource pools are not tied to toggles, so if you are using an ability with limited uses which also affects your attacks, you will need to both define those and interact with them separately. It's simply too much work otherwise._

**Is it auto calculated?** Basic combat actions are included outside of the box. Most class abilities you will need to add yourself, unless they happen to be one of the ones included in the example (see "Editing and Customization").


### Skills
Simple display of skills. Uses different icons and color coding to make the list a bit more readable (subjectively), and shows both total, and then break down of ranks vs stat, vs other.

Skill ranks can be edited from the **Config** note, but at this point individual skills which will show up are controlled entirely through YAML frontmatter.

Out of the box example shows conditional modification via a toggle button, for Versatile Performance.


### Spells
A very complete spell sheet/book, but still does require a small bit of setup and configuration.

Features:
- Supports all standard casting class types: Spontaneous, Prepared, Hybrid (i.e. Arcanist). (no Psychics)
- Has separate views for "Known" spells vs "Prepared" spells.
- Full browsable database of PF1e spells in Obsidian, which can be added to your "Known" spells.
- Metamagic support (actively updates display for spontaneous MM, prepares at adjusted level for prepared). _NOTE: currently you'll need to manually declare the Metamagic you have. I expect a way to do this without editing JS or YAML to come soon._
- Auto calculates casts and preparations per day based off of class and casting stat.
- Supports saving and loading of "Loadouts". I.e. you could have a set of prepared spells for combat, one for crafting, etc.

### Resources
A place to store any rules info you want to be able to reference quickly from in your character sheet. Pretty much arbitrary text entry, however you want. The example comes with some CSS for custom callouts, but I'll probably be entirely redesigning those sooner rather than later.


### Adjustments
Features:
- A Rest button which will restore HP and resources. _NOTE: any resources you want to renew on rest will need to be added to the Rest button_.
- Selectable lists of common Pathfinder Buffs and Conditions. Checking one of these off will auto adjust any stats, etc, and will show up as active in the Adventuring tab.
- Arbitrary/on the fly flat adjustments for attack, damage, and AC, as well as for every ability score.
- Ability drain/damage is also handled here.

### Settings
The catch all for everything else. 

Features:
- Automated XP tracker will track current XP and level breakpoints (currently programmed to medium track, wouldn't be hard to adjust)
- Edit ability scores
- Declare your class level. An editable input will show up for any class selected in the **Config** note.
- Any miscellaneous things that don't fit anywhere else that you think you may want to toggle, but maybe not every combat can go here.


# Editing and Customization

In a general sense, as stated above, this repository is an example character, and you will need to edit things to make it work for your character. I'll describe the basics of where each thing can be edited, but you will need to make your own changes, rename notes, etc.

## Components
There are theoretically two sets of components.
- Character specific (i.e. a characters specific attack calculations, etc). These are (by default) stored as the `components` sub-directory of a character folder (i.e. "Adarin" in this example). They're also all prefixed with the characters name (by convention, not enforced), so you'd want to edit that to your character's name.
- Global/universal: Stuff that is calculated the same way for every character. In practice, some of the things that can sometimes be global end up becoming character specific, so you may very well need to play around with this. These live in the `z_Components` folder. 

Components can either be a note with inline fields (i.e. almost every "tab" for the sheet is a component note, although some tabs are made up of multiple notes), or an external script. This will vary depending on area/feature.

## The Config Note
Much (but not all) of your character's information will be stored on their config note. Convention states that it is called `[CharacterName]MiniSheetConfig`. 

Mostly properties will get dumped here by various auto calculations, but the following things have UI to edit them as part of the Config note itself:
- Race
- Class(es)
- Skills (ranks/class only, does not have all knowledge/craft/profession skills populated by default).

## Customizing your character
COMING SOON

I'll fill this out more in the coming days, but for now I recommend just digging in and seeing if you can find the appropriate logic. The sheet itself makes extensive use of Meta Bind Embeds to keep the note from getting too outlandishly long. You can see the name of the embedded note if you view the main sheet note in Source Mode.

## License/OGL
Any included references to classes, races, etc, as well as the Spell rules and text belongs to their appropriate rights holders and is used under the OGL 1.0a.