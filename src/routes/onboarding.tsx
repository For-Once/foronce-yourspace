import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, Shuffle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MandalaBackground } from "@/components/MandalaBackground";
import { MoodSelector } from "@/components/MoodSelector";
import { useProfile } from "@/lib/profile";
import { generateUsername } from "@/lib/username";
import { getMood } from "@/lib/moods";

export const Route = createFileRoute("/onboarding")({
  validateSearch: z.object({ account: z.boolean().optional() }),
  component: Onboarding,
});

const REASONS = [
  { key: "vent", label: "I want to vent" },
  { key: "celebrate", label: "I want to celebrate something" },
  { key: "journal", label: "I want to journal" },
  { key: "read", label: "I want to read others" },
  { key: "somewhere", label: "I just needed somewhere to go" },
];

function Onboarding() {
  const navigate = useNavigate();
  const { profile, update, enterAnonymously } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(() => profile?.username ?? generateUsername());
  const [mood, setMood] = useState<string>();
  const [reason, setReason] = useState<string>();
  const [note, setNote] = useState("");

  const moodTone = mood ? getMood(mood)?.tone : undefined;
  const moodMessage = useMemo(() => {
    if (moodTone === "good")
      return "That's wonderful. Write it down — future you will want to remember this.";
    if (moodTone === "hard") return "You're safe here. Take your time.";
    if (moodTone === "neutral") return "Both are welcome here. Always.";
    return null;
  }, [moodTone]);

  const finish = () => {
    if (!profile) enterAnonymously();
    update({
      username: name,
      onboarded: true,
      todayMood: mood,
      reason,
    });
    navigate({ to: "/home" });
  };

  const skip = () => {
    if (!profile) enterAnonymously();
    update({ username: name, onboarded: true });
    navigate({ to: "/home" });
  };

  return (
    <div className="relative min-h-screen">
      <MandalaBackground />
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= step ? "bg-turquoise" : "bg-border"
                }`}
              />
            ))}
          </div>
          <button
            onClick={skip}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-cream"
          >
            <SkipForward className="h-3.5 w-3.5" /> skip
          </button>
        </div>

        {step === 0 && (
          <div className="page-enter space-y-6">
            <h1 className="font-hand text-4xl font-bold text-cream">
              You're here. That's enough for now.
            </h1>
            <p className="text-muted-foreground">
              We made you a soft, anonymous name. No real names — ever. Keep it, or shuffle for
              another.
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4">
              <span className="flex-1 font-hand text-3xl text-turquoise">{name}</span>
              <Button
                variant="soft"
                size="icon"
                onClick={() => setName(generateUsername())}
                aria-label="shuffle name"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="hero" size="xl" className="w-full" onClick={() => setStep(1)}>
              continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="page-enter space-y-6">
            <h1 className="font-hand text-4xl font-bold text-cream">
              How are you feeling today?
            </h1>
            <p className="text-muted-foreground">
              No wrong answer. The hard ones and the good ones both belong here.
            </p>
            <MoodSelector value={mood} onChange={setMood} />
            {moodMessage && (
              <p className="font-hand text-2xl text-turquoise/90 animate-rise">{moodMessage}</p>
            )}
            <Button variant="hero" size="xl" className="w-full" onClick={() => setStep(2)}>
              continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="page-enter space-y-6">
            <h1 className="font-hand text-4xl font-bold text-cream">What brought you here?</h1>
            <div className="grid gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setReason(r.key)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    reason === r.key
                      ? "border-turquoise/60 bg-turquoise/10 text-cream"
                      : "border-border bg-card/50 text-muted-foreground hover:text-cream"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">
                Anything you'd like to add? (optional)
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="only if you feel like it..."
                className="min-h-24 resize-none border-border bg-card/50"
              />
            </div>
            <Button variant="hero" size="xl" className="w-full" onClick={finish}>
              enter for once <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
