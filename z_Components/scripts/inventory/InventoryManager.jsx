// === Helper Functions ===

// Get Meta Bind API
const getMbApi = () => {
  if (typeof app === 'undefined' || !app.plugins) return null;
  return app.plugins.plugins['obsidian-meta-bind-plugin']?.api;
};

// Get frontmatter value safely
function getFMVal(obj, key) {
  if (!obj || !key) return undefined;
  if (obj[key] !== undefined) return obj[key];
  if (obj[key] && obj[key].value !== undefined) return obj[key].value;
  if (obj.value && typeof obj.value === 'function') {
    try {
      return obj.value(key);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

// Get media file for Datacore
async function requireMediaFile(path) {
  const mediaFile = await app.vault.getFileByPath(path);
  return app.vault.getResourcePath(mediaFile);
}

function hardResetInventory(setItems, setCopper, setSilver, setGold, setPlatinum) {
  try {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared localStorage');
    
    // Force reload from Meta Bind
    const mb = getMbApi();
    const activeFile = app?.vault?.getFileByPath("MiniSheet/Adarin/components/AdarinMiniSheetConfig.md");
    
    if (activeFile && mb) {
      const inventoryTarget = mb.parseBindTarget('inventory', activeFile.path);
      const currencyTarget = mb.parseBindTarget('currency', activeFile.path);

      const savedItems = mb.getMetadata(inventoryTarget) || [];
      const savedCurrency = mb.getMetadata(currencyTarget) || {};

      console.log('Meta Bind items:', savedItems);
      console.log('Meta Bind currency:', savedCurrency);

      // Reset to Meta Bind data or defaults
      setItems(savedItems);
      setCopper(savedCurrency.copper || 0);
      setSilver(savedCurrency.silver || 0);
      setGold(savedCurrency.gold || 0);
      setPlatinum(savedCurrency.platinum || 0);
    } else {
      // Reset to defaults if no Meta Bind
      setItems([]);
      setCopper(0);
      setSilver(0);
      setGold(0);
      setPlatinum(0);
    }
  } catch (error) {
    console.error('Hard reset failed:', error);
  }
}

// Calculate display weight for items (handles containers specially)
function getItemWeightDisplay(item, allItems) {
  if (item.type?.toLowerCase() === 'container') {
    const containedItems = getItemsInContainer(allItems, item.id);
    const contentsWeight = containedItems.reduce((total, containedItem) => {
      return total + ((containedItem.weight || 0) * (containedItem.count || 1));
    }, 0);
    
    const containerWeight = item.weight || 0;
    return containerWeight > 0 || contentsWeight > 0 
      ? `${containerWeight} | ${contentsWeight.toFixed(1)} lbs` 
      : '—';
  } else {
    return item.weight > 0 ? `${item.weight} lbs` : '—';
  }
}

// Item type definitions for Pathfinder
const ITEM_TYPES = [
  'Weapon',
  'Armor',
  'Shield',
  'Consumable',
  'Tool',
  'Gear',
  'Magic Item',
  'Wand',
  'Container',
  'Ammunition',
  'Clothing',
  'Jewelry',
  'Art Object',
  'Trade Good',
  'Other'
];

// Get type color scheme
function getTypeColors(type) {
  const colors = {
    'weapon': { bg: '#DC2626', text: '#FFFFFF' },
    'armor': { bg: '#7C2D12', text: '#FFFFFF' },
    'shield': { bg: '#92400E', text: '#FFFFFF' },
    'consumable': { bg: '#059669', text: '#FFFFFF' },
    'tool': { bg: '#7C3AED', text: '#FFFFFF' },
    'gear': { bg: '#0369A1', text: '#FFFFFF' },
    'magic item': { bg: '#BE185D', text: '#FFFFFF' },
    'wand': { bg: '#8B5CF6', text: '#FFFFFF' },
    'container': { bg: '#374151', text: '#FFFFFF' },
    'ammunition': { bg: '#B45309', text: '#FFFFFF' },
    'clothing': { bg: '#4338CA', text: '#FFFFFF' },
    'jewelry': { bg: '#C026D3', text: '#FFFFFF' },
    'art object': { bg: '#DB2777', text: '#FFFFFF' },
    'trade good': { bg: '#16A34A', text: '#FFFFFF' },
    'other': { bg: '#6B7280', text: '#FFFFFF' }
  };

  const typeLower = (type || '').toLowerCase();
  return colors[typeLower] || colors['other'];
}

// Get type emoji
function getTypeEmoji(type) {
  const emojis = {
    'weapon': '⚔️',
    'armor': '🛡️',
    'shield': '🛡️',
    'consumable': '🧪',
    'tool': '🔧',
    'gear': '⚙️',
    'magic item': '✨',
    'wand': '🪄',
    'container': '📦',
    'ammunition': '🏹',
    'clothing': '👕',
    'jewelry': '💎',
    'art object': '🎨',
    'trade good': '💰',
    'other': '❓'
  };

  const typeLower = (type || '').toLowerCase();
  return emojis[typeLower] || emojis['other'];
}

// Storage helpers
const STORAGE_KEY = 'pathfinderInventory';

function saveInventoryToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save inventory to localStorage:', error);
  }
}

function loadInventoryFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load inventory from localStorage:', error);
    return null;
  }
}

