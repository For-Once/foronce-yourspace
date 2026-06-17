import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Music2, Filter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { MoodSelector } from "@/components/MoodSelector";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { useProfile } from "@/lib/profile";
import { MOODS, getMood, moodColorStyle } from "@/lib/moods";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/community")({
  head: () => ({
    meta: [
      { title: "Community — For Once" },
      {
        name: "description",
        content:
          "Share your thoughts and hold each other. A gentle, heart-only community where your chosen username is the only name shown.",
      },
    ],
  }),
  component: Community,
});

interface CommunityPost {
  id: string;
  text: string;
  mood?: string;
  hearts: number;
  feed: "support" | "good";
  author?: string;
  createdAt: number;
}

const SEED: CommunityPost[] = [
  { id: "s1", text: "some days surviving is the whole achievement. that counts.", mood: "tired", hearts: 42, feed: "support", author: "quietwave", createdAt: Date.now() - 6e6 },
  { id: "s2", text: "i told someone how i really felt today and the sky didn't fall.", mood: "relieved", hearts: 31, feed: "support", author: "softfern", createdAt: Date.now() - 2e7 },
  { id: "s3", text: "you're not behind in life. there's no schedule. breathe.", mood: "lonely", hearts: 58, feed: "support", author: "moonlitharbor", createdAt: Date.now() - 9e7 },
  { id: "g1", text: "i got the job. i'm crying happy tears in a parking lot.", mood: "excited", hearts: 67, feed: "good", author: "goldenfern", createdAt: Date.now() - 1e6 },
  { id: "g2", text: "my plant grew a new leaf and i feel weirdly proud.", mood: "content", hearts: 22, feed: "good", author: "mistyshore", createdAt: Date.now() - 3e7 },
  { id: "g3", text: "first full night of sleep in weeks. i feel human again.", mood: "peaceful", hearts: 19, feed: "good", author: "calmriver", createdAt: Date.now() - 5e7 },
];

const NOT_ALONE = [
  "you don't have to figure it all out tonight.",
  "feeling too much is still feeling. it's allowed.",
  "someone, somewhere, gets exactly this.",
  "the version of you that's tired right now is still worthy.",
  "good days are proof that they exist. more are coming.",
];

