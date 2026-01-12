Developer Notes

- `SESSION_PASSWORD` (src/utils/ai.js): a short, session-local password is generated at module load and exported. The app prefixes any programmatic "System Instruction" messages with this password to reduce risk of prompt injection. The value is generated on each run and intended for runtime checks only.
- `src/utils/dice.js`: exposes `triggerRoll(notation, callback)` which dispatches a custom event consumed by the dice renderer.
- `src/utils/audio.js`: `playRandomIdle(audioRef, playlist)` centralizes idle-track selection and avoids impure calls during render.

Formatting & linting

- Run `npx prettier --write .` to apply Prettier formatting (Prettier installed as dev dependency in this repo).
- Run `npx eslint --fix .` to apply automatic ESLint fixes.

Notes

- Keep the dev server offline while you want to avoid network calls to external services (the LLM integration will attempt outbound requests if `VITE_OPENROUTER_API_KEY` is set). For quick local checks you can still open the UI without enabling the LLM key.