// Format currency display
function formatCurrency(cp, sp, gp, pp) {
  const parts = [];
  if (pp > 0) parts.push(`${pp}pp`);
  if (gp > 0) parts.push(`${gp}gp`);
  if (sp > 0) parts.push(`${sp}sp`);
  if (cp > 0) parts.push(`${cp}cp`);

  // Calculate total value in GP
  const totalGP = (pp * 10) + gp + (sp * 0.1) + (cp * 0.01);

  return {
    display: parts.join(' ') || '0cp',
    totalGP: totalGP
  };
}

// Calculate total weight and value
function calculateTotals(items) {
  let totalWeight = 0;
  let totalValue = 0;

  items.forEach(item => {
    const count = item.count || 1;
    const weight = item.weight || 0;
    const value = item.value || 0;

    totalWeight += weight * count;
    totalValue += value * count;
  });

  return { totalWeight, totalValue };
}

// Generate unique ID for items
function generateId() {
  return 'item_' + Math.random().toString(36).substr(2, 9);
}

// Container helper functions
function getContainers(items) {
  return items.filter(item => item.type?.toLowerCase() === 'container');
}

function getItemsInContainer(items, containerId) {
  return items.filter(item => item.containerId === containerId);
}

function getTopLevelItems(items) {
  return items.filter(item => !item.containerId);
}

