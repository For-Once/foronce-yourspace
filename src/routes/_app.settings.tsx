import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Heart, Check, Palette, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { PlusBadge } from "@/components/UpgradePrompt";
import { usePlus, usePlusVisible, planFor, PLUS_NOTE } from "@/lib/plus";
import { THEMES, useJournalTheme, themeStyle, type JournalTheme } from "@/lib/themes";
import { affirm } from "@/lib/affirm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — For Once" },
      {
        name: "description",
        content: "Manage your For Once Plus plan and choose the aesthetic for your private space.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { plus, isPlus, cancel } = usePlus();
  const plusVisible = usePlusVisible();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your plan and the look of your private space." />

      {/* Plan — hidden until For Once Plus launches */}
      {plusVisible && (
      <section className="mb-10">
        <h2 className="mb-3 font-hand text-3xl text-cream">For Once Plus</h2>
        {isPlus ? (
          <div className="rounded-2xl border border-turquoise/30 bg-turquoise/10 p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-turquoise" />
              <p className="font-medium text-cream">
                You're on Plus <PlusBadge className="ml-1 align-middle" />
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {planFor(plus.tier)?.label} plan
              {plus.renewAt
                ? ` · renews ${new Date(plus.renewAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : ""}
              .
            </p>
            <p className="mt-3 text-xs italic text-muted-foreground/80">{PLUS_NOTE}</p>
            <Button
              variant="soft"
              size="sm"
              className="mt-4"
              onClick={() => {
                cancel();
                affirm("Your Plus has ended. Everything that matters is still here, free.");
              }}
            >
              Cancel Plus
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <p className="font-medium text-cream">You're on the free plan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything that matters is yours, free, always. Plus adds a few gentle extras.
            </p>
            <Button asChild variant="warm" size="lg" className="mt-4">
              <Link to="/plus">
                <Sparkles className="h-4 w-4" /> See For Once Plus
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Themes */}
      <section>
        <h2 className="mb-1 font-hand text-3xl text-cream">Your own aesthetic</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose a theme for your private space — preview it before you apply.
        </p>
        <ThemePicker locked={!isPlus} />
      </section>
    </div>
  );
}

function ThemePicker({ locked }: { locked: boolean }) {
  const { themeId, setThemeId } = useJournalTheme();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {THEMES.map((t) => (
        <ThemeCard
          key={t.id}
          theme={t}
          active={themeId === t.id}
          locked={locked && t.id !== "default"}
          onApply={() => {
            setThemeId(t.id);
            affirm(`“${t.name}” looks good on you.`);
          }}
        />
      ))}
      {locked && (
        <p className="sm:col-span-2 mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Themes beyond the default unlock with{" "}
          <Link to="/plus" className="text-gold underline-offset-2 hover:underline">
            Plus
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function ThemeCard({
  theme,
  active,
  locked,
  onApply,
}: {
  theme: JournalTheme;
  active: boolean;
  locked: boolean;
  onApply: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all",
        active ? "border-turquoise/60 ring-1 ring-turquoise/40" : "border-border",
      )}
    >
      {/* live preview */}
      <div className="p-4" style={themeStyle(theme)}>
        <p className="text-lg font-semibold" style={{ color: theme.vars.text }}>
          {theme.name} {theme.accents.join(" ")}
        </p>
        <p className="mt-1 text-xs" style={{ color: theme.vars.muted }}>
          today felt like a quiet kind of okay…
        </p>
        <span
          className="mt-3 inline-block rounded-full px-2.5 py-1 text-[11px]"
          style={{ background: theme.vars.panel, color: theme.vars.accent }}
        >
          a little accent
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card/40 p-3">
        <span className="text-sm text-cream">{theme.desc}</span>
        <Button
          variant={active ? "default" : "soft"}
          size="sm"
          disabled={locked}
          onClick={onApply}
        >
          {locked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : active ? (
            <>
              <Check className="h-3.5 w-3.5" /> Applied
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
}
