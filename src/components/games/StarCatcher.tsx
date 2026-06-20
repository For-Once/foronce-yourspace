import { useCallback, useEffect, useRef, useState } from "react";

interface Star {
  id: number;
  left: number; // %
  size: number;
  duration: number;
}

export function StarCatcher() {
  const [stars, setStars] = useState<Star[]>([]);
  const [caught, setCaught] = useState(0);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const id = idRef.current++;
      setStars((s) => [
        ...s,
        {
          id,
          left: 4 + Math.random() * 90,
          size: 18 + Math.random() * 22,
          duration: 7 + Math.random() * 6,
        },
      ]);
      setTimeout(() => setStars((s) => s.filter((x) => x.id !== id)), 13500);
    };
    const t = setInterval(spawn, 1100);
    spawn();
    return () => clearInterval(t);
  }, []);

  const grab = useCallback((id: number) => {
    setStars((s) => s.filter((x) => x.id !== id));
    setCaught((c) => c + 1);
  }, []);

  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-lavender/25 bg-gradient-to-b from-[#0e1230]/60 to-[#161b3f]/40">
      <p className="absolute left-4 top-3 z-10 text-sm text-lavender/80">
        gather the drifting stars ✨
      </p>
      {stars.map((s) => (
        <button
          key={s.id}
          onClick={() => grab(s.id)}
          className="absolute top-[-40px] select-none transition-transform active:scale-150"
          style={{
            left: `${s.left}%`,
            fontSize: s.size,
            filter: "drop-shadow(0 0 6px rgba(143,162,255,0.7))",
            animation: `star-fall ${s.duration}s linear forwards`,
          }}
          aria-label="catch star"
        >
          ⭐
        </button>
      ))}
      {/* jar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border border-lavender/30 bg-card/60 px-5 py-2 text-center backdrop-blur">
        <span className="text-2xl">🫙</span>
        <p className="text-sm font-medium text-cream tabular-nums">{caught} in your jar</p>
      </div>
    </div>
  );
}
