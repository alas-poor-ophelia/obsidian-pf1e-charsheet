// === Helper Functions ===

// Get Meta Bind API
const getMbApi = () => {
  if (typeof app === 'undefined' || !app.plugins) return null;
  return app.plugins.plugins['obsidian-meta-bind-plugin']?.api;
};

// Transform spell data for spellbook format
// Transform spell data for spellbook format
function transformSpellForSpellbook(spell, selectedLevel = null, selectedClasses = null) {
  const getValue = (key) => spell.value ? spell.value(key) : getFMVal(spell.$frontmatter, key);

  const id = getValue('id');
  const name = getValue('name') || spell.$name;
  const spellLevelStr = getValue('spellLevel') || '';
  
  // Use selected level if provided, otherwise use lowest level
  const baseLevel = selectedLevel !== null ? selectedLevel : getLowestLevel(spellLevelStr);
  
  // Create a unique ID that includes the level and classes if specified
  const uniqueId = selectedLevel !== null && selectedClasses ? 
    `${id}_L${selectedLevel}_${selectedClasses.join('_').replace(/[^a-zA-Z0-9]/g, '')}` : 
    id;

  // Process range - extract main word before parentheses
  const rawRange = getValue('range') || '';
  const processedRange = rawRange.split('(')[0].trim();

  // Process casting time - abbreviate "Standard" to "std"
  const rawCastingTime = getValue('castingTime') || '';
  const processedCastingTime = rawCastingTime
    .replace(/standard/gi, 'std')
    .replace(/\s*action\s*/gi, '')
    .toLowerCase()
    .trim();

  // Get duration as-is without any processing
  const rawDuration = getValue('duration') || '';
  
  return {
    id: uniqueId,
    originalId: id, // Keep original ID for reference
    name: name,
    baseLevel: baseLevel,
    known: true,
    range: processedRange,
    castingTime: processedCastingTime,
    components: getValue('components') || '',
    saveType: getValue('saveType') || '',
    sr: getValue('sr') || '',
    duration: rawDuration, 
    school: getValue('school') || '',
    source: getValue('source') || ''
  };
}

// Parse spell level string into structured data
// "sorcerer/wizard 3, magus 3" → { classes: ["sorcerer", "wizard", "magus"], levels: { sorcerer: 3, wizard: 3, magus: 3 } }
function parseSpellLevel(spellLevelStr) {
  if (!spellLevelStr) return { classes: [], levels: {} };

  const entries = spellLevelStr.split(',').map(s => s.trim());
  const result = { classes: [], levels: {} };

  entries.forEach(entry => {
    const match = entry.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      const [, classNames, level] = match;
      const classes = classNames.split('/').map(c => c.trim());
      classes.forEach(cls => {
        if (!result.classes.includes(cls)) {
          result.classes.push(cls);
        }
        result.levels[cls] = parseInt(level);
      });
    }
  });

  return result;
}

function formatLevelsForDisplay(spellLevelStr) {
  if (!spellLevelStr) return '';
  
  const parsed = parseSpellLevel(spellLevelStr);
  
  // Get unique levels and sort them
  const uniqueLevels = [...new Set(Object.values(parsed.levels))].sort((a, b) => a - b);
  
  return uniqueLevels.join(', ');
}

function formatLevelsWithClassesForTooltip(spellLevelStr) {
  if (!spellLevelStr) return '';
  
  const parsed = parseSpellLevel(spellLevelStr);
  
  // Group classes by level
  const levelGroups = {};
  Object.entries(parsed.levels).forEach(([className, level]) => {
    if (!levelGroups[level]) {
      levelGroups[level] = [];
    }
    levelGroups[level].push(className);
  });
  
  // Format as "level (class1/class2), level (class3)"
  const formatted = Object.entries(levelGroups)
    .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by level ascending
    .map(([level, classes]) => `${level} (${classes.join('/')})`)
    .join(', ');
    
  return formatted;
}

// NEW: Get all unique levels from a spell level string
function getAllLevels(spellLevelStr) {
  if (!spellLevelStr) return [];
  
  const parsed = parseSpellLevel(spellLevelStr);
  return [...new Set(Object.values(parsed.levels))]; // Get unique levels
}

// NEW: Get lowest level for sorting (replaces getNumericLevel for sorting)
function getLowestLevel(spellLevelStr) {
  if (!spellLevelStr) return 0;
  
  const levels = getAllLevels(spellLevelStr);
  return levels.length > 0 ? Math.min(...levels) : 0;
}

// Get numeric level for sorting/filtering (returns first level found) - DEPRECATED, keeping for compatibility
function getNumericLevel(spellLevelStr) {
  if (!spellLevelStr) return 0;
  const match = spellLevelStr.match(/\b(\d+)\b/);
  return match ? parseInt(match[1]) : 0;
}

