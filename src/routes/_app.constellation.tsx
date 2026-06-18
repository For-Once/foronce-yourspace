import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Stars } from "lucide-react";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { PlusLock } from "@/components/UpgradePrompt";
import { useLocalStorage } from "@/lib/use-local-storage";
import { usePlus } from "@/lib/plus";
import { getMood, type Mood } from "@/lib/moods";

export const Route = createFileRoute("/_app/constellation")({
  head: () => ({
    meta: [
      { title: "Your Mood Constellation — For Once" },
      {
        name: "description",
        content:
          "A little universe of how you've felt. Every mood you log becomes a glowing star in your own personal night sky.",
      },
    ],
  }),
  component: ConstellationPage,
});

interface Entry {
  id: string;
  mood?: string;
  createdAt: number;
}

const MOOD_HEX: Record<Mood["color"], string> = {
  turquoise: "#4fd1c5",
  rose: "#f472b6",
  lavender: "#b9a7e6",
  gold: "#f6c667",
  peach: "#f7a98b",
  cream: "#f3e9d2",
};

function hashFloat(str: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

interface Star {
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;
  label: string;
  date: string;
}

function ConstellationPage() {
  const { isPlus } = usePlus();
  const [entries] = useLocalStorage<Entry[]>("foronce.journal", []);

  const stars = useMemo<Star[]>(() => {
    return entries
      .filter((e) => e.mood)
      .map((e) => {
        const mood = getMood(e.mood!);
        const color = mood ? MOOD_HEX[mood.color] : "#f3e9d2";
        return {
          id: e.id,
          x: 6 + hashFloat(e.id, 1) * 88,
          y: 8 + hashFloat(e.id, 2) * 84,
          r: 1.4 + hashFloat(e.id, 3) * 2.6,
          color,
          label: mood?.label ?? "a feeling",
          date: new Date(e.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      });
  }, [entries]);

  return (
    <div>
      <PageHeader
        title="Your Mood Constellation"
        subtitle="A little universe of how you've felt — every mood you log becomes a star."
      >
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Stars className="h-4 w-4 text-gold" />
          {stars.length} {stars.length === 1 ? "star" : "stars"} so far
        </div>
      </PageHeader>

      {isPlus ? (
        <Sky stars={stars} />
      ) : (
        <div className="space-y-4">
          <PlusLock label="Unlock your mood constellation with Plus">
            <div className="h-[60vh] min-h-80">
              <Sky stars={stars.slice(0, 12)} muted />
            </div>
          </PlusLock>
          <p className="text-center text-sm text-muted-foreground">
            You can keep logging moods for free — Plus just lets you watch your little
            universe grow.
          </p>
        </div>
      )}

      <Legend />
    </div>
  );
}

function Sky({ stars, muted }: { stars: Star[]; muted?: boolean }) {
  const [active, setActive] = useState<Star | null>(null);

  if (stars.length === 0) {
    return (
      <div className="grid h-[60vh] min-h-80 place-items-center rounded-3xl border border-border bg-[#0a0e22] text-center">
        <div>
          <Stars className="mx-auto mb-3 h-8 w-8 text-lavender/70" />
          <p className="font-hand text-2xl text-cream">Your sky is waiting</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log a mood and watch the first star appear.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[60vh] min-h-80 overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#0c1030] to-[#070914]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {stars.map((s) => (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={s.r * 2.4} fill={s.color} opacity={muted ? 0.06 : 0.14} />
            <circle
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={s.color}
              className="cursor-pointer transition-opacity hover:opacity-100"
              opacity={muted ? 0.5 : 0.95}
              onMouseEnter={() => setActive(s)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(s)}
            >
              <animate
                attributeName="opacity"
                values={`${muted ? 0.4 : 0.7};1;${muted ? 0.4 : 0.7}`}
                dur={`${2 + (s.r % 2)}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
      {active && (
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-border bg-background/80 px-4 py-2 text-center text-sm backdrop-blur">
          <span className="font-medium capitalize text-cream">{active.label}</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-muted-foreground">{active.date}</span>
        </div>
      )}
    </div>
  );
}

function Legend() {
  const items: { label: string; color: Mood["color"] }[] = [
    { label: "happy / proud", color: "gold" },
    { label: "calm / hopeful", color: "turquoise" },
    { label: "heavy / lonely", color: "lavender" },
    { label: "loved / angry", color: "rose" },
    { label: "excited / content", color: "peach" },
  ];
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: MOOD_HEX[i.color] }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}
