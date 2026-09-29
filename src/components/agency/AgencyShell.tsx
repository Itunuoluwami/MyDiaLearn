import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { toast } from "sonner";

import { BRAND } from "@/lib/brand";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useAgency } from "@/lib/agency-data";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "@/lib/tutor-data";
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

/** Agency portal information architecture. Labels are UI copy only. */
const NAV: NavItem[] = [
  { to: "/agency/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agency/tutors", label: "Tutors", icon: Users },
  { to: "/agency/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/agency/earnings", label: "Earnings", icon: Wallet },
  { to: "/agency/profile", label: "Agency profile", icon: Building2 },
  { to: "/account", label: "Account settings", icon: Settings },
];

const MOBILE_PRIMARY = [
  "/agency/dashboard",
  "/agency/tutors",
  "/agency/bookings",
  "/agency/earnings",
];

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useActivePath();
  return (
    <nav aria-label="Agency portal sections" className="flex flex-col gap-0.5">
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

/** Until DiaLearn verifies the agency, none of its tutors can appear in search. */
function VerificationBanner() {
  const { data: agency } = useAgency();
  const pathname = useActivePath();
  if (!agency) return null;
  if (agency.verificationStatus === "verified") return null;
  if (isActive(pathname, "/agency/profile")) return null;

  const waiting =
    agency.verificationStatus === "pending" || agency.verificationStatus === "in_review";
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-secondary/40 bg-secondary-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary-deep shadow-soft">
          {waiting ? <BadgeCheck className="size-5" /> : <ShieldCheck className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {waiting
              ? "Your agency is with our team for review"
              : "Your tutors are not visible to families yet"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {waiting
              ? "We check every agency before its tutors appear in search. You can keep adding and preparing tutors meanwhile."
              : "Complete your agency details and submit them for verification. Tutors under your agency are listed only once your agency is verified."}
          </p>
        </div>
      </div>
      <Button asChild variant="cta" size="sm" className="min-h-11 shrink-0 sm:min-h-10">
        <Link to="/agency/profile">{waiting ? "View status" : "Complete verification"}</Link>
      </Button>
    </div>
  );
}

export function AgencyShell({
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
  const { data: agency } = useAgency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useActivePath();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const firstName = (profile?.full_name ?? "").split(" ")[0];

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await authClient.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

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
                <SheetTitle className="sr-only">Agency portal navigation</SheetTitle>
                <div className="border-b border-border p-4">
                  <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-auto" />
                </div>
                <div className="p-3">
                  <NavList onNavigate={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/agency/dashboard" className="focus-ring flex items-center gap-2 rounded-md">
              <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-auto md:h-12" />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-deep md:inline-flex">
              <Building2 className="size-3.5" aria-hidden="true" /> Agency
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {agency ? (
              <span
                className={cn(
                  "hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex",
                  VERIFICATION_TONE[agency.verificationStatus],
                )}
              >
                {VERIFICATION_LABEL[agency.verificationStatus]}
              </span>
            ) : null}

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
                  <p className="truncate text-sm font-semibold">
                    {profile?.full_name ?? "Account"}
                  </p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {profile?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/agency/profile">
                    <Building2 className="size-4" /> {agency?.name ?? "Agency profile"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account">
                    <Settings className="size-4" /> Account settings
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
              {description ? (
                <p className="lead mt-1.5 text-sm md:text-base">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
          </div>
          <VerificationBanner />
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
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
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl p-4">
              <SheetTitle className="mb-3 text-base">All sections</SheetTitle>
              <NavList onNavigate={() => setMoreOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}
