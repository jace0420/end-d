// src/components/MapScreen.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { playSfx } from '../utils/audio';

// --- MAP CONSTANTS ---
const DAGGERFORD_POS = { x: 2050, y: 2300 };
const PIXELS_PER_MILE = 3.6; 
const TRAVEL_SPEED_MPH = 3; 

export default function MapScreen({ active, onClose, onAdvanceTime }) {
  const position = useRef({ x: -1500, y: -1800 });
  const scaleRef = useRef(0.6);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const [uiScalePercent, setUiScalePercent] = useState(14);
  const [playerPos, setPlayerPos] = useState(DAGGERFORD_POS);
  const [destination, setDestination] = useState(null);

  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 2.5;

  const updateTransform = () => {
    if (contentRef.current) {
      const { x, y } = position.current;
      const s = scaleRef.current;
      contentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }
  };

  useEffect(() => {
    if (active) {
      updateTransform();
      updateUiLabel();
    }
  }, [active]);

  const updateUiLabel = () => {
    const pct = Math.round(((scaleRef.current - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100);
    setUiScalePercent(pct);
  };

  const performZoom = useCallback((direction) => {
    const container = containerRef.current;
    if (!container) return;
    const currentScale = scaleRef.current;
    const step = 0.2;
    let newScale = direction === 'in' || direction > 0 ? currentScale + step : currentScale - step;
    newScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    if (newScale === currentScale) return;

    const viewportWidth = container.offsetWidth;
    const viewportHeight = container.offsetHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const ratio = newScale / currentScale;

    position.current.x = centerX - (centerX - position.current.x) * ratio;
    position.current.y = centerY - (centerY - position.current.y) * ratio;

    scaleRef.current = newScale;
    updateTransform();
    updateUiLabel();
  }, []);

  const handleWheel = (e) => performZoom(e.deltaY > 0 ? -1 : 1);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (!e.ctrlKey) e.preventDefault();
    
    isDraggingRef.current = false;
    dragStart.current = { 
      x: e.clientX - position.current.x, 
      y: e.clientY - position.current.y,
      rawX: e.clientX,
      rawY: e.clientY
    };
    if(containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      e.preventDefault();
      const dist = Math.hypot(e.clientX - dragStart.current.rawX, e.clientY - dragStart.current.rawY);
      if (dist > 5) {
        isDraggingRef.current = true;
        position.current = { 
          x: e.clientX - dragStart.current.x, 
          y: e.clientY - dragStart.current.y 
        };
        updateTransform();
      }
    }
  };

  const handleMouseUp = (e) => {
    if(containerRef.current) containerRef.current.style.cursor = 'grab';
    if (!isDraggingRef.current) {
      handleMapClick(e);
    }
  };

  const handleMapClick = (e) => {
    if (!e.ctrlKey) return; 
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const rawX = clickX / scaleRef.current;
    const rawY = clickY / scaleRef.current;

    playSfx('/sfx/map_mark.wav');
    setDestination({ x: rawX, y: rawY });
  };

  // --- REFACTORED TRAVEL STATS ---
  const getTravelStats = useCallback(() => {
    if (!destination) return null;
    const dx = destination.x - playerPos.x;
    const dy = destination.y - playerPos.y;
    const pixelDist = Math.sqrt(dx*dx + dy*dy);
    
    const miles = Math.round(pixelDist / PIXELS_PER_MILE);
    const hours = Math.round(miles / TRAVEL_SPEED_MPH);
    
    const timeString = hours > 24 
      ? `${Math.floor(hours/24)} Days, ${hours%24} Hrs`
      : `${hours} Hours`;

    return { miles, timeString, hours };
  }, [destination, playerPos]);

  const confirmTravel = () => {
    if (!destination) return;
    const travel = getTravelStats();
    
    // FIX: Using 'travel.hours' instead of 'stats.hours'
    const hours = travel && travel.hours ? travel.hours : 0;
    
    setPlayerPos(destination);
    setDestination(null);
    playSfx('/sfx/footsteps.wav');
    
    if (typeof onAdvanceTime === 'function') {
      onAdvanceTime(hours);
    }
  };

  const stats = getTravelStats();

  if (!active) return null;

  return (
    <div className="map-overlay">
      <div className="map-ui-header">
        <div className="map-title-group">
          <h2>THE SWORD COAST</h2>
          <span className="map-coords" style={{color: '#888'}}>
            CTRL + CLICK TO PLOT ROUTE
          </span>
        </div>
        <button 
          className="close-map-btn" 
          onClick={() => { playSfx('/scribblequick.wav'); onClose(); }}
        >
          CLOSE MAP
        </button>
      </div>

      <div 
        className="map-viewport"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        title="Hold CTRL to plot travel path"
      >
        <div className="map-vignette"></div>
        <div className="map-grid-overlay"></div>
        <div className="compass-rose"><i className="ra ra-compass ra-4x"></i></div>

        <div className="zoom-controls">
          <button onClick={() => performZoom('in')}>+</button>
          <div className="zoom-label">{uiScalePercent}%</div>
          <button onClick={() => performZoom('out')}>-</button>
        </div>

        {destination && stats && (
          <div 
            className="travel-panel" 
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <div className="travel-info">
              <div className="travel-stat">
                <label>DISTANCE</label>
                <span>{stats.miles} Miles</span>
              </div>
              <div className="travel-stat">
                <label>EST. TIME</label>
                <span>{stats.timeString}</span>
              </div>
            </div>
            <div className="travel-actions">
              <button className="confirm-btn" onClick={confirmTravel}>TRAVEL</button>
              <button className="cancel-btn" onClick={() => setDestination(null)}>CANCEL</button>
            </div>
          </div>
        )}

        <div 
          className="map-content"
          ref={contentRef}
          style={{ transformOrigin: '0 0', willChange: 'transform' }}
        >
          <img src="/swordcoast.jpg" alt="World Map" className="world-map-image" draggable="false" />

          <svg className="map-svg-layer">
            {destination && (
              <line 
                x1={playerPos.x} y1={playerPos.y} 
                x2={destination.x} y2={destination.y} 
                stroke="#d4af37" 
                strokeWidth="4" 
                strokeDasharray="10,10"
                className="travel-line"
              />
            )}
          </svg>

          <div 
            className="map-icon player"
            style={{ left: playerPos.x, top: playerPos.y }}
          >
            <i className="ra ra-helmet ra-2x"></i>
            <div className="icon-label">YOU</div>
          </div>

          {destination && (
            <div 
              className="map-icon ghost"
              style={{ left: destination.x, top: destination.y }}
            >
              <i className="ra ra-helmet ra-2x"></i>
              <div className="icon-label">TARGET</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}