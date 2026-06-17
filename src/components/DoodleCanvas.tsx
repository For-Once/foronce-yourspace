import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Eraser, RotateCcw } from "lucide-react";

const BG = "#13131c";
const COLORS = [
  "#f4ede4", // cream
  "#6fd6c8", // turquoise
  "#e8a0bf", // rose
  "#b9a7e6", // lavender
  "#f3c969", // gold
  "#f0a868", // peach
  "#7aa2f7", // soft blue
];

export interface DoodleCanvasHandle {
  toDataUrl: () => string | null;
  hasDrawing: () => boolean;
  clear: () => void;
}

export const DoodleCanvas = forwardRef<
  DoodleCanvasHandle,
  { onChange?: (hasDrawing: boolean) => void }
>(function DoodleCanvas({ onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(4);

  const fillBg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    fillBg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    toDataUrl: () => canvasRef.current?.toDataURL("image/png") ?? null,
    hasDrawing: () => dirty.current,
    clear: () => clearCanvas(),
  }));

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!dirty.current) {
      dirty.current = true;
      onChange?.(true);
    }
  };

  const end = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    fillBg();
    dirty.current = false;
    onChange?.(false);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`color ${c}`}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? "scale-110 border-cream" : "border-border"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">brush</span>
          <input
            type="range"
            min={2}
            max={24}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="accent-turquoise"
          />
        </div>
        <button
          type="button"
          onClick={() => setColor(BG)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-cream"
        >
          <Eraser className="h-3 w-3" /> eraser
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-rose"
        >
          <RotateCcw className="h-3 w-3" /> clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-72 w-full touch-none rounded-2xl border border-border"
        style={{ touchAction: "none", backgroundColor: BG }}
      />
    </div>
  );
});
