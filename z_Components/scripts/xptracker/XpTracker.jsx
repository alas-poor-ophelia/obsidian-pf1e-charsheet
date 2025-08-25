// === PF1e XP Tracker Component ===

// Get Meta Bind API
const getMbApi = () => {
  if (typeof app === 'undefined' || !app.plugins) return null;
  return app.plugins.plugins['obsidian-meta-bind-plugin']?.api;
};

// PF1e Medium XP Track breakpoints
const XP_BREAKPOINTS = [
  0,        // Level 1
  2000,     // Level 2
  5000,     // Level 3
  9000,     // Level 4
  15000,    // Level 5
  23000,    // Level 6
  35000,    // Level 7
  51000,    // Level 8
  75000,    // Level 9
  105000,   // Level 10
  155000,   // Level 11
  220000,   // Level 12
  315000,   // Level 13
  445000,   // Level 14
  635000,   // Level 15
  890000,   // Level 16
  1300000,  // Level 17
  1800000,  // Level 18
  2550000,  // Level 19
  3600000,  // Level 20
];

// Get current level from XP
function getLevelFromXP(xp) {
  for (let i = XP_BREAKPOINTS.length - 1; i >= 0; i--) {
    if (xp >= XP_BREAKPOINTS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Format XP number with commas
function formatXP(xp) {
  return xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Main XP Tracker Component
function XPTracker({ bindTarget = 'xp', initialXP = 0 }) {
  const mb = getMbApi();
  const [currentFilePath, setCurrentFilePath] = dc.useState('');
  const [currentXP, setCurrentXP] = dc.useState(initialXP);
  const [xpModifier, setXpModifier] = dc.useState('');
  const [isInitialized, setIsInitialized] = dc.useState(false);

  // Initialize on mount
  dc.useEffect(() => {
    const activeFile = app?.vault?.getFileByPath("MiniSheet/Adarin/components/AdarinMiniSheetConfig.md")
    if (activeFile && mb) {
      setCurrentFilePath(activeFile.path);

      // Load current XP from metadata
      const xpTarget = mb.parseBindTarget(bindTarget, activeFile.path);
      const storedXP = mb.getMetadata(xpTarget);
 
      if (storedXP !== undefined && storedXP !== null) {
        setCurrentXP(parseInt(storedXP) || 0);
      } else if (initialXP > 0) {
        // Set initial XP if no stored value exists
        mb.setMetadata(xpTarget, initialXP);
        setCurrentXP(initialXP);
      }
      
      setIsInitialized(true);
    }
  }, []);

  // Save XP to metadata whenever it changes (after initialization)
  dc.useEffect(() => {
    if (isInitialized && mb && currentFilePath) {
      const xpTarget = mb.parseBindTarget(bindTarget, currentFilePath);
      mb.setMetadata(xpTarget, currentXP);
    }
  }, [currentXP, isInitialized]);

  // Calculate level and progress
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevel = Math.min(currentLevel + 1, 20);
  
  const xpForCurrentLevel = XP_BREAKPOINTS[currentLevel - 1] || 0;
  const xpForNextLevel = XP_BREAKPOINTS[nextLevel - 1] || XP_BREAKPOINTS[19];
  
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  // Handle XP modification
  const modifyXP = (amount) => {
    const modifier = parseInt(amount) || 0;
    if (modifier !== 0) {
      const newXP = Math.max(0, currentXP + modifier);
      setCurrentXP(newXP);
      setXpModifier('');
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      modifyXP(xpModifier);
    }
  };

  return (
    <div style="width: 245px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
      {/* Current XP Display */}
      <div style="text-align: center; font-size: 0.85em; font-family: 'Taroca', serif; color: var(--text-normal); margin-bottom: 4px;">
        {formatXP(currentXP)} XP
      </div>

      {/* Progress Bar Container */}
      <div style="position: relative; margin-bottom: 4px;">
        {/* Level Labels */}
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="font-size: 0.8em; font-weight: 600; font-family: 'Taroca', serif;color: var(--text-normal);">
            LVL {currentLevel}
          </span>
          <span style="font-size: 0.8em; font-weight: 600; font-family: 'Taroca', serif; color: var(--text-muted);">
            LVL {nextLevel}
          </span>
        </div>

        {/* Progress Bar */}
        <div style="
          position: relative;
          width: 100%;
          height: 20px;
          background-color: var(--background-modifier-border);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
        ">
          {/* Progress Fill */}
          <div style={`
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: ${progressPercent}%;
            background-color: #C14343;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(193, 67, 67, 0.3);
          `}></div>

          {/* Percentage Text */}
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
			font-family: 'Taroca', serif;
            font-size: 0.75em;
            font-weight: 600;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            z-index: 1;
          ">
            {progressPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Next Level XP Display */}
      <div style="text-align: center; font-size: 0.75em; font-family: 'Taroca', serif; color: var(--text-muted); margin-bottom: 12px;">
        Next: {formatXP(xpForNextLevel)} XP
      </div>

      {/* XP Modifier Controls */}
      <div style="display: flex; gap: 6px; align-items: center; justify-content: center; margin-bottom: 10px;">
        <button
          onclick={() => modifyXP(-Math.abs(parseInt(xpModifier) || 0))}
          style="
            width: 28px;
            height: 28px;
            border-radius: 4px;
            background-color: var(--background-modifier-error);
            color: var(--text-on-accent);
            border: none;
            cursor: pointer;
            font-size: 1.1em;
            font-weight: bold;
			font-family: 'Taroca', serif;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
          "
          onmouseover={(e) => e.target.style.opacity = '0.8'}
          onmouseout={(e) => e.target.style.opacity = '1'}
        >
          −
        </button>

        <input
          type="number"
          value={xpModifier}
          oninput={(e) => setXpModifier(e.target.value)}
          onkeypress={handleInputKeyPress}
          placeholder="XP"
          style="
            width: 80px;
            height: 28px;
            text-align: center;
            border: 1px solid var(--background-modifier-border);
            border-radius: 4px;
            background-color: var(--background-primary);
            color: var(--text-normal);
            font-size: 0.85em;
            padding: 0 4px;
          "
        />

        <button
          onclick={() => modifyXP(Math.abs(parseInt(xpModifier) || 0))}
          style="
            width: 28px;
            height: 28px;
            border-radius: 4px;
            background-color: #ca9759;
            color: var(--text-on-accent);
            border: none;
            cursor: pointer;
            font-size: 1.1em;
            font-weight: bold;
			font-family: 'Taroca', serif;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
          "
          onmouseover={(e) => e.target.style.opacity = '0.8'}
          onmouseout={(e) => e.target.style.opacity = '1'}
        >
          +
        </button>
      </div>

      {/* Debug info (remove in production) */}
      {!mb && (
        <div style="
          margin-top: 10px;
          padding: 8px;
          background-color: var(--background-modifier-error-rgb);
          border-radius: 4px;
          font-size: 0.75em;
          color: var(--text-error);
        ">
          ⚠️ Meta Bind plugin not found. XP will not persist.
        </div>
      )}
    </div>
  );
}

// Export
return { XPTracker };