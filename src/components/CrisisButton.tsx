import { useState } from "react";
import { Heart, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CRISIS_RESOURCES } from "@/lib/crisis";
import { cn } from "@/lib/utils";

export function CrisisButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-rose/40 bg-rose/10 px-4 py-2 text-sm font-medium text-rose backdrop-blur-md transition-colors hover:bg-rose/20",
            className,
          )}
        >
          <Heart className="h-4 w-4" />
          need immediate help?
        </button>
      </DialogTrigger>
      <DialogContent className="border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="font-hand text-3xl font-semibold text-cream">
            You don't have to hold this alone
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sometimes what we're feeling is bigger than a journal can hold. That's okay too.
            Here are some people who can help, any time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {CRISIS_RESOURCES.map((r) => (
            <a
              key={r.name}
              href={`tel:${r.number.replace(/[^0-9]/g, "")}`}
              className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-turquoise/40 hover:bg-card"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-turquoise/15 text-turquoise">
                <Phone className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-cream">{r.name}</span>
                <span className="block text-lg text-turquoise">{r.number}</span>
                <span className="block text-sm text-muted-foreground">{r.detail}</span>
              </span>
            </a>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          You are not alone in this.
        </p>
      </DialogContent>
    </Dialog>
  );
}
