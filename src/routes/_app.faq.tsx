import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader, Whisper } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — For Once" },
      {
        name: "description",
        content:
          "Answers about For Once — how your privacy works, who it's for, and how to use this safe, anonymous space for all your feelings.",
      },
    ],
  }),
  component: FaqPage,
});

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is For Once?",
    a: "For Once is a safe, anonymous, judgment-free space for your feelings — the hard ones and the beautiful ones equally. It's somewhere to vent, journal, celebrate the good stuff, and feel a little less alone, all without anyone watching over your shoulder.",
  },
  {
    q: "Who is it for?",
    a: "It's built with teens and young adults (13–25) in mind, but everyone is welcome. If you have feelings, you belong here.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your private space, journal, and letters live on your own device. We don't sell your data, and we never ask for your real name. You can be exactly as anonymous as you want to be.",
  },
  {
    q: "Can I back up or move my entries?",
    a: "Yes. The Backup & Restore page lets you create an encrypted backup using a passphrase only you know. You can save it locally or move it safely to another device, then restore it whenever you're ready.",
  },
  {
    q: "Do I need an account?",
    a: "No sign-up, no email required. You pick a soft username during onboarding and that's it — no passwords, no inbox, no pressure.",
  },
  {
    q: "Is For Once a replacement for therapy or crisis help?",
    a: "No. For Once is a gentle companion for your everyday feelings — it isn't medical care or emergency support. If you're in crisis or thinking about hurting yourself, please reach out to a trusted person or a local emergency service right away.",
  },
  {
    q: "Does it cost anything?",
    a: "For Once is free to feel your feelings in. Soon we'll have a small store with journals, mandala art, and gentle supplements — entirely optional, just for if you want something to hold in your hands.",
  },
  {
    q: "Will others see what I write?",
    a: "Only what you choose to share in Community is visible to others, and always anonymously. Your Space, Private Space, and It Was Real stay yours alone.",
  },
];

function FaqPage() {
  return (
    <div>
      <PageHeader
        title="FAQ"
        subtitle="The gentle answers to the things people wonder about For Once."
      />

      <div className="mb-6 rounded-2xl border border-turquoise/20 bg-turquoise/5 p-4">
        <Whisper>However you found your way here — you're welcome.</Whisper>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="rounded-2xl border border-border bg-card/40 px-5"
          >
            <AccordionTrigger className="text-left text-base font-semibold text-cream hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-cream/80">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
