import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStickers } from "@/lib/stickers";

export function StickerTray({
  onPick,
  selected,
  label = "press on a sticker (optional)",
}: {
  onPick: (emoji: string) => void;
  selected?: string[];
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const results = searchStickers(query);

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-gold" /> {label}
      </p>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search stickers... (e.g. moon, heart, rain)"
          className="border-border bg-background/30 pl-9 text-sm"
        />
      </div>
      <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
        {results.length === 0 && (
          <p className="py-3 text-xs text-muted-foreground">
            no stickers match that — try another word.
          </p>
        )}
        {results.map((s) => {
          const active = selected?.includes(s.emoji);
          return (
            <button
              key={s.emoji}
              type="button"
              onClick={() => onPick(s.emoji)}
              aria-pressed={active}
              title={s.keywords}
              className={`grid h-9 w-9 place-items-center rounded-xl border text-lg transition-all hover:scale-110 ${
                active
                  ? "scale-110 border-gold/60 bg-gold/15 shadow-sm"
                  : "border-border bg-background/30"
              }`}
            >
              {s.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
