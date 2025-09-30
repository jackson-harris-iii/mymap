export function asciiProgress(current: number, goal: number) {
  if (!goal || goal <= 0) return '';
  const ratio = Math.min(Math.max(current / goal, 0), 1);
  const blocks = Math.round(ratio * 10);
  return `[${'█'.repeat(blocks)}${'░'.repeat(10 - blocks)}] ${(ratio * 100).toFixed(0)}%`;
}
