import { createFileRoute } from "@tanstack/react-router";
import { BookHeart, Flower2, Leaf, Sparkles } from "lucide-react";
import { PageHeader, Whisper } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/store")({
  head: () => ({
    meta: [
      { title: "Store — Coming Soon — For Once" },
      {
        name: "description",
        content:
          "Something gentle is on the way. The For Once store will offer journal books, mandala art, and calming supplements — soft things to hold while you feel.",
      },
    ],
  }),
  component: StorePage,
});

const PREVIEW = [
  {
    icon: BookHeart,
    name: "Journal Books",
    desc: "Soft-cover journals made for 2am thoughts and quiet mornings alike.",
    color: "text-lavender",
  },
  {
    icon: Flower2,
    name: "Mandala Art",
    desc: "Prints and colour-in pieces to slow your hands and your mind.",
    color: "text-turquoise",
  },
  {
    icon: Leaf,
    name: "Gentle Supplements",
    desc: "Calming, considered supplements to support how you feel.",
    color: "text-gold",
  },
];

function StorePage() {
  return (
    <div>
      <PageHeader
        title="The Store"
        subtitle="Soft things to hold while you feel — launching soon."
      />

      <div className="mb-8 flex flex-col items-center rounded-3xl border border-turquoise/20 bg-turquoise/5 p-10 text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-background/40">
          <Sparkles className="h-7 w-7 text-gold" />
        </span>
        <h2 className="font-hand text-4xl font-bold text-cream lg:text-5xl">
          Coming soon
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          We're carefully making journals, mandala art, and gentle supplements —
          things to keep close on the hard days and the beautiful ones.
        </p>
        <Whisper>
          <span className="mt-6 block">Good things are worth the wait.</span>
        </Whisper>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {PREVIEW.map((p) => {
          const Icon = p.icon;
          return (
            <article
              key={p.name}
              className="relative overflow-hidden rounded-2xl border border-border bg-card/40 p-5"
            >
              <span className="absolute right-3 top-3 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                soon
              </span>
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-background/40">
                <Icon className={`h-5 w-5 ${p.color}`} />
              </span>
              <h3 className="font-semibold text-cream">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
