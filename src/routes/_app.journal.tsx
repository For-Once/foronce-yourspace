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
  Brush,
  Smile,
  Frown,
  Meh,
  Mailbox,
  Clock,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { MoodSelector } from "@/components/MoodSelector";
import { StickerTray } from "@/components/StickerTray";
import { DoodleCanvas, type DoodleCanvasHandle } from "@/components/DoodleCanvas";
import { CameraCapture } from "@/components/CameraCapture";
import { UpgradePrompt, PlusLock } from "@/components/UpgradePrompt";
import { VoiceRecorder } from "./_app.your-space";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { getMood, moodColorStyle } from "@/lib/moods";
import { usePlus, usePlusVisible, FREE_JOURNAL_LIMIT } from "@/lib/plus";
import { useJournalTheme, themeStyle } from "@/lib/themes";
import { affirm } from "@/lib/affirm";

export const Route = createFileRoute("/_app/journal")({
  head: () => ({
    meta: [
      { title: "Private Space — For Once" },
      {
        name: "description",
        content:
          "A fully private journal only you will ever see. Write entries, doodle on a canvas, add searchable stickers and photos, capture moments with your camera, and keep memories — stored on your device.",
      },
    ],
  }),
  component: Journal,
});

interface Entry {
  id: string;
  text: string;
  mood?: string;
  kind: "entry" | "letter" | "memory" | "your-space" | "canvas" | "moment";
  to?: string;
  stickers?: string[];
  image?: string;
  feeling?: "happy" | "sad" | "neutral";
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
  const { theme } = useJournalTheme();
  const plusVisible = usePlusVisible();

