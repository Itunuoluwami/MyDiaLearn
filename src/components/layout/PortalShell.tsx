import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Settings, User as UserIcon, Users } from "lucide-react";
import { toast } from "sonner";

import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof UserIcon;
  /** Permission key from the database; undefined means always visible. */
  permission?: string;
};

/**
 * Navigation is permission-driven: entries appear when the signed-in user's
 * roles map to the permission key in role_permissions. No hardcoded role checks.
 */
const NAV_ITEMS: NavItem[] = [
  { to: "/account", label: "My account", icon: UserIcon },
  { to: "/family", label: "Family & students", icon: Users, permission: "students.manage" },
  { to: "/admin/settings", label: "Platform settings", icon: Settings, permission: "admin.settings" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary-soft text-primary-deep"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { profile, roles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container-site flex min-h-16 items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[17rem] p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="border-b border-border p-4">
                  <img src={BRAND.logoUrl} alt="DiaLearn" className="h-9 w-auto" />
                </div>
                <div className="p-3">
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <img src={BRAND.logoUrl} alt="DiaLearn" className="h-8 w-auto md:h-9" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{profile?.full_name ?? "Account"}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="min-h-11 sm:min-h-9">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container-site flex gap-8 py-6 md:py-10">
        <aside className="hidden w-60 shrink-0 md:block">
          <NavLinks />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display-section text-3xl">{title}</h1>
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="capitalize">
                  {role}
                </Badge>
              ))}
            </div>
            {description ? <p className="lead mt-2 text-base">{description}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
