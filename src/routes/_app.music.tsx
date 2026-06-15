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
          "Playlists sorted by feelings, not genres. Find music for whatever mood you're in right now.",
      },
    ],
  }),
  component: MusicPage,
});

interface Category {
  title: string;
  tone: "hard" | "good";
  url: string;
}

const CATEGORIES: Category[] = [
  { title: "I want to cry but can't", tone: "hard", url: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1" },
  { title: "I feel numb and empty", tone: "hard", url: "https://open.spotify.com/playlist/37i9dQZF1DWVrtsSlLKzro" },
  { title: "I'm angry and I don't know why", tone: "hard", url: "https://open.spotify.com/playlist/37i9dQZF1DX1tyCD9QhIWF" },
  { title: "I just need something calm", tone: "hard", url: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u" },
  { title: "I want to feel everything", tone: "good", url: "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634" },
  { title: "I want to dance alone in my room", tone: "good", url: "https://open.spotify.com/playlist/37i9dQZF1DX0BcQWzuB7ZO" },
  { title: "I feel okay and I want to stay here", tone: "good", url: "https://open.spotify.com/playlist/37i9dQZF1DWTwnEm1IYyoj" },
  { title: "I want to feel hopeful", tone: "good", url: "https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4" },
  { title: "I'm happy and I want to celebrate quietly", tone: "good", url: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC" },
];

function MusicPage() {
  return (
    <div>
      <PageHeader
        title="Music"
        subtitle="Sorted by feelings, not genres. Find what fits, or just let it play."
      />
      <Tabs defaultValue="hard">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/40 p-1">
          <TabsTrigger value="hard">Hard feelings</TabsTrigger>
          <TabsTrigger value="good">Good feelings</TabsTrigger>
          <TabsTrigger value="suggest">Suggest a song</TabsTrigger>
        </TabsList>
        <TabsContent value="hard">
          <Grid tone="hard" />
        </TabsContent>
        <TabsContent value="good">
          <Grid tone="good" />
        </TabsContent>
        <TabsContent value="suggest">
          <Suggest />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Grid({ tone }: { tone: "hard" | "good" }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CATEGORIES.filter((c) => c.tone === tone).map((c) => (
        <a
          key={c.title}
          href={c.url}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-5 transition-all hover:-translate-y-0.5 hover:border-turquoise/40"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-turquoise/15 text-turquoise transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="font-medium text-cream">{c.title}</span>
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
