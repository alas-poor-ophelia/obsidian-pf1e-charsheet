/**
 * Foundation TypeScript definitions for the Pathfinder 1e Spellbook project
 * 
 * This file provides base types for external APIs and common interfaces
 * that are used throughout the project.
 */

// ===================== OBSIDIAN API EXTENSIONS =====================

declare global {
    interface Window {
        app: App;
    }
}

// Extend Obsidian's HTMLElement with common methods used in Meta Bind
declare global {
    interface HTMLElement {
        createDiv(attrs?: DomElementInfo | string): HTMLDivElement;
        createEl<K extends keyof HTMLElementTagNameMap>(
            tag: K,
            attrs?: DomElementInfo | string
        ): HTMLElementTagNameMap[K];
        createSpan(attrs?: DomElementInfo | string): HTMLSpanElement;
        empty(): void;
    }
}

// ===================== META BIND API TYPES =====================

export interface MetaBindAPI {
    createBindTarget(type: string, filePath: string, path?: string[]): BindTarget;
    parseBindTarget(bindTarget: string, filePath: string): BindTarget;
    getMetadata(bindTarget: BindTarget): any;
    setMetadata(bindTarget: BindTarget, value: any): void;
    subscribeToMetadata(bindTarget: BindTarget, lifecycleHook: Component, callback: (value: any) => void): void;
    createInputFieldMountable(filePath: string, config: InputFieldConfig): Mountable;
    createButtonMountable(filePath: string, config: ButtonConfig): Mountable;
    createButtonGroupMountable(filePath: string, config: ButtonGroupConfig): Mountable;
    createInlineFieldFromString(fieldString: string, filePath: string, contextFile?: any): Mountable;
    wrapInMDRC(mountable: Mountable, container: HTMLElement, component: Component): MountableMDRC;
}

export interface BindTarget {
    type: string;
    filePath: string;
    path?: string[];
}

export interface Mountable {
    // Meta Bind mountable object
}

export interface MountableMDRC {
    containerEl?: HTMLElement;
    // Other Meta Bind MountableMDRC properties as needed
}

export interface Component {
    register?(callback: () => void): void;
    // Obsidian component for lifecycle management
}

export interface InputFieldConfig {
    renderChildType?: string;
    declaration: {
        inputFieldType: string;
        bindTarget: BindTarget;
        arguments?: Array<{ name: string; value: string[] }>;
    };
}

export interface ButtonConfig {
    declaration: {
        label: string;
        id: string;
        style?: string;
        class?: string;
        cssClass?: string;
        action?: ButtonAction;
        actions?: ButtonAction[];
    };
    isPreview?: boolean;
}

export interface ButtonGroupConfig {
    declaration: {
        referencedButtonIds: string[];
    };
    renderChildType?: 'inline' | 'block';
}

export interface ButtonAction {
    type: string; // More flexible to match actual usage
    bindTarget?: string;
    evaluate?: boolean;
    value?: string;
    code?: string;
}

// ===================== JS ENGINE TYPES =====================

export interface JSEngine {
    getPlugin(pluginId: string): { api?: MetaBindAPI } | undefined;
    importJs(path: string): Promise<any>;
    getObsidianModule(): any;
    markdown: {
        create(markdown: string): {
            render(app: App, container: HTMLElement, filePath: string, component?: Component): Promise<void>;
        };
    };
    app: App;
}

export interface JSEngineContext {
    bound: Record<string, any>;
    file: {
        path: string;
    };
}

// ===================== OBSIDIAN CORE TYPES =====================

// Re-export key Obsidian types that are commonly used
export type { App, TFile, CachedMetadata } from 'obsidian';

// ===================== DOM EXTENSIONS =====================

export interface DomElementInfo {
    text?: string;
    cls?: string | string[];
    attr?: Record<string, string>;
    title?: string;
}

// ===================== COMMON UTILITY TYPES =====================

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CastingClass = 
    | 'wizard' | 'sorcerer' | 'cleric' | 'druid' | 'bard' | 'ranger' | 'paladin'
    | 'arcanist' | 'oracle' | 'witch' | 'magus' | 'alchemist' | 'summoner'
    | 'inquisitor' | 'antipaladin' | 'bloodrager' | 'hunter' | 'shaman'
    | 'skald' | 'warpriest' | 'medium' | 'mesmerist' | 'occultist' | 'psychic' | 'spiritualist';

export type CastingStat = 'int' | 'wis' | 'cha';

export type MetamagicType = 
    | 'Still Spell (+1 level)'
    | 'Silent Spell (+1 level)'
    | 'Extend Spell (+1 level)'
    | 'Empower Spell (+2 levels)'
    | 'Maximize Spell (+3 levels)'
    | 'Heighten Spell (+? levels)'
    | 'Enlarge Spell (+1 level)'
    | 'Widen Spell (+3 levels)';