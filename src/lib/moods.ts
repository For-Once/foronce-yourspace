// Mood vocabulary — hard and good feelings treated equally.

export type MoodTone = "hard" | "neutral" | "good";

export interface Mood {
  key: string;
  label: string;
  tone: MoodTone;
  /** semantic accent token name */
  color: "turquoise" | "rose" | "lavender" | "gold" | "peach" | "cream";
}

export const MOODS: Mood[] = [
  { key: "numb", label: "numb", tone: "hard", color: "lavender" },
  { key: "heavy", label: "heavy", tone: "hard", color: "lavender" },
  { key: "angry", label: "angry", tone: "hard", color: "rose" },
  { key: "lonely", label: "lonely", tone: "hard", color: "lavender" },
  { key: "confused", label: "confused", tone: "hard", color: "rose" },
  { key: "tired", label: "tired", tone: "hard", color: "lavender" },
  { key: "okay", label: "okay", tone: "neutral", color: "cream" },
  { key: "relieved", label: "relieved", tone: "neutral", color: "turquoise" },
  { key: "grateful", label: "grateful", tone: "good", color: "gold" },
  { key: "excited", label: "excited", tone: "good", color: "peach" },
  { key: "happy", label: "happy", tone: "good", color: "gold" },
  { key: "hopeful", label: "hopeful", tone: "good", color: "turquoise" },
  { key: "peaceful", label: "peaceful", tone: "good", color: "turquoise" },
  { key: "loved", label: "loved", tone: "good", color: "rose" },
  { key: "proud", label: "proud", tone: "good", color: "gold" },
  { key: "content", label: "content", tone: "good", color: "peach" },
  { key: "giddy", label: "giddy", tone: "good", color: "peach" },
];

export function getMood(key: string): Mood | undefined {
  return MOODS.find((m) => m.key === key);
}

export const moodColorStyle: Record<Mood["color"], { bg: string; text: string; ring: string }> = {
  turquoise: {
    bg: "bg-turquoise/15",
    text: "text-turquoise",
    ring: "ring-turquoise/50",
  },
  rose: { bg: "bg-rose/15", text: "text-rose", ring: "ring-rose/50" },
  lavender: { bg: "bg-lavender/15", text: "text-lavender", ring: "ring-lavender/50" },
  gold: { bg: "bg-gold/15", text: "text-gold", ring: "ring-gold/50" },
  peach: { bg: "bg-peach/15", text: "text-peach", ring: "ring-peach/50" },
  cream: { bg: "bg-cream/15", text: "text-cream", ring: "ring-cream/40" },
};
