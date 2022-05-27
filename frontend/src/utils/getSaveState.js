export default function getSaveState(state) {
  const s = {};
  Object.keys(state)
    .filter((k) => state[k].value)
    .forEach((k) => {
      s[k] = state[k].value;
    });
  return s;
}
