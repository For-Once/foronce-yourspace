import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLUS_NOTE } from "@/lib/plus";
import { cn } from "@/lib/utils";

export function PlusBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" /> Plus
    </span>
  );
}

/**
 * A gentle, dismissible upgrade nudge. Never pushy, always closeable.
 */
export function UpgradePrompt({
  title = "A little more, when you're ready",
  message = "Plus gives you a letter from your future self, your own mood universe, and a private vault just for the heavy stuff. ₹100 for 3 months — less than a coffee.",
  storageKey,
}: {
  title?: string;
  message?: string;
  /** if set, dismissal is remembered for the session */
  storageKey?: string;
}) {
  const [dismissed, setDismissed] = useState(
    storageKey ? sessionStorage.getItem(storageKey) === "1" : false,
  );
  if (dismissed) return null;

  const dismiss = () => {
    if (storageKey) sessionStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gold/5 p-5">
      <button
        onClick={dismiss}
        aria-label="dismiss"
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-cream"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/40">
          <Sparkles className="h-5 w-5 text-gold" />
        </span>
        <div>
          <h3 className="font-hand text-2xl text-cream">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <p className="mt-2 text-xs italic text-muted-foreground/80">{PLUS_NOTE}</p>
          <Button asChild variant="warm" size="sm" className="mt-3">
            <Link to="/plus">See For Once Plus</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Locked preview overlay — shows a blurred child with an unlock CTA on top.
 */
export function PlusLock({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/60 p-6 text-center backdrop-blur-sm">
        <div>
          <Sparkles className="mx-auto mb-3 h-7 w-7 text-gold" />
          <p className="font-hand text-2xl text-cream">{label}</p>
          <Button asChild variant="warm" size="sm" className="mt-4">
            <Link to="/plus">Unlock with Plus</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
