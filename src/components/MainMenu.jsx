// This component represents the main menu of the game.

import React from 'react';

// 'onStart' is a function passed down from the parent (App.jsx)
// It tells the parent: "Hey, the user clicked the button!"
export default function MainMenu({ onStart }) {
  return (
    <div className="menu-container">
      <h1 className="title">END&D</h1>
      <p className="subtitle">Endless Dungeons & Dragons</p>
      <button className="play-btn" onClick={onStart}>
        PLAY
      </button>
    </div>
  );
}