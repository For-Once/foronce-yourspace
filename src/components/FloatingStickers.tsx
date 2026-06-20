import { useMemo } from "react";
import { cn } from "@/lib/utils";

// A gentle, non-interactive layer of cute floating elements.
// Sits behind content (pointer-events-none) and drifts softly.

const DEFAULT_SET = ["🌙", "⭐", "🌸", "🦋", "☁️", "✨", "🩷", "🌿"];

interface Props {
  /** emojis to sprinkle; defaults to a soft cute set */
  set?: string[];
  /** how many to scatter */
  count?: number;
  className?: string;
}

interface Sprite {
  emoji: string;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function FloatingStickers({ set = DEFAULT_SET, count = 10, className }: Props) {
  const sprites = useMemo<Sprite[]>(() => {
    // deterministic-ish pseudo random so it's stable per mount
    return Array.from({ length: count }).map((_, i) => {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * 99.13 + n * 7.7) * 10000;
        return x - Math.floor(x);
      };
      return {
        emoji: set[i % set.length],
        left: r(1) * 96,
        top: r(2) * 92,
        size: 16 + r(3) * 26,
        delay: r(4) * 8,
        duration: 9 + r(5) * 9,
        opacity: 0.18 + r(6) * 0.22,
      };
    });
  }, [set, count]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-0 overflow-hidden",
        className,
      )}
    >
      {sprites.map((s, i) => (
        <span
          key={i}
          className="absolute animate-float-slow select-none"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}
