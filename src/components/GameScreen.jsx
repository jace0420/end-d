// src/components/GameScreen.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function GameScreen({ character }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { 
      role: 'system', 
      text: `Welcome, ${character.name}. You stand at the threshold of adventure. The world awaits your command.` 
    }
  ]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [history]);

  const handleSend = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const newHistory = [...history, { role: 'user', text: input }];
      setHistory(newHistory);
      setInput('');
      
      setTimeout(() => {
        setHistory(prev => [...prev, { 
          role: 'ai', 
          text: "The Dungeon Master hears you, but is currently silent. (AI Connection Pending...)" 
        }]);
      }, 1000);
    }
  };

  return (
    <div className="game-screen">
      {/* LEFT PANEL: Narrative */}
      <div className="narrative-panel">
        <div className="messages-area">
          {history.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.role === 'ai' || msg.role === 'system' ? (
                <span className="ai-text">{msg.text}</span>
              ) : (
                <span className="user-text">
                  <span className="user-label">{character.name}</span>
                  {msg.text}
                </span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSend}
            placeholder="What do you do?"
          />
          <button onClick={() => handleSend({ key: 'Enter' })}>SEND</button>
        </div>
      </div>

      {/* RIGHT PANEL: Stats & Actions */}
      <div className="stats-panel">
        <div className="char-summary">
          <h2>{character.name}</h2>
          <div className="sub-header">{character.race} {character.class} • Lvl {character.level}</div>
        </div>

        {/* Vital Bars */}
        <div className="vitals">
          <div className="bar-container">
            <label><span>HP</span> <span>{character.hp}/{character.maxHP}</span></label>
            <div className="bar-bg">
              <div className="bar-fill hp" style={{width: `${(character.hp / character.maxHP) * 100}%`}} />
            </div>
          </div>
          
          <div className="bar-container">
            <label><span>XP</span> <span>{character.xp}/{character.xpToNextLevel}</span></label>
            <div className="bar-bg">
              <div className="bar-fill xp" style={{width: `${(character.xp / character.xpToNextLevel) * 100}%`}} />
            </div>
          </div>
        </div>

        {/* Action Grid (Now with RA Icons) */}
        <div className="action-grid">
          <button className="game-btn" onClick={() => alert("Map System Not Implemented")}>
            <i className="ra ra-compass ra-3x"></i>
            World Map
          </button>
          
          <button className="game-btn" onClick={() => alert("Looking around...")}>
            <i className="ra ra-eyeball ra-3x"></i>
            Look Around
          </button>
          
          <button className="game-btn" onClick={() => alert("Opening Inventory...")}>
            <i className="ra ra-kettlebell ra-3x"></i>
            Inventory
          </button>

          <button 
            className="game-btn level-up" 
            disabled={character.xp < character.xpToNextLevel}
          >
            <i className="ra ra-crystal-ball ra-3x"></i>
            Level Up
          </button>
        </div>
      </div>
    </div>
  );
}