import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCreator from './components/CharacterCreator';
import './App.css';

function App() {
  const [screen, setScreen] = useState('menu');
  
  // This is where the live game data lives
  const [character, setCharacter] = useState(null);

  const startCreation = () => {
    setScreen('create');
  };

  const finishCreation = (charData) => {
    console.log("Character Created:", charData);
    setCharacter(charData);
    setScreen('game'); // We will build this screen next!
  };

  return (
    <div className="app-container">
      {screen === 'menu' && (
        <MainMenu onStart={startCreation} />
      )}

      {screen === 'create' && (
        <CharacterCreator onCharacterComplete={finishCreation} />
      )}

      {screen === 'game' && (
        <div style={{color: 'white', marginTop: '50px', fontSize: '2rem'}}>
          {/* Placeholder for the Game Screen */}
          <h1 style={{fontFamily: 'var(--font-title)', color: 'var(--color-gold)'}}>
            WELCOME, {character?.name.toUpperCase()}
          </h1>
          <p>The Realm Awaits...</p>
          <small>(OpenRouter Connection Coming Next)</small>
        </div>
      )}
    </div>
  );
}

export default App;