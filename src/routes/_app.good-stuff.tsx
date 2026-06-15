import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PartyPopper, Coffee, Sun, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { affirm } from "@/lib/affirm";

export const Route = createFileRoute("/_app/good-stuff")({
  head: () => ({ meta: [{ title: "The Good Stuff — For Once" }] }),
  component: GoodStuff,
});

interface GoodPost {
  id: string;
  text: string;
  createdAt: number;
}

const HAPPY_PROMPTS = [
  "Write this one down — future you will want to remember it.",
  "What made you smile today, even quietly?",
  "Who made you feel loved recently?",
  "What are you proud of yourself for this week?",
  "What's something good coming that you're looking forward to?",
  "Describe a perfect ordinary moment you had recently.",
];

const SEED_GRATITUDE = [
  "the coffee was perfect this morning",
  "someone held the door for me",
  "I laughed today, really laughed",
  "the sky was a ridiculous pink at 6pm",
  "my favorite song came on randomly",
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
  const all = [
    ...posts,
    ...SEED_GRATITUDE.map((t, i) => ({ id: `seed${i}`, text: t, createdAt: 0 })),
  ];

  const post = () => {
    if (!text.trim()) return;
    setPosts((prev) => [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...prev]);
    affirm("The small things count. Thank you for noticing one.");
    setText("");
  };

  return (
    <div className="space-y-6">
      <Whisper>Small things only. The cozy, ordinary, almost-missed moments.</Whisper>
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
      <div className="columns-1 gap-3 sm:columns-2">
        {all.map((p) => (
          <div
            key={p.id}
            className="mb-3 break-inside-avoid rounded-2xl border border-peach/20 bg-peach/5 p-4"
          >
            <Coffee className="mb-2 h-4 w-4 text-peach" />
            <p className="text-sm leading-relaxed text-cream/90">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoodDayJar() {
  const [text, setText] = useState("");
  const [moments, setMoments] = useLocalStorage<GoodPost[]>("foronce.jar", []);

  const add = () => {
    if (!text.trim()) return;
    setMoments((prev) => [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...prev]);
    setText("");
  };

  const thisWeek = moments.filter((m) => Date.now() - m.createdAt < 7 * 864e5);

  return (
    <div className="space-y-6">
      <Whisper>Your private jar of good moments. One line is enough.</Whisper>
      {thisWeek.length > 0 && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-cream">
          You had {thisWeek.length} good moment{thisWeek.length > 1 ? "s" : ""} this week. Want to
          look back? 🫶
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="a good moment from today..."
          className="border-border bg-card/40"
        />
        <Button variant="hero" size="icon" disabled={!text.trim()} onClick={add}>
          <Sun className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {moments.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            your jar is empty for now. drop a good moment in whenever one happens.
          </p>
        )}
        {moments.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3"
          >
            <Sun className="h-4 w-4 shrink-0 text-gold" />
            <p className="flex-1 text-sm text-cream/90">{m.text}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HappyPrompts() {
  return (
    <div className="space-y-3">
      <Whisper>Gentle nudges for the good days. Pick one, or none.</Whisper>
      {HAPPY_PROMPTS.map((p) => (
        <div
          key={p}
          className="rounded-2xl border border-border bg-card/40 p-5 text-lg text-cream/90"
        >
          {p}
        </div>
      ))}
    </div>
  );
}
