import { useCallback, useEffect, useRef, useState } from "react";

interface Bubble {
  id: number;
  left: number; // %
  size: number; // px
  duration: number; // s
  hue: number;
}

const COLORS = [
  "200 80% 80%",
  "320 70% 82%",
  "270 60% 84%",
  "170 60% 78%",
  "40 90% 82%",
];

export function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const id = idRef.current++;
      setBubbles((b) => [
        ...b,
        {
          id,
          left: 4 + Math.random() * 88,
          size: 34 + Math.random() * 52,
          duration: 6 + Math.random() * 6,
          hue: Math.floor(Math.random() * COLORS.length),
        },
      ]);
      // auto-remove when it floats off the top
      setTimeout(() => {
        setBubbles((b) => b.filter((x) => x.id !== id));
      }, 12500);
    };
    const t = setInterval(spawn, 900);
    spawn();
    return () => clearInterval(t);
  }, []);

  const pop = useCallback((id: number) => {
    setBubbles((b) => b.filter((x) => x.id !== id));
    setPopped((p) => p + 1);
  }, []);

  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-turquoise/20 bg-gradient-to-b from-turquoise/5 to-lavender/10">
      <p className="absolute left-4 top-3 z-10 text-sm text-muted-foreground">
        tap the bubbles 🫧 · popped {popped}
      </p>
      {bubbles.map((b) => (
        <button
          key={b.id}
          onClick={() => pop(b.id)}
          className="absolute bottom-[-80px] rounded-full transition-transform active:scale-50"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.6), hsl(${COLORS[b.hue]} / 0.45))`,
            boxShadow: `inset 0 0 12px hsl(0 0% 100% / 0.4), 0 0 16px hsl(${COLORS[b.hue]} / 0.3)`,
            animation: `bubble-rise ${b.duration}s linear forwards`,
          }}
          aria-label="pop bubble"
        />
      ))}
    </div>
  );
}
