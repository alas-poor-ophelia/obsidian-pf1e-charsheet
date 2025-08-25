/**
* Handles displaying limited "resources" for things like class abilities 
* or items which tend to restore over time.
*
* Has the ability to create either a normal resource tracker or a "synced" resource 
* tracker for i.e. a pool that is shared between i.e. a master and familiar/animal companion.
*/
export class ResourceSyncManager {
    constructor(mb, component) {
        this.mb = mb;
        this.component = component;
        this.adarinFile = app.vault.getFileByPath('MiniSheet/Adarin/Adarin Mini Sheet.md');
        this.hwayoungFile = app.vault.getFileByPath('MiniSheet/Hwayoung/Hwayoung Mini Sheet.md');
        this.selectRefs = new Map(); // Store references to synced selects
    }

    _processValue(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return null;
        }
        const floored = Math.floor(value);
        return floored <= 0 ? null : floored;
    }

    _detectChangedField(previousValues, newValues) {
        // Handle case where there are no previous values (first run)
        if (!previousValues || previousValues.every(val => val === null || val === undefined)) {
            // Return index of first non-null/undefined value, or 0 if all are null
            for (let i = 0; i < newValues.length; i++) {
                if (newValues[i] !== null && newValues[i] !== undefined) {
                    return i;
                }
            }
            return 0; // Default to layOnHands if all are null/undefined
        }

        // Find the field that changed
        for (let i = 0; i < previousValues.length && i < newValues.length; i++) {
            const prevVal = previousValues[i] === null ? 0 : (previousValues[i] || 0);
            const newVal = newValues[i] === null ? 0 : (newValues[i] || 0);

            if (Math.abs(prevVal - newVal) > 0.0001) { // Use epsilon for floating point comparison
                return i;
            }
        }

        return -1; // No changes detected
    }

    _calculateNewLayOnHands(changedIndex, newValue) {
        const numValue = typeof newValue === 'number' ? newValue : parseFloat(newValue) || 0;
        switch (changedIndex) {
            case 0: return numValue; // layOnHands changed
            case 1: return numValue * 2; // channelEnergyAdarin changed  
            case 2: return numValue * 2; // layOnPaws changed
            case 3: return numValue * 6; // channelEnergyHwayoung changed
            default: return 0;
        }
    }

    createStandardSelect(bindTarget, maxValue, currentValue, className, container) {
        const selectContainer = container.createDiv();
        const selectConfig = {
            renderChildType: 'block',
            declaration: {
                inputFieldType: 'select',
                bindTarget: bindTarget,
                arguments: [
                    ...Array.from({ length: maxValue }, (_, i) => ({
                        name: 'option',
                        value: [`${i + 1}`]
                    })),
                    ...(currentValue > 0 ? [{ name: 'defaultValue', value: [`${currentValue}`] }] : []),
                    { name: 'class', value: [`tracker ${className}`] }
                ]
            }
        };
        const select = this.mb.createInputFieldMountable(this.adarinFile.path, selectConfig);
        return this.mb.wrapInMDRC(select, selectContainer, this.component);
    }

    createSyncedSelect(bindTarget, maxValue, currentValue, className, container) {
        const selectContainer = container.createDiv();
        const selectConfig = {
            renderChildType: 'block',
            declaration: {
                inputFieldType: 'select',
                bindTarget: bindTarget,
                arguments: [
                    ...Array.from({ length: maxValue }, (_, i) => ({
                        name: 'option',
                        value: [`${i + 1}`]
                    })),
                    ...(currentValue > 0 ? [{ name: 'defaultValue', value: [`${currentValue}`] }] : []),
                    { name: 'class', value: [`tracker ${className}`] }
                ]
            }
        };
        const select = this.mb.createInputFieldMountable(this.adarinFile.path, selectConfig);
        const mountedSelect = this.mb.wrapInMDRC(select, selectContainer, this.component);

        return mountedSelect;
    }

    setupBidirectionalSync() {
        console.log("setup bi directional sync");
        const bindTargetLayOnHands = this.mb.parseBindTarget("layOnHandsCurrent", this.adarinFile.path);
        const bindTargetChannelEnergyAdarin = this.mb.parseBindTarget("channelEnergyCurrent", this.adarinFile.path);
        const bindTargetLayOnPaws = this.mb.parseBindTarget("layOnPawsCurrent", this.hwayoungFile.path);
        const bindTargetChannelEnergyHwayoung = this.mb.parseBindTarget("channelEnergyCurrent", this.hwayoungFile.path);

        this.mb.reactiveMetadata([bindTargetLayOnHands, bindTargetChannelEnergyAdarin, bindTargetLayOnPaws, bindTargetChannelEnergyHwayoung],
            this.component, (valLayOnHands, valChannelEnergyAdarin, valLayOnPaws, valChannelEnergyHwayoung) => {
                console.log("hitting reactive update");
                const isUpdatingTarget = this.mb.parseBindTarget("AdarinMiniSheetConfig#isUpdating", this.adarinFile.path);
                const isUpdating = this.mb.getMetadata(isUpdatingTarget) || false;

                console.log("is updating:", isUpdating);
                if (isUpdating) return;

                // Set updating flag
                this.mb.setMetadata(isUpdatingTarget, true);

                // Get previous values for change detection
                const previousValuesTarget = this.mb.parseBindTarget("AdarinMiniSheetConfig#previousValues", this.adarinFile.path);
                const previousValues = this.mb.getMetadata(previousValuesTarget) || [null, null, null, null];
                const newValues = [valLayOnHands, valChannelEnergyAdarin, valLayOnPaws, valChannelEnergyHwayoung];

                // Detect changes and calculate new values
                const changedIndex = this._detectChangedField(previousValues, newValues);
                if (changedIndex === -1) {
                    this.mb.setMetadata(isUpdatingTarget, false);
                    return;
                }

                const changedValue = newValues[changedIndex];
                const newLayOnHands = this._calculateNewLayOnHands(changedIndex, changedValue);

                // Get layOnHandsMax from Adarin's frontmatter for maximum enforcement
                const layOnHandsMaxTarget = this.mb.parseBindTarget("layOnHandsMax", this.adarinFile.path);
                const layOnHandsMax = this.mb.getMetadata(layOnHandsMaxTarget) || 99;
                const constrainedLayOnHands = Math.min(newLayOnHands, layOnHandsMax);

                // Calculate all derived values
                const updatedLayOnHands = this._processValue(constrainedLayOnHands);
                const updatedChannelEnergyAdarin = this._processValue(updatedLayOnHands ? updatedLayOnHands / 2 : null);
                const updatedLayOnPaws = this._processValue(updatedLayOnHands ? updatedLayOnHands / 2 : null);
                const updatedChannelEnergyHwayoung = this._processValue(updatedLayOnHands ? updatedLayOnHands / 6 : null);

                // Update all bind targets
                this.mb.setMetadata(bindTargetLayOnHands, updatedLayOnHands);
                this.mb.setMetadata(bindTargetChannelEnergyAdarin, updatedChannelEnergyAdarin);
                this.mb.setMetadata(bindTargetLayOnPaws, updatedLayOnPaws);
                this.mb.setMetadata(bindTargetChannelEnergyHwayoung, updatedChannelEnergyHwayoung);

                // Store updated values as previous values
                this.mb.setMetadata(previousValuesTarget, [updatedLayOnHands, updatedChannelEnergyAdarin, updatedLayOnPaws, updatedChannelEnergyHwayoung]);

                // Clear updating flag
                this.mb.setMetadata(isUpdatingTarget, false);
            });
    }

    async renderAdarinResources(container, context, engine) {
        // Get frontmatter data
        const panacheMaxTarget = this.mb.parseBindTarget("panacheMax", this.adarinFile.path);
        const panacheCurrentTarget = this.mb.parseBindTarget("panachePoints", this.adarinFile.path);
        const layOnHandsMaxTarget = this.mb.parseBindTarget("layOnHandsMax", this.adarinFile.path);
        const layOnHandsCurrentTarget = this.mb.parseBindTarget("layOnHandsCurrent", this.adarinFile.path);
        const channelEnergyMaxTarget = this.mb.parseBindTarget("channelEnergyMax", this.adarinFile.path);
        const channelEnergyCurrentTarget = this.mb.parseBindTarget("channelEnergyCurrent", this.adarinFile.path);
        const smiteEvilMaxTarget = this.mb.parseBindTarget("smiteEvilMax", this.adarinFile.path);
        const smiteEvilCurrentTarget = this.mb.parseBindTarget("smiteEvilCurrent", this.adarinFile.path);
        const weaponSongMaxTarget = this.mb.parseBindTarget("weaponSongRoundsMax", this.adarinFile.path);
        const weaponSongCurrentTarget = this.mb.parseBindTarget("weaponSongRoundsCurrent", this.adarinFile.path);

        // Get current values
        const panacheMax = this.mb.getMetadata(panacheMaxTarget) || 5;
        const panacheCurrent = this.mb.getMetadata(panacheCurrentTarget) || 0;
        const layOnHandsMax = this.mb.getMetadata(layOnHandsMaxTarget) || 7;
        const layOnHandsCurrent = this.mb.getMetadata(layOnHandsCurrentTarget) || 0;
        const channelEnergyMax = this.mb.getMetadata(channelEnergyMaxTarget) || 3;
        const channelEnergyCurrent = this.mb.getMetadata(channelEnergyCurrentTarget) || 0;
        const smiteEvilMax = this.mb.getMetadata(smiteEvilMaxTarget) || 2;
        const smiteEvilCurrent = this.mb.getMetadata(smiteEvilCurrentTarget) || 0;
        const weaponSongMax = this.mb.getMetadata(weaponSongMaxTarget) || 10;
        const weaponSongCurrent = this.mb.getMetadata(weaponSongCurrentTarget) || 0;

        // 1. Panache select (standard)
        this.createStandardSelect(panacheCurrentTarget, panacheMax, panacheCurrent, "panache", container);

        // 2. Lay on Hands select (synced)
        this.createSyncedSelect(layOnHandsCurrentTarget, layOnHandsMax, layOnHandsCurrent, "lay-on-hands", container);

        // 3. Lay on Hands footer
        const lohFooterContainer = container.createDiv();
        const lohFooterView = this.mb.createInlineFieldFromString(
            `VIEW[{lohAmount}d6 (+4 self)][text(class(loh-footer))]`,
            this.adarinFile.path,
            undefined
        );
        this.mb.wrapInMDRC(lohFooterView, lohFooterContainer, this.component);

        // 4. Channel Energy select (synced)
        this.createSyncedSelect(channelEnergyCurrentTarget, channelEnergyMax, channelEnergyCurrent, "channel-energy", container);

        // 5. Channel Energy footer
        const channelEnergyFooter = container.createDiv();
        const ceFooterView = this.mb.createInlineFieldFromString(
            `VIEW[{ceAmount}d6 (+4 self)][text(class(ce-footer))]`,
            this.adarinFile.path,
            undefined
        );
        this.mb.wrapInMDRC(ceFooterView, channelEnergyFooter, this.component);

        // 6. Smite Evil select (standard)
        this.createStandardSelect(smiteEvilCurrentTarget, smiteEvilMax, smiteEvilCurrent, "smite-evil", container);

        // 7. Weapon Song select (standard)
        this.createStandardSelect(weaponSongCurrentTarget, weaponSongMax, weaponSongCurrent, "weapon-song", container);
        this.setupBidirectionalSync();
    }

    async renderAdarinItemResources(container, context, engine) {
        // Get frontmatter data
        const plumeOfPanacheMaxTarget = this.mb.parseBindTarget("plumeOfPanacheMax", this.adarinFile.path);
        const plumeOfPanacheCurrentTarget = this.mb.parseBindTarget("plumeOfPanacheCurrent", this.adarinFile.path);
        const quickrunnersMaxTarget = this.mb.parseBindTarget("quickrunnersMax", this.adarinFile.path);
        const quickrunnersCurrentTarget = this.mb.parseBindTarget("quickrunnersCurrent", this.adarinFile.path);

        // Get current values
        const plumeOfPanacheMax = this.mb.getMetadata(plumeOfPanacheMaxTarget) || 1;
        const plumeOfPanacheCurrent = this.mb.getMetadata(plumeOfPanacheCurrentTarget) || 1;
        const quickrunnersMax = this.mb.getMetadata(quickrunnersMaxTarget) || 7;
        const quickrunnersCurrent = this.mb.getMetadata(quickrunnersCurrentTarget) || 0;


        // 1. Plume of Panache select (standard)
        this.createStandardSelect(plumeOfPanacheCurrentTarget, plumeOfPanacheMax, plumeOfPanacheCurrent, "plume-of-panache", container);

        // 2. Plume of Panache footer
        const plumeFooterContainer = container.createDiv();
        const plumeFooterView = this.mb.createInlineFieldFromString(
            `VIEW[extra panache][text(renderMarkdown, class(plume-footer))]`,
            this.adarinFile.path,
            undefined
        );
        this.mb.wrapInMDRC(plumeFooterView, plumeFooterContainer, this.component);

        // 3. Quickrunner's select (synced)
        this.createStandardSelect(quickrunnersCurrentTarget, quickrunnersMax, quickrunnersCurrent, "quickrunners", container);

        // 4. Quickrunner's footer
        const quickrunnersFooterContainer = container.createDiv();
        const quickrunnersFooterView = this.mb.createInlineFieldFromString(
            `VIEW[extra move action][text(renderMarkdown, class(quickrunners-footer))]`,
            this.adarinFile.path,
            undefined
        );
        this.mb.wrapInMDRC(quickrunnersFooterView, quickrunnersFooterContainer, this.component);
    }

    async renderHwayoungResources(container, context, engine) {
        // Get frontmatter data
        const layOnPawsMaxTarget = this.mb.parseBindTarget("layOnPawsMax", this.hwayoungFile.path);
        const layOnPawsCurrentTarget = this.mb.parseBindTarget("layOnPawsCurrent", this.hwayoungFile.path);
        const channelEnergyMaxTarget = this.mb.parseBindTarget("channelEnergyMax", this.hwayoungFile.path);
        const channelEnergyCurrentTarget = this.mb.parseBindTarget("channelEnergyCurrent", this.hwayoungFile.path);

        // Get current values
        const layOnPawsMax = this.mb.getMetadata(layOnPawsMaxTarget) || 3;
        const layOnPawsCurrent = this.mb.getMetadata(layOnPawsCurrentTarget) || 0;
        const channelEnergyMax = this.mb.getMetadata(channelEnergyMaxTarget) || 1;
        const channelEnergyCurrent = this.mb.getMetadata(channelEnergyCurrentTarget) || 0;

        // 1. Lay on Paws select (synced)
        this.createSyncedSelect(layOnPawsCurrentTarget, layOnPawsMax, layOnPawsCurrent, "lay-on-paws", container);

        // 2. Lay on Paws footer
        const lopFooterContainer = container.createDiv();
        const lopFooterView = this.mb.createInlineFieldFromString(
            `VIEW[{Adarin Mini Sheet#lohAmount}d6][text(class(lop-footer))]`,
            this.hwayoungFile.path,
            undefined
        );
        this.mb.wrapInMDRC(lopFooterView, lopFooterContainer, this.component);

        // 3. Channel Energy select (synced)
        this.createSyncedSelect(channelEnergyCurrentTarget, channelEnergyMax, channelEnergyCurrent, "channel-energy-paws", container);

        // 4. Channel Energy footer
        const ceFooterContainer = container.createDiv();
        const ceFooterView = this.mb.createInlineFieldFromString(
            `VIEW[{Adarin Mini Sheet#ceAmount}d6][text(class(ce-paws-footer))]`,
            this.hwayoungFile.path,
            undefined
        );
        this.mb.wrapInMDRC(ceFooterView, ceFooterContainer, this.component);
        this.setupBidirectionalSync();
    }
}