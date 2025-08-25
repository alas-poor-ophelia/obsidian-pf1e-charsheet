import { SPELL_LINK_BEHAVIORS } from '../utils/spell-link-handler.js';

/**
 * Modal for prompting user to enter loadout name and description
 * Uses Obsidian's Modal API for native integration
 */
class LoadoutNameModal {
    constructor(onSubmit, existingLoadouts = [], editingLoadout = null) {
        this.onSubmit = onSubmit;
        this.existingLoadouts = existingLoadouts;
        this.editingLoadout = editingLoadout;
        this.result = { 
            name: editingLoadout?.name || '', 
            description: editingLoadout?.description || '' 
        };
        this.modal = null;
    }

    open() {
        // Create modal using Obsidian's API
        this.modal = new (window.app.constructor.Modal || class {
            constructor(app) {
                this.app = app;
                this.containerEl = document.createElement('div');
                this.containerEl.className = 'modal-container loadout-modal-container';
                this.contentEl = document.createElement('div');
                this.contentEl.className = 'modal-content loadout-name-modal';
                this.containerEl.appendChild(this.contentEl);
                
                // Add backdrop
                this.backdrop = document.createElement('div');
                this.backdrop.className = 'modal-backdrop loadout-modal-backdrop';
                this.backdrop.addEventListener('click', () => this.close());
                
                // ESC key handling
                this.onKeyDown = (e) => {
                    if (e.key === 'Escape') this.close();
                };
            }
            
            open() {
                document.body.appendChild(this.backdrop);
                document.body.appendChild(this.containerEl);
                document.addEventListener('keydown', this.onKeyDown);
                this.onOpen();
                return this;
            }
            
            close() {
                if (this.containerEl.parentNode) {
                    this.containerEl.parentNode.removeChild(this.containerEl);
                }
                if (this.backdrop.parentNode) {
                    this.backdrop.parentNode.removeChild(this.backdrop);
                }
                document.removeEventListener('keydown', this.onKeyDown);
                this.onClose();
            }
            
            onOpen() {}
            onClose() {}
        })(window.app);

        // Override onOpen to build our form
        this.modal.onOpen = () => {
            this._buildModalContent();
        };

        this.modal.onClose = () => {
            // Clean up any resources if needed
        };

        return this.modal.open();
    }

