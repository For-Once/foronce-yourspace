// Warm copy used throughout For Once.

export const HARD_PHRASES = [
  "You said it. That took courage.",
  "You don't have to be okay right now.",
  "Whatever you're carrying — you don't have to figure it out today.",
  "You are not alone in this.",
  "It's okay if you can't explain it. Feel it first.",
];

export const GOOD_PHRASES = [
  "Hold onto this one. You deserve to feel this.",
  "Write it down. Future you will want to remember it.",
  "You deserve to take up space with your happiness too.",
  "Good days are proof that they exist. More are coming.",
  "Let yourself be happy without waiting for something to go wrong.",
];

export const INBETWEEN_PHRASES = [
  "Both are welcome here. Always.",
  "For once — just for you.",
  "Be a little selfish about how you feel.",
];

export const LOADING_MESSAGES = [
  "taking a breath...",
  "almost there...",
  "just a moment...",
  "we're here...",
];

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
