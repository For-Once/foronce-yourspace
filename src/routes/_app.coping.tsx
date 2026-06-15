import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { CRISIS_RESOURCES } from "@/lib/crisis";

export const Route = createFileRoute("/_app/coping")({
  head: () => ({ meta: [{ title: "When It's Hard — For Once" }] }),
  component: Coping,
});

const GENTLE_PROMPTS = [
  "what does the heaviest part of today feel like in your body?",
  "if this feeling could speak, what would it be trying to tell you?",
  "what's one small thing that would make the next hour a little softer?",
  "what do you need right now that you haven't let yourself ask for?",
];

function Coping() {
  return (
    <div>
      <PageHeader title="When Coping Gets Hard" />

      <div className="mb-8 rounded-3xl border border-lavender/20 bg-lavender/5 p-6">
        <Whisper>
          You're not broken. You're just feeling something too big for right now.
        </Whisper>
      </div>

      <section className="mb-8 space-y-3">
        {GENTLE_PROMPTS.map((p) => (
          <div
            key={p}
            className="rounded-2xl border border-border bg-card/40 p-5 text-base leading-relaxed text-cream/90"
          >
            {p}
          </div>
        ))}
      </section>

      <p className="mb-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Sometimes what we're feeling is bigger than a journal can hold. That's okay too. Here are
        some people who can help — kind, real, and ready whenever you are.
      </p>

      <div className="space-y-3">
        {CRISIS_RESOURCES.map((r) => (
          <a
            key={r.name}
            href={`tel:${r.number.replace(/[^0-9]/g, "")}`}
            className="flex items-start gap-3 rounded-2xl border border-turquoise/30 bg-turquoise/5 p-5 transition-colors hover:bg-turquoise/10"
          >
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-turquoise/15 text-turquoise">
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

      <p className="mt-8 text-center font-hand text-2xl text-turquoise/90">
        You are not alone in this.
      </p>
    </div>
  );
}
