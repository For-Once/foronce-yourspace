import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Save, Lightbulb, Trash2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { MoodSelector } from "@/components/MoodSelector";
import { VoiceRecorder } from "./_app.your-space";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { getMood, moodColorStyle } from "@/lib/moods";
import { affirm } from "@/lib/affirm";

export const Route = createFileRoute("/_app/journal")({
  head: () => ({
    meta: [
      { title: "Private Space — For Once" },
      {
        name: "description",
        content:
          "A fully private journal only you will ever see. Write entries, unsent letters, and memories — stored on your device.",
      },
    ],
  }),
  component: Journal,
});

interface Entry {
  id: string;
  text: string;
  mood?: string;
  kind: "entry" | "letter" | "memory" | "your-space";
  to?: string;
  createdAt: number;
}

const PROMPTS = [
  "what has been sitting heavy on you lately?",
  "what do you wish someone would just ask you?",
  "what happened today that you want to remember?",
  "who made you feel seen recently?",
  "what are you quietly proud of?",
  "describe a perfect ordinary moment you had recently.",
];

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Journal() {
  const [entries, setEntries] = useLocalStorage<Entry[]>("foronce.journal", []);

  return (
    <div>
      <PageHeader
        title="Private Space"
        subtitle="Fully private. No one else will ever see this. Just you and the page."
      />
      <Tabs defaultValue="entries">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/40 p-1">
          <TabsTrigger value="entries">Journal</TabsTrigger>
          <TabsTrigger value="letters">Unsent letters</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Composer entries={entries} setEntries={setEntries} kind="entry" />
        </TabsContent>
        <TabsContent value="letters">
          <Composer entries={entries} setEntries={setEntries} kind="letter" />
        </TabsContent>
        <TabsContent value="memories">
          <Composer entries={entries} setEntries={setEntries} kind="memory" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Composer({
  entries,
  setEntries,
  kind,
}: {
  entries: Entry[];
  setEntries: (fn: (prev: Entry[]) => Entry[]) => void;
  kind: "entry" | "letter" | "memory";
}) {
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
  const [mood, setMood] = useState<string>();
  const [query, setQuery] = useState("");

  const config = {
    entry: {
      placeholder: "today felt like...",
      cta: "save entry",
      empty: "your journal is quiet for now. write whenever you're ready.",
    },
    letter: {
      placeholder: "dear...  (this is never sent — just released)",
      cta: "release this letter",
      empty: "no letters yet. write to anyone — they'll never read it, but you'll feel it.",
    },
    memory: {
      placeholder: "a good moment i want to keep...",
      cta: "save this memory",
      empty: "your good moments will live here. save the ones you don't want to forget.",
    },
  }[kind];

  const list = useMemo(
    () =>
      entries
        .filter((e) => (kind === "entry" ? e.kind === "entry" || e.kind === "your-space" : e.kind === kind))
        .filter((e) =>
          query
            ? (e.text + (e.to ?? "")).toLowerCase().includes(query.toLowerCase())
            : true,
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [entries, kind, query],
  );

  const save = () => {
    if (!text.trim()) return;
    setEntries((prev) => [
      { id: uid(), text: text.trim(), mood, kind, to: to.trim() || undefined, createdAt: Date.now() },
      ...prev,
    ]);
    if (kind === "letter") affirm("This was written. It was felt. It is released.");
    else if (kind === "memory") affirm("Write it down. Future you will want to remember it.");
    else affirm("Saved. This is yours and only yours.");
    setText("");
    setTo("");
    setMood(undefined);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        {kind === "letter" && (
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="to whom? (only you'll know)"
            className="mb-3 border-border bg-background/30"
          />
        )}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={config.placeholder}
          className="min-h-44 resize-none border-border bg-background/30 text-base leading-relaxed"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {PROMPTS.slice(0, 4).map((p) => (
            <button
              key={p}
              onClick={() => setText((t) => (t ? t + "\n\n" + p + "\n" : p + "\n"))}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
            >
              <Lightbulb className="h-3 w-3" /> {p}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">tag a mood (optional)</p>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <Button variant="hero" size="lg" className="mt-4" disabled={!text.trim()} onClick={save}>
          <Save className="h-4 w-4" /> {config.cta}
        </Button>
      </div>

      <details className="rounded-2xl border border-border bg-card/30 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Mic className="h-4 w-4" /> record a voice note instead
        </summary>
        <div className="mt-4">
          <VoiceRecorder />
        </div>
      </details>

      <div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search your entries..."
            className="border-border bg-card/40 pl-9"
          />
        </div>

        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{config.empty}</p>
        ) : (
          <div className="space-y-3">
            {list.map((e) => {
              const m = e.mood ? getMood(e.mood) : undefined;
              return (
                <article
                  key={e.id}
                  className="group rounded-2xl border border-border bg-card/40 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {e.to ? `to ${e.to} · ` : ""}
                      {fmt(e.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {m && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ${moodColorStyle[m.color].bg} ${moodColorStyle[m.color].text}`}
                        >
                          {m.label}
                        </span>
                      )}
                      <button
                        onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                        className="text-muted-foreground opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                        aria-label="delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">
                    {e.text}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