// Get frontmatter value safely - try multiple access patterns
function getFMVal(obj, key) {
  if (!obj || !key) return undefined;

  // Try multiple patterns to access the data
  // Pattern 1: Direct access to key
  if (obj[key] !== undefined) return obj[key];

  // Pattern 2: Key with .value property
  if (obj[key] && obj[key].value !== undefined) return obj[key].value;

  // Pattern 3: Using .value() method on the page
  if (obj.value && typeof obj.value === 'function') {
    try {
      return obj.value(key);
    } catch (e) {
      // Ignore errors and try next pattern
    }
  }

  return undefined;
}

// Debug function to inspect data structure
function debugSpellData(spell) {
  console.log('Spell debug info for:', spell.$name);
  console.log('Full spell object:', spell);
  console.log('$frontmatter:', spell.$frontmatter);
  console.log('frontmatter:', spell.frontmatter);
  console.log('value function:', typeof spell.value);
  if (spell.value && typeof spell.value === 'function') {
    console.log('value("spellLevel"):', spell.value("spellLevel"));
    console.log('value("name"):', spell.value("name"));
    console.log('value("school"):', spell.value("school"));
  }
}

// Get school color scheme
function getSchoolColors(school) {
  const colors = {
    'abjuration': { bg: '#4A90E2', text: '#FFFFFF' },
    'conjuration': { bg: '#7B68EE', text: '#FFFFFF' },
    'divination': { bg: '#FFB347', text: '#000000' },
    'enchantment': { bg: '#FF69B4', text: '#FFFFFF' },
    'evocation': { bg: '#FF4500', text: '#FFFFFF' },
    'illusion': { bg: '#9370DB', text: '#FFFFFF' },
    'necromancy': { bg: '#2F4F4F', text: '#FFFFFF' },
    'transmutation': { bg: '#32CD32', text: '#000000' },
    'universal': { bg: '#708090', text: '#FFFFFF' }
  };
  
  const schoolLower = (school || '').toLowerCase();
  return colors[schoolLower] || { bg: '#6B7280', text: '#FFFFFF' };
}

// Parse component text to check if it's compatible with Eschew Materials feat
function isEschewMaterialsCompatible(components) {
  if (!components || typeof components !== 'string') return true;
  
  // Look for GP costs in the components text
  // Common patterns: "100 gp", "1,000 gp", "50gp", "worth 500 gp", etc.
  const gpMatches = components.match(/(\d+(?:,\d+)*)\s*gp/gi);
  
  if (!gpMatches) return true; // No GP cost found, eschew materials applies
  
  // Check if any GP cost is > 1
  for (const match of gpMatches) {
    const costStr = match.replace(/[^\d,]/g, ''); // Extract just numbers and commas
    const cost = parseInt(costStr.replace(/,/g, '')); // Remove commas and parse
    if (cost > 1) {
      return false; // Found a cost > 1 gp, not compatible
    }
  }
  
  return true; // All costs are 1 gp or less
}

// Filter persistence helpers
const STORAGE_KEY = 'spellDatabaseFilters';

function saveFiltersToStorage(filters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('Failed to save filters to localStorage:', error);
  }
}

function loadFiltersFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load filters from localStorage:', error);
    return null;
  }
}

// UI Component for filter settings
function SpellQuerySettings({ children }) {
  return (
    <div
      style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5em;
        margin-top: 1em;
        align-items: stretch;
        height: 100%;
      "
    >
      {children}
    </div>
  );
}

