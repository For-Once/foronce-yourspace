import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PenLine,
  BookHeart,
  Users,
  Music,
  Sparkles,
  MessageCircleHeart,
  HeartHandshake,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";
import { useProfile } from "@/lib/profile";
import { getMood, moodColorStyle } from "@/lib/moods";
import { INBETWEEN_PHRASES, randomFrom } from "@/lib/copy";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const SPACES = [
  {
    to: "/your-space",
    label: "Your Space",
    desc: "Say whatever you need to — vent it or celebrate it.",
    icon: PenLine,
    color: "text-turquoise",
  },
  {
    to: "/journal",
    label: "Private Space",
    desc: "A journal only you will ever see.",
    icon: BookHeart,
    color: "text-lavender",
  },
  {
    to: "/good-stuff",
    label: "The Good Stuff",
    desc: "A whole tab just for joy and gratitude.",
    icon: Sparkles,
    color: "text-gold",
  },
  {
    to: "/community",
    label: "Community",
    desc: "Hold each other. Share good things.",
    icon: Users,
    color: "text-peach",
  },
  {
    to: "/music",
    label: "Music",
    desc: "Sorted by feelings, not genres.",
    icon: Music,
    color: "text-turquoise",
  },
  {
    to: "/prompts",
    label: "Guided Prompts",
    desc: "Gentle ways to start when you don't know how.",
    icon: MessageCircleHeart,
    color: "text-lavender",
  },
  {
    to: "/it-was-real",
    label: "It Was Real",
    desc: "For everything you felt that was never returned.",
    icon: HeartHandshake,
    color: "text-rose",
  },
  {
    to: "/coping",
    label: "When It's Hard",
    desc: "When what you feel is too big for right now.",
    icon: LifeBuoy,
    color: "text-peach",
  },
] as const;

function HomePage() {
  const { profile } = useProfile();
  const mood = profile?.todayMood ? getMood(profile.todayMood) : undefined;
  const phrase = useMemo(() => randomFrom(INBETWEEN_PHRASES), []);

  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "it's late. i'm glad you're here"
      : hour < 12
        ? "good morning"
        : hour < 18
          ? "good afternoon"
          : "good evening";

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="font-hand text-5xl font-bold text-cream lg:text-6xl">
          {profile?.username ?? "friend"}
        </h1>
        {mood && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm capitalize ring-1 ring-inset ring-border">
            <span className={moodColorStyle[mood.color].text}>feeling {mood.label} today</span>
          </div>
        )}
        <p className="mt-5 font-hand text-3xl text-turquoise/90">{phrase}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {SPACES.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.to}
              to={s.to}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-turquoise/40 hover:bg-card"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-background/40">
                <Icon className={`h-5 w-5 ${s.color}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-semibold text-cream">
                  {s.label}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{s.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
