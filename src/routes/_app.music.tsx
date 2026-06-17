import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { affirm } from "@/lib/affirm";

export const Route = createFileRoute("/_app/music")({
  head: () => ({
    meta: [
      { title: "Music — For Once" },
      {
        name: "description",
        content:
          "Playlists sorted by feelings, not genres — in English, Hindi and Spanish. Find music for whatever mood you're in right now.",
      },
    ],
  }),
  component: MusicPage,
});

interface Feeling {
  title: string;
  tone: "hard" | "good";
  query: string;
}

const FEELINGS: Feeling[] = [
  { title: "I want to cry but can't", tone: "hard", query: "emotional sad cry" },
  { title: "I feel numb and empty", tone: "hard", query: "numb melancholy quiet" },
  { title: "I'm angry and I don't know why", tone: "hard", query: "angry intense release" },
  { title: "I just need something calm", tone: "hard", query: "calm soft soothing" },
  { title: "I want to feel everything", tone: "good", query: "emotional uplifting" },
  { title: "I want to dance alone in my room", tone: "good", query: "dance feel good" },
  { title: "I feel okay and I want to stay here", tone: "good", query: "chill cozy mellow" },
  { title: "I want to feel hopeful", tone: "good", query: "hopeful uplifting" },
  { title: "I'm happy and I want to celebrate quietly", tone: "good", query: "happy celebrate" },
];

type Language = { key: string; label: string; term: string };

const LANGUAGES: Language[] = [
  { key: "english", label: "English", term: "english" },
  { key: "hindi", label: "Hindi", term: "hindi bollywood" },
  { key: "spanish", label: "Spanish", term: "spanish latino" },
];

function playlistUrl(lang: Language, feeling: Feeling) {
  const q = `${lang.term} ${feeling.query} playlist`;
  return `https://open.spotify.com/search/${encodeURIComponent(q)}/playlists`;
}

function MusicPage() {
  return (
    <div>
      <PageHeader
        title="Music"
        subtitle="Sorted by feelings, not genres — and now in three languages. Pick your language, then your mood."
      />
      <Tabs defaultValue="english">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/40 p-1">
          {LANGUAGES.map((l) => (
            <TabsTrigger key={l.key} value={l.key}>
              {l.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="suggest">Suggest a song</TabsTrigger>
        </TabsList>

        {LANGUAGES.map((l) => (
          <TabsContent key={l.key} value={l.key}>
            <LanguageSection lang={l} />
          </TabsContent>
        ))}

        <TabsContent value="suggest">
          <Suggest />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LanguageSection({ lang }: { lang: Language }) {
  return (
    <div className="space-y-8">
      <Whisper>{lang.label} songs for every feeling. Tap one and let it play.</Whisper>
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-lavender/80">
          Hard feelings
        </h2>
        <Grid lang={lang} tone="hard" />
      </section>
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gold/80">
          Good feelings
        </h2>
        <Grid lang={lang} tone="good" />
      </section>
    </div>
  );
}

function Grid({ lang, tone }: { lang: Language; tone: "hard" | "good" }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FEELINGS.filter((f) => f.tone === tone).map((f) => (
        <a
          key={f.title}
          href={playlistUrl(lang, f)}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-5 transition-all hover:-translate-y-0.5 hover:border-turquoise/40"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-turquoise/15 text-turquoise transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="font-medium text-cream">{f.title}</span>
        </a>
      ))}
    </div>
  );
}

function Suggest() {
  const [text, setText] = useState("");
  const [songs, setSongs] = useLocalStorage<{ id: string; text: string }[]>("foronce.songs", []);
  const add = () => {
    if (!text.trim()) return;
    setSongs((p) => [{ id: uid(), text: text.trim() }, ...p]);
    affirm("Thank you — your song might be exactly what someone needs.");
    setText("");
  };
  return (
    <div className="space-y-5">
      <Whisper>Add a song that helped you, or one that made you happy. Anonymously.</Whisper>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="song name + artist, or a link..."
          className="border-border bg-card/40"
        />
        <Button variant="hero" size="icon" disabled={!text.trim()} onClick={add}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {songs.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-cream/90">
            {s.text}
          </div>
        ))}
      </div>
    </div>
  );
}
