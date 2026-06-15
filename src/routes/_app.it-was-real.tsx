import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { affirm } from "@/lib/affirm";

export const Route = createFileRoute("/_app/it-was-real")({
  head: () => ({ meta: [{ title: "It Was Real — For Once" }] }),
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
          <TabsTrigger value="stories">Stories</TabsTrigger>
        </TabsList>
        <TabsContent value="unreturned">
          <LetterWriter prompts={UNRETURNED_PROMPTS} storageKey="foronce.itwasreal" />
        </TabsContent>
        <TabsContent value="returned">
          <LetterWriter prompts={RETURNED_PROMPTS} storageKey="foronce.itwasreturned" warm />
        </TabsContent>
        <TabsContent value="stories">
          <div className="space-y-3">
            {STORIES.map((s, i) => (
              <article key={i} className="rounded-2xl border border-border bg-card/40 p-5 text-base leading-relaxed text-cream/90">
                {s}
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LetterWriter({
  prompts,
  storageKey,
  warm,
}: {
  prompts: string[];
  storageKey: string;
  warm?: boolean;
}) {
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [letters, setLetters] = useLocalStorage<Letter[]>(storageKey, []);

  const save = () => {
    if (!text.trim()) return;
    setLetters((p) => [{ id: uid(), to: to.trim(), text: text.trim(), createdAt: Date.now() }, ...p]);
    affirm(warm ? "Hold onto this one. You deserve to feel this." : "This was written. It was felt. It is released.");
    setTo("");
    setText("");
  };

  return (
    <div className="space-y-6">
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
        <Button variant="hero" size="lg" className="mt-4" disabled={!text.trim()} onClick={save}>
          <Send className="h-4 w-4" /> release it
        </Button>
      </div>
      <div className="space-y-3">
        {letters.map((l) => (
          <article key={l.id} className="rounded-2xl border border-border bg-card/40 p-4">
            {l.to && <p className="mb-1 text-xs text-muted-foreground">to {l.to}</p>}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">{l.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
