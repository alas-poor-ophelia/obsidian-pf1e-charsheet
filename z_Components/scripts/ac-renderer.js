import './spellbook/types/types.js'; 

/**
* Responsible for rendering an AC display in a stylized shield display. Also
* calculates CMB and CMD (which can be accessed by tapping the shield).
* 
* Handles basic stat bonuses from Dex, etc. All class specific features would
* need to get programmed manually.
*
* Takes in bound data from a Meta Bind JS view rather than parsing bind targets manually.
*/

/**
 * @typedef {import('./spellbook/types/types.js').MetaBindAPI} MetaBindAPI
 * @typedef {import('./spellbook/types/types.js').Component} Component
 */
export class ACDisplayCalculator {
    /** @type {MetaBindAPI} */
    mb;
    /** @type {string} */
    filePath;
    
    /**
     * @param {MetaBindAPI} mb - Meta Bind API instance
     * @param {string} filePath - Path to the character file
     */
    constructor(mb, filePath) {
        this.mb = mb;
        this.filePath = filePath;
    }

    /**
     * Parse and calculate all AC values from bound data
     * @param {any} boundData - Character bound data
     * @returns {any} Calculated AC values
     */
    calculateACValues(boundData) {
        // Get the pre-calculated modifiers from memory
        let dexMod = boundData.dexMod || 0;
        const chaMod = boundData.chaMod || 0;
        const strMod = boundData.strMod || 0;
        const sizeMod = boundData.sizeMod || 0;

        // Handle conditionEffects - use empty object if undefined to prevent errors
        const conditionEffects = boundData.conditionEffects || {};

        const isDefendingWeaponSong = boundData.weaponSong == "Defending";
        const weaponSongBonus = isDefendingWeaponSong ? 1 : 0;

        // Calculate AC bonuses
        // All AC is added to a base of 10
        const baseAC = 10 + sizeMod + weaponSongBonus;
        const naturalAC = Number(boundData.naturalAC) || 0;
        const deflectionAC = Number(boundData.deflectionAC) || 0;
        const dodgeAC = Number(boundData.dodgeAC) || 0;

        // Scaled Fist Monk gets CHA bonus to AC when unarmored  
        const monkLvl = Number(boundData.monkLevel) || 0;
        let monkACBonus = monkLvl > 0 ? chaMod : 0;  

        // Monk gets +1 AC at level 4, and an additional +1 every 4 levels after  
        if (monkLvl >= 4) {  
            monkACBonus += 1 + Math.floor((monkLvl - 4) / 4);  
        }  

        // Calculate paladin AC bonus  
        // Virtuous Bravo gets a dodge bonus at level 3 that increases by 1 for every 4 levels  
        const paladinLvl = Number(boundData.paladinLevel) || 0;
        let paladinACBonus = 0;  
        if (paladinLvl >= 3) {  
            paladinACBonus += Math.floor((paladinLvl - 3) / 4) + 1;  
        }  

        // If we're hasted, that adds one to our AC
        const hastedACBonus = boundData.hasted ? 1 : 0;

        // If we're charging, our AC is lower
        const chargingACPenalty = boundData.charging ? -2 : 0;

        // Fighting defensively bonus  
        let fightingDefensivelyBonus = 0;  
        if (boundData.fightingDefensively) {  
            // Base defensive bonus is +2, increased by +1 with Crane Style  
            fightingDefensivelyBonus = 2;  
             
            if (boundData.craneStyle) {  
                fightingDefensivelyBonus += 1;  
            }  
             
            // Additional +1 with 3 ranks in Acrobatics  
            // Assuming character has 3 ranks in Acrobatics  
            fightingDefensivelyBonus += 1;  
        }

        // Handle losing dex to AC
        const loseDexToAC = conditionEffects.loseDexToAC || conditionEffects.flatFooted || false;
        if (loseDexToAC) {
            dexMod = 0; 
        }

        // AC adjustments - handle undefined conditionEffects properly
        // Separate calculations for different AC types to follow D&D rules
        const userAcAdjust = Number(boundData.acAdjust) || 0;
        const conditionAcAdjust = Number(conditionEffects.acAdjust) || 0;
        const conditionTouchAcAdjust = Number(conditionEffects.touchAcAdjust) || 0;
        const conditionFfAcAdjust = Number(conditionEffects.ffAcAdjust) || 0;
        
        // Normal AC: all adjustments
        const normalAcAdjust = userAcAdjust + chargingACPenalty + conditionAcAdjust;
        // Touch AC: only touch-specific adjustments (no armor/natural armor bonuses)
        const touchAcAdjust = userAcAdjust + chargingACPenalty + conditionTouchAcAdjust;
        // Flat-footed AC: armor and flat-footed specific adjustments
        const ffAcAdjust = userAcAdjust + chargingACPenalty + conditionFfAcAdjust;

        // AC calculations
        const normalAC = baseAC + dexMod + naturalAC + deflectionAC + monkACBonus + paladinACBonus + fightingDefensivelyBonus + dodgeAC + hastedACBonus + normalAcAdjust;
        const touchAC = baseAC + dexMod + deflectionAC + monkACBonus + paladinACBonus + fightingDefensivelyBonus + dodgeAC + hastedACBonus + touchAcAdjust;
        const flatFootedAC = baseAC + naturalAC + deflectionAC + monkACBonus + ffAcAdjust;

        // Calculate CMB/CMD
        const bab = boundData.bab || 0;
        // CMB = BAB + dex + size modifier + condition effects
        const cmb = bab + dexMod + sizeMod + (conditionEffects.cmb || 0);
        // CMD = 10 + BAB + STR + DEX + other AC bonuses that apply + condition effects
        const cmd = 10 + bab + strMod + dexMod + sizeMod + deflectionAC + monkACBonus + paladinACBonus + dodgeAC + (conditionEffects.cmd || 0);

        return {
            normalAC,
            touchAC,
            flatFootedAC,
            cmb,
            cmd,
            conditionEffects,
            // Include breakdown for debugging if needed
            breakdown: {
                dexMod, chaMod, strMod, sizeMod, monkLvl, paladinLvl, bab,
                baseAC, weaponSongBonus, naturalAC, deflectionAC, dodgeAC,
                monkACBonus, paladinACBonus, fightingDefensivelyBonus,
                hastedACBonus, chargingACPenalty, normalAcAdjust, touchAcAdjust, ffAcAdjust, loseDexToAC
            }
        };
    }

