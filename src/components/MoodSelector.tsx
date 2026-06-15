import { MOODS, moodColorStyle, type MoodTone } from "@/lib/moods";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  value?: string;
  onChange: (key: string) => void;
  filter?: MoodTone[];
  className?: string;
}

export function MoodSelector({ value, onChange, filter, className }: MoodSelectorProps) {
  const moods = filter ? MOODS.filter((m) => filter.includes(m.tone)) : MOODS;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {moods.map((m) => {
        const c = moodColorStyle[m.color];
        const active = value === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium capitalize transition-all duration-200",
              c.bg,
              c.text,
              "ring-1 ring-inset",
              active ? cn(c.ring, "scale-105") : "ring-transparent hover:ring-current/30",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
