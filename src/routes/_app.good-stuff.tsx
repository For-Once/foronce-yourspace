import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PartyPopper, Coffee, Sun, Send, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { affirm } from "@/lib/affirm";

export const Route = createFileRoute("/_app/good-stuff")({
  head: () => ({
    meta: [
      { title: "The Good Stuff — For Once" },
      {
        name: "description",
        content:
          "A space just for joy. Keep a gratitude wall and a good-day jar so you remember the moments worth holding onto.",
      },
    ],
  }),
  component: GoodStuff,
});

interface GoodPost {
  id: string;
  text: string;
  createdAt: number;
}

const HAPPY_PROMPTS = [
  "What made you smile today, even quietly?",
  "Who made you feel loved recently?",
  "What are you proud of yourself for this week?",
  "What's something good coming that you're looking forward to?",
  "Describe a perfect ordinary moment you had recently.",
  "What's a small comfort that always works for you?",
];

function GoodStuff() {
  return (
    <div>
      <PageHeader
        title="The Good Stuff"
        subtitle="A whole space just for joy, gratitude and celebration. You deserve to take up room with your happiness too."
      />
      <Tabs defaultValue="celebrate">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/40 p-1">
          <TabsTrigger value="celebrate">Celebrate</TabsTrigger>
          <TabsTrigger value="gratitude">Gratitude Wall</TabsTrigger>
          <TabsTrigger value="jar">Good Day Jar</TabsTrigger>
          <TabsTrigger value="prompts">Happy Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="celebrate">
          <Celebrate />
        </TabsContent>
        <TabsContent value="gratitude">
          <Gratitude />
        </TabsContent>
        <TabsContent value="jar">
          <GoodDayJar />
        </TabsContent>
        <TabsContent value="prompts">
          <HappyPrompts />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Celebrate() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useLocalStorage<GoodPost[]>("foronce.celebrate", []);

  const post = () => {
    if (!text.trim()) return;
    setPosts((prev) => [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...prev]);
    affirm("You deserve to take up space with your happiness too.");
    setText("");
  };

  return (
    <div className="space-y-6">
      <Whisper>Something good happened? Say it out loud. No likes, no comparison — just celebration.</Whisper>
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I want to celebrate that..."
          className="min-h-28 resize-none border-border bg-background/30"
        />
        <Button variant="hero" size="lg" className="mt-3" disabled={!text.trim()} onClick={post}>
          <PartyPopper className="h-4 w-4" /> celebrate it
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
            <Sparkles className="mb-2 h-4 w-4 text-gold" />
            <p className="text-sm leading-relaxed text-cream/90">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gratitude() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useLocalStorage<GoodPost[]>("foronce.gratitude", []);

  const post = () => {
    if (!text.trim()) return;
    setPosts((prev) => [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...prev]);
    affirm("The small things count. Thank you for noticing one.");
    setText("");
  };

  return (
    <div className="space-y-6">
      <Whisper>Small things only. The cozy, ordinary, almost-missed moments — all your own.</Whisper>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && post()}
          placeholder="something small you're grateful for..."
          className="border-border bg-card/40"
        />
        <Button variant="hero" size="icon" disabled={!text.trim()} onClick={post}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {posts.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          your gratitude wall is empty. add the first small thing you're thankful for.
        </p>
      ) : (
        <div className="columns-1 gap-3 sm:columns-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="mb-3 break-inside-avoid rounded-2xl border border-peach/20 bg-peach/5 p-4"
            >
              <Coffee className="mb-2 h-4 w-4 text-peach" />
              <p className="text-sm leading-relaxed text-cream/90">{p.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoodDayJar() {
  const [text, setText] = useState("");
  const [moments, setMoments] = useLocalStorage<GoodPost[]>("foronce.jar", []);
  const [dropping, setDropping] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const add = () => {
    if (!text.trim()) return;
    const value = text.trim();
    setText("");
    setDropping(true);
    window.setTimeout(() => {
      setMoments((prev) => [{ id: uid(), text: value, createdAt: Date.now() }, ...prev]);
      setDropping(false);
      affirm("dropped into your jar. it glows a little brighter now. ✨");
    }, 900);
  };

  const thisWeek = moments.filter((m) => Date.now() - m.createdAt < 7 * 864e5);
  const fillPct = Math.min(90, moments.length * 3 + (moments.length > 0 ? 10 : 0));
  const fireflies = Math.min(moments.length, 24);

  return (
    <div className="space-y-6">
      <Whisper>Your private jar of good moments. One line is enough. Tap the jar to open it.</Whisper>
      {thisWeek.length > 0 && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-cream">
          You had {thisWeek.length} good moment{thisWeek.length > 1 ? "s" : ""} this week. Want to
          look back? 🫶
        </div>
      )}

      {/* the jar */}
      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
        <button
          onClick={() => moments.length > 0 && setViewOpen(true)}
          disabled={moments.length === 0}
          aria-label="open your good day jar"
          className="group relative h-72 w-56 select-none disabled:cursor-default"
        >
          {/* dropping firefly */}
          {dropping && (
            <span
              className="pointer-events-none absolute left-1/2 top-0 z-20 h-3 w-3 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_16px_6px_rgba(255,210,120,0.7)]"
              style={{ animation: "jar-drop 0.9s cubic-bezier(0.5,0,0.6,1) forwards" }}
            />
          )}

          <svg
            viewBox="0 0 200 280"
            className="h-full w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-[1.02]"
          >
            <defs>
              <linearGradient id="jar-glass" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="oklch(0.82 0.12 184 / 0.15)" />
                <stop offset="50%" stopColor="oklch(0.96 0.012 85 / 0.08)" />
                <stop offset="100%" stopColor="oklch(0.82 0.12 184 / 0.2)" />
              </linearGradient>
              <linearGradient id="jar-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.85 0.14 80 / 0.55)" />
                <stop offset="100%" stopColor="oklch(0.7 0.13 60 / 0.35)" />
              </linearGradient>
              <clipPath id="jar-body-clip">
                <path d="M40,90 Q40,80 50,80 L150,80 Q160,80 160,90 L160,250 Q160,265 145,265 L55,265 Q40,265 40,250 Z" />
              </clipPath>
            </defs>
            {/* lid */}
            <rect x="52" y="55" width="96" height="26" rx="6" fill="#8a5a2b" stroke="#5c3a1e" strokeWidth="1.5" />
            <rect x="48" y="72" width="104" height="10" rx="3" fill="#6b4220" />
            {/* jar body outline */}
            <path
              d="M40,90 Q40,80 50,80 L150,80 Q160,80 160,90 L160,250 Q160,265 145,265 L55,265 Q40,265 40,250 Z"
              fill="url(#jar-glass)"
              stroke="oklch(0.82 0.12 184 / 0.4)"
              strokeWidth="2"
            />
            {/* fill level (from bottom) */}
            <g clipPath="url(#jar-body-clip)">
              <rect
                x="40"
                y={265 - (fillPct / 100) * 175}
                width="120"
                height="200"
                fill="url(#jar-fill)"
                style={{ transition: "y 0.7s cubic-bezier(0.5,0,0.3,1)" }}
              />
              {/* wavy top of fill */}
              <path
                d={`M40,${265 - (fillPct / 100) * 175} Q70,${265 - (fillPct / 100) * 175 - 6} 100,${265 - (fillPct / 100) * 175} T160,${265 - (fillPct / 100) * 175} L160,265 L40,265 Z`}
                fill="oklch(0.85 0.14 80 / 0.4)"
              />
              {/* fireflies inside */}
              {Array.from({ length: fireflies }).map((_, i) => {
                const cx = 55 + ((i * 17) % 90);
                const cy = 260 - ((i * 13) % Math.max(20, (fillPct / 100) * 165));
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={2.2}
                    fill="oklch(0.9 0.14 80)"
                    opacity={0.85}
                    style={{ animation: `jar-glow 3s ease-in-out ${i * 0.2}s infinite` }}
                  />
                );
              })}
            </g>
            {/* glass highlight */}
            <path
              d="M52,100 L52,240 Q52,250 60,250"
              stroke="oklch(0.96 0.012 85 / 0.35)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* label */}
            <rect x="65" y="170" width="70" height="34" rx="4" fill="oklch(0.96 0.012 85 / 0.85)" />
            <text
              x="100"
              y="190"
              textAnchor="middle"
              fontFamily="Caveat, cursive"
              fontSize="18"
              fill="#3a2a1a"
            >
              good days
            </text>
          </svg>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            {moments.length} {moments.length === 1 ? "moment" : "moments"}
            {moments.length > 0 && " · tap to open"}
          </p>
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="a good moment from today..."
          className="border-border bg-card/40"
          disabled={dropping}
        />
        <Button variant="hero" size="icon" disabled={!text.trim() || dropping} onClick={add}>
          <Sun className="h-4 w-4" />
        </Button>
      </div>

      {moments.length === 0 && (
        <p className="py-2 text-center text-sm text-muted-foreground">
          your jar is empty for now. drop a good moment in whenever one happens.
        </p>
      )}

      {viewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm"
          onClick={() => setViewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="jar-open-in max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-hand text-3xl text-gold">your good days</h3>
              <button
                onClick={() => setViewOpen(false)}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-cream"
              >
                close
              </button>
            </div>
            <div className="space-y-2">
              {moments.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 rounded-xl border border-gold/15 bg-gold/5 px-4 py-3"
                >
                  <Sun className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <p className="flex-1 whitespace-pre-wrap text-sm text-cream/90">{m.text}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Happy Prompts are now interactive — pick one, answer it, and it's saved
// straight into your Good Day Jar so it actually sticks around.
function HappyPrompts() {
  const [active, setActive] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [, setJar] = useLocalStorage<GoodPost[]>("foronce.jar", []);

  const open = (p: string) => {
    setActive(p);
    setAnswer("");
  };

  const save = () => {
    if (!active || !answer.trim()) return;
    setJar((prev) => [
      { id: uid(), text: `${active}\n— ${answer.trim()}`, createdAt: Date.now() },
      ...prev,
    ]);
    affirm("Saved to your Good Day Jar. Future you will love finding this.");
    setActive(null);
    setAnswer("");
  };

  return (
    <div className="space-y-3">
      <Whisper>Gentle nudges for the good days. Answer one and it's kept in your Good Day Jar.</Whisper>
      {HAPPY_PROMPTS.map((p) => (
        <div key={p} className="rounded-2xl border border-border bg-card/40 p-5">
          <button
            onClick={() => open(active === p ? "" : p)}
            className="flex w-full items-center justify-between gap-3 text-left text-lg text-cream/90"
          >
            <span>{p}</span>
            <PenLine className="h-4 w-4 shrink-0 text-turquoise" />
          </button>
          {active === p && (
            <div className="mt-4 space-y-3">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="write your answer..."
                className="min-h-24 resize-none border-border bg-background/30"
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="hero" size="sm" disabled={!answer.trim()} onClick={save}>
                  <Send className="h-4 w-4" /> keep it
                </Button>
                <Button variant="soft" size="sm" onClick={() => setActive(null)}>
                  cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
