// Gentle, soft anonymous username generation.

const adjectives = [
  "quiet",
  "gentle",
  "soft",
  "calm",
  "kind",
  "still",
  "warm",
  "tender",
  "dreamy",
  "hushed",
  "velvet",
  "moonlit",
  "drifting",
  "wandering",
  "sleepy",
  "golden",
  "silver",
  "misty",
  "amber",
  "twilight",
];

const nouns = [
  "moon",
  "wave",
  "tide",
  "cloud",
  "river",
  "willow",
  "ember",
  "feather",
  "harbor",
  "meadow",
  "lantern",
  "comet",
  "petal",
  "shore",
  "breeze",
  "fern",
  "star",
  "haven",
  "echo",
  "dawn",
];

export function generateUsername(): string {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `${a}${n}`;
}
