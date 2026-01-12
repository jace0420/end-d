import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCreator from './components/CharacterCreator';
import GameScreen from './components/GameScreen';
import DiceRoller from './components/DiceRoller';
import './App.css';

function App() {
  const [screen, setScreen] = useState('menu');
  const [character, setCharacter] = useState(null);

  const startCreation = () => {
    setScreen('create');
  };

  const finishCreation = (charData) => {
    setCharacter(charData);
    setScreen('game');
  };

  return (
    <div className="app-container">
      {/* The Dice Overlay - Always active but invisible until triggered */}
      <DiceRoller /> 

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