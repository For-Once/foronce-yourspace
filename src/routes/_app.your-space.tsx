import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Send, HelpCircle, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { MoodSelector } from "@/components/MoodSelector";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { getMood } from "@/lib/moods";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/your-space")({
  head: () => ({ meta: [{ title: "Your Space — For Once" }] }),
  component: YourSpace,
});

const PLACEHOLDERS = [
  "say whatever you need to say. no rules here.",
  "something amazing happened and you need to say it out loud? this is for that too.",
  "what's on your mind tonight?",
];

interface CommunityPost {
  id: string;
  text: string;
  mood?: string;
  hearts: number;
  feed: "support" | "good";
  createdAt: number;
}

function YourSpace() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string>();
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [visibility, setVisibility] = useState<"private" | "community">("private");
  const [mode, setMode] = useState<"type" | "voice">("type");

  const [, setPrivateEntries] = useLocalStorage<any[]>("foronce.journal", []);
  const [, setCommunity] = useLocalStorage<CommunityPost[]>("foronce.community", []);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[i]);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const tone = mood ? getMood(mood)?.tone : undefined;

  const submit = () => {
    if (!text.trim()) return;
    const entry = {
      id: uid(),
      text: text.trim(),
      mood,
      createdAt: Date.now(),
      kind: "your-space",
    };
    setPrivateEntries((prev) => [entry, ...prev]);
    if (visibility === "community") {
      setCommunity((prev) => [
        {
          id: uid(),
          text: text.trim(),
          mood,
          hearts: 0,
          feed: tone === "good" ? "good" : "support",
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    }
    if (tone === "good") {
      affirm("Hold onto this one. You deserve to feel this.");
    } else {
      affirm("You said it. That took courage.");
    }
    setText("");
    setMood(undefined);
  };

  return (
    <div>
      <PageHeader
        title="Your Space"
        subtitle="For all of it — the hard stuff and the good stuff. No rules, no names, no judgment."
      />

      <div className="mb-4 flex gap-2">
        <Button
          variant={mode === "type" ? "default" : "soft"}
          size="sm"
          onClick={() => setMode("type")}
        >
          type it
        </Button>
        <Button
          variant={mode === "voice" ? "default" : "soft"}
          size="sm"
          onClick={() => setMode("voice")}
        >
          <Mic className="h-4 w-4" /> voice note
        </Button>
      </div>

      {mode === "type" ? (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-h-56 resize-none border-border bg-card/50 text-lg leading-relaxed transition-all placeholder:text-muted-foreground/70"
        />
      ) : (
        <VoiceRecorder onSave={(label) => setText((t) => (t ? t : label))} />
      )}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">how are you feeling?</p>
          <button
            onClick={() => affirm("That's okay. You don't have to.")}
            className="flex items-center gap-1.5 text-xs text-lavender transition-colors hover:text-cream"
          >
            <HelpCircle className="h-3.5 w-3.5" /> I don't know how I feel
          </button>
        </div>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/40 p-4">
        <p className="mb-3 text-sm text-muted-foreground">when you're ready</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <VisChoice
            active={visibility === "private"}
            onClick={() => setVisibility("private")}
            icon={Lock}
            title="Keep it private"
            desc="Only you will ever see this."
          />
          <VisChoice
            active={visibility === "community"}
            onClick={() => setVisibility("community")}
            icon={Globe}
            title="Post to community"
            desc="Anonymously, no name attached."
          />
        </div>
        <Button
          variant="hero"
          size="xl"
          className="mt-4 w-full"
          disabled={!text.trim()}
          onClick={submit}
        >
          <Send className="h-4 w-4" /> let it out
        </Button>
      </div>
    </div>
  );
}

function VisChoice({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Lock;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-turquoise/60 bg-turquoise/10"
          : "border-border bg-background/30 hover:border-turquoise/30",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4", active ? "text-turquoise" : "text-muted-foreground")} />
      <span>
        <span className="block text-sm font-medium text-cream">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

export function VoiceRecorder({ onSave }: { onSave?: (label: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-card/50 p-8 text-center">
      <button
        onClick={() => {
          if (recording) {
            setRecording(false);
            setSaved(true);
            onSave?.(`voice note · ${mm}:${ss}`);
          } else {
            setSeconds(0);
            setSaved(false);
            setRecording(true);
          }
        }}
        className={cn(
          "grid h-20 w-20 place-items-center rounded-full transition-all",
          recording
            ? "bg-rose/20 text-rose ring-4 ring-rose/30 animate-breathe"
            : "bg-turquoise/15 text-turquoise hover:scale-105",
        )}
      >
        <Mic className="h-8 w-8" />
      </button>
      <p className="font-hand text-3xl text-cream">{recording ? `${mm}:${ss}` : saved ? "saved" : "tap to record"}</p>
      <p className="text-sm text-muted-foreground">
        {recording
          ? "speak freely. tap again to finish."
          : saved
            ? "your voice was heard."
            : "just to let it out, or to remember a moment."}
      </p>
    </div>
  );
}
