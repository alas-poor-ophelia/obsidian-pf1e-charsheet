// Horizontal Picker Wheel Component
function HorizontalPickerWheel({
  value = 0,
  onChange = () => { },
  min = 0,
  max = 99,
  className = ''
}) {
  const [selectedValue, setSelectedValue] = dc.useState(value);
  const [isDragging, setIsDragging] = dc.useState(false);
  const [dragStart, setDragStart] = dc.useState({ x: 0, scrollLeft: 0 });
  const [isAnimating, setIsAnimating] = dc.useState(false);
  const [touchStartTime, setTouchStartTime] = dc.useState(0);

  const containerRef = dc.useRef(null);

  // Create array of values
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // Constants for layout
  const itemWidth = 60;
  const containerWidth = itemWidth * 7; // Show 7 items visible
  const centerOffset = containerWidth / 2; // Where the center line is in the container

  // Track layout: [padding: 210px] [item0: 60px] [item1: 60px] [item2: 60px] ... [padding: 210px]
  // Item N center is at: 210 + N*60 + 30 = 240 + N*60
  // Container center is always at: scrollLeft + 210
  const getScrollForValue = (val) => {
    const index = val - min;
    // To center item N: align (240 + N*60) with (scrollLeft + 210)
    // So: scrollLeft = (240 + N*60) - 210 = 30 + N*60
    return 30 + (index * itemWidth);
  };

  // To find centered value: which item center aligns with container center?
  const getValueFromScroll = (scrollLeft) => {
    // Container center sees track position: scrollLeft + 210
    // Item N center is at: 240 + N*60  
    // If aligned: scrollLeft + 210 = 240 + N*60
    // So: N = (scrollLeft + 210 - 240) / 60 = (scrollLeft - 30) / 60
    const index = Math.round((scrollLeft - 30) / itemWidth);
    return Math.max(min, Math.min(max, min + index));
  };

  // Get visual properties - highlight the selected value with dramatic scaling
  const getItemStyle = (itemValue) => {
    const isSelected = itemValue === selectedValue;
    
    return {
      transform: isSelected ? 'scale(1.6) translateY(15%)' : 'scale(0.6)',
      transformOrigin: 'center bottom',
      opacity: isSelected ? 1 : 0.5,
      fontWeight: isSelected ? '800' : '400',
      color: isSelected ? '#ffffff' : 'var(--text-normal)',
      textShadow: isSelected ? '0 0 6px rgba(255, 255, 255, 0.8), 0 0 12px rgba(255, 255, 255, 0.4)' : 'none',
      filter: isSelected ? 'brightness(1.3) contrast(1.1)' : 'brightness(0.8)',
      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: isSelected ? 10 : 1,
      position: 'relative'
    };
  };

  // Smooth scroll to a position
  const scrollToPosition = (targetScroll, shouldAnimate = true) => {
    if (!containerRef.current) return;

    if (!shouldAnimate) {
      containerRef.current.scrollLeft = targetScroll;
      return;
    }

    setIsAnimating(true);
    const startScroll = containerRef.current.scrollLeft;
    const distance = targetScroll - startScroll;
    const duration = 300;
    const startTime = performance.now();

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      const currentScroll = startScroll + distance * easedProgress;
      containerRef.current.scrollLeft = currentScroll;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // Handle value selection
  const selectValue = (newValue) => {
    if (newValue === selectedValue || isAnimating) return;

    setSelectedValue(newValue);
    onChange(newValue);

    const targetScroll = getScrollForValue(newValue);
    scrollToPosition(targetScroll, true);
  };

  // Handle click on a specific item
  const handleItemClick = (clickedValue, e) => {
    if (isDragging) return;
    
    e.stopPropagation();
    selectValue(clickedValue);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;

    setDragStart({
      x: e.clientX,
      scrollLeft: containerRef.current.scrollLeft
    });

    e.preventDefault();
  };

  // Handle touch start for dragging
  const handleTouchStart = (e) => {
    if (!containerRef.current) return;

    setTouchStartTime(performance.now());
    setDragStart({
      x: e.touches[0].clientX,
      scrollLeft: containerRef.current.scrollLeft
    });

    // Don't prevent default here to allow item touches to work
  };

  // Handle mouse move during drag
  const handleMouseMove = (e) => {
    if (!dragStart.x || !containerRef.current) return;

    const clientX = e.clientX;
    const deltaX = Math.abs(clientX - dragStart.x);
    
    if (deltaX > 5 && !isDragging) {
      setIsDragging(true);
    }

    if (isDragging) {
      e.preventDefault();
      const deltaX = clientX - dragStart.x;
      const newScrollLeft = dragStart.scrollLeft - deltaX;

      containerRef.current.scrollLeft = newScrollLeft;

      // Update selected value during drag in real-time
      const dragValue = getValueFromScroll(newScrollLeft);
      if (dragValue !== selectedValue) {
        setSelectedValue(dragValue);
        onChange(dragValue);
      }
    }
  };

  // Handle touch move during drag
  const handleTouchMove = (e) => {
    if (!dragStart.x || !containerRef.current) return;

    const clientX = e.touches[0].clientX;
    const deltaX = Math.abs(clientX - dragStart.x);
    
    if (deltaX > 5 && !isDragging) {
      setIsDragging(true);
    }

    if (isDragging) {
      e.preventDefault();
      const deltaX = clientX - dragStart.x;
      const newScrollLeft = dragStart.scrollLeft - deltaX;

      containerRef.current.scrollLeft = newScrollLeft;

      // Update selected value during drag in real-time
      const dragValue = getValueFromScroll(newScrollLeft);
      if (dragValue !== selectedValue) {
        setSelectedValue(dragValue);
        onChange(dragValue);
      }
    }
  };

  // Handle mouse up - snap to the current position
  const handleMouseUp = () => {
    if (!containerRef.current) return;

    if (isDragging) {
      // Get the value that should be selected based on current scroll
      const currentScroll = containerRef.current.scrollLeft;
      const snapValue = getValueFromScroll(currentScroll);
      
      // Set this as the selected value and snap to it
      setSelectedValue(snapValue);
      onChange(snapValue);
      
      const snapScroll = getScrollForValue(snapValue);
      scrollToPosition(snapScroll, true);
    }

    setIsDragging(false);
    setDragStart({ x: 0, scrollLeft: 0 });
  };

  // Handle touch end - snap to the current position or handle tap
  const handleTouchEnd = (e) => {
    if (!containerRef.current) return;

    const touchDuration = performance.now() - touchStartTime;
    const wasDragging = isDragging;

    // If it was a quick touch without dragging, treat as tap-to-select
    if (!wasDragging && touchDuration < 200 && dragStart.x > 0) {
      // Find which item was touched
      const touch = e.changedTouches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      const scrollLeft = containerRef.current.scrollLeft;
      
      // Calculate which item was touched based on position
      const trackX = scrollLeft + relativeX - centerOffset;
      const itemIndex = Math.round((trackX - 30) / itemWidth);
      const touchedValue = Math.max(min, Math.min(max, min + itemIndex));
      
      selectValue(touchedValue);
    } else if (wasDragging) {
      // Handle normal drag end
      const currentScroll = containerRef.current.scrollLeft;
      const snapValue = getValueFromScroll(currentScroll);
      
      setSelectedValue(snapValue);
      onChange(snapValue);
      
      const snapScroll = getScrollForValue(snapValue);
      scrollToPosition(snapScroll, true);
    }

    setIsDragging(false);
    setDragStart({ x: 0, scrollLeft: 0 });
    setTouchStartTime(0);
  };

  // Handle scroll wheel
  const handleWheel = (e) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newValue = Math.max(min, Math.min(max, selectedValue + delta));
    selectValue(newValue);
  };

  // Set up event listeners for both mouse and touch
  dc.useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e) => handleTouchMove(e);
    const handleGlobalTouchEnd = (e) => handleTouchEnd(e);

    if (dragStart.x > 0) {
      // Mouse events
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      // Touch events
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      // Clean up mouse events
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      
      // Clean up touch events
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [dragStart.x, isDragging, selectedValue, touchStartTime]);

  // Initialize scroll position when selectedValue changes
  dc.useEffect(() => {
    if (containerRef.current && !isDragging && !isAnimating) {
      const targetScroll = getScrollForValue(selectedValue);
      containerRef.current.scrollLeft = targetScroll;
    }
  }, [selectedValue]);

  // Update when value prop changes
  dc.useEffect(() => {
    if (value !== selectedValue) {
      selectValue(value);
    }
  }, [value]);

  return (
    <div className={`horizontal-picker-wheel ${className}`}>
      <style>
        {`
          .horizontal-picker-wheel {
            position: relative;
            width: ${containerWidth}px;
            height: 80px;
            margin: 0 auto;
            background: linear-gradient(135deg, 
              var(--background-secondary, #1a1a1a) 0%, 
              var(--background-primary, #0d0d0d) 100%);
            border-radius: 16px;
            overflow: hidden;
            user-select: none;
          }
          
          .picker-container {
            width: 100%;
            height: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            position: relative;
            cursor: grab;
            touch-action: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          .picker-container::-webkit-scrollbar {
            display: none;
          }
          
          .picker-container.dragging {
            cursor: grabbing;
          }
          
          .picker-track {
            display: flex;
            height: 100%;
            align-items: flex-end;
            padding: 0 ${centerOffset}px;
            width: ${values.length * itemWidth + containerWidth}px;
          }
          
          .picker-item {
            width: ${itemWidth}px;
            height: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            font-size: 24px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            cursor: pointer;
            position: relative;
            flex-shrink: 0;
            touch-action: manipulation;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          .picker-item:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .center-line {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            background: var(--accent, #6366f1);
            opacity: 0.3;
            pointer-events: none;
            z-index: 1;
          }
        `}
      </style>

      <div
        ref={containerRef}
        className={`picker-container ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
      >
        <div className="picker-track">
          {values.map((val) => (
            <div
              key={val}
              className="picker-item"
              style={getItemStyle(val)}
              onClick={(e) => handleItemClick(val, e)}
            >
              {val}
            </div>
          ))}
        </div>
        
        <div className="center-line" />
      </div>
    </div>
  );
}

// Demo component
function Demo() {
  const [round, setRound] = dc.useState(0);

  return (
    <div style={{
      padding: '2rem',
      background: 'var(--background-primary, #0d0d0d)',
      minHeight: '100vh',
      color: 'var(--text-normal, #ffffff)'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Pathfinder 1e Combat Round Tracker
      </h1>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'var(--background-secondary, #1a1a1a)',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--background-modifier-border, #333)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Current Round
        </h2>

        <HorizontalPickerWheel
          value={round}
          onChange={setRound}
          min={0}
          max={99}
        />

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '1.2rem',
          color: 'var(--text-muted, #888)'
        }}>
          Round: <strong style={{ color: 'var(--accent, #6366f1)' }}>{round}</strong>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--background-primary, #0d0d0d)',
          borderRadius: '8px',
          border: '1px solid var(--background-modifier-border, #333)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Instructions:</h3>
          <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
            <li>Click/tap any number to jump to that round</li>
            <li>Drag horizontally to scroll through rounds (mouse or touch)</li>
            <li>Use mouse wheel to increment/decrement</li>
            <li>Values automatically snap to valid positions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Export
return { HorizontalPickerWheel, Demo };