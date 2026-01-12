// src/components/DiceRoller.jsx
import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";

// Ensure this matches where you put the folder in 'public'
const DICE_ASSETS_URL = "/assets/";

export default function DiceRoller({ onRollComplete }) {
  // We use State to hold the active engine so we can attach listeners to it later
  const [diceBox, setDiceBox] = useState(null);
  const initialized = useRef(false);
  const containerRef = useRef(null);

  // EFFECT 1: Initialize the Engine (Runs only ONCE)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const box = new DiceBox({
      container: "#dice-box",
      assetPath: DICE_ASSETS_URL,
      scale: 6, // Size of the dice
      theme: "default",
      themeColor: "#8a0303", // <--- NEW: Blood Red Color
      mass: 1,
      gravity: 3,
      friction: 0.8,
    });

    box
      .init()
      .then(() => {
        setDiceBox(box); // Save the engine to state
        // ensure container is hidden until a roll
        if (containerRef.current) containerRef.current.style.opacity = "0";
      })
      .catch((err) => {
        console.error("Dice Engine Failed to Load:", err);
        alert(
          "Dice Error: Check that you moved the 'assets' folder to 'public'!",
        );
      });
  }, []);

  // EFFECT 2: Listen for Rolls (Runs whenever the engine is ready)
  useEffect(() => {
    if (!diceBox) return; // Wait for engine to boot

    const handleRollRequest = (e) => {
      const { notation, callback } = e.detail;

      // Clear any previous dice and make container visible
      if (diceBox) diceBox.clear();
      if (containerRef.current) containerRef.current.style.opacity = "1";

      diceBox
        .roll(notation)
        .then((results) => {
          const total = results.reduce((sum, die) => sum + die.value, 0);

          // Callback after dice animation
          setTimeout(() => {
            if (callback) callback(total, results);
            if (onRollComplete) onRollComplete(total, results);
          }, 1500);

          // Fade out the dice after a short delay, then clear them
          setTimeout(() => {
            if (containerRef.current) containerRef.current.style.opacity = "0";
            setTimeout(() => {
              if (diceBox) diceBox.clear();
            }, 800); // match CSS fade duration
          }, 2200);
        })
        .catch((err) => {
          console.error("Dice roll failed", err);
        });
    };

    // Attach the listener
    window.addEventListener("ROLL_DICE", handleRollRequest);

    // Cleanup: Remove listener if component unmounts
    return () => {
      window.removeEventListener("ROLL_DICE", handleRollRequest);
    };
  }, [diceBox, onRollComplete]);

  return (
    <div
      id="dice-box"
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none", // Clicks pass through
        zIndex: 9999,
        transition: "opacity 800ms ease",
        opacity: 0,
      }}
    />
  );
}

// Trigger helper moved to src/utils/dice.js to keep this file focused on the component
