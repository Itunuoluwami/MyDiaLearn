import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Quote, Search, ShieldCheck, Sparkles, Video } from "lucide-react";

import heroStudent from "@/assets/hero-student.jpg";
import { PublicShell } from "@/components/public/PublicShell";
import { SiteSearch } from "@/components/public/SiteSearch";
import { ClassPreview } from "@/components/public/ClassPreview";
import { CurriculumGrid, SubjectGrid, TutorStrip } from "@/components/public/BrowseSections";
import { Button } from "@/components/ui/button";
import {
  settingList,
  settingText,
  usePublicSettings,
  type PersonaOption,
  type TrustSignal,
} from "@/lib/public-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DiaLearn — African tutors for diaspora families" },
      {
        name: "description",
        content:
          "Book one-to-one lessons with vetted African tutors. DiaLearn connects diaspora students and parents with teachers who know their curriculum.",
      },
      { property: "og:title", content: "DiaLearn — African tutors for diaspora families" },
      {
        property: "og:description",
        content:
          "Book one-to-one lessons with vetted African tutors who know your child's curriculum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

interface Testimonial {
  quote: string;
  name: string;
  detail?: string;
}

const STEPS = [
  {
    icon: Search,
    title: "Search",
    body: "Filter by subject, curriculum, country and timezone to find tutors who fit your child.",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    body: "Pick a time in your own timezone. Pay securely — funds are only released after the lesson.",
  },
  {
    icon: Video,
    title: "Learn",
    body: "Meet live one-to-one, review the recording, and follow progress from your parent portal.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="display-section mt-2">{title}</h2>
        {copy ? <p className="lead mt-2 max-w-2xl">{copy}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function HomePage() {
  const { data: settings } = usePublicSettings();
  const personas = settingList<PersonaOption>(settings, "content.persona_options");
  const trustSignals = settingList<TrustSignal>(settings, "content.trust_signals");
  const testimonials = settingList<Testimonial>(settings, "content.testimonials");

  return (
    <PublicShell>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="container-site grid items-center gap-8 py-10 md:py-16 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow">
              {settingText(settings, "content.hero_eyebrow", "Diaspora families, African teachers")}
            </p>
            <h1 className="display-hero mt-3">
              {settingText(
                settings,
                "content.hero_headline",
                "Learning that keeps your child close to home.",
              )}
            </h1>
            <p className="lead mt-4 max-w-xl">
              {settingText(
                settings,
                "content.hero_subcopy",
                "DiaLearn connects students and parents in the diaspora with vetted tutors across Africa.",
              )}
            </p>

            <div className="mt-6 max-w-xl">
              <SiteSearch />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="cta" size="lg">
                <Link to="/tutors">Find a tutor</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/become-a-tutor">Become a tutor</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroStudent}
              alt="A student in the diaspora taking a live one-to-one lesson with her tutor"
              width={1280}
              height={1440}
              className="w-full rounded-2xl border border-border object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* Persona picker */}
      {personas.length > 0 ? (
        <section className="container-site section-y">
          <SectionHeading
            eyebrow="Start here"
            title="What brings you to DiaLearn today?"
            copy="Pick the path that fits you — each one leads to the right part of DiaLearn."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona) => (
              <a
                key={persona.key}
                href={persona.href}
                className="card-interactive focus-ring flex flex-col p-5"
              >
                <h3 className="text-lg">{persona.label}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{persona.description}</p>
                <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                  {persona.cta}
                  <ArrowRight className="size-4" />
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* How it works */}
      <section className="border-y border-border bg-card">
        <div className="container-site section-y">
          <SectionHeading
            eyebrow="How it works"
            title="Search, book, learn."
            action={
              <Button asChild variant="subtle">
                <Link to="/how-it-works">See the full walkthrough</Link>
              </Button>
            }
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="card-warm p-5">
                <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-deep">
                  <step.icon className="size-5" />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by subject */}
      <section className="container-site section-y">
        <SectionHeading
          eyebrow="Explore"
          title="Browse by subject"
          copy="Every subject is managed by the DiaLearn team, so what you see is what our tutors actually teach."
          action={
            <Button asChild variant="subtle">
              <Link to="/explore">Explore everything</Link>
            </Button>
          }
        />
        <div className="mt-6">
          <SubjectGrid limit={8} />
        </div>
      </section>

      {/* Explore by curriculum */}
      <section className="border-y border-border bg-surface">
        <div className="container-site section-y">
          <SectionHeading
            eyebrow="Explore"
            title="Browse by curriculum"
            copy="British, American, IB, Cambridge or national — match the exam your child will actually sit."
          />
          <div className="mt-6">
            <CurriculumGrid limit={6} />
          </div>
        </div>
      </section>

      {/* Class preview */}
      <section className="container-site section-y">
        <ClassPreview />
        <div className="mt-6 text-center">
          <Button asChild variant="subtle">
            <Link to="/class-preview">More about DiaLearn lessons</Link>
          </Button>
        </div>
      </section>

      {/* Trust signals */}
      {trustSignals.length > 0 ? (
        <section className="border-y border-border bg-card">
          <div className="container-site section-y">
            <SectionHeading
              eyebrow="Trust & safety"
              title="Careful by design"
              action={
                <Button asChild variant="subtle">
                  <Link to="/trust-and-safety">How we vet tutors</Link>
                </Button>
              }
            />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {trustSignals.map((signal) => (
                <div key={signal.title} className="card-warm p-5">
                  <ShieldCheck className="size-5 text-primary" />
                  <h3 className="mt-3 text-lg">{signal.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{signal.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured tutors */}
      <section className="container-site section-y">
        <SectionHeading
          eyebrow="Featured tutors"
          title="Meet a few of our tutors"
          action={
            <Button asChild variant="subtle">
              <Link to="/tutors">Browse all tutors</Link>
            </Button>
          }
        />
        <div className="mt-6">
          <TutorStrip limit={8} />
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="band-ink">
          <div className="container-site section-y">
            <p className="eyebrow text-secondary">From DiaLearn families</p>
            <h2 className="display-section mt-3 max-w-2xl">
              Parents hear the difference before the results arrive.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <figure
                  key={item.name}
                  className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 p-5"
                >
                  <Quote className="size-5 text-secondary" />
                  <blockquote className="mt-3 text-sm text-ink-foreground/90">
                    {item.quote}
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {item.name}
                    {item.detail ? (
                      <span className="block text-xs font-normal text-ink-foreground/65">
                        {item.detail}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Closing CTA */}
      <section className="container-site section-y">
        <div className="card-warm flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <h2 className="display-section">Ready to find the right tutor?</h2>
            <p className="lead mt-2 max-w-xl">
              Start with a single lesson. No packages, no pressure.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg">
              <Link to="/tutors">
                <Sparkles /> Find a tutor
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Create an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
