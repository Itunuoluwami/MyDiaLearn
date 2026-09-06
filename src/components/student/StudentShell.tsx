import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";

import { toast } from "sonner";

import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useStudentRecord, useStudentNotifications } from "@/lib/student-data";
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

type NavItem = { to: string; label: string; icon: typeof Search };

const NAV: NavItem[] = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/find-tutor", label: "Find a Tutor", icon: Search },
  { to: "/student/history", label: "My Classes", icon: CalendarDays },
  { to: "/student/materials", label: "Assignments & Materials", icon: BookOpen },
  { to: "/student/messages", label: "Messages", icon: MessagesSquare },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
];

const MOBILE_PRIMARY = [
  "/student/dashboard",
  "/student/find-tutor",
  "/student/materials",
  "/student/messages",
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
    <nav aria-label="Student portal sections" className="flex flex-col gap-1">
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
              "focus-ring flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function StudentShell({
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
  const { data: student } = useStudentRecord();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useActivePath();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: notifications } = useStudentNotifications();

  const unread = (notifications ?? []).filter((item) => !item.read_at).length;
  const firstName = student?.first_name || (profile?.full_name ?? "").split(" ")[0];

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background selection:bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container-site flex min-h-16 items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <MoreHorizontal className="size-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[18rem] border-r-0 p-0">
                <SheetTitle className="sr-only">Student portal navigation</SheetTitle>
                <div className="border-b border-border p-4 bg-primary/5">
                  <img src={BRAND.logoUrl} alt={BRAND.name} className="h-10 w-auto" />
                </div>
                <div className="p-4">
                  <NavList onNavigate={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/student/dashboard" className="focus-ring flex items-center gap-2 rounded-md">
              <img src={BRAND.logoUrl} alt={BRAND.name} className="h-10 w-auto md:h-11" />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary-foreground md:inline-flex ml-2">
              Student Portal
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-primary"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            >
              <Link to="/student/notifications">
                <Bell className="size-5" aria-hidden="true" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-accent ring-2 ring-card" />
                ) : null}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="min-h-11 gap-2 px-2 hover:bg-primary/5" aria-label="Account menu">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {firstName ? firstName.charAt(0).toUpperCase() : "?"}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-bold text-primary sm:inline">
                    {firstName || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel className="space-y-0.5 px-2 py-1.5">
                  <p className="truncate text-sm font-bold">{student ? `${student.first_name} ${student.last_name || ""}` : (profile?.full_name ?? "Account")}</p>
                  <p className="truncate text-xs font-medium text-muted-foreground">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()} className="rounded-lg font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="size-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container-site flex gap-8 pb-28 pt-6 lg:pb-12 lg:pt-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl bg-card p-4 shadow-sm border border-border/50">
            <NavList />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-primary-deep md:text-4xl">{title}</h1>
              {description ? <p className="mt-2 text-base font-medium text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden pb-safe"
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
                  "focus-ring flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-bold transition-all",
                  active ? "text-primary" : "text-muted-foreground hover:text-primary/70",
                )}
              >
                <div className={cn("flex items-center justify-center rounded-full p-1.5 transition-colors", active && "bg-primary/10")}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="focus-ring flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-bold text-muted-foreground hover:text-primary/70"
              >
                <div className="flex items-center justify-center rounded-full p-1.5">
                  <MoreHorizontal className="size-5" aria-hidden="true" />
                </div>
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl p-6">
              <SheetTitle className="mb-4 text-lg font-extrabold text-primary-deep">Menu</SheetTitle>
              <NavList onNavigate={() => setMoreOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}
