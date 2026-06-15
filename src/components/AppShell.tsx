import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  PenLine,
  BookHeart,
  Users,
  Music,
  Sparkles,
  MessageCircleHeart,
  HeartHandshake,
  LifeBuoy,
} from "lucide-react";
import { MandalaBackground } from "./MandalaBackground";
import { CrisisButton } from "./CrisisButton";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  primary?: boolean;
}

const NAV: NavItem[] = [
  { to: "/home", label: "Home", icon: Home, primary: true },
  { to: "/your-space", label: "Your Space", icon: PenLine, primary: true },
  { to: "/journal", label: "Journal", icon: BookHeart, primary: true },
  { to: "/community", label: "Community", icon: Users, primary: true },
  { to: "/music", label: "Music", icon: Music, primary: true },
  { to: "/good-stuff", label: "Good Stuff", icon: Sparkles, primary: true },
  { to: "/prompts", label: "Guided Prompts", icon: MessageCircleHeart },
  { to: "/it-was-real", label: "It Was Real", icon: HeartHandshake },
  { to: "/coping", label: "When It's Hard", icon: LifeBuoy },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed?: boolean }) {
  const { Icon } = { Icon: item.icon };
  return (
    <Link
      to={item.to}
      activeProps={{ className: "bg-turquoise/15 text-turquoise" }}
      inactiveProps={{ className: "text-muted-foreground hover:text-cream hover:bg-card/60" }}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen">
      <MandalaBackground />

      {/* Desktop side nav */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar/70 backdrop-blur-xl lg:flex">
        <Link to="/home" className="px-6 pb-2 pt-7">
          <span className="font-hand text-4xl font-bold text-cream">For Once</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            be a little selfish about how you feel
          </span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="p-4">
          <CrisisButton className="w-full justify-center" />
        </div>
      </aside>

      {/* Floating crisis button on mobile */}
      <div className="fixed right-4 top-4 z-40 lg:hidden">
        <CrisisButton />
      </div>

      {/* Main content */}
      <main className="lg:pl-60">
        <div
          key={pathname}
          className="page-enter mx-auto w-full max-w-3xl px-4 pb-32 pt-16 lg:px-10 lg:pb-16 lg:pt-12"
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/85 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {NAV.filter((n) => n.primary).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-turquoise" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-none">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