    _buildModalContent() {
        const { contentEl } = this.modal;
        contentEl.empty();

        // Modal title
        const title = contentEl.createEl('h2', { 
            text: this.editingLoadout ? 'Edit Loadout' : 'Save Loadout',
            cls: 'modal-title'
        });

        // Name input section
        const nameSection = contentEl.createDiv('loadout-input-section');
        nameSection.createEl('label', { 
            text: 'Loadout Name *', 
            cls: 'loadout-input-label' 
        });
        
        const nameInput = nameSection.createEl('input', {
            type: 'text',
            placeholder: 'Enter loadout name...',
            value: this.result.name,
            cls: 'loadout-name-input'
        });

        const nameError = nameSection.createDiv('loadout-input-error');
        nameError.style.display = 'none';

        // Description input section
        const descSection = contentEl.createDiv('loadout-input-section');
        descSection.createEl('label', { 
            text: 'Description (optional)', 
            cls: 'loadout-input-label' 
        });
        
        const descInput = descSection.createEl('textarea', {
            placeholder: 'Enter loadout description...',
            value: this.result.description,
            cls: 'loadout-description-input'
        });
        descInput.rows = 3;

        // Conflict warning section (hidden by default)
        const conflictSection = contentEl.createDiv('loadout-conflict-section');
        conflictSection.style.display = 'none';

        // Button section
        const buttonSection = contentEl.createDiv('loadout-button-section');
        
        const cancelBtn = buttonSection.createEl('button', {
            text: 'Cancel',
            cls: 'loadout-btn loadout-btn-cancel'
        });

        const saveBtn = buttonSection.createEl('button', {
            text: this.editingLoadout ? 'Update' : 'Save',
            cls: 'loadout-btn loadout-btn-save'
        });

        // Event handlers
        nameInput.addEventListener('input', () => {
            this.result.name = nameInput.value.trim();
            this._validateAndUpdateUI(nameInput, nameError, conflictSection, saveBtn);
        });

        descInput.addEventListener('input', () => {
            this.result.description = descInput.value.trim();
        });

        cancelBtn.addEventListener('click', () => {
            this.modal.close();
            this.onSubmit(null); // Signal cancellation
        });

        saveBtn.addEventListener('click', () => {
            if (this._validateForm(nameInput, nameError)) {
                this.modal.close();
                this.onSubmit(this.result);
            }
        });

        // Enter key submission
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this._validateForm(nameInput, nameError)) {
                this.modal.close();
                this.onSubmit(this.result);
            }
        });

        // Focus name input
        setTimeout(() => nameInput.focus(), 50);

        // Initial validation
        this._validateAndUpdateUI(nameInput, nameError, conflictSection, saveBtn);
    }

    _validateAndUpdateUI(nameInput, nameError, conflictSection, saveBtn) {
        const validation = this._validateName(this.result.name);
        
        nameError.style.display = validation.error ? 'block' : 'none';
        nameError.textContent = validation.error || '';
        
        conflictSection.style.display = validation.conflict ? 'block' : 'none';
        if (validation.conflict) {
            this._showConflictWarning(conflictSection, validation.existingLoadout);
        }
        
        saveBtn.disabled = !validation.valid;
        nameInput.classList.toggle('error', !!validation.error);
    }

    _validateForm(nameInput, nameError) {
        const validation = this._validateName(this.result.name);
        
        if (!validation.valid) {
            nameError.style.display = 'block';
            nameError.textContent = validation.error;
            nameInput.classList.add('error');
            nameInput.focus();
            return false;
        }
        
        return true;
    }

    _validateName(name) {
        if (!name || name.length === 0) {
            return { valid: false, error: 'Loadout name is required' };
        }
        
        if (name.length > 50) {
            return { valid: false, error: 'Loadout name cannot exceed 50 characters' };
        }
        
        // Check for conflict (but allow editing existing loadout with same name)
        const existing = this.existingLoadouts.find(l => l.name === name);
        if (existing && (!this.editingLoadout || this.editingLoadout.name !== name)) {
            return { 
                valid: true, 
                conflict: true, 
                existingLoadout: existing 
            };
        }
        
        return { valid: true };
    }

    _showConflictWarning(conflictSection, existingLoadout) {
        conflictSection.innerHTML = '';
        
        const warning = conflictSection.createDiv('loadout-conflict-warning');
        warning.createEl('strong', { text: '⚠️ Name Conflict' });
        
        const message = warning.createDiv();
        message.innerHTML = `A loadout named "<strong>${existingLoadout.name}</strong>" already exists. Saving will overwrite the existing loadout.`;
        
        if (existingLoadout.description) {
            const desc = warning.createDiv('conflict-existing-desc');
            desc.innerHTML = `<em>Existing description:</em> ${existingLoadout.description}`;
        }
    }
}

/**
 * ConfigManager: Handles gear icon creation, flyout menu toggle, and lifecycle management for spellbook config UI.
 * Follows the SLAManager pattern for event and resource cleanup.
 */


/**
 * @typedef {object} RendererWithContainer
 * @property {HTMLElement} container
 */

/**
 * @typedef {object} LoadoutData
 * @property {string} name
 * @property {string} [description]
 * @property {string} [createdDate]
 * @property {string} [lastUsed]
 * @property {SpellPreparations} spellPreparations
 */

/**
 * @typedef {object} SpellPreparations
 * @property {Array<any>} level0
 * @property {Array<any>} level1
 * @property {Array<any>} level2
 * @property {Array<any>} level3
 * @property {Array<any>} level4
 * @property {Array<any>} level5
 * @property {Array<any>} level6
 * @property {Array<any>} level7
 * @property {Array<any>} level8
 * @property {Array<any>} level9
 * @property {Array<any>} sla
 */

/**
 * @typedef {object} SpellLevelSettings
 * @property {any} level0
 * @property {any} level1
 * @property {any} level2
 * @property {any} level3
 * @property {any} level4
 * @property {any} level5
 * @property {any} level6
 * @property {any} level7
 * @property {any} level8
 * @property {any} level9
 * @property {string} [selectedGlobalMetamagic]
 * @property {Array<string>} [globalActiveMetamagics]
 */

/**
 * @typedef {object} SpellbookMetadata
 * @property {SpellPreparations} spellPreparations
 * @property {SpellLevelSettings} spellLevelSettings
 * @property {Array<LoadoutData>} [loadouts]
 */

