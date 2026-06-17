// Cute stickers with searchable keywords for the private space.

export interface Sticker {
  emoji: string;
  keywords: string;
}

export const STICKERS: Sticker[] = [
  { emoji: "🌙", keywords: "moon night sleep dream calm" },
  { emoji: "⭐", keywords: "star wish sparkle night shine" },
  { emoji: "🌸", keywords: "blossom flower pink spring cute" },
  { emoji: "🦋", keywords: "butterfly change soft fly" },
  { emoji: "🍃", keywords: "leaf nature calm green wind" },
  { emoji: "☁️", keywords: "cloud sky soft dream calm" },
  { emoji: "🫧", keywords: "bubble float soft light" },
  { emoji: "💌", keywords: "letter love note mail heart" },
  { emoji: "🕯️", keywords: "candle warm cozy light calm" },
  { emoji: "🌷", keywords: "tulip flower spring pink" },
  { emoji: "🐚", keywords: "shell beach sea ocean calm" },
  { emoji: "🌊", keywords: "wave ocean sea water calm" },
  { emoji: "🌻", keywords: "sunflower happy bright yellow" },
  { emoji: "🧸", keywords: "teddy bear comfort cozy soft hug" },
  { emoji: "🍓", keywords: "strawberry fruit sweet cute red" },
  { emoji: "🌈", keywords: "rainbow hope colour happy" },
  { emoji: "✨", keywords: "sparkle shine magic glitter" },
  { emoji: "🩷", keywords: "heart pink love soft" },
  { emoji: "🐱", keywords: "cat kitten cute pet" },
  { emoji: "📷", keywords: "camera photo memory picture" },
  { emoji: "☀️", keywords: "sun sunny happy warm bright" },
  { emoji: "🌧️", keywords: "rain sad grey cozy" },
  { emoji: "❄️", keywords: "snow cold winter calm" },
  { emoji: "🔥", keywords: "fire warm passion energy" },
  { emoji: "💧", keywords: "tear water drop cry" },
  { emoji: "💖", keywords: "heart love sparkle pink" },
  { emoji: "💜", keywords: "heart purple love" },
  { emoji: "💙", keywords: "heart blue calm love" },
  { emoji: "🌼", keywords: "daisy flower happy yellow" },
  { emoji: "🍀", keywords: "clover luck green lucky" },
  { emoji: "🦢", keywords: "swan grace calm soft white" },
  { emoji: "🪻", keywords: "lavender flower calm purple" },
  { emoji: "🫶", keywords: "hands heart love care" },
  { emoji: "🌟", keywords: "star glow shine bright wish" },
  { emoji: "🐰", keywords: "bunny rabbit cute soft" },
  { emoji: "🐻", keywords: "bear cozy hug comfort" },
  { emoji: "🍂", keywords: "leaf autumn fall cozy" },
  { emoji: "🌿", keywords: "herb plant green calm nature" },
  { emoji: "💫", keywords: "dizzy star sparkle dream" },
  { emoji: "🎀", keywords: "bow ribbon cute pink gift" },
];

export function searchStickers(query: string): Sticker[] {
  const q = query.trim().toLowerCase();
  if (!q) return STICKERS;
  return STICKERS.filter(
    (s) => s.emoji === q || s.keywords.includes(q),
  );
}
