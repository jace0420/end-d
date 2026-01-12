// src/App.jsx
import React, { useState } from "react";
import MainMenu from "./components/MainMenu";
import CharacterCreator from "./components/CharacterCreator";
import GameScreen from "./components/GameScreen";
import DiceRoller from "./components/DiceRoller";
import MusicManager from "./components/MusicManager";
import TransitionScreen from "./components/TransitionScreen";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("menu");
  const [character, setCharacter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startCreation = () => {
    setScreen("create");
  };

  const finishCreation = (charData) => {
    setCharacter(charData);

    // 1. PLAY SOUND EFFECT (Optional - ensure file exists in public folder)
    const scribbleSfx = new Audio("/scribble.wav");
    scribbleSfx.volume = 0.9;
    scribbleSfx.play().catch(() => console.debug("SFX blocked"));

    // 2. START VISUAL & MUSIC TRANSITION
    setIsTransitioning(true);

    setTimeout(() => {
      setScreen("game");

      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
    }, 1200);
  };

  // --- DAMAGE HANDLER ---
  const handleDamage = (amount) => {
    if (!character) return;

    setCharacter((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - amount), // Prevent HP from going below 0
    }));
  };

  return (
    <div className="app-container">
      {/* 1. GLOBAL OVERLAYS */}
      <DiceRoller />
      <MusicManager currentScreen={screen} inTransition={isTransitioning} />
      <TransitionScreen active={isTransitioning} />

      {/* 2. SCREEN ROUTING */}
      {screen === "menu" && <MainMenu onStart={startCreation} />}

      {screen === "create" && (
        <CharacterCreator onCharacterComplete={finishCreation} />
      )}

      {screen === "game" && character && (
        <GameScreen character={character} onDamage={handleDamage} />
      )}
    </div>
  );
}

export default App;
