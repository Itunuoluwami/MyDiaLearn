import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DiaLearn Design System — Sahara Hub Limited" },
      {
        name: "description",
        content:
          "Colour, typography, shape and component foundations for the DiaLearn education marketplace.",
      },
      { property: "og:title", content: "DiaLearn Design System" },
      {
        property: "og:description",
        content: "Colour, typography, shape and component foundations for DiaLearn.",
      },
    ],
  }),
  component: DesignSystemPage,
});

const palette = [
  { name: "Primary", hex: "#1E5F74", token: "bg-primary", fg: "text-primary-foreground" },
  { name: "Primary deep", hex: "#1A3A45", token: "bg-primary-deep", fg: "text-primary-foreground" },
  { name: "Secondary", hex: "#F2A65A", token: "bg-secondary", fg: "text-secondary-foreground" },
  { name: "Accent", hex: "#E8743B", token: "bg-accent", fg: "text-accent-foreground" },
  { name: "Ink", hex: "#12262E", token: "bg-ink", fg: "text-ink-foreground" },
  { name: "Background", hex: "#FAF9F6", token: "bg-background", fg: "text-foreground" },
  { name: "Success", hex: "#3F9142", token: "bg-success", fg: "text-success-foreground" },
  { name: "Warning", hex: "#E0A03B", token: "bg-warning", fg: "text-warning-foreground" },
  { name: "Error", hex: "#D64545", token: "bg-destructive", fg: "text-destructive-foreground" },
  { name: "Text secondary", hex: "#5B6B70", token: "bg-muted-foreground", fg: "text-background" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="text-xl">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function DesignSystemPage() {
  const { session, loading } = useAuth();

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="container-site flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
          <img src={BRAND.logoUrl} alt="DiaLearn" className="h-8 w-auto md:h-9" />
          {loading ? null : session ? (
            <Button asChild>
              <Link to="/account">Go to my account</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </header>
      <div className="container-site py-14">
        <p className="eyebrow">Sahara Hub Limited</p>
        <h1 className="display-hero mt-3">DiaLearn design system</h1>
        <p className="lead mt-4 max-w-2xl">
          Warm, trustworthy and calm — closer to a respected educational institution than a
          marketplace app. Foundations below are the shared language for the public website and all
          five portals.
        </p>

        <Section title="Colour" hint="Semantic tokens only — never hardcoded hex in components.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {palette.map((c) => (
              <div key={c.name} className="card-warm overflow-hidden">
                <div className={`${c.token} ${c.fg} flex h-24 items-end p-3 text-xs font-medium`}>
                  {c.hex}
                </div>
                <div className="p-3 text-sm font-semibold">{c.name}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Typography"
          hint="Fraunces for editorial headings, Inter for body and dense portal UI."
        >
          <div className="card-warm space-y-5 p-6">
            <p className="display-hero">Find a tutor who knows home.</p>
            <p className="display-section">Trusted tutors, carefully vetted</p>
            <h4>Subheading — 600 weight, Inter</h4>
            <p className="lead max-w-2xl">
              Lead paragraph: calm, editorial copy used across the public marketing site to explain
              how DiaLearn works before a parent commits.
            </p>
            <p className="max-w-2xl">
              Body text at 16px with generous line height for readability across long-form marketing
              pages and portal content alike.
            </p>
            <p className="portal-dense max-w-2xl text-muted-foreground">
              Portal-dense text at 14px, used in Tutor, Agency and Admin tables where information
              density matters more than editorial rhythm.
            </p>
          </div>
        </Section>

        <Section title="Buttons" hint="16px cards, 10px buttons. Accent reserved for key moments.">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="cta">Book a Lesson</Button>
            <Button>Find a tutor</Button>
            <Button variant="warm">Become a tutor</Button>
            <Button variant="outline">Learn more</Button>
            <Button variant="subtle">Save for later</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="link">How it works</Button>
            <Button size="portal" variant="outline">
              Portal action
            </Button>
          </div>
        </Section>

        <Section title="Surfaces" hint="Soft shadows only — never hard drop shadows.">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card-interactive p-6">
              <ShieldCheck className="text-primary" />
              <h3 className="mt-4 text-lg">Vetted tutors</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Interactive listing card — lifts gently on hover, no urgency cues.
              </p>
            </div>
            <div className="card-warm p-6">
              <BookOpen className="text-primary" />
              <h3 className="mt-4 text-lg">Content card</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Static card for marketing and portal content blocks.
              </p>
            </div>
            <div className="panel-portal p-5">
              <CalendarCheck className="text-primary" />
              <h4 className="mt-4">Portal panel</h4>
              <p className="portal-dense mt-2 text-muted-foreground">
                Tighter radius and spacing for operational views.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Status & inputs">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-success-soft text-success">Verified</Badge>
            <Badge className="bg-warning-soft text-warning-foreground">Pending review</Badge>
            <Badge className="bg-destructive/10 text-destructive">Payment failed</Badge>
            <Badge className="bg-primary-soft text-primary-deep">Mathematics</Badge>
          </div>
          <div className="mt-6 max-w-sm">
            <Input placeholder="Search subjects, e.g. WAEC Mathematics" />
          </div>
        </Section>
      </div>

      <div className="band-ink">
        <div className="container-site section-y">
          <p className="eyebrow text-secondary">Dark editorial band</p>
          <p className="display-section mt-3 max-w-2xl">
            Used for testimonial and video blocks, where a parent hears from another parent.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button variant="cta">
              <Sparkles /> Book a Lesson
            </Button>
            <Button variant="onInk">Watch the story</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
