// src/components/TransitionScreen.jsx
import React from 'react';

export default function TransitionScreen({ active }) {
  if (!active) return null;

  return (
    <div className="transition-overlay">
      {/* Multiple puffs to create density and chaos */}
      <div className="smoke-puff puff-1"></div>
      <div className="smoke-puff puff-2"></div>
      <div className="smoke-puff puff-3"></div>
      <div className="smoke-puff puff-4"></div>
      <div className="smoke-puff puff-5"></div>
      
      <div className="loading-text">Entering Faerûn...</div>
    </div>
  );
}