import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarClock,
  CheckSquare,
  CreditCard,
  Flag,
  Gavel,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

import { toast } from "sonner";

import { BRAND } from "@/lib/brand";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { clearAdminContextCache } from "@/lib/admin-guard";
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

type NavItem = {
  to: string;
  label: string;
  icon: typeof Users;
  /** Hidden unless the viewer holds this permission. */
  permission?: string;
  /** Hidden from everyone but super admins. */
  superAdminOnly?: boolean;
};

/** Admin Portal information architecture. The governance group at the end is
 * permission-filtered, so a scoped admin never sees a link they cannot open. */
const NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/verification", label: "Tutor verification", icon: ShieldCheck },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/payouts", label: "Payouts", icon: Wallet },
  { to: "/admin/disputes", label: "Disputes", icon: Gavel },
  { to: "/admin/moderation", label: "Moderation", icon: Flag },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Platform settings", icon: Settings },
];

const GOVERNANCE_NAV: NavItem[] = [
  { to: "/admin/approvals", label: "Approvals", icon: CheckSquare, permission: "admin.approvals" },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText, permission: "admin.audit" },
  { to: "/admin/admins", label: "Admins & roles", icon: UserCog, superAdminOnly: true },
];

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: (() => void) | undefined }) {
  const pathname = useActivePath();
  const Icon = item.icon;
  const active = isActive(pathname, item.to);
  return (
    <Link
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
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useActivePath();
  const { hasPermission, isSuperAdmin } = useAuth();

  const governance = GOVERNANCE_NAV.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    return !item.permission || hasPermission(item.permission);
  });

  return (
    <nav aria-label="Admin portal sections" className="flex flex-col gap-0.5">
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

      {governance.length > 0 ? (
        <>
          <p className="eyebrow mt-5 px-3 pb-1">Governance</p>
          {governance.map((item) => (
            <NavLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </>
      ) : null}
    </nav>
  );
}

/**
 * Admin Portal shell. This portal is desk-work by nature, so — unlike
 * TutorShell/StudentShell/ParentShell — it skips the fixed bottom mobile tab
 * bar and instead relies on the same Sheet slide-over nav on every
 * breakpoint below `lg`. It still has to not break on a phone, so the
 * slide-over remains fully usable there; it just isn't optimized as the
 * primary layout the way the family portals are.
 */
export function AdminShell({
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
  const { profile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = (profile?.full_name ?? "").split(" ")[0];

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearAdminContextCache();
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
                <SheetTitle className="sr-only">Admin portal navigation</SheetTitle>
                <div className="border-b border-border p-4">
                  <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-auto" />
                </div>
                <div className="p-3">
                  <NavList onNavigate={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/admin/dashboard" className="focus-ring flex items-center gap-2 rounded-md">
              <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-auto md:h-12" />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-deep md:inline-flex">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {isSuperAdmin ? "Super admin" : "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="min-h-11 gap-2 px-2" aria-label="Account menu">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep">
                    {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {firstName || "Admin"}
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
                  <Link to="/admin/security">
                    <KeyRound className="size-4" /> Password &amp; security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings">
                    <Settings className="size-4" /> Platform settings
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

      <div className="container-site flex gap-8 pb-12 pt-6 lg:pt-8">
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
          {children}
        </main>
      </div>
    </div>
  );
}
