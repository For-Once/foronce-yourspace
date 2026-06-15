// India-based crisis resources — always available, never buried.

export interface CrisisResource {
  name: string;
  number: string;
  detail: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "iCall",
    number: "9152987821",
    detail: "Psychosocial helpline by TISS — Mon to Sat, 8am to 10pm",
  },
  {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    detail: "Free counselling, available 24x7",
  },
  {
    name: "AASRA",
    number: "9820466726",
    detail: "Emotional support & suicide prevention, 24x7",
  },
];
