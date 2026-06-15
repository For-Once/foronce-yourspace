import { type ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <h1 className="font-hand text-5xl font-bold leading-tight text-cream lg:text-6xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-xl text-base text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </header>
  );
}

export function Whisper({ children }: { children: ReactNode }) {
  return (
    <p className="font-hand text-2xl leading-snug text-turquoise/90">{children}</p>
  );
}
