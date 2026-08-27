import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LineChart,
  LogOut,
  MessagesSquare,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/lib/parent-data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Users };

/** Documented Parent Portal information architecture. Labels are static UI copy. */
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/children", label: "My Children", icon: Users },
  { to: "/find-tutor", label: "Find Tutor", icon: Search },
  { to: "/my-tutors", label: "Tutors", icon: UserRound },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/progress", label: "Learning Progress", icon: LineChart },
  { to: "/messages", label: "Messages", icon: MessagesSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_PRIMARY = ["/dashboard", "/children", "/find-tutor", "/bookings"];

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useActivePath();
  return (
    <nav aria-label="Parent portal sections" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary-soft text-primary-deep shadow-soft"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ParentShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useActivePath();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: notifications } = useNotifications();

  const unread = (notifications ?? []).filter((item) => !item.read_at).length;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const firstName = (profile?.full_name ?? "").split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container-site flex min-h-16 items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <MoreHorizontal className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[18rem] p-0">
                <SheetTitle className="sr-only">Parent portal navigation</SheetTitle>
                <div className="border-b border-border p-4">
                  <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-auto" />
                </div>
                <div className="p-3">
                  <NavList onNavigate={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/dashboard" className="focus-ring flex items-center gap-2 rounded-md">
              <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-auto md:h-12" />
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            >
              <Link to="/notifications">
                <Bell className="size-5" aria-hidden="true" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-secondary ring-2 ring-card" />
                ) : null}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="min-h-11 gap-2 px-2" aria-label="Account menu">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep">
                    {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {firstName || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="truncate text-sm font-semibold">{profile?.full_name ?? "Account"}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {profile?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/children">
                    <ShieldCheck className="size-4" /> Children & permissions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container-site flex gap-8 pb-28 pt-6 lg:pb-12 lg:pt-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <NavList />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="display-section text-2xl md:text-3xl">{title}</h1>
              {description ? <p className="lead mt-1.5 text-sm md:text-base">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation — thumb-reachable primary actions */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/98 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.filter((item) => MOBILE_PRIMARY.includes(item.to)).map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="focus-ring flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-medium text-muted-foreground"
              >
                <MoreHorizontal className="size-5" aria-hidden="true" />
                More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl p-4">
              <SheetTitle className="text-base">All sections</SheetTitle>
              <div className="mt-3">
                <NavList onNavigate={() => setMoreOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}