const PLAYLISTS = [
  { title: "songs that got me through", note: "shared by quietwave", url: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u" },
  { title: "made me dance in my kitchen", note: "shared by goldenfern", url: "https://www.youtube.com/results?search_query=feel+good+playlist" },
  { title: "for the 2am crying", note: "shared by mistyshore", url: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1" },
];

function Community() {
  return (
    <div>
      <PageHeader
        title="Community"
        subtitle="Share what you're feeling — only your chosen username shows, never your real name. Hold each other, and celebrate together."
      />

      <div className="mb-6 rounded-2xl border border-turquoise/20 bg-turquoise/5 p-4">
        <p className="mb-1 text-xs uppercase tracking-wide text-turquoise/70">you are not alone</p>
        <Rotating items={NOT_ALONE} />
      </div>

      <Tabs defaultValue="support">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/40 p-1">
          <TabsTrigger value="support">Holding Each Other</TabsTrigger>
          <TabsTrigger value="good">Good Things</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>
        <TabsContent value="support">
          <Feed feed="support" />
        </TabsContent>
        <TabsContent value="good">
          <Feed feed="good" />
        </TabsContent>
        <TabsContent value="playlists">
          <Playlists />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Rotating({ items }: { items: string[] }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * items.length));
  return (
    <button
      onClick={() => setI((p) => (p + 1) % items.length)}
      className="text-left font-hand text-2xl text-cream transition-opacity hover:opacity-80"
    >
      {items[i]}
    </button>
  );
}

function Composer({
  feed,
  setPosts,
}: {
  feed: "support" | "good";
  setPosts: (fn: (prev: CommunityPost[]) => CommunityPost[]) => void;
}) {
  const { profile } = useProfile();
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string>();
  const author = profile?.username ?? "anonymous";

  const post = () => {
    if (!text.trim()) return;
    setPosts((prev) => [
      {
        id: uid(),
        text: text.trim(),
        mood,
        hearts: 0,
        feed,
        author,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    affirm(
      feed === "good"
        ? "Shared. Someone needed to see something good today."
        : "Shared. You're not carrying it alone now.",
    );
    setText("");
    setMood(undefined);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <p className="mb-3 text-sm text-muted-foreground">
        posting as <span className="text-turquoise">{author}</span>
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          feed === "good"
            ? "share something good that happened..."
            : "share what's sitting with you..."
        }
        className="min-h-24 resize-none border-border bg-background/30"
      />
      <div className="mt-3">
        <p className="mb-2 text-xs text-muted-foreground">tag a mood (optional)</p>
        <MoodSelector value={mood} onChange={setMood} />
      </div>
      <Button variant="hero" size="lg" className="mt-3" disabled={!text.trim()} onClick={post}>
        <Send className="h-4 w-4" /> share with the community
      </Button>
    </div>
  );
}

function Feed({ feed }: { feed: "support" | "good" }) {
  const [posts, setPosts] = useLocalStorage<CommunityPost[]>("foronce.community", []);
  const [hearted, setHearted] = useLocalStorage<string[]>("foronce.hearted", []);
  const [moodFilter, setMoodFilter] = useState<string>();

  const all = useMemo(() => {
    const merged = [...posts.filter((p) => p.feed === feed), ...SEED.filter((p) => p.feed === feed)];
    return merged
      .filter((p) => (moodFilter ? p.mood === moodFilter : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, feed, moodFilter]);

  const usedMoods = useMemo(() => {
    const keys = new Set(
      [...posts.filter((p) => p.feed === feed), ...SEED.filter((p) => p.feed === feed)]
        .map((p) => p.mood)
        .filter(Boolean) as string[],
    );
    return MOODS.filter((m) => keys.has(m.key));
  }, [posts, feed]);

  const toggleHeart = (id: string) => {
    const has = hearted.includes(id);
    setHearted((prev) => (has ? prev.filter((x) => x !== id) : [...prev, id]));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hearts: p.hearts + (has ? -1 : 1) } : p)),
    );
  };

  return (
    <div className="space-y-4">
      {feed === "support" ? (
        <Whisper>Honest, not cleaned up. The hard and the surviving, side by side.</Whisper>
      ) : (
        <Whisper>Real wins, small and big. Cheer each other on.</Whisper>
      )}

      <Composer feed={feed} setPosts={setPosts} />

      {usedMoods.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={() => setMoodFilter(undefined)}
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              !moodFilter ? "bg-turquoise/15 text-turquoise" : "text-muted-foreground",
            )}
          >
            all
          </button>
          {usedMoods.map((m) => (
            <button
              key={m.key}
              onClick={() => setMoodFilter(m.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs capitalize",
                moodFilter === m.key
                  ? `${moodColorStyle[m.color].bg} ${moodColorStyle[m.color].text}`
                  : "text-muted-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {all.map((p) => {
        const m = p.mood ? getMood(p.mood) : undefined;
        const isHearted = hearted.includes(p.id);
        return (
          <article key={p.id} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-turquoise/15 text-xs font-medium text-turquoise">
                {(p.author ?? "a").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-cream/90">{p.author ?? "anonymous"}</span>
            </div>
            <p className="text-base leading-relaxed text-cream/90">{p.text}</p>
            <div className="mt-3 flex items-center justify-between">
              {m ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs capitalize ${moodColorStyle[m.color].bg} ${moodColorStyle[m.color].text}`}
                >
                  {m.label}
                </span>
              ) : (
                <span />
              )}
              <button
                onClick={() => toggleHeart(p.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
                  isHearted ? "text-rose" : "text-muted-foreground hover:text-rose",
                )}
              >
                <Heart className={cn("h-4 w-4", isHearted && "fill-current")} />
                {p.hearts}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Playlists() {
  return (
    <div className="space-y-3">
      <Whisper>Songs that helped people through — or made them happy.</Whisper>
      {PLAYLISTS.map((p) => (
        <a
          key={p.title}
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-turquoise/40"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-turquoise/15 text-turquoise">
            <Music2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-cream">{p.title}</span>
            <span className="block text-xs text-muted-foreground">{p.note}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
