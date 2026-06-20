import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Flower, Wind, Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FloatingStickers } from "@/components/FloatingStickers";
import { BubblePop } from "@/components/games/BubblePop";
import { ZenGarden } from "@/components/games/ZenGarden";
import { BreathingBloom } from "@/components/games/BreathingBloom";
import { StarCatcher } from "@/components/games/StarCatcher";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/calm")({
  head: () => ({
    meta: [
      { title: "Calm Corner — For Once" },
      {
        name: "description",
        content:
          "Tiny, no-pressure games to soothe a busy mind: pop bubbles, rake a zen garden, breathe with a blooming flower, or catch drifting stars.",
      },
    ],
  }),
  component: CalmCorner,
});

type GameId = "bubbles" | "garden" | "bloom" | "stars";

const GAMES: { id: GameId; label: string; tag: string; icon: typeof Sparkles }[] = [
  { id: "bubbles", label: "Bubble Pop", tag: "pop the worries away", icon: Sparkles },
  { id: "garden", label: "Zen Garden", tag: "rake soft patterns", icon: Flower },
  { id: "bloom", label: "Breathing Bloom", tag: "breathe with a flower", icon: Wind },
  { id: "stars", label: "Star Catcher", tag: "collect drifting stars", icon: Star },
];

function CalmCorner() {
  const [game, setGame] = useState<GameId>("bubbles");

  return (
    <div className="relative">
      <FloatingStickers set={["🫧", "🌸", "✨", "🪷", "🌙", "🎀"]} count={8} />

      <div className="relative z-10">
        <PageHeader
          title="Calm Corner"
          subtitle="No scores, no winning, no losing. Just little things to do with your hands while your mind settles. 🫧"
        />

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GAMES.map((g) => {
            const Icon = g.icon;
            const active = game === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGame(g.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02]",
                  active
                    ? "border-turquoise/50 bg-turquoise/10 text-turquoise"
                    : "border-border bg-card/40 text-muted-foreground hover:text-cream",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{g.label}</span>
                <span className="text-[11px] opacity-80">{g.tag}</span>
              </button>
            );
          })}
        </div>

        {game === "bubbles" && <BubblePop />}
        {game === "garden" && <ZenGarden />}
        {game === "bloom" && <BreathingBloom />}
        {game === "stars" && <StarCatcher />}
      </div>
    </div>
  );
}
