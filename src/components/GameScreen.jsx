// src/components/GameScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { triggerRoll } from "../utils/dice";
import { getZMResponse, SESSION_PASSWORD } from "../utils/ai";
import { SKILL_MAP, getModifier, SKILLS } from "../utils/rules";
import { formatGameTime } from '../utils/time';

export default function GameScreen({ character, onDamage, onToggleMap, gameMinutes, onAdvanceTime }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [hasLooked, setHasLooked] = useState(false);
  const [activeRoll, setActiveRoll] = useState(null);

  // --- NEW: NOTIFICATION STATE ---
  // Stores { type: 'roll' | 'damage', value: number, label: string } or null
  const [notification, setNotification] = useState(null);

  const messagesEndRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Helper to trigger a popup that disappears after 3 seconds
  const showNotification = (type, value, label) => {
    setNotification({ type, value, label });
    // Auto-clear matches the CSS animation duration (3s)
    setTimeout(() => setNotification(null), 3000);
  };

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [history, isLoading, activeRoll]);

  // --- INITIAL INTRO ---
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    const STATIC_INTRO = `The tavern is loud, smelling of stale ale and roasting meat. In the corner, a hooded figure beckons to you. Outside, the storm rages, but here, for a moment, you are safe. 

You finish your drink and stand up.`;
    setHistory([{ role: "ai", text: STATIC_INTRO }]);
  }, []);

  // --- HELPER: PROCESS AI RESPONSE ---
  const processAIResponse = (text) => {
    let cleanText = text;

    // 1. DETECT DAMAGE TAGS: [DAMAGE: 5]
    const damageMatch = cleanText.match(/\[DAMAGE:\s*(\d+)\]/i);
    if (damageMatch) {
      const amount = parseInt(damageMatch[1], 10);
      onDamage(amount);

      // SHOW POPUP INSTEAD OF CHAT MESSAGE
      showNotification("damage", amount, "HP LOST");

      cleanText = cleanText.replace(damageMatch[0], "").trim();
    }

    // 2. DETECT SKILL CHECKS
    const checkMatch = cleanText.match(/\[CHECK:\s*([^\]]+)\]/i);
    if (checkMatch) {
      const rawRequest = checkMatch[1].trim();
      const validSkill = SKILLS.find((s) =>
        rawRequest.toLowerCase().includes(s.toLowerCase()),
      );
      const finalSkill = validSkill || rawRequest;
      setActiveRoll(finalSkill);
      cleanText = cleanText.replace(checkMatch[0], "").trim();
    }

    // 3. DETECT TIME ADVANCE: [TIME: +30]
    const timeMatch = cleanText.match(/\[TIME:\s*\+(\d+)\]/i);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      
      // Call the App function to update the clock
      onAdvanceTime(minutes, 'minutes');

      // Optional: Show a notification?
      // showNotification("time", minutes, "MINUTES PASSED");
      
      cleanText = cleanText.replace(timeMatch[0], "").trim();
    }

    return cleanText;
  };

  // --- HANDLE LOOK AROUND ---
  const handleLookAround = async () => {
    if (isLoading || hasLooked || activeRoll) return;

    setIsLoading(true);
    const secretPrompt = {
      role: "user",
      text: `${SESSION_PASSWORD} System Instruction: Describe the immediate surroundings without asking for any additional rolls or stats. Begin your sentence with 'You look around and see...'. Keep it brief, one sentence max, and objective. Do not narrate actions or thoughts. This is purely for observation of the immediate environment.`,
    };
    const apiHistory = [...history, secretPrompt];

    // GET TIME DATA
    const timeData = formatGameTime(gameMinutes);

    try {
      // PASS TIME DATA
      const rawText = await getZMResponse(apiHistory, character, timeData);
      const cleanText = processAIResponse(rawText);
      setHistory((prev) => [...prev, { role: "ai", text: cleanText }]);
      setHasLooked(true);
    } catch {
      setHistory((prev) => [...prev, { role: "system", text: "Error..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE SEND ---
  const handleSend = async (e) => {
    if (activeRoll) return;

    if ((e.key === "Enter" || e.type === "click") && input.trim()) {
      setHasLooked(false);
      const userMsg = { role: "user", text: input };
      const newHistory = [...history, userMsg];

      setHistory(newHistory);
      setInput("");
      setIsLoading(true);

      const timeData = formatGameTime(gameMinutes);

      try {
        const rawText = await getZMResponse(newHistory, character, timeData);
        const cleanText = processAIResponse(rawText);
        setHistory((prev) => [...prev, { role: "ai", text: cleanText }]);
      } catch {
        setHistory((prev) => [
          ...prev,
          { role: "system", text: "Error contacting DM." },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- HANDLE DICE ROLL ---
  const handleDiceRoll = () => {
    if (!activeRoll) return;

    triggerRoll("1d20", (total) => {
      const attribute = SKILL_MAP[activeRoll] || "Dexterity";
      const attrScore = character.attributes[attribute];
      let modifier = getModifier(attrScore);
      if (character.skills.includes(activeRoll)) {
        modifier += 2;
      }

      const finalResult = total + modifier;

      // SHOW POPUP INSTEAD OF CHAT MESSAGE
      showNotification("roll", finalResult, `${activeRoll} CHECK`);

      // Send Result to AI (Hidden from user)
      setIsLoading(true);
      const resultMsg = {
        role: "system",
        text: `${SESSION_PASSWORD} SYSTEM: User rolled ${finalResult} for ${activeRoll}`,
      };
      const newHistory = [...history, resultMsg];

      getZMResponse(newHistory, character)
        .then((rawText) => {
          const cleanText = processAIResponse(rawText);
          setHistory((prev) => [...prev, { role: "ai", text: cleanText }]);
          setActiveRoll(null);
          setIsLoading(false);
        })
        .catch(() => {
          setHistory((prev) => [
            ...prev,
            { role: "system", text: "Error contacting DM." },
          ]);
          setActiveRoll(null);
          setIsLoading(false);
        });
    });
  };

  return (
    <div className="game-screen">
      {/* --- NEW: NOTIFICATION OVERLAY --- */}
      {notification && (
        <div className={`notification-overlay ${notification.type}`}>
          {/* ICON SWITCHER */}
          <i
            className={`notif-icon ra ${
              notification.type === "roll" ? "ra-dice-six" : "ra-broken-skull"
            } ra-5x`}
          ></i>

          <div className="notif-label">{notification.label}</div>

          <div className="notif-value">
            {notification.type === "damage" ? "-" : ""}
            {notification.value}
            {notification.type === "damage" ? " HP" : ""}
          </div>
        </div>
      )}

      {/* LEFT PANEL */}
      <div className="narrative-panel">
        <div className="messages-area">
          {history.map((msg, index) => {
            const isLastMessage = index === history.length - 1;
            const isNarrative = msg.role === "ai" || msg.role === "system";

            return (
              <div key={index} className={`message ${msg.role}`}>
                {isNarrative ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="ai-text">
                      {isLastMessage ? (
                        <Typewriter text={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </span>

                    {/* REMOVED: THE "WHAT DO YOU DO" DIVIDER IS GONE */}
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
              <span className="ai-text" style={{ opacity: 0.6 }}>
                <i>The Dungeon Master is thinking...</i>
              </span>
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
            placeholder={
              activeRoll ? `Roll for ${activeRoll}!` : "What do you do?"
            }
            disabled={isLoading || activeRoll !== null}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || activeRoll !== null}
          >
            SEND
          </button>
        </div>
      </div>

      {/* RIGHT PANEL (Stats) */}
      <div className="stats-panel">
        <div className="char-summary">
          <h2>{character.name}</h2>
          <div className="sub-header">
            {character.race} {character.class} • Lvl {character.level}
          </div>
        </div>

        <div className="vitals">
          <div className="bar-container">
            <label>
              <span>HP</span>{" "}
              <span>
                {character.hp}/{character.maxHP}
              </span>
            </label>
            <div className="bar-bg">
              <div
                className="bar-fill hp"
                style={{ width: `${(character.hp / character.maxHP) * 100}%` }}
              />
            </div>
          </div>
          <div className="bar-container">
            <label>
              <span>XP</span>{" "}
              <span>
                {character.xp}/{character.xpToNextLevel}
              </span>
            </label>
            <div className="bar-bg">
              <div
                className="bar-fill xp"
                style={{
                  width: `${(character.xp / character.xpToNextLevel) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="action-grid">
          <button
            className="game-btn"
            onClick={onToggleMap}
            data-sfx="/sfx/map.wav"
          >
            <i className="ra ra-compass ra-3x"></i>
            World Map
          </button>

          <button
            className="game-btn"
            onClick={handleLookAround}
            disabled={isLoading || hasLooked || activeRoll !== null}
            style={{ opacity: isLoading || hasLooked || activeRoll ? 0.5 : 1 }}
            data-sfx="/sfx/look.wav"
          >
            <i className="ra ra-eyeball ra-3x"></i>
            {hasLooked ? "Looked" : "Look Around"}
          </button>

          <button
            className="game-btn"
            onClick={() => alert("Opening Inventory...")}
            data-sfx="/sfx/inventory.wav"
          >
            <i className="ra ra-kettlebell ra-3x"></i>
            Inventory
          </button>

          {/* --- THE ROLL BUTTON --- */}
          <button
            className="game-btn"
            onClick={handleDiceRoll}
            disabled={activeRoll === null}
            style={{
              borderColor: activeRoll ? "#d4af37" : "#333",
              color: activeRoll ? "#d4af37" : "#888",
              background: activeRoll ? "rgba(212, 175, 55, 0.1)" : "#111",
              cursor: activeRoll ? "pointer" : "not-allowed",
            }}
            data-sfx="/sfx/roll.wav"
          >
            <i
              className={`ra ra-dice-six ra-3x ${activeRoll ? "ra-spin" : ""}`}
            ></i>
            {activeRoll ? `ROLL ${activeRoll.toUpperCase()}` : "Wait for DM"}
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

// ... Typewriter helper stays same as before ...
const Typewriter = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayedText("");
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
      style={{ cursor: isTyping ? "pointer" : "text" }}
      title={isTyping ? "Click to skip" : ""}
    >
      {displayedText}
    </span>
  );
};
