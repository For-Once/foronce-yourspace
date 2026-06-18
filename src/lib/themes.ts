import { useLocalStorage } from "./use-local-storage";

// Optional aesthetic themes for the private space (a Plus extra).
// Each theme is scoped to a wrapper via inline CSS variables, so it never
// touches the global app theme.

export interface JournalTheme {
  id: string;
  name: string;
  desc: string;
  /** decorative emoji accents sprinkled into the space */
  accents: string[];
  /** css variables applied to the scoped wrapper */
  vars: {
    bg: string;
    panel: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    font: string;
  };
}

export const DEFAULT_THEME = "default";

export const THEMES: JournalTheme[] = [
  {
    id: "default",
    name: "For Once",
    desc: "The calm default — soft dark and turquoise.",
    accents: ["🌙", "⭐"],
    vars: {
      bg: "transparent",
      panel: "hsl(0 0% 100% / 0.04)",
      border: "hsl(0 0% 100% / 0.10)",
      text: "#f3ead9",
      muted: "#a9a597",
      accent: "#4fd1c5",
      font: "inherit",
    },
  },
  {
    id: "dark-academia",
    name: "Dark Academia",
    desc: "Sepia, candlelight and old paper.",
    accents: ["📜", "🕯️", "🖋️"],
    vars: {
      bg: "linear-gradient(160deg,#241a12,#1a130d)",
      panel: "#2e2419cc",
      border: "#5a4632",
      text: "#ecd9b8",
      muted: "#b29c7e",
      accent: "#c89b56",
      font: "Georgia, 'Times New Roman', serif",
    },
  },
  {
    id: "soft-pastel",
    name: "Soft Pastel",
    desc: "Cotton-candy skies and gentle pinks.",
    accents: ["🌸", "🧸", "🍡"],
    vars: {
      bg: "linear-gradient(160deg,#3a2c39,#2c2433)",
      panel: "#46384fcc",
      border: "#7d6488",
      text: "#fbe4f3",
      muted: "#cdb4d4",
      accent: "#f3a9d4",
      font: "'Comic Sans MS', 'Segoe UI', cursive",
    },
  },
  {
    id: "night-sky",
    name: "Night Sky",
    desc: "Deep indigo dusted with stars.",
    accents: ["✨", "🌌", "🪐"],
    vars: {
      bg: "linear-gradient(160deg,#0e1230,#080a1c)",
      panel: "#161b3fcc",
      border: "#2f3a6e",
      text: "#dfe6ff",
      muted: "#9aa6d6",
      accent: "#8fa2ff",
      font: "inherit",
    },
  },
  {
    id: "botanical",
    name: "Botanical",
    desc: "Greenhouse calm and growing things.",
    accents: ["🌿", "🍃", "🌱"],
    vars: {
      bg: "linear-gradient(160deg,#15241a,#0f1c14)",
      panel: "#1d3326cc",
      border: "#3a5a44",
      text: "#e2f3e6",
      muted: "#a3c2ac",
      accent: "#6fcf97",
      font: "'Iowan Old Style', Georgia, serif",
    },
  },
  {
    id: "minimalist-mono",
    name: "Minimalist Mono",
    desc: "Quiet greys, nothing in the way.",
    accents: ["◦", "—"],
    vars: {
      bg: "linear-gradient(160deg,#1b1b1d,#141416)",
      panel: "#26262acc",
      border: "#3c3c40",
      text: "#ededf0",
      muted: "#9c9ca2",
      accent: "#cfcfd6",
      font: "'SFMono-Regular', ui-monospace, monospace",
    },
  },
];

export function getTheme(id?: string): JournalTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function useJournalTheme() {
  const [themeId, setThemeId, hydrated] = useLocalStorage<string>(
    "foronce.theme",
    DEFAULT_THEME,
  );
  return { themeId, setThemeId, theme: getTheme(themeId), hydrated };
}

export function themeStyle(t: JournalTheme): React.CSSProperties {
  return {
    background: t.vars.bg,
    color: t.vars.text,
    fontFamily: t.vars.font,
  };
}
