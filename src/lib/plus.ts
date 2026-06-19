import { useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";

// "For Once Plus" — a gentle, optional subscription. Everything core stays free, always.

// ── Launch gating ─────────────────────────────────────────────
// Plus is not public yet. It stays hidden from everyone until launch,
// except people who open the private preview link:
//   /plus?preview=foronce-early-2026
// That link flips a flag in their browser so they (and only they) can
// see and use everything Plus.
export const PLUS_LAUNCHED = false;
export const PLUS_PREVIEW_TOKEN = "foronce-early-2026";
const PREVIEW_KEY = "foronce.plus.preview";

export function isPlusPreview(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

export function enablePlusPreview() {
  try {
    window.localStorage.setItem(PREVIEW_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Whether any Plus surface (nav entry, pricing, upsell) should be shown. */
export function usePlusVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(PLUS_LAUNCHED || isPlusPreview());
  }, []);
  return visible;
}

export type Tier = "3m" | "6m" | "12m";

export interface Plan {
  id: Tier;
  months: number;
  price: number;
  label: string;
  per: string;
  save?: string;
  badge?: string;
}

export const PLANS: Plan[] = [
  { id: "3m", months: 3, price: 100, label: "3 months", per: "₹33 / month" },
  {
    id: "6m",
    months: 6,
    price: 180,
    label: "6 months",
    per: "₹30 / month",
    save: "Save ₹20",
  },
  {
    id: "12m",
    months: 12,
    price: 300,
    label: "12 months",
    per: "₹25 / month",
    save: "Save ₹100 compared to paying every 3 months",
    badge: "Most Loved",
  },
];

export interface PlusState {
  active: boolean;
  tier?: Tier;
  startedAt?: number;
  renewAt?: number;
}

const KEY = "foronce.plus";

export const FREE_JOURNAL_LIMIT = 20;
export const FREE_VOICE_LIMIT = 5;

export const PLUS_NOTE =
  "For Once is free, always. Plus just gives you a few more ways to hold onto what you feel.";

export function planFor(tier?: Tier) {
  return PLANS.find((p) => p.id === tier);
}

export function usePlus() {
  const [plus, setPlus, hydrated] = useLocalStorage<PlusState>(KEY, { active: false });
  const preview = usePlusVisible();

  const activate = (tier: Tier) => {
    const plan = planFor(tier);
    const now = Date.now();
    const months = plan?.months ?? 3;
    setPlus({
      active: true,
      tier,
      startedAt: now,
      renewAt: now + months * 30 * 24 * 60 * 60 * 1000,
    });
  };

  const cancel = () => setPlus({ active: false });

  // While Plus is unlaunched, the private preview link unlocks every feature
  // for the previewer so it can be tested end-to-end.
  return { plus, isPlus: plus.active || preview, activate, cancel, hydrated };
}
