// src/components/GameScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { triggerRoll } from './DiceRoller';
import { getZMResponse } from '../utils/ai';
import { SKILL_MAP, getModifier } from '../utils/rules'; // Import helpers

export default function GameScreen({ character }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [history, setHistory] = useState([]); 
  
  const [hasLooked, setHasLooked] = useState(false); 

  // --- NEW: STATE FOR DICE CHECKS ---
  // If this string is not null (e.g., "Perception"), the game is LOCKED until they roll.
  const [activeRoll, setActiveRoll] = useState(null);

  const messagesEndRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [history, isLoading, activeRoll]);

  // --- INITIAL INTRO ---
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    const STATIC_INTRO = `There is nay a moment where you don't feel the weight of destiny upon thy shoulders. Faerûn, your home, or more specifically the Sword Coast, has always called to thee, but never as urgently as now. Something, perhaps fate itself, has called out to you, warning you of a foreboding darkness that threatens to engulf the world. This same energy - fate, has drawn you from your humble beginnings and set you on a path of adventure. You find yourself on the path toward Daggerford, a small town nestled along the Trade Way. There is commotion ahead. You see a band of warriors clad in heavy steel armor painted with evil looking runes harassing a group of innocent villagers. The conflict escalates, and the warriors begin to attack the villagers. Fire bursts from the warriors' hands, and Daggerford is under siege. From behind, you hear heavy footsteps approaching. A large, scary figure looms over you, wearing armor similar to the lesser warriors, but made of a much darker steel.`;
    setHistory([{ role: 'ai', text: STATIC_INTRO }]);
  }, []);

  // --- HELPER: PROCESS AI RESPONSE ---
  // We extract the [CHECK: Skill] tag so the user doesn't see it in the text bubble
  const processAIResponse = (text) => {
    // Regex to find [CHECK: Something]
    const match = text.match(/\[CHECK:\s*([a-zA-Z\s]+)\]/i);
    
    if (match) {
      const skillName = match[1].trim(); // e.g. "Perception"
      setActiveRoll(skillName); // LOCK THE UI
      
      // Remove the tag from the visible text
      return text.replace(match[0], "").trim();
    }
    return text;
  };

  // --- HANDLE LOOK AROUND ---
  const handleLookAround = async () => {
    if (isLoading || hasLooked || activeRoll) return; // Disable if roll pending

    setIsLoading(true);
    const secretPrompt = { 
      role: 'user', 
      text: "[System Instruction: You must describe to the user their immediate surroundings, and more importantly hostiles (if present) within one sentence max that always begins with 'You see'. It is imperative that this description is concise, objective, and kept in exactly one sentence. Do not include any additional narrative or context..]" 
    };
    const apiHistory = [...history, secretPrompt];

    try {
      const rawText = await getZMResponse(apiHistory, character);
      const cleanText = processAIResponse(rawText); // Check for rolls
      
      setHistory(prev => [...prev, { role: 'ai', text: cleanText }]);
      setHasLooked(true);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'system', text: "Your eyes fail to adjust..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE SEND ---
  const handleSend = async (e) => {
    // Block sending if a roll is active
    if (activeRoll) return;

    if ((e.key === 'Enter' || e.type === 'click') && input.trim()) {
      setHasLooked(false); 
      const userMsg = { role: 'user', text: input };
      const newHistory = [...history, userMsg];
      
      setHistory(newHistory);
      setInput('');
      setIsLoading(true);

      try {
        const rawText = await getZMResponse(newHistory, character);
        const cleanText = processAIResponse(rawText); // Check for rolls
        setHistory(prev => [...prev, { role: 'ai', text: cleanText }]);
      } catch (err) {
        setHistory(prev => [...prev, { role: 'system', text: "Error contacting DM." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- HANDLE DICE ROLL (THE KEY) ---
  const handleDiceRoll = () => {
    if (!activeRoll) return; // Only work if requested

    triggerRoll('1d20', (total) => {
      // 1. Calculate Modifier
      const attribute = SKILL_MAP[activeRoll] || "Dexterity"; // Default safety
      const attrScore = character.attributes[attribute];
      let modifier = getModifier(attrScore);

      // Add Proficiency (+2) if they have the skill
      if (character.skills.includes(activeRoll)) {
        modifier += 2;
      }

      const finalResult = total + modifier;
      const resultText = `I rolled a ${finalResult} for ${activeRoll} (Natural ${total} + ${modifier})`;

      // 2. Add System Message for the User
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: `🎲 ${activeRoll} Check: ${total} + ${modifier} = ${finalResult}` 
      }]);

      // 3. Send Result to AI
      setIsLoading(true);
      const resultMsg = { role: 'system', text: `[SYSTEM: User rolled ${finalResult} for ${activeRoll}]` };
      const newHistory = [...history, resultMsg]; // We don't show this msg to user, just history

      getZMResponse(newHistory, character).then(rawText => {
        const cleanText = processAIResponse(rawText);
        setHistory(prev => [...prev, { role: 'ai', text: cleanText }]);
        setActiveRoll(null); // UNLOCK THE UI
        setIsLoading(false);
      });
    });
  };

  return (
    <div className="game-screen">
      {/* LEFT PANEL */}
      <div className="narrative-panel">
        <div className="messages-area">
          {history.map((msg, index) => {
            const isLastMessage = index === history.length - 1;
            const isNarrative = msg.role === 'ai' || msg.role === 'system';
            
            return (
              <div key={index} className={`message ${msg.role}`}>
                {isNarrative ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="ai-text">
                      {isLastMessage ? <Typewriter text={msg.text} /> : msg.text}
                    </span>
                    
                    {/* HIDE PROMPT IF ROLL IS PENDING */}
                    {!activeRoll && (
                       <div className="interaction-prompt" style={{
                        marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #222',
                        textAlign: 'center', color: '#8a0303', fontFamily: 'var(--font-header)',
                        fontSize: '0.85rem', letterSpacing: '3px', opacity: 0.9, fontWeight: 'bold',
                        userSelect: 'none'
                      }}>
                        ◆ WHAT DO YOU DO? ◆
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="user-text">
                    <span className="user-label">{character.name}</span>
                    {msg.text}
                  </span>
                )}
              </div>
            );
          })}
          
          {isLoading && (
            <div className="message system">
              <span className="ai-text" style={{opacity: 0.6}}><i>The Dungeon Master is thinking...</i></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSend}
            // LOCK INPUT IF LOADING OR ROLL PENDING
            placeholder={activeRoll ? `Roll for ${activeRoll}!` : "What do you do?"}
            disabled={isLoading || activeRoll !== null} 
          />
          <button onClick={handleSend} disabled={isLoading || activeRoll !== null}>SEND</button>
        </div>
      </div>

      {/* RIGHT PANEL (Stats) */}
      <div className="stats-panel">
        <div className="char-summary">
          <h2>{character.name}</h2>
          <div className="sub-header">{character.race} {character.class} • Lvl {character.level}</div>
        </div>

        <div className="vitals">
          <div className="bar-container">
            <label><span>HP</span> <span>{character.hp}/{character.maxHP}</span></label>
            <div className="bar-bg"><div className="bar-fill hp" style={{width: `${(character.hp / character.maxHP) * 100}%`}} /></div>
          </div>
          <div className="bar-container">
            <label><span>XP</span> <span>{character.xp}/{character.xpToNextLevel}</span></label>
            <div className="bar-bg"><div className="bar-fill xp" style={{width: `${(character.xp / character.xpToNextLevel) * 100}%`}} /></div>
          </div>
        </div>

        <div className="action-grid">
          <button className="game-btn" onClick={() => alert("Map System Not Implemented")}>
            <i className="ra ra-compass ra-3x"></i>
            World Map
          </button>
          
          <button 
            className="game-btn" 
            onClick={handleLookAround}
            disabled={isLoading || hasLooked || activeRoll !== null} 
            style={{ opacity: (isLoading || hasLooked || activeRoll) ? 0.5 : 1 }}
          >
            <i className="ra ra-eyeball ra-3x"></i>
            {hasLooked ? "Looked" : "Look Around"}
          </button>
          
          <button className="game-btn" onClick={() => alert("Opening Inventory...")}>
            <i className="ra ra-kettlebell ra-3x"></i>
            Inventory
          </button>

          {/* --- THE ROLL BUTTON --- */}
          <button 
            className="game-btn" 
            onClick={handleDiceRoll}
            disabled={activeRoll === null} // ONLY ENABLED IF ROLL REQUESTED
            style={{
              borderColor: activeRoll ? '#d4af37' : '#333',
              color: activeRoll ? '#d4af37' : '#888',
              background: activeRoll ? 'rgba(212, 175, 55, 0.1)' : '#111',
              cursor: activeRoll ? 'pointer' : 'not-allowed'
            }}
          >
            <i className={`ra ra-dice-six ra-3x ${activeRoll ? 'ra-spin' : ''}`}></i>
            {activeRoll ? `ROLL ${activeRoll.toUpperCase()}` : "Wait for DM"}
          </button>

          <button className="game-btn level-up" disabled={character.xp < character.xpToNextLevel}>
            <i className="ra ra-crystal-ball ra-3x"></i>
            Level Up
          </button>
        </div>
      </div>
    </div>
  );
}

// ... Typewriter helper stays same as before ...
const Typewriter = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let i = 0;
    const speed = 15;

    timerRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timerRef.current);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [text]);

  const finish = () => {
    if (!isTyping) return;
    clearInterval(timerRef.current);
    setDisplayedText(text);
    setIsTyping(false);
  };

  return (
    <span 
      onClick={finish} 
      style={{ cursor: isTyping ? 'pointer' : 'text' }}
      title={isTyping ? "Click to skip" : ""}
    >
      {displayedText}
    </span>
  );
};