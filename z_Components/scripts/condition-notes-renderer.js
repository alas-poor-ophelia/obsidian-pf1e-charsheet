import './spellbook/types/types.js'; 

/**
* Handles display of notes for active buffs or conditions, and the ability to remove it inline.
* 
* Will render the conditions or buffs UI dynamically depending on what is active. Tapping the appropriate toggle will open the note "modal", and tapping it again will 
* close it.
*/

/**
 * @typedef {import('./spellbook/types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('./spellbook/types/types.js').Component} Component
 * @typedef {import('./spellbook/types/types.js').ConditionEffects} ConditionEffects
 */
export class ConditionBuffRenderer {
    /** @type {MetaBindAPI} */
    mb;
    /** @type {string} */
    filePath;
    
    /**
     * @param {MetaBindAPI} mb - Meta Bind API instance
     * @param {string} filePath - Path to character file
     */
    constructor(mb, filePath) {
        this.mb = mb;
        this.filePath = filePath;
    }

    /**
     * Render conditions and buffs sections
     * @param {string[]} conditions - Active conditions
     * @param {string[]} buffs - Active buffs
     * @param {number} negativeLevels - Number of negative levels
     * @param {ConditionEffects} conditionEffects - Calculated effects
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderConditionsAndBuffs(conditions, buffs, negativeLevels, conditionEffects, container, component) {
        const hasConditions = conditions && conditions.length !== 0 || negativeLevels;
        const hasBuffs = buffs && buffs.length !== 0;

        if (hasConditions) {
            this.renderConditionsSection(conditions, conditionEffects, container, component);
        }

        if (hasBuffs) {
            this.renderBuffsSection(buffs, conditionEffects, container, component);
        }
    }

    /**
     * Render conditions section
     * @param {string[]} conditions - Active conditions
     * @param {ConditionEffects} conditionEffects - Calculated effects
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderConditionsSection(conditions, conditionEffects, container, component) {
        // Create the condition section
        const conditionSection = container.createDiv();
        conditionSection.style.marginBottom = '10px';
        
        // Create header with toggle
        const conditionHeader = conditionSection.createDiv();
        conditionHeader.style.display = 'flex';
        conditionHeader.style.alignItems = 'center';
        conditionHeader.style.gap = '5px';
        conditionHeader.style.marginBottom = '5px';
        
        // Condition toggle
        const conditionToggle = this.mb.createInlineFieldFromString(
            "INPUT[toggle(class(condition-icon))]",
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(conditionToggle, conditionHeader, component);
        
        // Create container for all condition notes with proper CSS class
        const conditionNotesContainer = conditionSection.createDiv();
        conditionNotesContainer.classList.add('condition-notes');
        
        // Get the actual condition notes content
        const conditionNotes = conditionEffects?.conditionNotes || '';
        console.log('Condition notes content:', conditionNotes);
        
        if (conditionNotes && conditions && conditions.length > 0) {
            this.renderNoteItems(conditionNotes, conditions, conditionNotesContainer, component, 'condition');
        }
        
        this.addConditionStyles(container);
    }

    /**
     * Render buffs section
     * @param {string[]} buffs - Active buffs
     * @param {ConditionEffects} conditionEffects - Calculated effects
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderBuffsSection(buffs, conditionEffects, container, component) {
        // Create the buff section
        const buffSection = container.createDiv();
        buffSection.style.marginBottom = '10px';
        
        // Create header with toggle
        const buffHeader = buffSection.createDiv();
        buffHeader.style.display = 'flex';
        buffHeader.style.alignItems = 'center';
        buffHeader.style.gap = '5px';
        buffHeader.style.marginBottom = '5px';
        
        // Buff toggle
        const buffToggle = this.mb.createInlineFieldFromString(
            "INPUT[toggle(class(buff-icon))]",
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(buffToggle, buffHeader, component);
        
        // Create container for all buff notes with proper CSS class
        const buffNotesContainer = buffSection.createDiv();
        buffNotesContainer.classList.add('buff-notes');
        
        // Get the actual buff notes content
        const buffNotes = conditionEffects?.buffNotes || '';
        console.log('Buff notes content:', buffNotes);
        
        if (buffNotes && buffs && buffs.length > 0) {
            this.renderNoteItems(buffNotes, buffs, buffNotesContainer, component, 'buff');
        }
        
        this.addBuffStyles(container);
    }

    renderNoteItems(/** @type {string} */ notesContent, /** @type {string[]} */ itemArray, /** @type {HTMLElement} */ notesContainer, /** @type {Component} */ component, /** @type {string} */ type) {
        // Split by top-level bullet points but keep the original formatting
        const noteItems = this.parseNotes(/** @type {string} */ notesContent);
        
        console.log(`Parsed ${type} items:`, noteItems);
        console.log(`${type} array:`, itemArray);
        
        // Create individual items for each note, with remove buttons based on item array
        for (let i = 0; i < noteItems.length && i < itemArray.length; i++) {
            const noteText = noteItems[i];
            const item = itemArray[i];
            console.log(`Creating item ${i}: noteText="${noteText}", ${type}="${item}"`);
            console.log(noteText);
            
            this.renderSingleNoteItem(noteText, i, notesContainer, component, type);
        }
    }

    parseNotes(/** @type {string} */ notesContent) {
        const noteItems = [];
        const lines = notesContent.split('\n');
        let currentItem = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Check if this is a top-level bullet (starts with - and minimal leading whitespace)
            if (trimmedLine.startsWith('- ') && line.match(/^\s{0,2}- /)) {
                // Save previous item if it exists
                if (currentItem.trim()) {
                    noteItems.push(currentItem.trim());
                }
                // Start new item (keep the full line including the bullet)
                currentItem = line;
            } else if (line.trim() || currentItem) {
                // Add continuation line to current item (including empty lines and nested content)
                if (currentItem) {
                    currentItem += '\n' + line;
                }
            }
        }
        // Don't forget the last item
        if (currentItem.trim()) {
            noteItems.push(currentItem.trim());
        }
        
        return noteItems;
    }

    renderSingleNoteItem(/** @type {string} */ noteText, /** @type {number} */ index, /** @type {HTMLElement} */ notesContainer, /** @type {Component} */ component, /** @type {string} */ type) {
        const itemContainer = notesContainer.createDiv();
        itemContainer.style.display = 'flex';
        itemContainer.style.alignItems = 'flex-start'; // Changed to flex-start for multi-line content
        itemContainer.style.gap = '5px';
        itemContainer.style.marginBottom = '3px';
        
        // Create remove button
        const removeButtonConfig = {
            label: `✕`,
            id: `remove-${type}-${index}`,
            class: 'remove-condition-button',
            style: "destructive",
            action: {
                type: "updateMetadata",
                bindTarget: type === 'condition' ? "conditions" : "buffs",
                evaluate: true,
                value: `x.filter((_, index) => index !== ${index})`
            }
        };
        
        const removeBtn = this.mb.createButtonMountable(this.filePath, {
            declaration: removeButtonConfig,
            isPreview: false,
        });
        const btnHTML = this.mb.wrapInMDRC(removeBtn, itemContainer, component);
        if (btnHTML?.containerEl) {
            btnHTML.containerEl.style.setProperty("display", "flex", "important");
        }
        
        // Create a container for the markdown-rendered note
        const noteContainer = itemContainer.createDiv();
        noteContainer.style.flex = '1';
        
        // Create a Meta Bind VIEW for this specific note with markdown rendering and inline display
        const noteView = this.mb.createInlineFieldFromString(
            `VIEW[${noteText}][text(renderMarkdown, class(inline-${type}-note))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(noteView, noteContainer, component);
        
        console.log(`created markdown view for ${noteText}`);
    }

    addConditionStyles(/** @type {HTMLElement} */ container) {
        const conditionStyleEl = document.createElement("style");
        const conditionStyle = document.createTextNode(`.inline-condition-note > ul {
            margin-top: 0;
        }`);
        conditionStyleEl.appendChild(conditionStyle);
        container.appendChild(conditionStyleEl);
    }

    addBuffStyles(/** @type {HTMLElement} */ container) {
        const styleEl = document.createElement("style");
        const style = document.createTextNode(`.inline-buff-note > ul {
            margin-top: 0;
        }`);
        styleEl.appendChild(style);
        container.appendChild(styleEl);
    }
}