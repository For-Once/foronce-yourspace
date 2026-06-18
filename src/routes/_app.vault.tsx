import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, KeyRound, Trash2, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { PlusLock } from "@/components/UpgradePrompt";
import { useLocalStorage, uid } from "@/lib/use-local-storage";
import { usePlus } from "@/lib/plus";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/vault")({
  head: () => ({
    meta: [
      { title: "The Vault — For Once" },
      {
        name: "description",
        content:
          "Some things need an extra layer. The Vault is a PIN-locked space inside your private journal, just for the heaviest entries.",
      },
    ],
  }),
  component: VaultPage,
});

interface VaultEntry {
  id: string;
  text: string;
  createdAt: number;
}

function VaultPage() {
  const { isPlus } = usePlus();

  return (
    <div>
      <PageHeader
        title="The Vault"
        subtitle="Some things need an extra layer. The Vault is just for you."
      />
      {isPlus ? (
        <VaultInner />
      ) : (
        <PlusLock label="The Vault is a Plus space">
          <div className="grid h-80 place-items-center rounded-2xl bg-card/40">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
        </PlusLock>
      )}
    </div>
  );
}

function VaultInner() {
  const [pin, setPin] = useLocalStorage<string>("foronce.vaultpin", "");
  const [unlocked, setUnlocked] = useState(false);

  if (!pin) return <SetPin onSet={setPin} />;
  if (!unlocked) return <Unlock pin={pin} onUnlock={() => setUnlocked(true)} />;
  return <VaultEntries />;
}

function SetPin({ onSet }: { onSet: (pin: string) => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const valid = a.length >= 4 && a === b;
  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card/40 p-6 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold/10">
        <KeyRound className="h-6 w-6 text-gold" />
      </span>
      <h2 className="font-hand text-3xl text-cream">Create your Vault PIN</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A separate 4+ digit code, just for this space. Keep it somewhere safe — it can't be
        recovered.
      </p>
      <Input
        type="password"
        inputMode="numeric"
        value={a}
        onChange={(e) => setA(e.target.value.replace(/\D/g, ""))}
        placeholder="choose a PIN"
        className="mt-4 border-border bg-background/30 text-center tracking-[0.4em]"
      />
      <Input
        type="password"
        inputMode="numeric"
        value={b}
        onChange={(e) => setB(e.target.value.replace(/\D/g, ""))}
        placeholder="confirm PIN"
        className="mt-2 border-border bg-background/30 text-center tracking-[0.4em]"
      />
      <Button variant="hero" size="lg" className="mt-4 w-full" disabled={!valid} onClick={() => onSet(a)}>
        <ShieldCheck className="h-4 w-4" /> Lock the Vault
      </Button>
    </div>
  );
}

function Unlock({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);
  const [opening, setOpening] = useState(false);

  const tryOpen = () => {
    if (entry === pin) {
      setOpening(true);
      setTimeout(onUnlock, 1100);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card/40 p-8 text-center">
      <span
        className={cn(
          "mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full transition-all duration-700",
          opening
            ? "scale-110 bg-gold/20 text-gold ring-4 ring-gold/40"
            : "bg-background/40 text-lavender",
          error && "animate-[scale-out_0.3s_ease-in-out]",
        )}
      >
        {opening ? <KeyRound className="h-9 w-9 animate-pulse" /> : <Lock className="h-9 w-9" />}
      </span>
      <h2 className="font-hand text-3xl text-cream">
        {opening ? "Unlocking…" : "Enter your Vault PIN"}
      </h2>
      {!opening && (
        <>
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            value={entry}
            onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && tryOpen()}
            placeholder="• • • •"
            className={cn(
              "mt-4 border-border bg-background/30 text-center text-xl tracking-[0.5em]",
              error && "border-rose text-rose",
            )}
          />
          {error && <p className="mt-2 text-xs text-rose">That PIN didn't match. Try again.</p>}
          <Button variant="hero" size="lg" className="mt-4 w-full" onClick={tryOpen}>
            Open the Vault
          </Button>
        </>
      )}
    </div>
  );
}

function VaultEntries() {
  const [entries, setEntries] = useLocalStorage<VaultEntry[]>("foronce.vault", []);
  const [text, setText] = useState("");

  const save = () => {
    if (!text.trim()) return;
    setEntries((prev) => [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...prev]);
    affirm("Held safely. Only you can open this.");
    setText("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Whisper>The Vault is open. These entries live nowhere else.</Whisper>
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="the thing you've been carrying..."
          className="min-h-40 resize-none border-border bg-background/30 leading-relaxed"
        />
        <Button variant="hero" size="lg" className="mt-3" disabled={!text.trim()} onClick={save}>
          <Save className="h-4 w-4" /> keep it here
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          The Vault is empty. Whatever you put here stays here.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <article key={e.id} className="group rounded-2xl border border-border bg-card/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">{e.text}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