export class ConfigManager {
    /**
     * @param {import('../core/spellbook.js').SpellbookRenderer} renderer - The renderer instance
     */
    constructor(renderer) {
        /**
         * @type {import('../core/spellbook.js').SpellbookRenderer}
         */
        this.renderer = renderer;
        /** @type {HTMLElement|null} */
        this.gearIcon = null;
        /** @type {HTMLElement|null} */
        this.flyoutMenu = null;
        /** @type {HTMLElement|null} */
        this._container = null;
        this._boundToggleMenu = this.toggleMenu.bind(this);
        this._boundClickOutside = this.handleClickOutside.bind(this);
        this._isMenuOpen = false;
        this._disposables = new Set();
        this._renderComponent = null;
    }

    /**
     * Set the render component for Meta Bind usage
     * @param {import('../types/types.js').Component} component - The component from renderConfigView
     */
    setRenderComponent(component) {
        this._renderComponent = component;
    }

    /**
     * Create the gear icon and attach click handler
     * @param {HTMLElement} container - The container to append the gear icon to
     */
    createGearIcon(container) {
        this._container = container;
        this.gearIcon = document.createElement('span');
        this.gearIcon.className = 'config-gear-icon';
        this.gearIcon.title = 'Open config menu';
        this.gearIcon.innerHTML = '⚙️';
        this.gearIcon.addEventListener('click', this._boundToggleMenu);
        if (this.gearIcon) {
            this._disposables.add(() => this.gearIcon && this.gearIcon.removeEventListener('click', this._boundToggleMenu));
        }
        // Append to the container so it's positioned relative to the spellbook
        container.appendChild(this.gearIcon);
    }

    /**
     * Toggle the flyout menu
     */
    toggleMenu() {
        if (this._isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open the flyout menu and set up click-outside handler
     */
    openMenu() {
        const container = this._container;
        if (!this.flyoutMenu) {
            this.flyoutMenu = document.createElement('div');
            this.flyoutMenu.className = 'config-flyout-menu';
            // Navigation button
            const renderer = this.renderer;
            const uiFactory = renderer && renderer.uiFactory;
            const spellLinkHandler = renderer && renderer.spellLinkHandler;
            const spellbookPath = renderer && (renderer.spellbookNotePath || (renderer.spellbookFile && renderer.spellbookFile.path));
            if (uiFactory && typeof uiFactory.createSpellbookNavigationButton === 'function') {
                const navBtn = uiFactory.createSpellbookNavigationButton(async () => {
                    if (spellbookPath && spellLinkHandler) {
                        // Use the SpellLinkHandler's new public method to open spellbook in main pane
                        await spellLinkHandler.openFileWithBehavior(spellbookPath, SPELL_LINK_BEHAVIORS.MAIN_PANE);
                    }
                    this.closeMenu();
                });
                this.flyoutMenu.appendChild(navBtn);
            }

            // Add separator
            const separator = document.createElement('div');
            separator.className = 'config-menu-separator';
            this.flyoutMenu.appendChild(separator);

            // Save loadout button
            if (uiFactory && typeof uiFactory.createSaveLoadoutButton === 'function') {
                const saveBtn = uiFactory.createSaveLoadoutButton(async () => {
                    this.closeMenu();
                    await this.saveLoadoutWithPrompt();
                });
                this.flyoutMenu.appendChild(saveBtn);
            }

            // Create loadout selector and load button section
            this._createLoadoutSection(uiFactory);
            (container || document.body).appendChild(this.flyoutMenu);
        }
        if (this.flyoutMenu) {
            this.flyoutMenu.classList.add('open');
        }
        document.addEventListener('mousedown', this._boundClickOutside);
        this._disposables.add(() => document.removeEventListener('mousedown', this._boundClickOutside));
        this._isMenuOpen = true;
    }

    /**
     * Close the flyout menu and remove click-outside handler
     */
    closeMenu() {
        if (this.flyoutMenu) {
            this.flyoutMenu.classList.remove('open');
        }
        document.removeEventListener('mousedown', this._boundClickOutside);
        this._isMenuOpen = false;
    }

    /**
     * Handle click outside the menu to close it
     */
    /**
     * @param {MouseEvent} event
     */
    handleClickOutside(event) {
        const targetNode = event.target;
        if (
            this.flyoutMenu &&
            targetNode &&
            !this.flyoutMenu.contains(targetNode) &&
            this.gearIcon &&
            !this.gearIcon.contains(targetNode)
        ) {
            this.closeMenu();
        }
    }

    /**
     * Save current spell preparations and settings as a loadout
     * @param {string} name - The name for the loadout
     * @param {string} [description] - Optional description
     * @returns {Promise<boolean>} - Success status
     */
    async saveLoadout(name, description = '') {
        try {
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                throw new Error('Loadout name is required and must be a non-empty string');
            }

            const trimmedName = name.trim();
            if (trimmedName.length > 50) {
                throw new Error('Loadout name cannot exceed 50 characters');
            }

            // Get current spell preparations
            const currentPreparations = await this._getCurrentSpellPreparations();

            if (!currentPreparations) {
                throw new Error('Unable to retrieve current spell preparations');
            }

            // Create loadout object
            const loadout = {
                name: trimmedName,
                description: description.trim().substring(0, 200),
                createdDate: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                spellPreparations: currentPreparations
            };

            // Get existing loadouts or create new array
            const existingLoadouts = await this.getAvailableLoadouts();
            
            // Check for duplicate names and handle accordingly
            const existingIndex = existingLoadouts.findIndex(l => l.name === trimmedName);
            
            if (existingIndex >= 0) {
                // Replace existing loadout
                existingLoadouts[existingIndex] = loadout;
            } else {
                // Add new loadout
                existingLoadouts.push(loadout);
            }

            // Save to YAML
            await this._saveLoadoutsToYAML(existingLoadouts);
            
            return true;
        } catch (error) {
            console.error('Error saving loadout:', error);
            return false;
        }
    }

    /**
     * Load a saved loadout and apply it to current spell preparations
     * @param {string} name - The name of the loadout to load
     * @returns {Promise<boolean>} - Success status
     */
    async loadLoadout(name) {
        try {
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                throw new Error('Loadout name is required');
            }

            const loadouts = await this.getAvailableLoadouts();
            const loadout = loadouts.find(l => l.name === name.trim());

            if (!loadout) {
                throw new Error(`Loadout '${name}' not found`);
            }

            // Validate loadout structure
            if (!this._validateLoadoutData(loadout)) {
                throw new Error(`Loadout '${name}' has invalid or corrupted data`);
            }

            // Apply loadout to current spellbook
            await this._applyLoadoutToSpellbook(loadout);

            // Update last used timestamp
            loadout.lastUsed = new Date().toISOString();
            await this._saveLoadoutsToYAML(loadouts);

            // Trigger spellbook re-render
            if (this.renderer && typeof this.renderer.refresh === 'function') {
                await this.renderer.refresh();
            }

            return true;
        } catch (error) {
            console.error('Error loading loadout:', error);
            return false;
        }
    }

