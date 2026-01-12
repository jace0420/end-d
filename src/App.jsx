// src/App.jsx
import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCreator from './components/CharacterCreator';
import GameScreen from './components/GameScreen';
import DiceRoller from './components/DiceRoller';
import MusicManager from './components/MusicManager';
import TransitionScreen from './components/TransitionScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState('menu');
  const [character, setCharacter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startCreation = () => {
    setScreen('create');
  };

  const finishCreation = (charData) => {
    setCharacter(charData);
    
    // 1. PLAY SWORD SOUND
    // We create a temporary audio object just for this sound effect
    const scribbleSfx = new Audio('/scribble.wav');
    scribbleSfx.volume = 1.0;
    scribbleSfx.play().catch(e => console.log("SFX blocked"));

    // 2. START VISUAL & MUSIC TRANSITION
    setIsTransitioning(true);

    setTimeout(() => {
      setScreen('game');
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="app-container">
      <DiceRoller />
      
      {/* PASS THE PROP HERE so MusicManager knows when to fade out */}
      <MusicManager currentScreen={screen} inTransition={isTransitioning} /> 
      
      <TransitionScreen active={isTransitioning} />

      {screen === 'menu' && (
        <MainMenu onStart={startCreation} />
      )}

      {screen === 'create' && (
        <CharacterCreator onCharacterComplete={finishCreation} />
      )}

      {screen === 'game' && character && (
        <GameScreen character={character} />
      )}
    </div>
  );
}

export default App;