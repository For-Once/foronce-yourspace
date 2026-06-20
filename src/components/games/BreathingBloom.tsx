import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Phase = "in" | "hold" | "out";

const SEQUENCE: { phase: Phase; label: string; secs: number }[] = [
  { phase: "in", label: "breathe in…", secs: 4 },
  { phase: "hold", label: "hold…", secs: 4 },
  { phase: "out", label: "breathe out…", secs: 6 },
];

export function BreathingBloom() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running) return;
    const cur = SEQUENCE[step];
    timer.current = setTimeout(() => {
      const next = (step + 1) % SEQUENCE.length;
      if (next === 0) setCycles((c) => c + 1);
      setStep(next);
    }, cur.secs * 1000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [running, step]);

  const current = SEQUENCE[step];
  const scale = current.phase === "in" ? 1 : current.phase === "hold" ? 1 : 0.6;
  const dur = current.secs;

  const toggle = () => {
    if (running) {
      setRunning(false);
      setStep(0);
    } else {
      setStep(0);
      setRunning(true);
    }
  };

  return (
    <div className="grid h-[440px] place-items-center rounded-3xl border border-rose/25 bg-gradient-to-b from-rose/5 to-lavender/10">
      <div className="flex flex-col items-center gap-6">
        <div className="relative grid h-56 w-56 place-items-center">
          {/* petals */}
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-5xl"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-${running ? 64 * scale : 40}px)`,
                transition: `transform ${dur}s ease-in-out`,
                opacity: 0.9,
              }}
            >
              🌸
            </span>
          ))}
          <span
            className="text-4xl"
            style={{
              transform: `scale(${running ? scale + 0.2 : 1})`,
              transition: `transform ${dur}s ease-in-out`,
            }}
          >
            🌼
          </span>
        </div>

        <p className="font-hand text-3xl text-rose">
          {running ? current.label : "follow the bloom"}
        </p>

        <button
          onClick={toggle}
          className={cn(
            "rounded-full px-7 py-2.5 text-sm font-medium transition-all hover:scale-105",
            running
              ? "border border-border bg-card/50 text-muted-foreground"
              : "bg-rose/20 text-rose ring-1 ring-inset ring-rose/40",
          )}
        >
          {running ? "rest" : "begin"}
        </button>
        {cycles > 0 && (
          <p className="text-xs text-muted-foreground">{cycles} calm breaths together</p>
        )}
      </div>
    </div>
  );
}
