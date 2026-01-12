import React, { useEffect, useRef, useState } from 'react';

// --- CONFIGURATION ---
const MAIN_THEME = '/music/theme.flac';

// Add all your idle track filenames here
const IDLE_PLAYLIST = [
  '/music/idle/track1.flac',
  '/music/idle/track2.flac',
  '/music/idle/track3.flac',
  '/music/idle/track4.flac',
  '/music/idle/track5.flac',
  '/music/idle/track6.flac',
  '/music/idle/track7.flac',
  '/music/idle/track8.flac',
  '/music/idle/track10.flac',
  '/music/idle/track11.flac',
  '/music/idle/track12.flac',
  '/music/idle/track13.flac',

];

const BASE_VOLUME = 0.4; // Max volume for background music

export default function MusicManager({ currentScreen, inTransition }) {
  const audioRef = useRef(new Audio());
  const [hasInteracted, setHasInteracted] = useState(false);
  const fadeInterval = useRef(null);

  // --- FADE HELPERS ---
  const fadeOut = (callback) => {
    const audio = audioRef.current;
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    
    fadeInterval.current = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume -= 0.05; // Lower volume rapidly
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeInterval.current);
        if (callback) callback();
      }
    }, 100); // Run every 100ms
  };

  const fadeIn = () => {
    const audio = audioRef.current;
    audio.volume = 0; 
    audio.play().catch(e => console.log("Autoplay waiting..."));

    if (fadeInterval.current) clearInterval(fadeInterval.current);

    fadeInterval.current = setInterval(() => {
      if (audio.volume < BASE_VOLUME) {
        audio.volume = Math.min(BASE_VOLUME, audio.volume + 0.05);
      } else {
        clearInterval(fadeInterval.current);
      }
    }, 200); // Slower fade in
  };

  // --- PLAYBACK LOGIC ---
  const playTrack = (src, loop = false) => {
    const audio = audioRef.current;
    audio.src = src;
    audio.loop = loop;
    fadeIn(); // Always fade in new tracks
  };

  const playRandomIdle = () => {
    const randomIndex = Math.floor(Math.random() * IDLE_PLAYLIST.length);
    playTrack(IDLE_PLAYLIST[randomIndex], false);
    
    // When song ends, play another
    audioRef.current.onended = playRandomIdle;
  };

  // 1. Handle Transition (Fade Out)
  useEffect(() => {
    if (inTransition) {
      fadeOut(); 
    }
  }, [inTransition]);

  // 2. Handle Screen Changes (Start New Music)
  useEffect(() => {
    if (!hasInteracted) return;
    
    const audio = audioRef.current;

    // If we are NOT transitioning, check if we need to switch music
    if (!inTransition) {
      if (currentScreen === 'menu' || currentScreen === 'create') {
        // Only restart theme if it's not already playing
        if (!audio.src.includes('theme.flac')) {
          playTrack(MAIN_THEME, true);
          audio.onended = null;
        }
      } 
      else if (currentScreen === 'game') {
        // Start the playlist
        playRandomIdle();
      }
    }
  }, [currentScreen, hasInteracted, inTransition]);

  // 3. First Interaction Unlock
  useEffect(() => {
    const unlockAudio = () => {
      setHasInteracted(true);
      if (audioRef.current.paused && !inTransition) {
        if (currentScreen === 'menu' || currentScreen === 'create') {
          playTrack(MAIN_THEME, true);
        }
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  return null;
}