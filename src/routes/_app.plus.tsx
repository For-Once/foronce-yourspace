import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Check,
  Heart,
  Lock,
  Stars,
  Mailbox,
  Palette,
  Infinity as InfinityIcon,
  Smartphone,
  CreditCard,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Whisper } from "@/components/PageHeader";
import { PlusBadge } from "@/components/UpgradePrompt";
import { PLANS, PLUS_NOTE, planFor, usePlus, type Tier } from "@/lib/plus";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/plus")({
  head: () => ({
    meta: [
      { title: "For Once Plus — A Little More, When You're Ready" },
      {
        name: "description",
        content:
          "For Once is free, always. Plus adds a letter to your future self, your own mood constellation, custom themes, a private vault, and unlimited journaling — from ₹100 for 3 months.",
      },
    ],
  }),
  component: PlusPage,
});

const FEATURES = [
  {
    icon: Mailbox,
    title: "Letter to Future You",
    desc: "Lock a journal entry and have it find you again in 1, 3, or 6 months.",
  },
  {
    icon: Stars,
    title: "Mood Constellation",
    desc: "Every feeling becomes a glowing star in your own little universe.",
  },
  {
    icon: InfinityIcon,
    title: "Unlimited everything",
    desc: "No caps on journal entries or voice notes — ever.",
  },
  {
    icon: Palette,
    title: "Your own aesthetic",
    desc: "Dress your private space in themes made just for you.",
  },
  {
    icon: Lock,
    title: "The Vault",
    desc: "An extra-protected, PIN-locked space for the heaviest entries.",
  },
];

const FREE_FOREVER = [
  "Vent Space & Your Space",
  "Mood check-ins",
  "Community wall & feed",
  "Crisis resources — always visible",
  "“I don't know how I feel”",
  "Music in every language",
  "Unsent letters",
  "Your first 20 journal entries",
];

function PlusPage() {
  const { plus, isPlus } = usePlus();

  return (
    <div>
      <PageHeader
        title="For Once Plus"
        subtitle="A little more, when you're ready — never required, never pushy."
      >
        <p className="mt-4 max-w-xl rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm italic text-muted-foreground">
          {PLUS_NOTE}
        </p>
      </PageHeader>

      {isPlus && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-turquoise/30 bg-turquoise/10 p-5">
          <Heart className="h-6 w-6 text-turquoise" />
          <div>
            <p className="font-medium text-cream">
              You're on Plus <PlusBadge className="ml-1 align-middle" />
            </p>
            <p className="text-sm text-muted-foreground">
              {planFor(plus.tier)?.label} plan
              {plus.renewAt
                ? ` · renews ${new Date(plus.renewAt).toLocaleDateString()}`
                : ""}
              . Thank you for holding on with us.
            </p>
          </div>
          <Button asChild variant="soft" size="sm" className="ml-auto">
            <Link to="/settings">Manage</Link>
          </Button>
        </div>
      )}

      {/* feature showcase */}
      <section className="mb-12 grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/10">
                <Icon className="h-5 w-5 text-gold" />
              </span>
              <div>
                <h3 className="font-semibold text-cream">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </article>
          );
        })}
      </section>

      {/* pricing */}
      <section className="mb-12">
        <h2 className="mb-1 font-hand text-3xl text-cream">Choose your time with us</h2>
        <Whisper>Pick what feels kind to you — you can change later.</Whisper>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.id} tier={p.id} disabled={isPlus} />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Pay with</span>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5">
            <Smartphone className="h-3.5 w-3.5 text-turquoise" /> UPI
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5">
            <CreditCard className="h-3.5 w-3.5 text-lavender" /> Cards
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5">
            <Landmark className="h-3.5 w-3.5 text-gold" /> Net banking
          </span>
        </div>
      </section>

      {/* free forever */}
      <section className="rounded-2xl border border-border bg-card/30 p-6">
        <h2 className="mb-1 font-hand text-3xl text-cream">Free for everyone, always</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          None of this is ever locked behind Plus.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {FREE_FOREVER.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-cream/90">
              <Check className="h-4 w-4 shrink-0 text-turquoise" /> {f}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PlanCard({ tier, disabled }: { tier: Tier; disabled?: boolean }) {
  const plan = planFor(tier)!;
  const [open, setOpen] = useState(false);
  const best = tier === "12m";
  return (
    <>
      <div
        className={cn(
          "relative flex flex-col rounded-3xl border p-6 transition-all",
          best
            ? "border-gold/50 bg-gold/5 ring-1 ring-gold/30"
            : "border-border bg-card/40",
        )}
      >
        {plan.badge && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-background">
            {plan.badge}
          </span>
        )}
        <p className="font-hand text-2xl text-cream">{plan.label}</p>
        <p className="mt-2 text-4xl font-bold text-cream">
          ₹{plan.price}
          <span className="ml-1 text-sm font-normal text-muted-foreground">{plan.per}</span>
        </p>
        {plan.save && (
          <p className="mt-2 inline-flex w-fit rounded-full bg-turquoise/15 px-2.5 py-1 text-xs font-medium text-turquoise">
            {plan.save}
          </p>
        )}
        <Button
          variant={best ? "hero" : "soft"}
          size="lg"
          className="mt-auto pt-0"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {disabled ? "You're on Plus" : "Choose this"}
        </Button>
      </div>
      {open && <Checkout tier={tier} onClose={() => setOpen(false)} />}
    </>
  );
}

const METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, hint: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, hint: "Debit or credit" },
  { id: "netbanking", label: "Net banking", icon: Landmark, hint: "All major banks" },
];

function Checkout({ tier, onClose }: { tier: Tier; onClose: () => void }) {
  const plan = planFor(tier)!;
  const { activate } = usePlus();
  const [method, setMethod] = useState("upi");
  const [paying, setPaying] = useState(false);

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      activate(tier);
      affirm("Welcome to Plus. Be a little gentle with yourself today. 💛");
      onClose();
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h3 className="font-hand text-2xl text-cream">For Once Plus · {plan.label}</h3>
        </div>
        <p className="mb-4 text-3xl font-bold text-cream">₹{plan.price}</p>

        <p className="mb-2 text-sm text-muted-foreground">How would you like to pay?</p>
        <div className="space-y-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-turquoise/60 bg-turquoise/10"
                    : "border-border bg-background/30 hover:border-turquoise/30",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-turquoise" : "text-muted-foreground")} />
                <span>
                  <span className="block text-sm font-medium text-cream">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <Button variant="hero" size="lg" className="mt-5 w-full" disabled={paying} onClick={pay}>
          {paying ? "Confirming…" : `Pay ₹${plan.price}`}
        </Button>
        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-cream"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