    /**
     * Get all available loadouts
     * @returns {Promise<Array<LoadoutData>>} - Array of loadout objects
     */
    async getAvailableLoadouts() {
        try {
            const metadata = await this._getSpellbookMetadata();
            return metadata.loadouts || [];
        } catch (error) {
            console.error('Error getting available loadouts:', error);
            return [];
        }
    }

    /**
     * Delete a loadout by name
     * @param {string} name - The name of the loadout to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deleteLoadout(name) {
        try {
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                throw new Error('Loadout name is required');
            }

            const loadouts = await this.getAvailableLoadouts();
            const filteredLoadouts = loadouts.filter(l => l.name !== name.trim());

            if (filteredLoadouts.length === loadouts.length) {
                throw new Error(`Loadout '${name}' not found`);
            }

            await this._saveLoadoutsToYAML(filteredLoadouts);
            
            // Clear selected loadout if it was deleted
            const currentSelection = await this.getSelectedLoadout();
            if (currentSelection === name.trim()) {
                await this.setSelectedLoadout(null);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting loadout:', error);
            return false;
        }
    }

    /**
     * Get the currently selected loadout name from YAML
     * @returns {Promise<string|null>} - The selected loadout name or null if none selected
     */
    async getSelectedLoadout() {
        try {
            if (!this.renderer || !this.renderer.metadataManager) {
                return null;
            }

            const metadataManager = this.renderer.metadataManager;
            const spellbookPath = this.renderer.spellbookNotePath || (this.renderer.spellbookFile && this.renderer.spellbookFile.path);
            
            if (!spellbookPath) {
                return null;
            }

            const target = metadataManager.mb.parseBindTarget('selectedLoadout', spellbookPath);
            const selectedLoadout = await metadataManager.mb.getMetadata(target);
            
            // Return null if empty string or null/undefined
            return selectedLoadout && selectedLoadout.trim().length > 0 ? selectedLoadout.trim() : null;
        } catch (error) {
            // Field might not exist yet, that's ok
            return null;
        }
    }

