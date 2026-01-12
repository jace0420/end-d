// src/App.jsx
import React, { useState, useEffect } from "react";
import MainMenu from './components/MainMenu';
import CharacterCreator from "./components/CharacterCreator";
import GameScreen from "./components/GameScreen";
import DiceRoller from "./components/DiceRoller";
import MusicManager from "./components/MusicManager";
import TransitionScreen from "./components/TransitionScreen";
import GameClock from "./components/GameClock"; // <--- Ensure this is imported
import MapScreen from "./components/MapScreen"; // <--- Ensure this is imported
import "./App.css";
import { playSfx } from './utils/audio';

function App() {
  const [screen, setScreen] = useState("menu");
  const [character, setCharacter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // --- TIME STATE ---
  // Start at 8:00 AM (8 * 60 = 480 minutes)
  const [gameMinutes, setGameMinutes] = useState(480);

  // The missing function that caused the crash!
  const handleAdvanceTime = (amount, unit = 'hours') => {
    if (unit === 'minutes') {
      setGameMinutes(prev => prev + amount);
    } else {
      setGameMinutes(prev => prev + (amount * 60));
    }
  };
  // ------------------

  const startCreation = () => {
    setScreen("create");
  };

  const finishCreation = (charData) => {
    setCharacter(charData);
    playSfx('/scribble.wav', 0.9);
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen("game");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
    }, 1200);
  };

  const handleDamage = (amount) => {
    if (!character) return;
    setCharacter((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - amount),
    }));
  };

  const handleLocationUpdate = (locationName) => {
    setCharacter(prev => ({
      ...prev,
      currentLocation: locationName
    }));
  };

  // Global SFX Click Listener
  useEffect(() => {
    const onClick = (e) => {
      if (e.button && e.button !== 0) return;
      const btn = e.target.closest && e.target.closest('button, [role="button"], .play-btn, .game-btn, .submit-btn');
      if (!btn) return;
      if (btn.hasAttribute('data-nosfx')) return;
      const sfx = btn.getAttribute && btn.getAttribute('data-sfx');
      playSfx(sfx || '/scribblequick.wav', 0.9);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <div className="app-container">
      {/* GLOBAL OVERLAYS */}
      <DiceRoller />
      <MusicManager currentScreen={screen} inTransition={isTransitioning} />
      <TransitionScreen active={isTransitioning} />

      {/* --- CLOCK (Shows only in game) --- */}
      {screen === 'game' && <GameClock totalMinutes={gameMinutes} />}

      {/* --- MAP SCREEN (Now receiving the prop!) --- */}
      <MapScreen 
        active={showMap} 
        onClose={() => setShowMap(false)} 
        onAdvanceTime={handleAdvanceTime} // <--- CRITICAL FIX
        onLocationUpdate={handleLocationUpdate}
      />

      {/* SCREEN ROUTING */}
      {screen === "menu" && <MainMenu onStart={startCreation} />}

      {screen === "create" && (
        <CharacterCreator onCharacterComplete={finishCreation} />
      )}

      {screen === "game" && character && (
        <GameScreen 
          character={character} 
          onDamage={handleDamage} 
          onToggleMap={() => setShowMap(true)} 
          gameMinutes={gameMinutes}
          onAdvanceTime={(mins) => handleAdvanceTime(mins, 'minutes')}
        />
      )}
    </div>
  );
}

export default App;