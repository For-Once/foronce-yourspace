import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send, Flame, Archive, Waves, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/it-was-real")({
  head: () => ({
    meta: [
      { title: "It Was Real — For Once" },
      {
        name: "description",
        content:
          "For everything you felt that was never returned. Write unsent letters, let them go on the sea, burn them, or keep them safely archived — your choice.",
      },
    ],
  }),
  component: ItWasReal,
});

interface Letter {
  id: string;
  to: string;
  text: string;
  createdAt: number;
}

const UNRETURNED_PROMPTS = [
  "what do you wish they knew?",
  "what would you tell yourself six months from now?",
  "what did loving them quietly teach you?",
];

const RETURNED_PROMPTS = [
  "who showed up for you when you didn't expect it?",
  "what does being loved back feel like?",
  "what would you thank them for?",
];

const STORIES = [
  "i loved someone for two years who never knew. it wasn't wasted — it taught me how much i'm capable of feeling.",
  "they didn't choose me. i'm learning that doesn't mean i was unchoosable.",
  "it ended and i survived it. that surprised me in the best way.",
];

function ItWasReal() {
  return (
    <div>
      <PageHeader
        title="It Was Real"
        subtitle="For everything you felt that was never returned — and for the love that did show up too."
      />
      <div className="mb-6 rounded-2xl border border-rose/20 bg-rose/5 p-4">
        <Whisper>Your feelings deserved a space even when they were not returned.</Whisper>
      </div>

      <Tabs defaultValue="unreturned">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/40 p-1">
          <TabsTrigger value="unreturned">It Wasn't Returned</TabsTrigger>
          <TabsTrigger value="returned">It Was Returned</TabsTrigger>
          <TabsTrigger value="archive">My Archive</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
        </TabsList>
        <TabsContent value="unreturned">
          <LetterWriter prompts={UNRETURNED_PROMPTS} />
        </TabsContent>
        <TabsContent value="returned">
          <LetterWriter prompts={RETURNED_PROMPTS} warm />
        </TabsContent>
        <TabsContent value="archive">
          <Archived />
        </TabsContent>
        <TabsContent value="stories">
          <div className="space-y-3">
            {STORIES.map((s, i) => (
              <article
                key={i}
                className="rounded-2xl border border-border bg-card/40 p-5 text-base leading-relaxed text-cream/90"
              >
                {s}
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type ReleaseChoice = "letgo" | "keep" | "burn";

function LetterWriter({ prompts, warm }: { prompts: string[]; warm?: boolean }) {
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [, setArchive] = useLocalStorage<Letter[]>("foronce.itwasreal.archive", []);
  const [choosing, setChoosing] = useState(false);
  const [animating, setAnimating] = useState<ReleaseChoice | null>(null);

  const openChoice = () => {
    if (!text.trim()) return;
    setChoosing(true);
  };

  const chose = (choice: ReleaseChoice) => {
    setChoosing(false);
    setAnimating(choice);

    if (choice === "keep") {
      setArchive((p) => [
        { id: uid(), to: to.trim(), text: text.trim(), createdAt: Date.now() },
        ...p,
      ]);
    }

    // let animation play, then clear
    window.setTimeout(() => {
      setAnimating(null);
      setText("");
      setTo("");
      const msg =
        choice === "keep"
          ? "Kept safe, just for you. 🕊️"
          : choice === "burn"
            ? "Burned. It's ash now — and you're lighter. 🔥"
            : "Let it go 🌊";
      affirm(msg);
    }, 2600);
  };

  return (
    <div className="relative space-y-6">
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <Input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="to the person... (only you'll know)"
          className="mb-3 border-border bg-background/30"
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="it never gets sent. just released."
          className="min-h-40 resize-none border-border bg-background/30"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => setText((t) => (t ? t + "\n\n" + p + "\n" : p + "\n"))}
              className="rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-rose/40 hover:text-rose"
            >
              {p}
            </button>
          ))}
        </div>
        <Button variant="hero" size="lg" className="mt-4" disabled={!text.trim()} onClick={openChoice}>
          <Send className="h-4 w-4" /> release it
        </Button>
        {warm && (
          <p className="mt-3 text-xs text-muted-foreground">
            you can keep these ones in your archive so you can revisit the warmth.
          </p>
        )}
      </div>

      {choosing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setChoosing(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="font-hand text-3xl text-cream">what happens now?</h3>
              <button
                onClick={() => setChoosing(false)}
                className="text-muted-foreground hover:text-cream"
                aria-label="close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <ChoiceRow
                icon={<Waves className="h-5 w-5" />}
                label="Let it go completely"
                sub="drifts away on the sea. no trace kept."
                onClick={() => chose("letgo")}
                color="turquoise"
              />
              <ChoiceRow
                icon={<Archive className="h-5 w-5" />}
                label="Release it, but keep in my archive"
                sub="only you can read it later. private."
                onClick={() => chose("keep")}
                color="gold"
              />
              <ChoiceRow
                icon={<Flame className="h-5 w-5" />}
                label="Burn it"
                sub="burns to ash. gone for good."
                onClick={() => chose("burn")}
                color="rose"
              />
            </div>
          </div>
        </div>
      )}

      {animating && <ReleaseAnimation choice={animating} text={text} />}
    </div>
  );
}

function ChoiceRow({
  icon,
  label,
  sub,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
  color: "turquoise" | "gold" | "rose";
}) {
  const cls = {
    turquoise: "border-turquoise/30 bg-turquoise/5 hover:bg-turquoise/10 text-turquoise",
    gold: "border-gold/30 bg-gold/5 hover:bg-gold/10 text-gold",
    rose: "border-rose/30 bg-rose/5 hover:bg-rose/10 text-rose",
  }[color];
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors", cls)}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background/30">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-cream">{label}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}

function ReleaseAnimation({ choice, text }: { choice: ReleaseChoice; text: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden bg-background/85 backdrop-blur-sm">
      {choice !== "burn" ? (
        // ocean waves for letgo + keep
        <svg
          className="absolute inset-x-0 bottom-0 h-64 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.12 184 / 0.35)" />
              <stop offset="100%" stopColor="oklch(0.32 0.028 184 / 0.9)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave-grad)"
            d="M0,160 C240,220 480,80 720,140 C960,200 1200,100 1440,160 L1440,320 L0,320 Z"
          >
            <animate
              attributeName="d"
              dur="3s"
              repeatCount="indefinite"
              values="
                M0,160 C240,220 480,80 720,140 C960,200 1200,100 1440,160 L1440,320 L0,320 Z;
                M0,180 C240,120 480,220 720,160 C960,100 1200,200 1440,140 L1440,320 L0,320 Z;
                M0,160 C240,220 480,80 720,140 C960,200 1200,100 1440,160 L1440,320 L0,320 Z"
            />
          </path>
        </svg>
      ) : (
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-rose/30 via-peach/10 to-transparent" />
      )}

      <div
        className={cn(
          "letter-fold absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 rounded-md border border-cream/40 bg-[#f7ecd6] p-4 text-[11px] leading-snug text-[#3a2a1a] shadow-2xl",
          choice === "burn" && "letter-burn",
          choice !== "burn" && "letter-drift",
        )}
      >
        <div className="line-clamp-6 whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

function Archived() {
  const [archive, setArchive] = useLocalStorage<Letter[]>("foronce.itwasreal.archive", []);
  const remove = (id: string) => setArchive((p) => p.filter((l) => l.id !== id));

  if (archive.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        nothing here yet. anything you choose to keep will live here quietly.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <Whisper>Only you can read these. Yours to keep or delete.</Whisper>
      {archive.map((l) => (
        <article key={l.id} className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <div className="mb-1 flex items-center justify-between">
            {l.to ? (
              <p className="text-xs text-muted-foreground">to {l.to}</p>
            ) : (
              <span />
            )}
            <button
              onClick={() => remove(l.id)}
              className="text-xs text-muted-foreground hover:text-rose"
            >
              delete
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">{l.text}</p>
        </article>
      ))}
    </div>
  );
}