    /**
     * Set the selected loadout in YAML and validate it exists
     * @param {string|null} loadoutName - The loadout name to select, or null to clear selection
     * @returns {Promise<boolean>} - True if selection was successful, false if loadout doesn't exist
     */
    async setSelectedLoadout(loadoutName) {
        try {
            if (!this.renderer || !this.renderer.metadataManager) {
                console.error('Renderer or metadata manager not available');
                return false;
            }

            const metadataManager = this.renderer.metadataManager;
            const spellbookPath = this.renderer.spellbookNotePath || (this.renderer.spellbookFile && this.renderer.spellbookFile.path);
            
            if (!spellbookPath) {
                console.error('Spellbook file path not available');
                return false;
            }

            // Handle null/empty values
            if (loadoutName === null || loadoutName === '') {
                const target = metadataManager.mb.parseBindTarget('selectedLoadout', spellbookPath);
                await metadataManager.mb.setMetadata(target, '');
                return true;
            }

            if (typeof loadoutName !== 'string') {
                console.error('Selected loadout name must be a string or null');
                return false;
            }

            const trimmedName = loadoutName.trim();
            if (trimmedName.length === 0) {
                const target = metadataManager.mb.parseBindTarget('selectedLoadout', spellbookPath);
                await metadataManager.mb.setMetadata(target, '');
                return true;
            }

            // Validate that the loadout exists
            const availableLoadouts = await this.getAvailableLoadouts();
            const loadoutExists = availableLoadouts.some(l => l.name === trimmedName);

            if (!loadoutExists) {
                console.error(`Cannot select loadout '${trimmedName}': loadout not found`);
                return false;
            }

            // Set in YAML
            const target = metadataManager.mb.parseBindTarget('selectedLoadout', spellbookPath);
            await metadataManager.mb.setMetadata(target, trimmedName);
            return true;
        } catch (error) {
            console.error('Error setting selected loadout:', error);
            return false;
        }
    }

    /**
     * Validate that the currently selected loadout still exists
     * @returns {Promise<boolean>} - True if selected loadout is valid or none selected
     */
    async validateSelectedLoadout() {
        const selectedLoadout = await this.getSelectedLoadout();
        if (!selectedLoadout) {
            return true; // No selection is valid
        }

        const availableLoadouts = await this.getAvailableLoadouts();
        const exists = availableLoadouts.some(l => l.name === selectedLoadout);
        
        if (!exists) {
            // Clear invalid selection
            await this.setSelectedLoadout(null);
            return false;
        }
        
        return true;
    }

    /**
     * Get current spell preparations from the spellbook
     * @private
     * @returns {Promise<SpellPreparations|null>} - Current spell preparations object
     */
    async _getCurrentSpellPreparations() {
        try {
            const metadata = await this._getSpellbookMetadata();
            return metadata.spellPreparations || null;
        } catch (error) {
            console.error('Error getting current spell preparations:', error);
            return null;
        }
    }


    /**
     * Get spellbook metadata through the renderer
     * @private
     * @returns {Promise<SpellbookMetadata>} - Spellbook metadata object
     */
    async _getSpellbookMetadata() {
        if (!this.renderer || !this.renderer.metadataManager) {
            throw new Error('Renderer or metadata manager not available');
        }

        // Use the renderer's metadata manager to get current spellbook data
        const metadataManager = this.renderer.metadataManager;
        
        // Get the frontmatter target for the spellbook file
        const spellbookPath = this.renderer.spellbookNotePath || (this.renderer.spellbookFile && this.renderer.spellbookFile.path);
        if (!spellbookPath) {
            throw new Error('Spellbook file path not available');
        }

        // Get spell preparations
        const preparationsTarget = metadataManager.mb.parseBindTarget(`spellPreparations`, spellbookPath);
        const spellPreparations = await metadataManager.mb.getMetadata(preparationsTarget);
        
        // Get loadouts (might not exist yet)
        const loadoutsTarget = metadataManager.mb.parseBindTarget(`loadouts`, spellbookPath);
        let loadouts;
        try {
            loadouts = await metadataManager.mb.getMetadata(loadoutsTarget);
        } catch (error) {
            // loadouts field might not exist yet, that's ok
            loadouts = [];
        }
        
        // Get spell level settings (keeping for compatibility with other parts of the system)
        // NOTE: Loadouts do NOT save or restore spell level settings, only spell preparations.
        // This data is retrieved here for other system components that may use _getSpellbookMetadata().
        let spellLevelSettings;
        try {
            const levelSettingsTarget = metadataManager.mb.parseBindTarget(`spellLevelSettings`, spellbookPath);
            spellLevelSettings = await metadataManager.mb.getMetadata(levelSettingsTarget);
        } catch (error) {
            // Spell level settings might not exist, that's ok for loadout purposes
            spellLevelSettings = null;
        }
        
        const metadata = {
            spellPreparations,
            spellLevelSettings,
            loadouts: loadouts || []
        };
        
        if (!metadata.spellPreparations) {
            throw new Error('Unable to retrieve required spellbook metadata');
        }

        return metadata;
    }

