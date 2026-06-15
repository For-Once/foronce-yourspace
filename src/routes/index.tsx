import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Cloud, CloudRain, Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MandalaBackground } from "@/components/MandalaBackground";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Once — Be a little selfish about how you feel" },
      {
        name: "description",
        content:
          "A safe, anonymous space for everything you feel — the hard stuff and the good stuff too.",
      },
    ],
  }),
  component: Landing,
});

const MOODS_HERO = [
  { icon: CloudRain, label: "struggling", color: "text-lavender", ring: "ring-lavender/40" },
  { icon: Cloud, label: "somewhere in between", color: "text-cream", ring: "ring-cream/30" },
  { icon: Sun, label: "glowing", color: "text-gold", ring: "ring-gold/40" },
];

function usePresenceCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const base = 40 + Math.floor(Math.random() * 80);
    setCount(base);
    const t = setInterval(() => {
      setCount((c) => Math.max(18, c + (Math.random() > 0.5 ? 1 : -1)));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return count;
}

function Landing() {
  const navigate = useNavigate();
  const { enterAnonymously } = useProfile();
  const presence = usePresenceCount();

  const enterAnon = () => {
    enterAnonymously();
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MandalaBackground />



      {/* floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-turquoise/30 animate-float-slow"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${9 + (i % 6)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
        <span className="page-enter mb-6 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          a 2am safe space · for all feelings
        </span>

        <h1 className="page-enter font-hand text-7xl font-bold leading-[0.95] text-cream sm:text-8xl">
          For Once
        </h1>
        <p className="page-enter mt-3 text-xl text-turquoise/90 sm:text-2xl">
          Be a little selfish about how you feel.
        </p>

        <p className="page-enter mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          A safe, anonymous space for everything you feel — the hard stuff and the good
          stuff too.
        </p>

        {/* three mood states */}
        <div className="page-enter mt-10 flex items-center justify-center gap-5 sm:gap-8">
          {MOODS_HERO.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex flex-col items-center gap-2">
                <span
                  className={`grid h-16 w-16 place-items-center rounded-full bg-card/50 ring-1 ${m.ring} backdrop-blur-sm animate-breathe`}
                  style={{ animationDelay: `${i * 1.3}s` }}
                >
                  <Icon className={`h-7 w-7 ${m.color}`} />
                </span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            );
          })}
        </div>

        <div className="page-enter mt-10 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={enterAnon}>
            Enter Anonymously
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="soft" size="xl" className="w-full sm:w-auto" asChild>
            <Link to="/onboarding" search={{ account: true }}>
              Create Account
            </Link>
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          No forced signup. No real names. Ever.
        </p>

        <div className="page-enter mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turquoise/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-turquoise" />
          </span>
          {presence} people are here right now
        </div>
      </div>
    </div>
  );
}
