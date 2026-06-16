import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Save,
  Lightbulb,
  Trash2,
  Mic,
  ImagePlus,
  X,
  Sparkles,
} from "lucide-react";
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
          "A fully private journal only you will ever see. Write entries, add cute stickers and photos, write unsent letters, and keep memories — stored on your device.",
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
  stickers?: string[];
  image?: string;
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

// little cute companions you can press onto an entry
const STICKERS = [
  "🌙",
  "⭐",
  "🌸",
  "🦋",
  "🍃",
  "☁️",
  "🫧",
  "💌",
  "🕯️",
  "🌷",
  "🐚",
  "�– ",
].map((s) => s.trim());

const ALL_STICKERS = [
  "🌙",
  "⭐",
  "🌸",
  "🦋",
  "🍃",
  "☁️",
  "🫧",
  "💌",
  "🕯️",
  "🌷",
  "🐚",
  "🌊",
  "🌻",
  "🧸",
  "🍓",
  "🌈",
  "✨",
  "🩷",
  "🐱",
  "📷",
];

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Resize + compress an uploaded image so private entries stay small in local storage.
async function fileToCompressedDataUrl(file: File, max = 900): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function Journal() {
  const [entries, setEntries] = useLocalStorage<Entry[]>("foronce.journal", []);

  return (
    <div>
      <PageHeader
        title="Private Space"
        subtitle="Fully private. No one else will ever see this. Just you, the page, and a few cute friends."
      >
        <div className="mt-4 flex select-none gap-2 text-2xl" aria-hidden="true">
          {["🌙", "⭐", "🌸", "🦋", "🫧"].map((s, i) => (
            <span
              key={s}
              className="inline-block animate-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {s}
            </span>
          ))}
        </div>
      </PageHeader>
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
  const [stickers, setStickers] = useState<string[]>([]);
  const [image, setImage] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const toggleSticker = (s: string) =>
    setStickers((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await fileToCompressedDataUrl(file);
      setImage(compressed);
    } catch {
      affirm("That image didn't want to come along — try another one.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () => {
    if (!text.trim() && !image && stickers.length === 0) return;
    setEntries((prev) => [
      {
        id: uid(),
        text: text.trim(),
        mood,
        kind,
        to: to.trim() || undefined,
        stickers: stickers.length ? stickers : undefined,
        image,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    if (kind === "letter") affirm("This was written. It was felt. It is released.");
    else if (kind === "memory") affirm("Write it down. Future you will want to remember it.");
    else affirm("Saved. This is yours and only yours.");
    setText("");
    setTo("");
    setMood(undefined);
    setStickers([]);
    setImage(undefined);
  };

  const canSave = Boolean(text.trim()) || Boolean(image) || stickers.length > 0;

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

        {/* image upload + preview */}
        {image && (
          <div className="relative mt-3 inline-block">
            <img
              src={image}
              alt="your attached moment"
              className="max-h-60 rounded-xl border border-border object-cover"
            />
            <button
              onClick={() => setImage(undefined)}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-cream backdrop-blur transition-colors hover:bg-rose/70"
              aria-label="remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-turquoise/40 hover:text-turquoise disabled:opacity-60"
          >
            <ImagePlus className="h-3 w-3" />
            {uploading ? "adding photo..." : image ? "change photo" : "add a photo"}
          </button>
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

        {/* stickers */}
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> press on a sticker (optional)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_STICKERS.map((s) => {
              const active = stickers.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSticker(s)}
                  aria-pressed={active}
                  className={`grid h-9 w-9 place-items-center rounded-xl border text-lg transition-all hover:scale-110 ${
                    active
                      ? "border-gold/60 bg-gold/15 scale-110 shadow-sm"
                      : "border-border bg-background/30"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {stickers.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              on this entry: <span className="text-base">{stickers.join(" ")}</span>
            </p>
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">tag a mood (optional)</p>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <Button variant="hero" size="lg" className="mt-4" disabled={!canSave} onClick={save}>
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

                  {e.image && (
                    <img
                      src={e.image}
                      alt="a moment you kept"
                      className="mb-3 max-h-72 w-full rounded-xl border border-border object-cover"
                    />
                  )}

                  {e.text && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">
                      {e.text}
                    </p>
                  )}

                  {e.stickers && e.stickers.length > 0 && (
                    <p className="mt-2 select-none text-xl">{e.stickers.join(" ")}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