    /**
     * Save loadouts array to YAML file
     * @private
     * @param {Array<LoadoutData>} loadouts - Array of loadout objects to save
     * @returns {Promise<void>}
     */
    async _saveLoadoutsToYAML(loadouts) {
        if (!this.renderer || !this.renderer.metadataManager) {
            throw new Error('Renderer or metadata manager not available');
        }

        const metadataManager = this.renderer.metadataManager;
        const spellbookPath = this.renderer.spellbookNotePath || (this.renderer.spellbookFile && this.renderer.spellbookFile.path);
        
        if (!spellbookPath) {
            throw new Error('Spellbook file path not available');
        }

        // Update the loadouts field in the YAML frontmatter
        const target = metadataManager.mb.parseBindTarget(`loadouts`, spellbookPath);
        await metadataManager.mb.setMetadata(target, loadouts);
    }

    /**
     * Apply a loadout to the current spellbook
     * @private
     * @param {LoadoutData} loadout - The loadout object to apply
     * @returns {Promise<void>}
     */
    async _applyLoadoutToSpellbook(loadout) {
        if (!this.renderer || !this.renderer.metadataManager) {
            throw new Error('Renderer or metadata manager not available');
        }

        const metadataManager = this.renderer.metadataManager;
        const spellbookPath = this.renderer.spellbookNotePath || (this.renderer.spellbookFile && this.renderer.spellbookFile.path);
        
        if (!spellbookPath) {
            throw new Error('Spellbook file path not available');
        }

        // Apply spell preparations
        const preparationsTarget = metadataManager.mb.parseBindTarget(`spellPreparations`, spellbookPath);
        await metadataManager.mb.setMetadata(preparationsTarget, loadout.spellPreparations);
    }

    /**
     * Validate loadout data structure
     * @private
     * @param {LoadoutData} loadout - The loadout object to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    _validateLoadoutData(loadout) {
        if (!loadout || typeof loadout !== 'object') {
            return false;
        }

        // Check required fields
        if (!loadout.name || typeof loadout.name !== 'string' || loadout.name.trim().length === 0) {
            return false;
        }

        if (!loadout.spellPreparations || typeof loadout.spellPreparations !== 'object') {
            return false;
        }

        // Check spell preparations structure
        const requiredLevels = ['level0', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9', 'sla'];
        for (const level of requiredLevels) {
            if (!Array.isArray(loadout.spellPreparations[level])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Prompt user for loadout name and description using modal
     * @param {LoadoutData} [editingLoadout] - Existing loadout to edit (optional)
     * @returns {Promise<{name: string, description: string}|null>} - Loadout data or null if cancelled
     */
    async promptForLoadoutName(editingLoadout = null) {
        return new Promise((resolve) => {
            const existingLoadouts = [];
            
            // Get existing loadouts for conflict detection
            this.getAvailableLoadouts().then(loadouts => {
                const modal = new LoadoutNameModal(
                    (result) => resolve(result),
                    loadouts,
                    editingLoadout
                );
                modal.open();
            }).catch(error => {
                console.error('Error getting existing loadouts for modal:', error);
                // Still show modal, just without conflict detection
                const modal = new LoadoutNameModal(
                    (result) => resolve(result),
                    [],
                    editingLoadout
                );
                modal.open();
            });
        });
    }

