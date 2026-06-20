import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// A simple sand-raking canvas. Drag to comb soft lines into the sand.
export function ZenGarden() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  const paintSand = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = "#e9dcc3";
    ctx.fillRect(0, 0, w, h);
    // subtle grain
    for (let i = 0; i < w * h * 0.03; i++) {
      ctx.fillStyle = `rgba(120,100,70,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d");
      if (ctx) paintSand(ctx, canvas.width, canvas.height);
      setReady(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    // rake: several parallel grooves
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.strokeStyle = i === 0 ? "rgba(150,128,92,0.5)" : "rgba(168,146,108,0.4)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.moveTo(last.current.x, last.current.y + i * 6);
      ctx.lineTo(p.x, p.y + i * 6);
      ctx.stroke();
      // highlight groove
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,250,235,0.35)";
      ctx.lineWidth = 1;
      ctx.moveTo(last.current.x, last.current.y + i * 6 - 2);
      ctx.lineTo(p.x, p.y + i * 6 - 2);
      ctx.stroke();
    }
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) paintSand(ctx, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-gold/30 shadow-soft">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-[440px] w-full touch-none cursor-crosshair"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          drag slowly to rake the sand 🪨 {ready ? "" : ""}
        </p>
        <Button variant="soft" size="sm" onClick={clear}>
          <RotateCcw className="h-4 w-4" /> smooth it over
        </Button>
      </div>
    </div>
  );
}
