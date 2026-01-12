// small helper to trigger the dice roll event from anywhere
export function triggerRoll(notation, callback) {
  const event = new CustomEvent("ROLL_DICE", {
    detail: { notation, callback },
  });
  window.dispatchEvent(event);
}