    /**
     * Show user feedback about loadout operations
     * @param {boolean} success - Whether operation was successful
     * @param {string} message - Message to display
     * @param {number} [duration=3000] - How long to show message (ms)
     */
    showLoadoutFeedback(success, message, duration = 3000) {
        // Create or use Obsidian's Notice API if available
        if (window.app && window.app.constructor.Notice) {
            new window.app.constructor.Notice(message, duration);
        } else {
            // Fallback: create a simple toast notification
            this._showFallbackNotification(success, message, duration);
        }
    }

    /**
     * Fallback notification system when Obsidian Notice isn't available
     * @private
     * @param {boolean} success - Whether operation was successful
     * @param {string} message - Message to display
     * @param {number} duration - How long to show message (ms)
     */
    _showFallbackNotification(success, message, duration) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `loadout-toast ${success ? 'success' : 'error'}`;
        toast.textContent = message;
        
        // Position and style
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '4px',
            color: 'white',
            backgroundColor: success ? '#4caf50' : '#f44336',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: '10000',
            fontSize: '14px',
            maxWidth: '300px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 50);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Enhanced save loadout with UI integration
     * @param {string} [promptForName=true] - Whether to prompt for name via modal
     * @returns {Promise<boolean>} - Success status
     */
    async saveLoadoutWithPrompt(promptForName = true) {
        try {
            let loadoutData;
            
            if (promptForName) {
                loadoutData = await this.promptForLoadoutName();
                if (!loadoutData) {
                    // User cancelled
                    return false;
                }
            } else {
                // Use default name (for testing or automated saves)
                loadoutData = {
                    name: `Loadout ${new Date().toLocaleString()}`,
                    description: 'Auto-saved loadout'
                };
            }
            
            const success = await this.saveLoadout(loadoutData.name, loadoutData.description);
            
            if (success) {
                this.showLoadoutFeedback(true, `Loadout "${loadoutData.name}" saved successfully!`);
            } else {
                this.showLoadoutFeedback(false, 'Failed to save loadout. Please try again.');
            }
            
            return success;
            
        } catch (error) {
            console.error('Error in saveLoadoutWithPrompt:', error);
            this.showLoadoutFeedback(false, 'An error occurred while saving the loadout.');
            return false;
        }
    }

    /**
     * Enhanced load loadout with UI feedback
     * @param {string} [loadoutName] - Name of loadout to load, or use selected loadout if not provided
     * @returns {Promise<boolean>} - Success status
     */
    async loadLoadoutWithFeedback(loadoutName = null) {
        try {
            // Use provided loadout name or fall back to selected loadout
            const targetLoadout = loadoutName || await this.getSelectedLoadout();
            
            if (!targetLoadout) {
                // No loadout specified and none selected - try most recent as fallback
                const loadouts = await this.getAvailableLoadouts();
                if (loadouts.length === 0) {
                    this.showLoadoutFeedback(false, 'No saved loadouts found.');
                    return false;
                }
                
                // Sort by lastUsed timestamp and get most recent
                loadouts.sort((a, b) => {
                    const timeA = new Date(a.lastUsed || a.createdDate || 0).getTime();
                    const timeB = new Date(b.lastUsed || b.createdDate || 0).getTime();
                    return timeB - timeA;
                });
                
                const fallbackLoadout = loadouts[0].name;
                this.showLoadoutFeedback(false, `No loadout selected. Using most recent: "${fallbackLoadout}"`);
                
                const success = await this.loadLoadout(fallbackLoadout);
                if (success) {
                    await this.setSelectedLoadout(fallbackLoadout); // Update selection
                }
                return success;
            }
            
            const success = await this.loadLoadout(targetLoadout);
            
            if (success) {
                this.showLoadoutFeedback(true, `Loadout "${targetLoadout}" loaded successfully!`);
                // Ensure selection is updated
                await this.setSelectedLoadout(targetLoadout);
            } else {
                this.showLoadoutFeedback(false, `Failed to load loadout "${targetLoadout}".`);
            }
            
            return success;
            
        } catch (error) {
            console.error('Error in loadLoadoutWithFeedback:', error);
            this.showLoadoutFeedback(false, 'An error occurred while loading the loadout.');
            return false;
        }
    }