    /**
     * Create and render the AC display
     * @param {any} boundData - Character bound data
     * @param {HTMLElement} container - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderACDisplay(boundData, container, component) {
		container.empty();
        const calculations = this.calculateACValues(boundData);
        const showCMBCMD = boundData.showCMBCMD || false;

        // Create the main container with inline styling
        const acContainer = container.createDiv();
        acContainer.style.display = 'flex';
        acContainer.style.alignItems = 'center';
        acContainer.style.gap = '10px';

        try {
            if (showCMBCMD) {
                this.renderCMBCMDDisplay(calculations, acContainer, component);
            } else {
                this.renderTouchFFDisplay(calculations, acContainer, component);
            }

            // Add the toggle button in its own container
            this.renderToggleButton(acContainer, component);

        } catch (error) {
            console.error("Error creating AC display views:", /** @type {Error} */ (error).message);
            acContainer.createEl('span', { text: `Error: ${/** @type {Error} */ (error).message}` });
        }
    }

    /**
     * Render CMB/CMD display
     * @param {any} calculations - AC calculations
     * @param {HTMLElement} acContainer - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderCMBCMDDisplay(calculations, acContainer, component) {
        // Normal AC
        const normalACContainer = acContainer.createDiv();
        const normalACView = this.mb.createInlineFieldFromString(
            `VIEW[${calculations.normalAC}][text(class(normal-ac))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(normalACView, normalACContainer, component);
        
        // CMB
        const cmbContainer = acContainer.createDiv();
        const cmbView = this.mb.createInlineFieldFromString(
            `VIEW[${calculations.cmb}][text(class(cmb-display))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(cmbView, cmbContainer, component);
        
        // CMD
        const cmdContainer = acContainer.createDiv();
        const cmdView = this.mb.createInlineFieldFromString(
            `VIEW[${calculations.cmd}][text(class(cmd-display))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(cmdView, cmdContainer, component);
    }

    /**
     * Render Touch/Flat-Footed AC display
     * @param {any} calculations - AC calculations
     * @param {HTMLElement} acContainer - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderTouchFFDisplay(calculations, acContainer, component) {
        // Maybe show flatfooted indicator
        if (calculations.conditionEffects.flatFooted) {
            const flatFootedIndicatorContainer = acContainer.createDiv();
            const flatFootedIndicator = this.mb.createInlineFieldFromString(
                `VIEW[][text(class(flatFootedIndicator))]`,
                this.filePath,
                undefined
            );
            this.mb.wrapInMDRC(flatFootedIndicator, flatFootedIndicatorContainer, component);
        }
        
        // Normal AC
        const normalACContainer = acContainer.createDiv();
        const normalACView = this.mb.createInlineFieldFromString(
            `VIEW[${calculations.normalAC}][text(class(normal-ac))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(normalACView, normalACContainer, component);
        
        // Touch AC
        const touchACContainer = acContainer.createDiv();
        const touchACView = this.mb.createInlineFieldFromString(
            `VIEW[${calculations.touchAC}][text(class(touch-ac))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(touchACView, touchACContainer, component);
        
        // Flat-footed AC
        const flatFootedACContainer = acContainer.createDiv();
        const flatFootedACView = this.mb.createInlineFieldFromString(
            `VIEW[${calculations.flatFootedAC}][text(class(flatfooted-ac))]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(flatFootedACView, flatFootedACContainer, component);
    }

    /**
     * Render toggle button for switching between display modes
     * @param {HTMLElement} acContainer - Container element
     * @param {Component} component - Component for lifecycle
     */
    renderToggleButton(acContainer, component) {
        const toggleContainer = acContainer.createDiv();
        const toggleView = this.mb.createInlineFieldFromString(
            `INPUT[toggle(showcase, class(invisible-input)):showCMBCMD]`,
            this.filePath,
            undefined
        );
        this.mb.wrapInMDRC(toggleView, toggleContainer, component);
    }
}