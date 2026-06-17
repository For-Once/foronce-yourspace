import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, CloudRain, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/meditation")({
  head: () => ({
    meta: [
      { title: "Meditation — For Once" },
      {
        name: "description",
        content:
          "A calm, quiet corner to breathe. Set a gentle timer and let soft ambient sounds — rain, ocean, or a warm drone — slow everything down.",
      },
    ],
  }),
  component: Meditation,
});

const PRESETS = [3, 5, 10, 15, 20];

type Sound = "rain" | "ocean" | "drone";

const SOUNDS: { key: Sound; label: string; icon: typeof Waves }[] = [
  { key: "rain", label: "soft rain", icon: CloudRain },
  { key: "ocean", label: "ocean waves", icon: Waves },
  { key: "drone", label: "warm drone", icon: Wind },
];

// A tiny self-contained ambient sound engine using the Web Audio API.
class AmbientEngine {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private master: GainNode | null = null;
  current: Sound | null = null;

  private ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx!;
  }

  private noiseBuffer(ctx: AudioContext) {
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // brown-ish noise: smoother, calmer than white noise
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }

  setVolume(v: number) {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    this.nodes.forEach((n) => {
      try {
        (n as AudioScheduledSourceNode).stop?.();
      } catch {
        /* ignore */
      }
      n.disconnect();
    });
    this.nodes = [];
    this.current = null;
  }

  async play(sound: Sound) {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.stop();
    this.current = sound;

    if (sound === "drone") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      filter.connect(this.master!);
      [110, 164.81, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = i * 4;
        const g = ctx.createGain();
        g.gain.value = 0.12;
        osc.connect(g);
        g.connect(filter);
        osc.start();
        this.nodes.push(osc, g);
      });
      this.nodes.push(filter);
      return;
    }

    // rain + ocean both come from soft brown noise, shaped differently
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();

    if (sound === "rain") {
      filter.type = "highpass";
      filter.frequency.value = 900;
      g.gain.value = 0.5;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master!);
    } else {
      // ocean: low rumble with a slow swelling LFO for waves
      filter.type = "lowpass";
      filter.frequency.value = 500;
      g.gain.value = 0.2;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.18;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      lfo.start();
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master!);
      this.nodes.push(lfo, lfoGain);
    }

    src.start();
    this.nodes.push(src, filter, g);
  }
}

function Meditation() {
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const engineRef = useRef<AmbientEngine | null>(null);
  if (!engineRef.current && typeof window !== "undefined") {
    engineRef.current = new AmbientEngine();
  }

  // countdown
  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      engineRef.current?.stop();
      setSound(null);
      affirm("That was time just for you. Carry the quiet with you.");
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  // cleanup on unmount
  useEffect(() => () => engineRef.current?.stop(), []);

  const setPreset = (m: number) => {
    setMinutes(m);
    setRemaining(m * 60);
    setRunning(false);
  };

  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      if (remaining <= 0) setRemaining(minutes * 60);
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setRemaining(minutes * 60);
  };

  const pickSound = async (s: Sound) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (sound === s) {
      engine.stop();
      setSound(null);
    } else {
      await engine.play(s);
      engine.setVolume(muted ? 0 : volume);
      setSound(s);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    engineRef.current?.setVolume(next ? 0 : volume);
  };

  const onVolume = (v: number) => {
    setVolume(v);
    setMuted(false);
    engineRef.current?.setVolume(v);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div>
      <PageHeader
        title="Meditation"
        subtitle="A quiet corner to breathe and slow down. Set a gentle timer, choose a soft sound, and let the rest fall away."
      />

      <div className="space-y-8">
        {/* breathing timer */}
        <div className="relative overflow-hidden rounded-3xl border border-turquoise/20 bg-gradient-to-b from-turquoise/5 to-lavender/5 p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative grid place-items-center">
              <div
                className={cn(
                  "grid h-52 w-52 place-items-center rounded-full bg-turquoise/10 ring-1 ring-turquoise/20",
                  running && "animate-breathe",
                )}
              >
                <div className="grid h-40 w-40 place-items-center rounded-full bg-turquoise/10">
                  <span className="font-hand text-6xl text-cream tabular-nums">
                    {mm}:{ss}
                  </span>
                </div>
              </div>
            </div>

            <p className="font-hand text-2xl text-turquoise/90">
              {running ? "breathe in… and slowly out…" : "whenever you're ready"}
            </p>

            <div className="flex gap-2">
              <Button variant="hero" size="lg" onClick={toggle}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "pause" : "begin"}
              </Button>
              <Button variant="soft" size="lg" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> reset
              </Button>
            </div>
          </div>
        </div>

        {/* presets */}
        <div>
          <p className="mb-3 text-sm text-muted-foreground">how long?</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setPreset(m)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-all",
                  minutes === m
                    ? "bg-turquoise/15 text-turquoise ring-1 ring-inset ring-turquoise/50"
                    : "border border-border bg-card/40 text-muted-foreground hover:text-cream",
                )}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* soundscapes */}
        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <Whisper>soft sounds to settle into</Whisper>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {SOUNDS.map((s) => {
              const Icon = s.icon;
              const active = sound === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => pickSound(s.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all",
                    active
                      ? "border-turquoise/50 bg-turquoise/10 text-turquoise"
                      : "border-border bg-background/30 text-muted-foreground hover:text-cream",
                  )}
                >
                  <Icon className={cn("h-6 w-6", active && "animate-pulse")} />
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-muted-foreground transition-colors hover:text-cream"
              aria-label={muted ? "unmute" : "mute"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              className="flex-1 accent-turquoise"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            sounds keep playing while your timer runs, and fade out gently when it ends.
          </p>
        </div>
      </div>
    </div>
  );
}
