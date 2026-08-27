import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  GraduationCap,
  Presentation,
  Users,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

import heroStudent from "@/assets/hero-student.jpg";
import tutorTeaching from "@/assets/tutor-teaching.jpg";
import parentChild from "@/assets/parent-child.jpg";
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

/** Decorative persona icons, cycled in order — content itself stays DB-driven. */
const PERSONA_ICONS = [Users, GraduationCap, Presentation, Building2];

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
      <section className="band-hero relative overflow-hidden border-b border-border">
        <span
          aria-hidden="true"
          className="orb -top-24 -left-20 size-72 bg-primary/20 md:size-96"
        />
        <span
          aria-hidden="true"
          className="orb top-40 -right-16 size-72 bg-secondary/25 md:size-96"
        />
        <div className="container-site relative grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[minmax(20rem,1fr)_minmax(20rem,1fr)] lg:gap-14">
          <div className="w-full min-w-0">
            <span className="chip-float text-primary-deep">
              <ShieldCheck className="size-4" />
              {settingText(settings, "content.hero_eyebrow", "Diaspora families, African teachers")}
            </span>
            <h1 className="display-hero mt-5">
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
              <SiteSearch showTrending={false} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="cta" size="lg">
                <Link to="/tutors">Find a tutor</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/become-a-tutor">Become a tutor</Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {[
                "Identity & qualification checks",
                "Pay per lesson, no packages",
                "Every lesson recorded",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full min-w-0">
            <div className="media-frame aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
              <img
                src={heroStudent}
                alt="A student in the diaspora taking a live one-to-one lesson with her tutor"
                width={1280}
                height={1440}
              />
              <span aria-hidden="true" className="media-overlay opacity-60" />
            </div>

            <div className="card-elevated absolute -bottom-5 left-4 flex items-center gap-3 p-3 pr-4 md:left-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-success-soft text-success">
                <Video className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Live one-to-one lesson</span>
                <span className="block text-xs text-muted-foreground">
                  Recorded for parents to review
                </span>
              </span>
            </div>

            <div className="card-elevated absolute -top-4 right-2 hidden items-center gap-3 p-3 pr-4 md:flex">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary-soft text-secondary-foreground">
                <GraduationCap className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Curriculum-matched</span>
                <span className="block text-xs text-muted-foreground">British, IB, WAEC & more</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending searches — pastel category palette, capped at two rows */}
      {(() => {
        const CHIP_STYLES = [
          "bg-cat-lavender text-cat-lavender-ink",
          "bg-cat-mint text-cat-mint-ink",
          "bg-cat-rose text-cat-rose-ink",
          "bg-cat-peach text-cat-peach-ink",
          "bg-cat-sky text-cat-sky-ink",
          "bg-cat-cream text-cat-cream-ink",
        ];
        const trending = settingList<string>(settings, "content.trending_searches");
        const visible = trending.slice(0, 10);
        return visible.length > 0 ? (
          <section className="border-b border-border bg-card">
            <div className="container-site py-5">
              <div className="flex flex-wrap items-center gap-3">
                {visible.map((item, index) => (
                  <Link
                    key={item}
                    to="/tutors"
                    search={{ q: item }}
                    className={`rounded-full px-4 py-2 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${CHIP_STYLES[index % CHIP_STYLES.length]}`}
                  >
                    {item}
                  </Link>
                ))}
                {trending.length > visible.length ? (
                  <Button asChild variant="subtle" size="sm" className="rounded-full">
                    <Link to="/explore">
                      Explore more
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        ) : null;
      })()}

      {/* Persona picker */}
      {personas.length > 0 ? (
        <section className="container-site section-y">
          <SectionHeading
            eyebrow="Start here"
            title="What brings you to DiaLearn today?"
            copy="Pick the path that fits you — each one leads to the right part of DiaLearn."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona, index) => (
              <a
                key={persona.key}
                href={persona.href}
                className="card-interactive focus-ring group relative flex flex-col overflow-hidden p-5"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1 ${
                    index % 2 === 0
                      ? "bg-gradient-to-r from-primary to-primary/40"
                      : "bg-gradient-to-r from-secondary to-secondary/40"
                  }`}
                />
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${
                    index % 2 === 0
                      ? "bg-primary-soft text-primary-deep"
                      : "bg-secondary-soft text-secondary-foreground"
                  }`}
                >
                  {(() => {
                    const Icon = PERSONA_ICONS[index % PERSONA_ICONS.length] ?? GraduationCap;
                    return <Icon className="size-5" />;
                  })()}
                </span>
                <h3 className="mt-4 text-lg">{persona.label}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{persona.description}</p>
                <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                  {persona.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* How it works */}
      <section className="band-tint border-y border-border">
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
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(20rem,1.1fr)]">
            <div className="media-frame aspect-[4/3] w-full">
              <img
                src={tutorTeaching}
                alt="An African tutor teaching a live online lesson from her home study"
                width={1280}
                height={960}
                loading="lazy"
              />
            </div>
            <ol className="grid gap-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="card-warm hover-lift flex gap-4 p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                    <step.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-lg">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
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
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {trustSignals.map((signal) => (
                <div
                  key={signal.title}
                  className="card-warm hover-lift relative overflow-hidden p-5 pt-6"
                >
                  <span
                    aria-hidden="true"
                    className="orb -top-16 -right-10 size-32 bg-primary/15"
                  />
                  <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                    <ShieldCheck className="size-5" />
                  </span>
                  <h3 className="relative mt-4 text-lg">{signal.title}</h3>
                  <p className="relative mt-2 text-sm text-muted-foreground">{signal.body}</p>
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
        <section className="band-deep relative overflow-hidden">
          <span aria-hidden="true" className="orb -top-24 left-1/4 size-80 bg-secondary/20" />
          <div className="container-site section-y relative">
            <p className="eyebrow text-secondary">From DiaLearn families</p>
            <h2 className="display-section mt-3 max-w-2xl">
              Parents hear the difference before the results arrive.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <figure
                  key={item.name}
                  className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/[0.07] p-5 backdrop-blur transition-colors hover:bg-ink-foreground/[0.11]"
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
        <div className="card-elevated grid gap-0 overflow-hidden md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="flex flex-col items-start justify-center gap-4 p-6 md:p-10">
            <h2 className="display-section">Ready to find the right tutor?</h2>
            <p className="lead max-w-xl">
              Start with a single lesson. No packages, no pressure.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
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
          <div className="relative min-h-56 md:min-h-72">
            <img
              src={parentChild}
              alt="A parent and child reviewing homework together after a DiaLearn lesson"
              width={1280}
              height={960}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </div>
      </section>

    </PublicShell>
  );
}
