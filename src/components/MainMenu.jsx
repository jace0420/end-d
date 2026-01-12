import React, { useEffect, useRef } from 'react';

export default function MainMenu({ onStart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      // 1. Get mouse position
      const { clientX, clientY } = e;
      
      // 2. Calculate center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // 3. Calculate distance from center (-1 to +1 scale)
      const x = (clientX - centerX) / centerX;
      const y = (clientY - centerY) / centerY;

      // 4. Send these numbers to CSS as variables
      // We multiply by -1 to make elements move AWAY from mouse (Parallax feel)
      containerRef.current.style.setProperty('--mouse-x', x);
      containerRef.current.style.setProperty('--mouse-y', y);
    };

    // Attach event listener
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup when leaving menu
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="menu-container" ref={containerRef}>
      <h1 className="title">END&D</h1>
      <p className="subtitle">Endless Dungeons & Dragons</p>
      
      {/* We wrap the button to separate the 'Hover Scale' logic 
        from the 'Parallax Move' logic 
      */}
      <div className="button-wrapper">
        <button className="play-btn" onClick={onStart}>
          Enter Faerûn
        </button>
      </div>
    </div>
  );
}