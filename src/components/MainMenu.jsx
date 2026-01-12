import React, { useEffect, useRef } from "react";

export default function MainMenu({ onStart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (clientX - centerX) / centerX;
      const y = (clientY - centerY) / centerY;

      containerRef.current.style.setProperty("--mouse-x", x);
      containerRef.current.style.setProperty("--mouse-y", y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="menu-container" ref={containerRef}>
      {/* --- NEW: FOG LAYERS --- */}
      <div className="fog-wrapper">
        <div className="fog-layer fog-1"></div>
        <div className="fog-layer fog-2"></div>
        <div className="fog-layer fog-3"></div>
      </div>

      {/* Title & Content */}
      <h1 className="title">END&D</h1>
      <p className="subtitle">Endless Dungeons & Dragons</p>

      <div className="button-wrapper">
        <button className="play-btn" onClick={onStart}>
          Enter Faerûn
        </button>
      </div>
    </div>
  );
}
