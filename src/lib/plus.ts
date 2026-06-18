import { useLocalStorage } from "./use-local-storage";

// "For Once Plus" — a gentle, optional subscription. Everything core stays free, always.

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

  return { plus, isPlus: plus.active, activate, cancel, hydrated };
}
