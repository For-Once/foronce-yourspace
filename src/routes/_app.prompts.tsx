import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { MoodSelector } from "@/components/MoodSelector";
import { getMood } from "@/lib/moods";
import { randomFrom } from "@/lib/copy";

export const Route = createFileRoute("/_app/prompts")({
  head: () => ({ meta: [{ title: "Guided Prompts — For Once" }] }),
  component: Prompts,
});

const HARD = [
  "what has been sitting heavy on you lately?",
  "what do you wish someone would just ask you?",
  "what are you tired of carrying?",
];
const GOOD = [
  "what happened today that you want to remember?",
  "who made you feel seen recently?",
  "what are you quietly proud of?",
];

function Prompts() {
  const [mood, setMood] = useState<string>();
  const tone = mood ? getMood(mood)?.tone : undefined;
  const pool = tone === "good" ? GOOD : tone === "hard" ? HARD : [...HARD, ...GOOD];
  const [prompt, setPrompt] = useState(() => randomFrom([...HARD, ...GOOD]));

  return (
    <div>
      <PageHeader
        title="Guided Prompts"
        subtitle="Gentle ways to start when you don't know where to. Never forced — just here if you want them."
      />

      <div className="mb-6">
        <p className="mb-3 text-sm text-muted-foreground">tap what you feel — no need to explain</p>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      <div className="rounded-3xl border border-turquoise/20 bg-turquoise/5 p-8 text-center">
        <Whisper>{prompt}</Whisper>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="soft" size="lg" onClick={() => setPrompt(randomFrom(pool))}>
            <RefreshCw className="h-4 w-4" /> another one
          </Button>
          <Button variant="hero" size="lg" asChild>
            <Link to="/journal">
              write about it <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-hand text-2xl text-lavender">for the hard days</h2>
          <div className="space-y-2">
            {HARD.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="w-full rounded-xl border border-border bg-card/40 p-3 text-left text-sm text-cream/90 transition-colors hover:border-lavender/40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-hand text-2xl text-gold">for the good days</h2>
          <div className="space-y-2">
            {GOOD.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="w-full rounded-xl border border-border bg-card/40 p-3 text-left text-sm text-cream/90 transition-colors hover:border-gold/40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
