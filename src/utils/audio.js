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
