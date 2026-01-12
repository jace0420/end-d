import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCreator from './components/CharacterCreator';
import './App.css'; // We will add basic styles next

function App() {
  // This is the "State" variable. 
  // It starts as 'menu'. When we change it, the screen changes.
  const [screen, setScreen] = useState('menu');

  return (
    <div className="app-container">
      {/* IF screen is 'menu', show MainMenu */}
      {screen === 'menu' && (
        <MainMenu onStart={() => setScreen('create')} />
      )}

      {/* IF screen is 'create', show CharacterCreator */}
      {screen === 'create' && (
        <CharacterCreator />
      )}
    </div>
  );
}

export default App;