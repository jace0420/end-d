// Helper to play a random idle track and attach onended handler.
export function playRandomIdle(audioRef, playlist) {
  if (!audioRef || !audioRef.current) return;
  const audio = audioRef.current;
  const randomIndex = Math.floor(Math.random() * playlist.length);
  audio.src = playlist[randomIndex];
  audio.loop = false;
  audio.onended = () => playRandomIdle(audioRef, playlist);
  audio.play().catch(() => console.debug("Autoplay blocked"));
}

// Play a short sound effect. Uses a transient Audio element so multiple
// effects can overlap. `src` should be a path under `public/` or a URL.
export function playSfx(src = '/scribblequick.wav', volume = 0.9) {
  try {
    const s = new Audio(src);
    s.volume = volume;
    // Best-effort play; swallow autoplay errors (user gesture required)
    s.play().catch(() => console.debug('SFX autoplay blocked'));
  } catch (err) {
    console.debug('playSfx failed', err);
  }
}