  return (
    <div
      className="-mx-4 rounded-3xl px-4 py-2 transition-colors lg:-mx-10 lg:px-10"
      style={themeStyle(theme)}
    >
      <PageHeader
        title="Private Space"
        subtitle="Fully private. No one else will ever see this. Just you, the page, and a few cute friends."
      >
        <div className="mt-4 flex select-none gap-2 text-2xl" aria-hidden="true">
          {theme.accents.concat(["🌙", "⭐", "🌸"]).slice(0, 5).map((s, i) => (
            <span
              key={`${s}-${i}`}
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
          {plusVisible && <TabsTrigger value="future">Letter to Future You</TabsTrigger>}
          <TabsTrigger value="canvas">Doodle & Stickers</TabsTrigger>
          <TabsTrigger value="gallery">Moments</TabsTrigger>
          <TabsTrigger value="letters">Unsent letters</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Composer entries={entries} setEntries={setEntries} kind="entry" />
        </TabsContent>
        {plusVisible && (
          <TabsContent value="future">
            <FutureLetters />
          </TabsContent>
        )}
        <TabsContent value="canvas">
          <CanvasStudio entries={entries} setEntries={setEntries} />
        </TabsContent>
        <TabsContent value="gallery">
          <Gallery entries={entries} setEntries={setEntries} />
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
  const { isPlus } = usePlus();
  const plusVisible = usePlusVisible();
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
  const [mood, setMood] = useState<string>();
  const [query, setQuery] = useState("");
  const [stickers, setStickers] = useState<string[]>([]);
  const [image, setImage] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Free tier caps basic journal entries at 20 total.
  const basicCount = useMemo(
    () => entries.filter((e) => e.kind === "entry" || e.kind === "your-space").length,
    [entries],
  );
  const capped = kind === "entry" && !isPlus && basicCount >= FREE_JOURNAL_LIMIT;

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
    if (capped) return;
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

  const canSave = (Boolean(text.trim()) || Boolean(image) || stickers.length > 0) && !capped;

  return (
    <div className="space-y-8">
      {kind === "entry" && !isPlus && (
        <p className="text-xs text-muted-foreground">
          {Math.min(basicCount, FREE_JOURNAL_LIMIT)} of {FREE_JOURNAL_LIMIT} free entries used
        </p>
      )}
      {capped && (
        <UpgradePrompt
          title="You've written 20 entries"
          message="That's something to be proud of. Want unlimited space to keep going? Plus removes the cap on entries and voice notes."
        />
      )}
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

        {/* searchable stickers */}
        <div className="mt-4">
          <StickerTray onPick={toggleSticker} selected={stickers} />
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
            {list.map((e) => (
              <EntryCard key={e.id} entry={e} setEntries={setEntries} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({
  entry: e,
  setEntries,
}: {
  entry: Entry;
  setEntries: (fn: (prev: Entry[]) => Entry[]) => void;
}) {
  const m = e.mood ? getMood(e.mood) : undefined;
  return (
    <article className="group rounded-2xl border border-border bg-card/40 p-4">
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
}

function CanvasStudio({
  entries,
  setEntries,
}: {
  entries: Entry[];
  setEntries: (fn: (prev: Entry[]) => Entry[]) => void;
}) {
  const canvasRef = useRef<DoodleCanvasHandle>(null);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [caption, setCaption] = useState("");
  const [stickers, setStickers] = useState<string[]>([]);

  const list = useMemo(
    () => entries.filter((e) => e.kind === "canvas").sort((a, b) => b.createdAt - a.createdAt),
    [entries],
  );

  const toggleSticker = (s: string) =>
    setStickers((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const save = () => {
    const hasArt = canvasRef.current?.hasDrawing();
    if (!hasArt && !caption.trim() && stickers.length === 0) return;
    const image = hasArt ? canvasRef.current?.toDataUrl() ?? undefined : undefined;
    setEntries((prev) => [
      {
        id: uid(),
        text: caption.trim(),
        kind: "canvas",
        stickers: stickers.length ? stickers : undefined,
        image,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    affirm("A little piece of you, saved. Only you can see it.");
    setCaption("");
    setStickers([]);
    canvasRef.current?.clear();
    setHasDrawing(false);
  };

  const canSave = hasDrawing || Boolean(caption.trim()) || stickers.length > 0;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Brush className="h-4 w-4 text-turquoise" /> draw anything — scribble your mood, doodle a
          flower, sketch your day.
        </p>
        <DoodleCanvas ref={canvasRef} onChange={setHasDrawing} />

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="a little caption for your doodle (optional)"
          className="mt-4 min-h-20 resize-none border-border bg-background/30"
        />

        <div className="mt-4">
          <StickerTray onPick={toggleSticker} selected={stickers} label="decorate with stickers (optional)" />
          {stickers.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              on this doodle: <span className="text-base">{stickers.join(" ")}</span>
            </p>
          )}
        </div>

        <Button variant="hero" size="lg" className="mt-4" disabled={!canSave} onClick={save}>
          <Save className="h-4 w-4" /> save to my space
        </Button>
      </div>

      {list.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((e) => (
            <EntryCard key={e.id} entry={e} setEntries={setEntries} />
          ))}
        </div>
      )}
    </div>
  );
}

const FEELINGS: { key: "happy" | "sad" | "neutral"; label: string; icon: typeof Smile }[] = [
  { key: "happy", label: "happy", icon: Smile },
  { key: "neutral", label: "in between", icon: Meh },
  { key: "sad", label: "sad", icon: Frown },
];

function Gallery({
  entries,
  setEntries,
}: {
  entries: Entry[];
  setEntries: (fn: (prev: Entry[]) => Entry[]) => void;
}) {
  const [pending, setPending] = useState<string | undefined>();
  const [feeling, setFeeling] = useState<"happy" | "sad" | "neutral">("happy");
  const [caption, setCaption] = useState("");
  const [filter, setFilter] = useState<"all" | "happy" | "sad" | "neutral">("all");

  const list = useMemo(
    () =>
      entries
        .filter((e) => e.kind === "moment")
        .filter((e) => (filter === "all" ? true : e.feeling === filter))
        .sort((a, b) => b.createdAt - a.createdAt),
    [entries, filter],
  );

  const save = () => {
    if (!pending) return;
    setEntries((prev) => [
      {
        id: uid(),
        text: caption.trim(),
        kind: "moment",
        image: pending,
        feeling,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    affirm(
      feeling === "sad"
        ? "This feeling is real too. Thank you for keeping it gently."
        : "A moment worth holding onto. Saved just for you.",
    );
    setPending(undefined);
    setCaption("");
    setFeeling("happy");
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          take a picture of this moment — happy or sad — and keep it in your private gallery.
        </p>

        {pending ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={pending}
                alt="captured moment"
                className="max-h-80 w-full rounded-xl border border-border object-cover"
              />
              <button
                onClick={() => setPending(undefined)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-cream backdrop-blur transition-colors hover:bg-rose/70"
                aria-label="discard photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="mb-2 text-sm text-muted-foreground">how does this moment feel?</p>
              <div className="flex flex-wrap gap-2">
                {FEELINGS.map((f) => {
                  const Icon = f.icon;
                  const active = feeling === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFeeling(f.key)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm capitalize transition-all ${
                        active
                          ? "bg-turquoise/15 text-turquoise ring-1 ring-inset ring-turquoise/50"
                          : "border border-border bg-background/30 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="a few words about this moment (optional)"
              className="min-h-20 resize-none border-border bg-background/30"
            />

            <Button variant="hero" size="lg" onClick={save}>
              <Save className="h-4 w-4" /> keep this moment
            </Button>
          </div>
        ) : (
          <CameraCapture onCapture={setPending} />
        )}
      </div>

      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "happy", "neutral", "sad"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                filter === f
                  ? "bg-turquoise/15 text-turquoise"
                  : "text-muted-foreground hover:text-cream"
              }`}
            >
              {f === "neutral" ? "in between" : f}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            your gallery is empty. capture a moment whenever one happens.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((e) => (
              <div
                key={e.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/40"
              >
                {e.image && (
                  <img
                    src={e.image}
                    alt={e.text || "a kept moment"}
                    className="aspect-square w-full object-cover"
                  />
                )}
                <button
                  onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/70 text-cream opacity-0 backdrop-blur transition-opacity hover:bg-rose/70 group-hover:opacity-100"
                  aria-label="delete moment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {(e.text || e.feeling) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                    {e.feeling && (
                      <span className="text-xs capitalize text-turquoise">
                        {e.feeling === "neutral" ? "in between" : e.feeling}
                      </span>
                    )}
                    {e.text && (
                      <p className="line-clamp-2 text-xs text-cream/90">{e.text}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Letter to Future You (Plus) ----------

interface FutureLetter {
  id: string;
  text: string;
  createdAt: number;
  deliverAt: number;
  opened: boolean;
}

const DELIVERY_OPTIONS = [
  { label: "in 1 month", months: 1 },
  { label: "in 3 months", months: 3 },
  { label: "in 6 months", months: 6 },
];

function monthsFromNow(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

function countdown(target: number) {
  const ms = target - Date.now();
  if (ms <= 0) return "arriving now";
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days >= 30) return `${Math.round(days / 30)} month${days >= 60 ? "s" : ""} to go`;
  if (days > 1) return `${days} days to go`;
  return "tomorrow";
}

function FutureLetters() {
  const { isPlus } = usePlus();

  if (!isPlus) {
    return (
      <div className="space-y-4">
        <PlusLock label="Write a letter to your future self with Plus">
          <div className="grid h-72 place-items-center rounded-2xl bg-card/40">
            <Mailbox className="h-12 w-12 text-muted-foreground" />
          </div>
        </PlusLock>
        <p className="text-center text-sm text-muted-foreground">
          Lock a journal entry and have it find you again in 1, 3, or 6 months.
        </p>
      </div>
    );
  }

  return <FutureLettersInner />;
}

function FutureLettersInner() {
  const [letters, setLetters] = useLocalStorage<FutureLetter[]>("foronce.futureletters", []);
  const [text, setText] = useState("");
  const [months, setMonths] = useState(3);
  const [revealing, setRevealing] = useState<string | null>(null);

  const now = Date.now();
  const delivered = letters.filter((l) => l.deliverAt <= now && !l.opened).sort((a, b) => b.deliverAt - a.deliverAt);
  const pending = letters.filter((l) => l.deliverAt > now).sort((a, b) => a.deliverAt - b.deliverAt);
  const opened = letters.filter((l) => l.opened).sort((a, b) => b.deliverAt - a.deliverAt);

  const send = () => {
    if (!text.trim()) return;
    setLetters((prev) => [
      {
        id: uid(),
        text: text.trim(),
        createdAt: Date.now(),
        deliverAt: monthsFromNow(months),
        opened: false,
      },
      ...prev,
    ]);
    affirm("Sealed. Your future self will be glad you wrote this.");
    setText("");
  };

  const open = (l: FutureLetter) => {
    setRevealing(l.id);
    setTimeout(() => {
      setLetters((prev) => prev.map((x) => (x.id === l.id ? { ...x, opened: true } : x)));
      setRevealing(null);
    }, 1300);
  };

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* delivered notification */}
      {delivered.map((l) => (
        <div
          key={l.id}
          className="overflow-hidden rounded-3xl border border-gold/40 bg-gold/5 p-6 text-center"
        >
          {revealing === l.id ? (
            <div className="animate-scale-in py-6">
              <Mailbox className="mx-auto h-12 w-12 animate-bounce text-gold" />
              <p className="mt-3 font-hand text-2xl text-cream">opening…</p>
            </div>
          ) : (
            <>
              <Sparkles className="mx-auto mb-2 h-7 w-7 text-gold" />
              <p className="font-hand text-2xl text-cream">A letter from your past self just arrived</p>
              <p className="mt-1 text-sm text-muted-foreground">
                written on {fmtDate(l.createdAt)}
              </p>
              <Button variant="hero" size="lg" className="mt-4" onClick={() => open(l)}>
                <Mailbox className="h-4 w-4" /> open it
              </Button>
            </>
          )}
        </div>
      ))}

      {/* composer */}
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Mailbox className="h-4 w-4 text-gold" /> write something for a future version of you. it
          stays sealed until the day you choose.
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="dear future me,"
          className="min-h-40 resize-none border-border bg-background/30 leading-relaxed"
        />
        <div className="mt-3">
          <p className="mb-2 text-sm text-muted-foreground">deliver this letter</p>
          <div className="flex flex-wrap gap-2">
            {DELIVERY_OPTIONS.map((o) => (
              <button
                key={o.months}
                onClick={() => setMonths(o.months)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  months === o.months
                    ? "bg-gold/15 text-gold ring-1 ring-inset ring-gold/50"
                    : "border border-border bg-background/30 text-muted-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="hero" size="lg" className="mt-4" disabled={!text.trim()} onClick={send}>
          <Lock className="h-4 w-4" /> lock this letter
        </Button>
      </div>

      {/* on their way */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-lavender/80">
          <Clock className="h-4 w-4" /> Letters on their way
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            no sealed letters yet. write one above — future you will thank you.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card/40 px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm text-cream/90">
                  <Lock className="h-4 w-4 text-muted-foreground" /> sealed letter ·{" "}
                  {fmtDate(l.deliverAt)}
                </span>
                <span className="text-xs text-gold">{countdown(l.deliverAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* opened */}
      {opened.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gold/80">
            Letters you've opened
          </h3>
          <div className="space-y-3">
            {opened.map((l) => (
              <article key={l.id} className="rounded-2xl border border-gold/20 bg-gold/5 p-4 animate-fade-in">
                <p className="mb-2 text-xs text-muted-foreground">
                  written {fmtDate(l.createdAt)} · arrived {fmtDate(l.deliverAt)}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">{l.text}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
