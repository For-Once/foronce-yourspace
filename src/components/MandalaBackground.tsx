import { cn } from "@/lib/utils";

function Mandala({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      aria-hidden="true"
    >
      <g>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30} 100 100)`}>
            <circle cx="100" cy="42" r="9" />
            <path d="M100 50 C 88 70, 88 90, 100 100 C 112 90, 112 70, 100 50 Z" />
            <line x1="100" y1="100" x2="100" y2="20" />
            <circle cx="100" cy="24" r="3" />
          </g>
        ))}
      </g>
      <circle cx="100" cy="100" r="22" />
      <circle cx="100" cy="100" r="34" />
      <circle cx="100" cy="100" r="58" />
      <circle cx="100" cy="100" r="80" />
    </svg>
  );
}

/**
 * Subtle floating mandala watermarks for the calm 2am backdrop.
 */
export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {/* deep radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.4_0.04_185_/_0.6),_transparent_60%)]" />
      <div className="absolute bottom-[-10%] left-[-5%] h-[40rem] w-[40rem] rounded-full bg-turquoise/5 blur-3xl" />
      <div className="absolute right-[-10%] top-[10%] h-[32rem] w-[32rem] rounded-full bg-lavender/5 blur-3xl" />

      <Mandala className="absolute -left-24 -top-24 h-[28rem] w-[28rem] text-turquoise/10 animate-spin-slow" />
      <Mandala className="absolute -right-32 top-1/3 h-[34rem] w-[34rem] text-lavender/[0.07] animate-spin-slow [animation-direction:reverse]" />
      <Mandala className="absolute bottom-[-12rem] left-1/4 h-[26rem] w-[26rem] text-gold/[0.06] animate-spin-slow" />
    </div>
  );
}