function SpellQuerySetting({ title, icon, children }) {
  return (
    <div
      style="
        border: 1px solid var(--background-modifier-border, #444);
        border-radius: 1em;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        padding: 1em 1em;
        min-width: 160px;
        background-color: var(--background-secondary-alt, #23272e);
        margin-bottom: 1.1em;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: flex-start;
      "
    >
      <div
        style="
          font-weight: 600;
          font-size: 1em;
          margin-bottom: 0.5em;
          display: flex;
          justify-content: center;
          gap: 0.5em;
        "
      >
        <dc.Icon icon={icon} />
        <span>{title}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.4em; overflow-y: auto;">
        {children}
      </div>
    </div>
  );
}

// Main component
function SpellDatabase({ showFilters = true, paging = 50 }) {
  // Query all spell files
  const query = dc.useQuery('@page and path("MiniSheet/z_Components/database/spells")');
  const allSpells = dc.useArray(query, arr => arr.sort(page => [page.value("name")], 'asc'));

  // Load saved filters or use defaults
  const savedFilters = loadFiltersFromStorage();
  
  // Filter states
  const [filterSearch, setFilterSearch] = dc.useState(savedFilters?.filterSearch || '');
  const [filterLevel, setFilterLevel] = dc.useState(savedFilters?.filterLevel || []);
  const [filterSchool, setFilterSchool] = dc.useState(savedFilters?.filterSchool || []);
  const [filterClass, setFilterClass] = dc.useState(savedFilters?.filterClass || []);
  const [filterComponents, setFilterComponents] = dc.useState(savedFilters?.filterComponents || '');
  const [filterSource, setFilterSource] = dc.useState(savedFilters?.filterSource || []);
  const [filterSR, setFilterSR] = dc.useState(savedFilters?.filterSR || '');
  const [filterEschewMaterials, setFilterEschewMaterials] = dc.useState(savedFilters?.filterEschewMaterials || false);
  const [filterKnownOnly, setFilterKnownOnly] = dc.useState(savedFilters?.filterKnownOnly || false);
  const [filtersShown, setFiltersShown] = dc.useState(savedFilters?.filtersShown || false);
  const [filterClassSearch, setFilterClassSearch] = dc.useState(savedFilters?.filterClassSearch || '');
  const [columnVisibilityExpanded, setColumnVisibilityExpanded] = dc.useState(savedFilters?.columnVisibilityExpanded || false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = dc.useState(savedFilters?.visibleColumns || {
    'Name': true,
    'Level': true,
    'School': true,
    'Classes': true,
    'Components': true,
    'Casting Time': true,
    'Range': true,
    'Duration': true,
    'Source': true,
    'SR': true
  });

  // New states for Meta Bind integration
  const [knownSpellIds, setKnownSpellIds] = dc.useState(new Set());
  const [currentFilePath, setCurrentFilePath] = dc.useState('');

  // States for level selection modal
  const [showLevelModal, setShowLevelModal] = dc.useState(false);
  const [modalSpell, setModalSpell] = dc.useState(null);
  const [selectedModalLevel, setSelectedModalLevel] = dc.useState('');
  const [selectedModalClasses, setSelectedModalClasses] = dc.useState('');

  // Sort state
  const [sortColumn, setSortColumn] = dc.useState(savedFilters?.sortColumn || 'Name');
  const [sortDirection, setSortDirection] = dc.useState(savedFilters?.sortDirection || 'asc');

  // Handle column header clicks for sorting
  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Initialize on mount
  dc.useEffect(() => {
    const mb = getMbApi();
    const activeFile = app?.workspace?.getActiveFile()
    if (activeFile && mb) {
      setCurrentFilePath(activeFile.path);

      // Load known spells
      const spellsTarget = mb.parseBindTarget('spells', activeFile.path);
      const spells = mb.getMetadata(spellsTarget) || [];
      const ids = new Set(spells.map(s => s.id)); // Use the unique IDs
      setKnownSpellIds(ids);
    }
  }, []);

  // Save filters to localStorage whenever they change
  dc.useEffect(() => {
    const filtersToSave = {
      filterSearch,
      filterLevel,
      filterSchool,
      filterClass,
      filterComponents,
      filterSource,
      filterSR,
      filterEschewMaterials,
      filterKnownOnly,
      filtersShown,
      filterClassSearch,
      sortColumn,
      sortDirection,
      visibleColumns,
      columnVisibilityExpanded
    };
    saveFiltersToStorage(filtersToSave);
  }, [filterSearch, filterLevel, filterSchool, filterClass, filterComponents, filterSource, filterSR, filterEschewMaterials, filterKnownOnly, filtersShown, filterClassSearch, sortColumn, sortDirection, visibleColumns, columnVisibilityExpanded]);

  // Add click handlers to table headers
  dc.useEffect(() => {
    const tableContainer = document.querySelector('.spell-table-container');
    if (!tableContainer) return;

    const handleHeaderClick = (e) => {
      const th = e.target.closest('th');
      if (!th) return;
      
      const headerText = th.textContent.trim();
      const columnMap = {
        'Name': 'Name',
        'L': 'Level', 
        'School': 'School',
        'Classes': 'Classes',
        'Components': 'Components',
        'Casting Time': 'Casting Time',
        'Range': 'Range',
        'Duration': 'Duration',
        'Source': 'Source',
        'SR': 'SR'
      };
      
      // Extract column name (remove sort arrows)
      const columnName = Object.keys(columnMap).find(key => headerText.includes(key));
      if (columnName && th.cellIndex > 0) { // Skip first column (add button)
        handleSort(columnMap[columnName]);
      }
    };

    tableContainer.addEventListener('click', handleHeaderClick);
    return () => tableContainer.removeEventListener('click', handleHeaderClick);
  });

  // Extract unique values for dropdowns
  const allClasses = Array.from(
    new Set(
      allSpells
        .flatMap(p => {
          // Try different access patterns for spellLevel
          let spellLevel = '';
          if (p.value && typeof p.value === 'function') {
            spellLevel = p.value('spellLevel') || '';
          } else {
            spellLevel = getFMVal(p.$frontmatter, 'spellLevel') || '';
          }

          const parsed = parseSpellLevel(spellLevel);
          return parsed.classes;
        })
        .filter(Boolean)
    )
  ).sort();

  const allSchools = Array.from(
    new Set(
      allSpells
        .map(p => p.value ? p.value('school') : getFMVal(p.$frontmatter, 'school'))
        .filter(Boolean)
    )
  ).sort();

  const allSources = Array.from(
    new Set(
      allSpells
        .map(p => p.value ? p.value('source') : getFMVal(p.$frontmatter, 'source'))
        .filter(Boolean)
    )
  ).sort();

  // Get total spell count (excluding ALL_SPELLS)
  const totalSpells = allSpells.filter(spell => spell.$name !== "ALL_SPELLS");

  // Filter logic
  const filteredSpells = allSpells.filter(spell => {
    // Exclude ALL_SPELLS.json
    if (spell.$name === "ALL_SPELLS") return false;

    // Helper function to get value using correct access pattern
    const getValue = (key) => spell.value ? spell.value(key) : getFMVal(spell.$frontmatter, key);

    // Name search
    if (filterSearch) {
      const name = (getValue('name') || spell.$name || '').toLowerCase();
      if (!name.includes(filterSearch.toLowerCase())) return false;
    }

    // UPDATED: Level filter - check against ALL levels
    if (filterLevel.length > 0) {
      const spellLevel = getValue('spellLevel') || '';
      const allLevels = getAllLevels(spellLevel);
      if (!filterLevel.some(level => allLevels.includes(level))) return false;
    }

    // Class filter
    if (filterClass.length > 0) {
      const spellLevel = getValue('spellLevel') || '';
      const parsed = parseSpellLevel(spellLevel);
      if (!filterClass.some(cls => parsed.classes.includes(cls))) return false;
    }

    // School filter
    if (filterSchool.length > 0) {
      const school = getValue('school') || '';
      if (!filterSchool.includes(school)) return false;
    }

    // Components filter (text search)
    if (filterComponents) {
      const components = (getValue('components') || '').toLowerCase();
      if (!components.includes(filterComponents.toLowerCase())) return false;
    }

    // Source filter
    if (filterSource.length > 0) {
      const source = getValue('source') || '';
      if (!filterSource.includes(source)) return false;
    }

    // SR filter
    if (filterSR) {
      const sr = (getValue('sr') || '').toLowerCase();
      if (sr !== filterSR.toLowerCase()) return false;
    }

    // Eschew Materials filter
    if (filterEschewMaterials) {
      const components = getValue('components') || '';
      if (!isEschewMaterialsCompatible(components)) return false;
    }

    // Known spells only filter
    if (filterKnownOnly) {
      const mb = getMbApi();
      if (mb && currentFilePath) {
        const spellId = getValue('id');
        const spellsTarget = mb.parseBindTarget('spells', currentFilePath);
        const currentSpells = mb.getMetadata(spellsTarget) || [];
        
        // Check if any variant of this spell is known
        const hasKnownVariant = currentSpells.some(s => s.originalId === spellId || s.id === spellId);
        if (!hasKnownVariant) return false;
      } else {
        // Fallback to knownSpellIds if Meta Bind not available
        const spellId = getValue('id');
        if (!knownSpellIds.has(spellId)) return false;
      }
    }

    return true;
  });

  // Sort the filtered spells
  const sortedSpells = [...filteredSpells].sort((a, b) => {
    let aValue, bValue;
    
    // Helper function to get value using correct access pattern
    const getValue = (spell, key) => spell.value ? spell.value(key) : getFMVal(spell.$frontmatter, key);
    
    switch (sortColumn) {
      case 'Name':
        aValue = (getValue(a, 'name') || a.$name || '').toLowerCase();
        bValue = (getValue(b, 'name') || b.$name || '').toLowerCase();
        break;
      case 'Level':
        // UPDATED: Sort by lowest level for consistency
        aValue = getLowestLevel(getValue(a, 'spellLevel') || '');
        bValue = getLowestLevel(getValue(b, 'spellLevel') || '');
        break;
      case 'School':
        aValue = (getValue(a, 'school') || '').toLowerCase();
        bValue = (getValue(b, 'school') || '').toLowerCase();
        break;
      case 'Classes':
        const aSpellLevel = getValue(a, 'spellLevel') || '';
        const bSpellLevel = getValue(b, 'spellLevel') || '';
        aValue = parseSpellLevel(aSpellLevel).classes.join(", ").toLowerCase();
        bValue = parseSpellLevel(bSpellLevel).classes.join(", ").toLowerCase();
        break;
      case 'Components':
        aValue = (getValue(a, 'components') || '').toLowerCase();
        bValue = (getValue(b, 'components') || '').toLowerCase();
        break;
      case 'Casting Time':
        aValue = (getValue(a, 'castingTime') || '').toLowerCase();
        bValue = (getValue(b, 'castingTime') || '').toLowerCase();
        break;
      case 'Range':
        aValue = (getValue(a, 'range') || '').toLowerCase();
        bValue = (getValue(b, 'range') || '').toLowerCase();
        break;
      case 'Duration':
        aValue = (getValue(a, 'duration') || '').toLowerCase();
        bValue = (getValue(b, 'duration') || '').toLowerCase();
        break;
      case 'Source':
        aValue = (getValue(a, 'source') || '').toLowerCase();
        bValue = (getValue(b, 'source') || '').toLowerCase();
        break;
      case 'SR':
        aValue = (getValue(a, 'sr') || '').toLowerCase();
        bValue = (getValue(b, 'sr') || '').toLowerCase();
        break;
      default:
        return 0;
    }
    
    // Handle numeric vs string comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });

  // Column definitions
  const columns = [
    {
      id: "",
      sortable: false,
      value: p => {
        const mb = getMbApi();
        if (!mb || !currentFilePath) {
          return <span style="width: 30px; display: inline-block;"></span>;
        }

        const spellId = p.value ? p.value('id') : getFMVal(p.$frontmatter, 'id');
        const spellLevelStr = p.value ? p.value('spellLevel') : getFMVal(p.$frontmatter, 'spellLevel') || '';
        
        // Check if this spell (any variant) is known
        const spellsTarget = mb.parseBindTarget('spells', currentFilePath);
        const currentSpells = mb.getMetadata(spellsTarget) || [];
        const knownVariants = currentSpells.filter(s => s.originalId === spellId || s.id === spellId);
        
        if (knownVariants.length > 0) {
          // Show remove button with count if multiple variants
          const handleRemoveSpell = async () => {
            try {
              // Remove all variants of this spell
              const updatedSpells = currentSpells.filter(s => s.originalId !== spellId && s.id !== spellId);
              mb.setMetadata(spellsTarget, updatedSpells);

              // Update React state for immediate UI feedback
              setKnownSpellIds(prev => {
                const newSet = new Set(prev);
                knownVariants.forEach(variant => newSet.delete(variant.id));
                return newSet;
              });

            } catch (error) {
              console.error('Error removing spell:', error);
            }
          };

          const buttonText = knownVariants.length > 1 ? `× (${knownVariants.length})` : '×';
          const buttonTitle = knownVariants.length > 1 ? 
            `Remove all ${knownVariants.length} variants from spellbook` : 
            'Remove from spellbook';

          return (
            <button
              onClick={handleRemoveSpell}
              className="spellbook-database-remove-btn"
              title={buttonTitle}
            >
              {buttonText}
            </button>
          );
        }

        // Add button logic
        const handleAddSpell = async () => {
          try {
            // Check if spell has multiple levels
            const parsed = parseSpellLevel(spellLevelStr);
            const levelGroups = {};
            Object.entries(parsed.levels).forEach(([className, level]) => {
              if (!levelGroups[level]) {
                levelGroups[level] = [];
              }
              levelGroups[level].push(className);
            });
            
            const uniqueLevels = Object.keys(levelGroups);
            
            if (uniqueLevels.length > 1) {
              // Multiple levels - show modal
              setModalSpell(p);
              setShowLevelModal(true);
            } else {
              // Single level - add directly
              const spellData = transformSpellForSpellbook(p);

              // Check for duplicates
              if (currentSpells.some(s => s.id === spellData.id)) {
                return; // Already exists
              }

              // Update metadata directly
              const updatedSpells = [...currentSpells, spellData];
              mb.setMetadata(spellsTarget, updatedSpells);

              // Update React state for immediate UI feedback
              setKnownSpellIds(prev => new Set([...prev, spellData.id]));
            }
          } catch (error) {
            console.error('Error adding spell:', error);
          }
        };

        return (
          <button
            onClick={handleAddSpell}
            className="spellbook-database-add-btn"
            title="Add to spellbook"
          >
            +
          </button>
        );
      }
    },
    {
      id: `Name ${sortColumn === 'Name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => {
        // Use Datacore's proper link syntax
        return p.$link;
      }
    },
    {
      id: `L ${sortColumn === 'Level' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => {
        const spellLevel = (p.value ? p.value('spellLevel') : getFMVal(p.$frontmatter, 'spellLevel')) || '';
        // Show just the levels, with classes shown on click
        const levelNumbers = formatLevelsForDisplay(spellLevel);
        const fullDetails = formatLevelsWithClassesForTooltip(spellLevel);
        return (
          <span 
            title={fullDetails}
            style="
              cursor: help;
              border-bottom: 1px dotted currentColor;
            "
          >
            {levelNumbers}
          </span>
        );
      }
    },
    {
      id: `School ${sortColumn === 'School' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => {
        const school = (p.value ? p.value('school') : getFMVal(p.$frontmatter, 'school')) || "";
        if (!school) return "";
        
        const colors = getSchoolColors(school);
        return (
          <span
            style={`
              background-color: ${colors.bg};
              color: ${colors.text};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 0.85em;
              font-weight: 500;
              display: inline-block;
              text-align: center;
              min-width: fit-content;
              white-space: nowrap;
            `}
            title={school}
          >
            {school}
          </span>
        );
      }
    },
    {
      id: `Classes ${sortColumn === 'Classes' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => {
        const spellLevel = (p.value ? p.value('spellLevel') : getFMVal(p.$frontmatter, 'spellLevel')) || '';
        const parsed = parseSpellLevel(spellLevel);
        return parsed.classes.join(", ");
      }
    },
    {
      id: `Components ${sortColumn === 'Components' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => (p.value ? p.value('components') : getFMVal(p.$frontmatter, 'components')) || ""
    },
    {
      id: `Casting Time ${sortColumn === 'Casting Time' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => (p.value ? p.value('castingTime') : getFMVal(p.$frontmatter, 'castingTime')) || ""
    },
    {
      id: `Range ${sortColumn === 'Range' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => (p.value ? p.value('range') : getFMVal(p.$frontmatter, 'range')) || ""
    },
    {
      id: `Duration ${sortColumn === 'Duration' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => (p.value ? p.value('duration') : getFMVal(p.$frontmatter, 'duration')) || ""
    },
    {
      id: `Source ${sortColumn === 'Source' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => (p.value ? p.value('source') : getFMVal(p.$frontmatter, 'source')) || ""
    },
    {
      id: `SR ${sortColumn === 'SR' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}`,
      value: p => (p.value ? p.value('sr') : getFMVal(p.$frontmatter, 'sr')) || ""
    }
  ];

  return (
    <>
      {/* Level Selection Modal */}
      {showLevelModal && modalSpell && (
        <div 
          style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          "
          onclick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLevelModal(false);
              setModalSpell(null);
              setSelectedModalLevel('');
              setSelectedModalClasses('');
            }
          }}
        >
          <div 
            style="
              background-color: var(--background-primary);
              border: 1px solid var(--background-modifier-border);
              border-radius: 8px;
              padding: 1.5em;
              min-width: 300px;
              max-width: 500px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            "
          >
            <h3 style="margin-top: 0; margin-bottom: 1em;">
              Choose Spell Level
            </h3>
            <p style="margin-bottom: 1em; color: var(--text-muted);">
              {modalSpell.value ? modalSpell.value('name') : modalSpell.$name} is available at multiple levels. Choose which level to add:
            </p>
            
            <div style="margin-bottom: 1.5em;">
              {(() => {
                const spellLevel = modalSpell.value ? modalSpell.value('spellLevel') : getFMVal(modalSpell.$frontmatter, 'spellLevel') || '';
                const parsed = parseSpellLevel(spellLevel);
                
                // Group classes by level
                const levelGroups = {};
                Object.entries(parsed.levels).forEach(([className, level]) => {
                  if (!levelGroups[level]) {
                    levelGroups[level] = [];
                  }
                  levelGroups[level].push(className);
                });
                
                return Object.entries(levelGroups)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([level, classes]) => {
                    const isSelected = selectedModalLevel === level && selectedModalClasses === classes.join('/');
                    return (
                      <label 
                        key={`${level}-${classes.join('/')}`}
                        style={`
                          display: block;
                          margin-bottom: 0.5em;
                          cursor: pointer;
                          padding: 0.5em;
                          border: 1px solid ${isSelected ? 'var(--accent)' : 'var(--background-modifier-border)'};
                          border-radius: 4px;
                          background-color: ${isSelected ? 'var(--accent)' : 'var(--background-secondary)'};
                          color: ${isSelected ? 'white' : 'var(--text-normal)'};
                          transition: all 0.2s ease;
                        `}
                      >
                        <input
                          type="radio"
                          name="spellLevel"
                          value={`${level}|${classes.join('/')}`}
                          checked={isSelected}
                          onchange={(e) => {
                            if (e.target.checked) {
                              setSelectedModalLevel(level);
                              setSelectedModalClasses(classes.join('/'));
                            }
                          }}
                          style="margin-right: 0.5em;"
                        />
                        Level {level} ({classes.join('/')})
                      </label>
                    );
                  });
              })()}
            </div>
            
            <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
              <button
                onclick={() => {
                  setShowLevelModal(false);
                  setModalSpell(null);
                  setSelectedModalLevel('');
                  setSelectedModalClasses('');
                }}
                style="
                  padding: 0.5em 1em;
                  border: 1px solid var(--background-modifier-border);
                  border-radius: 4px;
                  background: var(--background-secondary);
                  color: var(--text-normal);
                  cursor: pointer;
                "
              >
                Cancel
              </button>
              <button
                onclick={async () => {
                  if (!selectedModalLevel || !selectedModalClasses) return;
                  
                  try {
                    const mb = getMbApi();
                    if (!mb || !currentFilePath) return;
                    
                    const spellData = transformSpellForSpellbook(
                      modalSpell, 
                      parseInt(selectedModalLevel),
                      selectedModalClasses.split('/')
                    );

                    const spellsTarget = mb.parseBindTarget('spells', currentFilePath);
                    const currentSpells = mb.getMetadata(spellsTarget) || [];

                    // Check for duplicates (by unique ID)
                    if (currentSpells.some(s => s.id === spellData.id)) {
                      return; // Already exists
                    }

                    // Update metadata directly
                    const updatedSpells = [...currentSpells, spellData];
                    mb.setMetadata(spellsTarget, updatedSpells);

                    // Update React state for immediate UI feedback
                    setKnownSpellIds(prev => new Set([...prev, spellData.id]));

                    // Close modal
                    setShowLevelModal(false);
                    setModalSpell(null);
                    setSelectedModalLevel('');
                    setSelectedModalClasses('');
                  } catch (error) {
                    console.error('Error adding spell:', error);
                  }
                }}
                disabled={!selectedModalLevel || !selectedModalClasses}
                style="
                  padding: 0.5em 1em;
                  border: 1px solid var(--accent);
                  border-radius: 4px;
                  background: var(--accent);
                  color: white;
                  cursor: pointer;
                  opacity: ${!selectedModalLevel || !selectedModalClasses ? '0.5' : '1'};
                "
              >
                Add Spell
              </button>
            </div>
          </div>
        </div>
      )}

      <div style="display: flex; gap: 0.75em; margin-bottom: 1em;">
        <input
          type="search"
          placeholder="Search by name..."
          value={filterSearch}
          oninput={e => setFilterSearch(e.target.value)}
          style="flex-grow: 1;"
        />
        {showFilters && (
          <button class="primary" onclick={() => setFiltersShown(!filtersShown)}>
            ⚙ Filters
          </button>
        )}
        {showFilters && (
          <button
            onclick={() => {
              setFilterSearch('');
              setFilterLevel([]);
              setFilterSchool([]);
              setFilterClass([]);
              setFilterComponents('');
              setFilterSource([]);
              setFilterSR('');
              setFilterEschewMaterials(false);
              setFilterKnownOnly(false);
              setFilterClassSearch('');
              // Reset column visibility to all visible
              setVisibleColumns({
                'Name': true,
                'Level': true,
                'School': true,
                'Classes': true,
                'Components': true,
                'Casting Time': true,
                'Range': true,
                'Duration': true,
                'Source': true,
                'SR': true
              });
              // Reset column visibility expanded state
              setColumnVisibilityExpanded(false);
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {filtersShown && (
        <SpellQuerySettings>
          {/* Class Filter */}
          <SpellQuerySetting title="Classes" icon="lucide-users">
            <input
              type="search"
              placeholder="Type to filter classes..."
              value={filterClassSearch}
              oninput={e => setFilterClassSearch(e.target.value)}
              style="margin-bottom: 0.5em;"
            />
            <div style="display: flex; flex-direction: column; gap: 0.25em; max-height: 500px; overflow-y: auto;">
              {allClasses
                .filter(c => c.toLowerCase().includes(filterClassSearch.toLowerCase()))
                .map(c => (
                  <label style="display: block" key={c}>
                    <input
                      type="checkbox"
                      checked={filterClass.includes(c)}
                      onchange={e =>
                        setFilterClass(
                          e.target.checked
                            ? [...filterClass, c]
                            : filterClass.filter(x => x !== c)
                        )
                      }
                    />{' '}
                    {c}
                  </label>
                ))}
            </div>
          </SpellQuerySetting>

          {/* Level & School Filter */}
          <SpellQuerySetting title="Level & School" icon="lucide-hash">
            <div style="margin-bottom: 1em;">
              <div style="font-weight: 500; margin-bottom: 0.25em;">Level</div>
              <div style="display: flex; flex-direction: column; gap: 0.25em;">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <label style="display: block" key={level}>
                    <input
                      type="checkbox"
                      checked={filterLevel.includes(level)}
                      onchange={e =>
                        setFilterLevel(
                          e.target.checked
                            ? [...filterLevel, level]
                            : filterLevel.filter(l => l !== level)
                        )
                      }
                    />{' '}
                    Level {level}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div style="font-weight: 500; margin-bottom: 0.25em;">School</div>
              <div style="display: flex; flex-direction: column; gap: 0.25em; max-height: 200px; overflow-y: auto;">
                {allSchools.map(s => (
                  <label style="display: block" key={s}>
                    <input
                      type="checkbox"
                      checked={filterSchool.includes(s)}
                      onchange={e =>
                        setFilterSchool(
                          e.target.checked
                            ? [...filterSchool, s]
                            : filterSchool.filter(x => x !== s)
                        )
                      }
                    />{' '}
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </SpellQuerySetting>

          {/* Components, Source & SR Filter */}
          <SpellQuerySetting title="Other Filters" icon="lucide-filter">
            <div style="margin-bottom: 1em;">
              <div style="font-weight: 500; margin-bottom: 0.25em;">Components</div>
              <input
                type="search"
                placeholder="e.g., V, S, M"
                value={filterComponents}
                oninput={e => setFilterComponents(e.target.value)}
                style="width: 100%;"
              />
            </div>
            <div style="margin-bottom: 1em;">
              <div style="font-weight: 500; margin-bottom: 0.25em;">Source</div>
              <div style="display: flex; flex-direction: column; gap: 0.25em; max-height: 150px; overflow-y: auto;">
                {allSources.map(s => (
                  <label style="display: block" key={s}>
                    <input
                      type="checkbox"
                      checked={filterSource.includes(s)}
                      onchange={e =>
                        setFilterSource(
                          e.target.checked
                            ? [...filterSource, s]
                            : filterSource.filter(x => x !== s)
                        )
                      }
                    />{' '}
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div style="margin-bottom: 1em;">
              <div style="font-weight: 500; margin-bottom: 0.25em;">Spell Resistance</div>
              <select
                value={filterSR}
                onchange={e => setFilterSR(e.target.value)}
                style="width: 100%;"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="varies">Varies</option>
              </select>
            </div>
            <div style="margin-bottom: 1em;">
              <label style="display: flex; align-items: center; gap: 0.5em;">
                <input
                  type="checkbox"
                  checked={filterEschewMaterials}
                  onchange={e => setFilterEschewMaterials(e.target.checked)}
                />
                <span style="font-weight: 500;">Exclude expensive components</span>
              </label>
              <div style="font-size: 0.8em; color: var(--text-muted); margin-top: 0.25em;">
                Hide spells with material components costing more than 1 gp
              </div>
            </div>
            <div>
              <label style="display: flex; align-items: center; gap: 0.5em;">
                <input
                  type="checkbox"
                  checked={filterKnownOnly}
                  onchange={e => setFilterKnownOnly(e.target.checked)}
                />
                <span style="font-weight: 500;">Known spells only</span>
              </label>
              <div style="font-size: 0.8em; color: var(--text-muted); margin-top: 0.25em;">
                Show only spells in your spellbook
              </div>
            </div>
          </SpellQuerySetting>
        </SpellQuerySettings>
      )}

      {filtersShown && (
        <div style="margin-top: 1em;">
          <div
            style="
              border: 1px solid var(--background-modifier-border, #444);
              border-radius: 1em;
              box-shadow: 0 2px 6px rgba(0,0,0,0.08);
              padding: 1em 1em;
              min-width: 160px;
              background-color: var(--background-secondary-alt, #23272e);
              margin-bottom: 1.1em;
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: flex-start;
            "
          >
            <div
              style="
                font-weight: 600;
                font-size: 1em;
                margin-bottom: 0.5em;
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
                position: relative;
              "
              onclick={() => setColumnVisibilityExpanded(!columnVisibilityExpanded)}
            >
              <div style="display: flex; align-items: center; gap: 0.5em; flex: 1; justify-content: center;">
                <dc.Icon icon="lucide-columns" />
                <span>Column Visibility</span>
              </div>
              <div style="position: absolute; right: 0;">
                <dc.Icon icon={columnVisibilityExpanded ? "lucide-chevron-up" : "lucide-chevron-down"} />
              </div>
            </div>
            {columnVisibilityExpanded && (
              <div style="display: flex; flex-direction: column; gap: 0.4em;">
                <div style="display: flex; flex-wrap: wrap; gap: 1em; margin-bottom: 1em;">
                  {Object.keys(visibleColumns).map(columnName => (
                    <label style="display: flex; align-items: center; gap: 0.5em; white-space: nowrap;" key={columnName}>
                      <input
                        type="checkbox"
                        checked={visibleColumns[columnName]}
                        onchange={e => 
                          setVisibleColumns(prev => ({
                            ...prev,
                            [columnName]: e.target.checked
                          }))
                        }
                      />
                      <span style="font-size: 0.9em;">{columnName}</span>
                    </label>
                  ))}
                </div>
                <div style="display: flex; gap: 0.5em;">
                  <button 
                    style="
                      padding: 0.4em 0.8em; 
                      font-size: 0.8em; 
                      border: 1px solid var(--background-modifier-border);
                      border-radius: 4px;
                      background: var(--background-secondary);
                      color: var(--text-normal);
                      cursor: pointer;
                    "
                    onclick={() => {
                      const allVisible = {};
                      Object.keys(visibleColumns).forEach(col => {
                        allVisible[col] = true;
                      });
                      setVisibleColumns(allVisible);
                    }}
                  >
                    Select All
                  </button>
                  <button 
                    style="
                      padding: 0.4em 0.8em; 
                      font-size: 0.8em; 
                      border: 1px solid var(--background-modifier-border);
                      border-radius: 4px;
                      background: var(--background-secondary);
                      color: var(--text-normal);
                      cursor: pointer;
                    "
                    onclick={() => {
                      const allHidden = {};
                      Object.keys(visibleColumns).forEach(col => {
                        allHidden[col] = false;
                      });
                      setVisibleColumns(allHidden);
                    }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style="margin: 1em 0 0.5em 0; font-style: italic; color: var(--text-muted); font-size: 0.9em;">
        Showing {sortedSpells.length} of {totalSpells.length} spells
      </div>

      <div
        style="
          font-size: 0.8em;
          --table-header-font-size: 0.55em;
        "
        className="spell-table-container"
      >
        <style>
          {`
            .spell-bind-btn {
              padding: 2px 6px !important;
              min-width: unset !important;
            }
            
            .spell-table-container td:first-child {
              width: 40px;
              text-align: center;
            }

            .spell-table-container th {
              cursor: pointer;
              user-select: none;
            }

            .spell-table-container th:first-child {
              cursor: default;
            }

            .spell-table-container th:hover:not(:first-child) {
              background-color: var(--background-modifier-hover);
            }

            /* Modal styles */
            .spell-level-modal-radio:checked + label {
              background-color: var(--accent) !important;
              color: white !important;
              border-color: var(--accent) !important;
            }
          `}
        </style>
        <dc.VanillaTable columns={columns.filter((col, index) => {
          // Always show the first column (action buttons)
          if (index === 0) return true;
          
          // For other columns, check if they're visible
          const columnName = col.id.split(' ')[0]; // Extract column name (remove sort arrows)
          // Map "L" header back to "Level" for visibility check
          const visibilityKey = columnName === 'L' ? 'Level' : columnName;
          return visibleColumns[visibilityKey];
        })} rows={sortedSpells} paging={paging} />
      </div>
    </>
  );
}

// Export
return { SpellDatabase };