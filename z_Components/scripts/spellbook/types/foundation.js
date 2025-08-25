/**
 * @fileoverview Foundation type definitions for the spellbook system
 * 
 * This file contains basic type definitions for external APIs and 
 * foundational types used throughout the spellbook system.
 */

/**
 * Spell level (0-9)
 * @typedef {0|1|2|3|4|5|6|7|8|9} SpellLevel
 */

/**
 * Spellcasting classes
 * @typedef {'wizard'|'sorcerer'|'cleric'|'druid'|'bard'|'ranger'|'paladin'|'arcanist'|'oracle'|'skald'|'witch'|'magus'} CastingClass
 */

/**
 * Casting stats
 * @typedef {'int'|'wis'|'cha'} CastingStat
 */

/**
 * Metamagic feat types
 * @typedef {string} MetamagicType
 */

/**
 * Meta Bind API interface
 * @typedef {object} MetaBindAPI
 * @property {function} parseBindTarget - Parse a bind target
 * @property {function} getMetadata - Get metadata for a target
 * @property {function} setMetadata - Set metadata for a target
 * @property {function} subscribeToMetadata - Subscribe to metadata changes
 * @property {function} reactiveMetadata - Subscribe to multiple bind targets with callback
 * @property {function} createButtonMountable - Create a button mountable
 * @property {function} createButtonGroupMountable - Create a button group
 * @property {function} createInputFieldMountable - Create an input field
 * @property {function} createInputField - Create an input field (alternative method)
 * @property {function} createInlineFieldFromString - Create inline field from string
 * @property {function} createSelectMountable - Create a select dropdown
 * @property {function} wrapInMDRC - Wrap component in MDRC
 */

/**
 * Bind target interface
 * @typedef {object} BindTarget
 * @property {string} path - Path to the metadata
 * @property {string} filePath - File path for the bind target
 */

/**
 * Obsidian component interface
 * @typedef {object} Component
 * @property {function} register - Register cleanup function
 * @property {function} [addChild] - Add child component
 * @property {function} [removeChild] - Remove child component
 */

/**
 * JS Engine interface
 * @typedef {object} JSEngine
 * @property {function} getPlugin - Get plugin by name
 * @property {function} getObsidianModule - Get Obsidian module
 * @property {MarkdownAPI} markdown - Markdown processing utilities
 * @property {object} app - Obsidian app instance
 */

/**
 * Markdown API interface
 * @typedef {object} MarkdownAPI
 * @property {function} create - Create markdown processor
 */

/**
 * JS Engine context interface
 * @typedef {object} JSEngineContext
 * @property {object} bound - Bound values from meta-bind
 * @property {object} [app] - Obsidian app instance
 * @property {FileContext} file - Current file being processed
 */

/**
 * File context interface
 * @typedef {object} FileContext
 * @property {string} path - File path
 */

// Export empty object to make this a valid module
export {};