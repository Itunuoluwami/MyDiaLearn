import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/use-auth";
import { portalHome } from "@/lib/portal-home";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const NAV_LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/tutors", label: "Find a tutor" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/become-a-tutor", label: "Become a tutor" },
  { to: "/for-agencies", label: "For agencies" },
] as const;

const FOOTER_GROUPS = [
  {
    title: "Learn",
    links: [
      { to: "/explore", label: "Explore subjects" },
      { to: "/tutors", label: "Browse tutors" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/class-preview", label: "What a class looks like" },
      { to: "/pricing", label: "How payment works" },
    ],
  },
  {
    title: "Teach",
    links: [
      { to: "/become-a-tutor", label: "Become a tutor" },
      { to: "/for-agencies", label: "For tutor agencies" },
      { to: "/auth", label: "Tutor sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About DiaLearn" },
      { to: "/trust-and-safety", label: "Trust & safety" },
      { to: "/contact", label: "Contact us" },
    ],
  },
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { session, loading, roles } = useAuth();
  const portalPath = portalHome(roles);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container-site grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 lg:flex lg:justify-between">
          <Link to="/" className="flex min-w-0 items-center" aria-label="DiaLearn home">
            <img src={BRAND.logoUrl} alt="DiaLearn" className="h-11 w-auto md:h-12" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {loading ? null : session ? (
                <Button asChild>
                  <Link to={portalPath}>
                    {portalPath === "/account" ? "My account" : "Dashboard"}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button asChild variant="cta">
                    <Link to="/tutors">Find a tutor</Link>
                  </Button>
                </>
              )}
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[19rem] overflow-y-auto p-0">
                <div className="border-b border-border p-4">
                  <img src={BRAND.logoUrl} alt="DiaLearn" className="h-11 w-auto" />
                </div>
                <nav className="flex flex-col p-2" aria-label="Mobile">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Separator className="my-2" />
                  {[
                    { to: "/about", label: "About" },
                    { to: "/trust-and-safety", label: "Trust & safety" },
                    { to: "/contact", label: "Contact" },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-2 p-4">
                  {session ? (
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link to={portalPath}>
                        {portalPath === "/account" ? "My account" : "Dashboard"}
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="cta" onClick={() => setOpen(false)}>
                        <Link to="/tutors">Find a tutor</Link>
                      </Button>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/auth">Sign in</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="band-ink mt-auto">
        <div className="container-site py-10 md:py-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
            <div>
              <img
                src={BRAND.logoUrl}
                alt="DiaLearn"
                className="h-11 w-auto brightness-0 invert"
                loading="lazy"
              />
              <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
                {BRAND.tagline} — one-to-one lessons between diaspora families and vetted African
                tutors.
              </p>
            </div>
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-secondary">{group.title}</h4>
                <ul className="mt-3 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="flex min-h-9 items-center text-sm text-ink-foreground/75 transition-colors hover:text-ink-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/60">
            © {new Date().getFullYear()} {BRAND.company}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