// Add Item Modal Component
function AddItemModal({ isOpen, onClose, onAdd, availableContainers }) {
  const [name, setName] = dc.useState('');
  const [count, setCount] = dc.useState(1);
  const [weight, setWeight] = dc.useState('');
  const [value, setValue] = dc.useState('');
  const [type, setType] = dc.useState('');
  const [charges, setCharges] = dc.useState(50);
  const [containerId, setContainerId] = dc.useState('');
  const [note, setNote] = dc.useState('');

  // Create portal-like behavior by appending to body
  dc.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem = {
      id: generateId(),
      name: name.trim(),
      count: Math.max(1, parseInt(count) || 1),
      weight: parseFloat(weight) || 0,
      value: parseFloat(value) || 0,
      type: type || '',
      containerId: containerId || null,
      note: note.trim() || null
    };

    // Add charges for wands
    if (type.toLowerCase() === 'wand') {
      newItem.charges = Math.max(0, Math.min(50, parseInt(charges) || 50));
    }

    onAdd(newItem);

    // Reset form
    setName('');
    setCount(1);
    setWeight('');
    setValue('');
    setType('');
    setCharges(50);
    setContainerId('');
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 999999;
        margin: 0;
        padding: 1rem;
        padding-top: calc(25px + 1rem);
        box-sizing: border-box;
      "
      onclick={e => e.target === e.currentTarget && onClose()}
    >
      <div style="
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 1em;
        width: 95%;
        max-width: 250px;
        max-height: 60vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      ">

        <form onsubmit={handleSubmit}>
          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Name *
            </label>
            <input
              type="text"
              value={name}
              oninput={e => setName(e.target.value)}
              placeholder="Item name"
              required
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5em; margin-bottom: 0.75em;">
            <div>
              <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
                Count
              </label>
              <input
                type="number"
                value={count}
                oninput={e => setCount(e.target.value)}
                min="1"
                style="width: 100%; padding: 0.4em; font-size: 0.9em;"
              />
            </div>
            <div>
              <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                oninput={e => setWeight(e.target.value)}
                step="0.1"
                min="0"
                placeholder="0"
                style="width: 100%; padding: 0.4em; font-size: 0.9em;"
              />
            </div>
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Value (gp)
            </label>
            <input
              type="number"
              value={value}
              oninput={e => setValue(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0"
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            />
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Type
            </label>
            <select
              value={type}
              onchange={e => setType(e.target.value)}
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            >
              <option value="">Select type...</option>
              {ITEM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Note (optional)
            </label>
            <textarea
              value={note}
              oninput={e => setNote(e.target.value.slice(0, 144))}
              placeholder="Description or notes..."
              maxlength="144"
              style="width: 100%; padding: 0.4em; font-size: 0.9em; resize: vertical; min-height: 2.5em; max-height: 5em;"
            />
            <div style="font-size: 0.7em; color: var(--text-muted); text-align: right; margin-top: 0.2em;">
              {note.length}/144
            </div>
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Note (optional)
            </label>
            <textarea
              value={note}
              oninput={e => setNote(e.target.value.slice(0, 144))}
              placeholder="Description or notes..."
              maxlength="144"
              style="width: 100%; padding: 0.4em; font-size: 0.9em; resize: vertical; min-height: 2.5em; max-height: 5em;"
            />
            <div style="font-size: 0.7em; color: var(--text-muted); text-align: right; margin-top: 0.2em;">
              {note.length}/144
            </div>
          </div>

          {type.toLowerCase() === 'wand' && (
            <div style="margin-bottom: 0.75em;">
              <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
                Charges (0-50)
              </label>
              <input
                type="number"
                value={charges}
                oninput={e => setCharges(e.target.value)}
                min="0"
                max="50"
                style="width: 100%; padding: 0.4em; font-size: 0.9em;"
              />
            </div>
          )}

          <div style="margin-bottom: 1em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Container
            </label>
            <select
              value={containerId}
              onchange={e => setContainerId(e.target.value)}
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            >
              <option value="">No container</option>
              {availableContainers.map(container => (
                <option key={container.id} value={container.id}>{container.name}</option>
              ))}
            </select>
          </div>

          <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
            <button
              type="button"
              onclick={onClose}
              style="
                padding: 0.5em 1em;
                background: var(--background-secondary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              style="
                padding: 0.5em 1em;
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
              "
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Item Modal Component
function EditItemModal({ isOpen, onClose, onUpdate, item, availableContainers }) {
  const [name, setName] = dc.useState('');
  const [count, setCount] = dc.useState(1);
  const [weight, setWeight] = dc.useState('');
  const [value, setValue] = dc.useState('');
  const [type, setType] = dc.useState('');
  const [charges, setCharges] = dc.useState(50);
  const [containerId, setContainerId] = dc.useState('');
  const [note, setNote] = dc.useState('');

  // Initialize form with item data when modal opens
  dc.useEffect(() => {
    if (isOpen && item) {
      setName(item.name || '');
      setCount(item.count || 1);
      setWeight(item.weight || '');
      setValue(item.value || '');
      setType(item.type || '');
      setCharges(item.charges || 50);
      setContainerId(item.containerId || '');
      setNote(item.note || '');
    }
  }, [isOpen, item]);

  // Create portal-like behavior by appending to body
  dc.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !item) return;

    const updatedItem = {
      name: name.trim(),
      count: Math.max(1, parseInt(count) || 1),
      weight: parseFloat(weight) || 0,
      value: parseFloat(value) || 0,
      type: type || '',
      containerId: containerId || null,
      note: note.trim() || null
    };

    // Add charges for wands
    if (type.toLowerCase() === 'wand') {
      updatedItem.charges = Math.max(0, Math.min(50, parseInt(charges) || 50));
    } else {
      // Remove charges if changing away from wand
      updatedItem.charges = undefined;
    }

    onUpdate(item.id, updatedItem);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div
      style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 999999;
        margin: 0;
        padding: 1rem;
        padding-top: calc(25px + 1rem);
        box-sizing: border-box;
      "
      onclick={e => e.target === e.currentTarget && onClose()}
    >
      <div style="
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        padding: 1em;
        width: 95%;
        max-width: 250px;
        max-height: 60vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      ">
        <form onsubmit={handleSubmit}>
          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Name *
            </label>
            <input
              type="text"
              value={name}
              oninput={e => setName(e.target.value)}
              placeholder="Item name"
              required
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5em; margin-bottom: 0.75em;">
            <div>
              <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
                Count
              </label>
              <input
                type="number"
                value={count}
                oninput={e => setCount(e.target.value)}
                min="1"
                style="width: 100%; padding: 0.4em; font-size: 0.9em;"
              />
            </div>
            <div>
              <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                oninput={e => setWeight(e.target.value)}
                step="0.1"
                min="0"
                placeholder="0"
                style="width: 100%; padding: 0.4em; font-size: 0.9em;"
              />
            </div>
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Value (gp)
            </label>
            <input
              type="number"
              value={value}
              oninput={e => setValue(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0"
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            />
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Type
            </label>
            <select
              value={type}
              onchange={e => setType(e.target.value)}
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            >
              <option value="">Select type...</option>
              {ITEM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style="margin-bottom: 0.75em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Note (optional)
            </label>
            <textarea
              value={note}
              oninput={e => setNote(e.target.value.slice(0, 144))}
              placeholder="Description or notes..."
              maxlength="144"
              style="width: 100%; padding: 0.4em; font-size: 0.9em; resize: vertical; min-height: 2.5em; max-height: 5em;"
            />
            <div style="font-size: 0.7em; color: var(--text-muted); text-align: right; margin-top: 0.2em;">
              {note.length}/144
            </div>
          </div>

          {type.toLowerCase() === 'wand' && (
            <div style="margin-bottom: 0.75em;">
              <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
                Charges (0-50)
              </label>
              <input
                type="number"
                value={charges}
                oninput={e => setCharges(e.target.value)}
                min="0"
                max="50"
                style="width: 100%; padding: 0.4em; font-size: 0.9em;"
              />
            </div>
          )}

          <div style="margin-bottom: 1em;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 0.25em; font-weight: 500; font-family: 'Taroca', serif;">
              Container
            </label>
            <select
              value={containerId}
              onchange={e => setContainerId(e.target.value)}
              style="width: 100%; padding: 0.4em; font-size: 0.9em;"
            >
              <option value="">No container</option>
              {availableContainers.filter(container => container.id !== item?.id).map(container => (
                <option key={container.id} value={container.id}>{container.name}</option>
              ))}
            </select>
          </div>

          <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
            <button
              type="button"
              onclick={onClose}
              style="
                padding: 0.5em 1em;
                background: var(--background-secondary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              style="
                padding: 0.5em 1em;
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
              "
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Inventory Component
function PathfinderInventory() {
  // Load saved data
  const savedData = loadInventoryFromStorage();

  // Currency state
  const [copper, setCopper] = dc.useState(savedData?.currency?.copper || 0);
  const [silver, setSilver] = dc.useState(savedData?.currency?.silver || 0);
  const [gold, setGold] = dc.useState(savedData?.currency?.gold || 0);
  const [platinum, setPlatinum] = dc.useState(savedData?.currency?.platinum || 0);

  // Image state for coins
  const [ppCoinImage, setPpCoinImage] = dc.useState('');
  const [gpCoinImage, setGpCoinImage] = dc.useState('');
  const [spCoinImage, setSpCoinImage] = dc.useState('');
  const [cpCoinImage, setCpCoinImage] = dc.useState('');

  // Items state
  const [items, setItems] = dc.useState(savedData?.items || []);

  // UI state
  const [searchTerm, setSearchTerm] = dc.useState('');
  const [sortBy, setSortBy] = dc.useState('name');
  const [sortDirection, setSortDirection] = dc.useState('asc');
  const [filtersExpanded, setFiltersExpanded] = dc.useState(false);
  const [currencyExpanded, setCurrencyExpanded] = dc.useState(savedData?.ui?.currencyExpanded ?? true);
  const [controlsExpanded, setControlsExpanded] = dc.useState(savedData?.ui?.controlsExpanded ?? true);
  const [showAddModal, setShowAddModal] = dc.useState(false);
  const [showEditModal, setShowEditModal] = dc.useState(false);
  const [editingItem, setEditingItem] = dc.useState(null);
  const [typeFilter, setTypeFilter] = dc.useState('');
  const [containerFilter, setContainerFilter] = dc.useState(''); // NEW: Container filter state
  const [currentFilePath, setCurrentFilePath] = dc.useState('');
  const [containerExpanded, setContainerExpanded] = dc.useState(savedData?.containerExpanded || {});

  // Initialize Meta Bind integration
    dc.useEffect(() => {
      const mb = getMbApi();
      
      const activeFile = app?.vault?.getFileByPath("MiniSheet/Adarin/components/AdarinMiniSheetConfig.md");
      
      if (activeFile && mb) {
        setCurrentFilePath(activeFile.path);

        // Load inventory from Meta Bind if available
        try {
          const inventoryTarget = mb.parseBindTarget('inventory', activeFile.path);
          const currencyTarget = mb.parseBindTarget('currency', activeFile.path);

          const savedItems = mb.getMetadata(inventoryTarget) || [];
          const savedCurrency = mb.getMetadata(currencyTarget) || {};

          if (savedItems.length > 0) {
            setItems(savedItems);
          } else {
            console.log('No items found in Meta Bind');
          }
          
          if (Object.keys(savedCurrency).length > 0) {
            setCopper(savedCurrency.copper || 0);
            setSilver(savedCurrency.silver || 0);
            setGold(savedCurrency.gold || 0);
            setPlatinum(savedCurrency.platinum || 0);
          } else {
            console.log('No currency found in Meta Bind');
          }
        } catch (error) {
          console.error('Failed to load from Meta Bind:', error);
        }
      } else {
        console.log('Meta Bind not available or file not found');
      }
    }, []);

  // Save to storage and Meta Bind when data changes
  dc.useEffect(() => {
    const data = {
      currency: { copper, silver, gold, platinum },
      items,
      filters: { searchTerm, sortBy, sortDirection, filtersExpanded, typeFilter, containerFilter },
      ui: { currencyExpanded, controlsExpanded},
      containerExpanded // Add this line
    };

    saveInventoryToStorage(data);

    // Save to Meta Bind if available
    const mb = getMbApi();
    if (mb && currentFilePath) {
      try {
        const inventoryTarget = mb.parseBindTarget('inventory', currentFilePath);
        const currencyTarget = mb.parseBindTarget('currency', currentFilePath);

        mb.setMetadata(inventoryTarget, items);
        mb.setMetadata(currencyTarget, { copper, silver, gold, platinum });
      } catch (error) {
        console.warn('Failed to save to Meta Bind:', error);
      }
    }
  }, [copper, silver, gold, platinum, items, currencyExpanded, controlsExpanded, searchTerm, sortBy, sortDirection, filtersExpanded, typeFilter, containerFilter, containerExpanded]);

  // Load coin images
  dc.useEffect(() => {
    const fetchImages = async () => {
      try {
        const ppImage = await requireMediaFile('MiniSheet/z_Components/scripts/inventory/images/Platinum_Emoji.png');
        setPpCoinImage(ppImage);

        const gpImage = await requireMediaFile('MiniSheet/z_Components/scripts/inventory/images/Gold_Emoji.png');
        setGpCoinImage(gpImage);

        const spImage = await requireMediaFile('MiniSheet/z_Components/scripts/inventory/images/Silver_Emoji.png');
        setSpCoinImage(spImage);

        const cpImage = await requireMediaFile('MiniSheet/z_Components/scripts/inventory/images/Copper_Emoji.png');
        setCpCoinImage(cpImage);
      } catch (error) {
        console.error('Failed to load coin images:', error);
      }
    };
    fetchImages();
  }, []);

  // Filter and sort items
  const containers = getContainers(items);
  const availableContainers = containers.filter(container => container.id !== editingItem?.id);
  
  const filteredItems = items.filter(item => {
    // Text search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (typeFilter && item.type !== typeFilter) {
      return false;
    }

    // Container filter - NEW LOGIC
    if (containerFilter) {
      // Show only the selected container and its contents
      if (item.id === containerFilter || item.containerId === containerFilter) {
        return true;
      }
      return false;
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'count':
        aValue = a.count || 1;
        bValue = b.count || 1;
        break;
      case 'weight':
        aValue = a.weight || 0;
        bValue = b.weight || 0;
        break;
      case 'value':
        aValue = a.value || 0;
        bValue = b.value || 0;
        break;
      case 'type':
        aValue = (a.type || '').toLowerCase();
        bValue = (b.type || '').toLowerCase();
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });

  // Separate top-level items and organize by container
  const topLevelItems = sortedItems.filter(item => !item.containerId);
  const containedItems = sortedItems.filter(item => item.containerId);

  // Create display items array with containers and their contents
  const displayItems = [];
  topLevelItems.forEach(item => {
    displayItems.push({ ...item, level: 0 });
    
    // If this item is a container, add its contained items (if expanded)
    if (item.type?.toLowerCase() === 'container') {
      const isExpanded = containerExpanded[item.id] !== false; // Default to true (expanded)
      if (isExpanded) {
        const itemsInContainer = containedItems.filter(containedItem => containedItem.containerId === item.id);
        itemsInContainer.forEach(containedItem => {
          displayItems.push({ ...containedItem, level: 1 });
        });
      }
    }
  });

  // Calculate totals - use filtered items instead of all items when container filter is active
  const itemsForTotals = containerFilter ? filteredItems : items;
  const { totalWeight, totalValue } = calculateTotals(itemsForTotals);

  // Event handlers
  const handleAddItem = (newItem) => {
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(prev => {
      const itemToRemove = prev.find(item => item.id === itemId);
      
      // If removing a container, move contained items to top level
      if (itemToRemove?.type?.toLowerCase() === 'container') {
        return prev.map(item => {
          if (item.containerId === itemId) {
            return { ...item, containerId: null };
          }
          return item;
        }).filter(item => item.id !== itemId);
      }
      
      // Otherwise just remove the item
      return prev.filter(item => item.id !== itemId);
    });
  };

  const handleUpdateItem = (itemId, updates) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSpendCharge = (itemId) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId && item.type?.toLowerCase() === 'wand' && item.charges > 0) {
        return { ...item, charges: item.charges - 1 };
      }
      return item;
    }));
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const toggleContainer = (containerId) => {
    setContainerExpanded(prev => ({
      ...prev,
      [containerId]: prev[containerId] === false ? true : false
    }));
  };

  return (
    <div style="max-width: 250px; font-size: 0.8em;">
      <style>
        {`
        .add-button {
          flex: 1;
          padding: 0.4em;
          font-size: 0.7em;
          background: var(--interactive-accent) !important;
          color: var(--text-on-accent);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Taroca', serif;
          transition: all 0.2s ease;
        }
        
        .add-button:hover {
          background: var(--interactive-accent-hover, #0066cc);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .add-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .charge-button {
          background: #8B5CF6;
          color: white;
          border: none;
          border-radius: 3px;
          padding: 0.2em 0.4em;
          font-size: 0.7em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .charge-button:hover {
          background: #7C3AED;
          transform: translateY(-1px);
        }
        
        .charge-button:disabled {
          background: #6B7280;
          cursor: not-allowed;
          transform: none;
        }
      `}
      </style>
      {/* Currency Section */}
      <div style="
          padding: 0.5em;
          margin-bottom: 0.1em;
        ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 600; font-size: 1em; font-family: 'Taroca', serif;">
            Currency
          </div>
          <button
            onclick={() => setCurrencyExpanded(!currencyExpanded)}
            style="
              background: none;
              box-shadow: none;
              border: none;
              cursor: pointer;
              font-size: 0.8em;
              color: var(--text-muted);
              padding: 0.2em;
            "
          >
            {currencyExpanded ? '▲' : '▼'}
          </button>
        </div>

        {currencyExpanded ? (
          <>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4em; margin-bottom: 0.5em;">
              <div>
                <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-family: 'Taroca', serif;">PP</label>
                <div style="display: flex; align-items: center; gap: 0.3em;">
                  {ppCoinImage && <img src={ppCoinImage} alt="PP" style="width: 16px; height: 16px; flex-shrink: 0;" />}
                  <input
                    type="number"
                    value={platinum}
                    oninput={e => setPlatinum(parseInt(e.target.value) || 0)}
                    min="0"
                    style="width: 100%; padding: 0.3em; font-size: 0.8em;"
                  />
                </div>
              </div>
              <div>
                <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-family: 'Taroca', serif;">GP</label>
                <div style="display: flex; align-items: center; gap: 0.3em;">
                  {gpCoinImage && <img src={gpCoinImage} alt="GP" style="width: 16px; height: 16px; flex-shrink: 0;" />}
                  <input
                    type="number"
                    value={gold}
                    oninput={e => setGold(parseInt(e.target.value) || 0)}
                    min="0"
                    style="width: 100%; padding: 0.3em; font-size: 0.8em;"
                  />
                </div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4em; margin-bottom: 0.5em;">
              <div>
                <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-family: 'Taroca', serif;">SP</label>
                <div style="display: flex; align-items: center; gap: 0.3em;">
                  {spCoinImage && <img src={spCoinImage} alt="SP" style="width: 16px; height: 16px; flex-shrink: 0;" />}
                  <input
                    type="number"
                    value={silver}
                    oninput={e => setSilver(parseInt(e.target.value) || 0)}
                    min="0"
                    style="width: 100%; padding: 0.3em; font-size: 0.8em;"
                  />
                </div>
              </div>
              <div>
                <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-family: 'Taroca', serif;">CP</label>
                <div style="display: flex; align-items: center; gap: 0.3em;">
                  {cpCoinImage && <img src={cpCoinImage} alt="CP" style="width: 16px; height: 16px; flex-shrink: 0;" />}
                  <input
                    type="number"
                    value={copper}
                    oninput={e => setCopper(parseInt(e.target.value) || 0)}
                    min="0"
                    style="width: 100%; padding: 0.3em; font-size: 0.8em;"
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}

        <div style="text-align: center; font-size: 0.75em; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 0.5em; flex-wrap: wrap;">
          {(() => {
            const parts = [];
            if (platinum > 0) parts.push(<span key="pp" style="display: flex; align-items: center; gap: 0.2em;">{ppCoinImage && <img src={ppCoinImage} alt="PP" style="width: 14px; height: 14px;" />}{platinum}</span>);
            if (gold > 0) parts.push(<span key="gp" style="display: flex; align-items: center; gap: 0.2em;">{gpCoinImage && <img src={gpCoinImage} alt="GP" style="width: 14px; height: 14px;" />}{gold}</span>);
            if (silver > 0) parts.push(<span key="sp" style="display: flex; align-items: center; gap: 0.2em;">{spCoinImage && <img src={spCoinImage} alt="SP" style="width: 14px; height: 14px;" />}{silver}</span>);
            if (copper > 0) parts.push(<span key="cp" style="display: flex; align-items: center; gap: 0.2em;">{cpCoinImage && <img src={cpCoinImage} alt="CP" style="width: 14px; height: 14px;" />}{copper}</span>);
            
            const totalGP = (platinum * 10) + gold + (silver * 0.1) + (copper * 0.01);
            return parts.length > 0 ? [...parts, <span key="total" style="margin-left: 0.3em;">• Total: {totalGP.toFixed(2)} gp</span>] : <span>0 coins • Total: 0.00 gp</span>;
          })()}
        </div>
      </div>

      {/* Search and Controls */}
      <div style="
          padding: 0.5em;
          margin-bottom: 0.15em;
        ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 600; font-size: 1em; font-family: 'Taroca', serif;">
            Controls
            {!controlsExpanded && (
              <span style="font-weight: normal; font-size: 0.75em; color: var(--text-muted); margin-left: 0.5em;">
                {searchTerm ? `"${searchTerm}"` : ''} {typeFilter ? `[${typeFilter}]` : ''} {containerFilter ? `[${containers.find(c => c.id === containerFilter)?.name || 'Container'}]` : ''} {sortBy !== 'name' || sortDirection !== 'asc' ? `(${sortBy} ${sortDirection})` : ''}
              </span>
            )}
          </div>
          <button
            onclick={() => setControlsExpanded(!controlsExpanded)}
            style="
              background: none;
              box-shadow: none;
              border: none;
              cursor: pointer;
              font-size: 0.8em;
              color: var(--text-muted);
              padding: 0.2em;
            "
          >
            {controlsExpanded ? '▲' : '▼'}
          </button>
        </div>

        {controlsExpanded && (
          <>
            <input
              type="search"
              placeholder="Search items..."
              value={searchTerm}
              oninput={e => setSearchTerm(e.target.value)}
              style="width: 100%; padding: 0.4em; font-size: 0.8em; margin-bottom: 0.5em;"
            />

            <div style="display: flex; gap: 0.3em; margin-bottom: 0.5em;">
              <button
                onclick={() => setFiltersExpanded(!filtersExpanded)}
                style="
                  flex: 1;
                  padding: 0.4em;
                  font-size: 0.7em;
                  cursor: pointer;
                  font-family: 'Taroca', serif;
                "
              >
                Filter {filtersExpanded ? '▲' : '▼'}
              </button>
              <button
                onclick={() => setShowAddModal(true)}
                className="add-button"
              >
                + Add
              </button>
              {/* Uncomment to add window storage reset button for debugging */}
              {/* <button
                onclick={() => hardResetInventory(setItems, setCopper, setSilver, setGold, setPlatinum)}
                style="
                  padding: 0.4em;
                  font-size: 0.7em;
                  background: #DC2626;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-family: 'Taroca', serif;
                "
                title="Clear localStorage and reload from frontmatter"
              >
                Reset
              </button> */}
            </div>

            {filtersExpanded && (
              <div style="
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                padding: 0.5em;
                margin-bottom: 0.5em;
              ">
                <div style="margin-bottom: 0.4em;">
                  <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-weight: 500; font-family: 'Taroca', serif;">
                    Type:
                  </label>
                  <select
                    value={typeFilter}
                    onchange={e => setTypeFilter(e.target.value)}
                    style="width: 100%; padding: 0.3em; font-size: 0.75em; margin-bottom: 0.4em;"
                  >
                    <option value="">All types</option>
                    {ITEM_TYPES.map(type => (
                      <option key={type} value={type}>
                        {getTypeEmoji(type)} {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NEW: Container filter dropdown */}
                <div style="margin-bottom: 0.4em;">
                  <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-weight: 500; font-family: 'Taroca', serif;">
                    Container:
                  </label>
                  <select
                    value={containerFilter}
                    onchange={e => setContainerFilter(e.target.value)}
                    style="width: 100%; padding: 0.3em; font-size: 0.75em; margin-bottom: 0.4em;"
                  >
                    <option value="">All containers</option>
                    {containers.map(container => (
                      <option key={container.id} value={container.id}>
                        📦 {container.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style="margin-bottom: 0.4em;">
                  <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-weight: 500; font-family: 'Taroca', serif;">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onchange={e => setSortBy(e.target.value)}
                    style="width: 100%; padding: 0.3em; font-size: 0.75em;"
                  >
                    <option value="name">Name</option>
                    <option value="count">Count</option>
                    <option value="weight">Weight</option>
                    <option value="value">Value</option>
                    <option value="type">Type</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 0.75em; margin-bottom: 0.2em; font-weight: 500; font-family: 'Taroca', serif;">
                    Direction:
                  </label>
                  <select
                    value={sortDirection}
                    onchange={e => setSortDirection(e.target.value)}
                    style="width: 100%; padding: 0.3em; font-size: 0.75em;"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Summary */}
      <div style="
        font-size: 0.7em;
        color: #ffd;
        margin-bottom: 0.75em;
        text-align: center;
        padding: 0.4em;
        background: var(--dark-accent);
        border-radius: 4px;
      ">
        {itemsForTotals.length} items • {totalWeight.toFixed(1)} lbs • {totalValue.toFixed(2)} gp
        {containerFilter && (
          <div style="margin-top: 0.2em; font-size: 0.9em;">
            📦 {containers.find(c => c.id === containerFilter)?.name || 'Container'} contents
          </div>
        )}
      </div>

      {/* Items List */}
      <div style="
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        overflow-y: auto;
      ">
        {displayItems.length === 0 ? (
          <div style="
            padding: 1em;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.8em;
          ">
            {searchTerm || typeFilter || containerFilter ? 'No items match your filters' : 'No items in inventory'}
          </div>
        ) : (
          displayItems.map((item, index) => (
            <div
              key={item.id}
              style={`
                padding: 0.5em;
                padding-left: ${0.5 + (item.level * 1)}em;
                border-bottom: ${index < displayItems.length - 1 ? '1px solid var(--background-modifier-border)' : 'none'};
                background: ${index % 2 === 0 ? 'var(--background-primary)' : 'var(--background-secondary-alt)'};
                ${item.level > 0 ? 'border-left: 3px solid var(--background-modifier-border-hover);' : ''}
              `}
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.3em;">
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 500; font-size: 0.9em; line-height: 1.2; font-family: 'Norwester'; color: var(--h1-color);">
                  {item.level > 0 && <span style="color: var(--text-muted); margin-right: 0.3em;">└</span>}
                  {item.type?.toLowerCase() === 'container' ? (
                    <span 
                      onclick={() => toggleContainer(item.id)}
                      style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.3em;"
                    >
                      <span style="font-size: 0.8em;">
                        {containerExpanded[item.id] !== false ? '▼' : '▶'}
                      </span>
                      {item.name}
                    </span>
                  ) : item.name}
                    {item.count > 1 && (
                      <span style="color: var(--text-muted); font-weight: normal; margin-left: 0.3em;">
                        ×{item.count}
                      </span>
                    )}
                  </div>
                  {item.type && (
                    <div style="margin-top: 0.2em;">
                      {(() => {
                        const colors = getTypeColors(item.type);
                        return (
                          <span style={`
                            background-color: ${colors.bg};
                            color: ${colors.text};
                            padding: 1px 4px;
                            border-radius: 8px;
                            font-size: 0.75em;
                            font-weight: 500;
                          `}>
                            {getTypeEmoji(item.type)} {item.type}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  {/* Note display */}
                  {item.note && (
                    <div style="margin-top: 0.3em; font-size: 0.8em; color: var(--text-muted); font-style: italic;">
                      <span 
                        title={item.note.length > 80 ? item.note : undefined}
                        style="cursor: help;"
                      >
                        {item.note.length > 80 ? `${item.note.substring(0, 80)}...` : item.note}
                      </span>
                    </div>
                  )}
                  {/* Container item count display */}
                  {item.type?.toLowerCase() === 'container' && (() => {
                    const containedCount = getItemsInContainer(items, item.id).length;
                    return containedCount > 0 ? (
                      <div style="margin-top: 0.2em; font-size: 0.8em; color: var(--text-muted);">
                        Contains {containedCount} item{containedCount !== 1 ? 's' : ''}
                      </div>
                    ) : null;
                  })()}
                  {/* Wand charges display and control */}
                  {item.type?.toLowerCase() === 'wand' && item.charges !== undefined && (
                    <div style="margin-top: 0.3em; display: flex; align-items: center; gap: 0.5em;">
                      <span style="font-size: 0.7em; color: var(--text-muted);">
                        Charges: {item.charges}/50
                      </span>
                      <button
                        onclick={() => handleSpendCharge(item.id)}
                        disabled={item.charges <= 0}
                        className="charge-button"
                        title={item.charges <= 0 ? 'No charges remaining' : 'Spend 1 charge'}
                      >
                        Use
                      </button>
                    </div>
                  )}
                </div>
                <div style="display: flex; gap: 0.2em; margin-left: 0.3em;">
                  <button
                    onclick={() => handleEditItem(item)}
                    style="
                      background: none;
                      border: none;
                      color: var(--text-muted);
                      cursor: pointer;
                      padding: 0.2em;
                      display: flex;
                      align-items: center !important;
                      justify-content: center !important;
                    "
                    title="Edit item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button
                    onclick={() => handleRemoveItem(item.id)}
                    style="
                      background: none;
                      border: none;
                      font-weight: 600;
                      width: 20px;
                      color: var(--text-muted);
                      cursor: pointer;
                      font-size: 1.6em;
                      padding: 0.2em;
                    "
                    title="Remove item"
                  >
                    X
                  </button>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.8em; color: var(--text-muted);">
                <span>
                  {getItemWeightDisplay(item, items)}
                </span>
                <span>
                  {item.value > 0 ? `${item.value} gp` : '—'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        availableContainers={availableContainers}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onUpdate={handleUpdateItem}
        item={editingItem}
        availableContainers={availableContainers}
      />
    </div>
  );
}

// Export
return { PathfinderInventory };