    /**
     * Create the loadout selection section with dropdown and load button
     * @private
     * @param {*} uiFactory - UI component factory instance
     */
    async _createLoadoutSection(uiFactory) {
        if (!uiFactory || typeof uiFactory.createLoadoutSelector !== 'function') {
            return;
        }

        try {
            // Get available loadouts
            const loadouts = await this.getAvailableLoadouts();
            
            // Validate current selection
            await this.validateSelectedLoadout();

            // Create loadout section container
            const selectorContainer = this.flyoutMenu.createDiv('spellbook-loadout-section');
            
            // Store reference for recreation
            this._loadoutSectionContainer = selectorContainer;
            this._uiFactory = uiFactory;
            this._currentLoadouts = JSON.parse(JSON.stringify(loadouts)); // Deep copy for comparison
            
            // Create initial UI using the stored render component
            await this._renderLoadoutSectionUI(selectorContainer, uiFactory, loadouts);
            
            // Start watching for loadouts array changes
            this._startLoadoutArrayWatcher();

        } catch (error) {
            console.error('Error creating loadout section:', error);
            // Fall back to simple message
            const errorContainer = this.flyoutMenu.createDiv('spellbook-loadout-error');
            errorContainer.textContent = 'Error loading loadouts';
        }
    }

    /**
     * Render the loadout section UI components
     * @private
     * @param {HTMLElement} selectorContainer - Container for the UI
     * @param {*} uiFactory - UI component factory instance
     * @param {Array} loadouts - Current loadouts array
     */
    async _renderLoadoutSectionUI(selectorContainer, uiFactory, loadouts) {
        // Clear existing content
        selectorContainer.innerHTML = '';
        
        // Use the stored render component from renderConfigView
        const component = this._renderComponent;
        
        if (!component) {
            console.error('No render component available for Meta Bind integration');
            return;
        }
        
        // Create loadout selector using Meta Bind
        const selector = uiFactory.createLoadoutSelector(loadouts, selectorContainer, component);

        // Create load button (Meta Bind will handle the reactive state)
        if (typeof uiFactory.createLoadLoadoutButton === 'function') {
            const loadBtn = uiFactory.createLoadLoadoutButton(async () => {
                this.closeMenu();
                await this.loadLoadoutWithFeedback();
            }, false); // Start enabled since Meta Bind will handle validation
            
            selectorContainer.appendChild(loadBtn);
        }
    }

    /**
     * Start watching for changes in the loadouts array and recreate UI when needed
     * @private
     */
    _startLoadoutArrayWatcher() {
        if (this._loadoutWatcherInterval) {
            clearInterval(this._loadoutWatcherInterval);
        }

        this._loadoutWatcherInterval = setInterval(async () => {
            try {
                const currentLoadouts = await this.getAvailableLoadouts();
                
                // Compare with stored loadouts to detect changes
                if (!this._loadoutsEqual(this._currentLoadouts, currentLoadouts)) {
                    console.log('Loadouts array changed, recreating selector UI');
                    
                    // Update stored loadouts
                    this._currentLoadouts = JSON.parse(JSON.stringify(currentLoadouts));
                    
                    // Recreate UI if container still exists
                    if (this._loadoutSectionContainer && this._uiFactory) {
                        await this._renderLoadoutSectionUI(this._loadoutSectionContainer, this._uiFactory, currentLoadouts);
                    }
                }
            } catch (error) {
                // Ignore errors in watcher
            }
        }, 1000); // Check every second
        
        // Store for cleanup
        this._disposables.add(() => {
            if (this._loadoutWatcherInterval) {
                clearInterval(this._loadoutWatcherInterval);
                this._loadoutWatcherInterval = null;
            }
        });
    }

    /**
     * Compare two loadouts arrays for equality
     * @private
     * @param {Array} arr1 - First loadouts array
     * @param {Array} arr2 - Second loadouts array
     * @returns {boolean} - True if arrays are equal
     */
    _loadoutsEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        
        // Compare loadout names (simple comparison for change detection)
        const names1 = arr1.map(l => l.name).sort();
        const names2 = arr2.map(l => l.name).sort();
        
        return JSON.stringify(names1) === JSON.stringify(names2);
    }

    /**
     * Cleanup all event listeners and DOM elements
     */
    dispose() {
        for (const disposeFn of this._disposables) {
            try { disposeFn(); } catch (e) { /* ignore */ }
        }
        this._disposables.clear();
        if (this.gearIcon && this.gearIcon.parentNode) {
            this.gearIcon.parentNode.removeChild(this.gearIcon);
        }
        if (this.flyoutMenu && this.flyoutMenu.parentNode) {
            this.flyoutMenu.parentNode.removeChild(this.flyoutMenu);
        }
        this.gearIcon = null;
        this.flyoutMenu = null;
    }
}
