import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About DiaLearn — by Sahara Hub Limited" },
      {
        name: "description",
        content:
          "DiaLearn is built by Sahara Hub Limited to connect diaspora families with African teachers, keeping language, curriculum and culture within reach.",
      },
      { property: "og:title", content: "About DiaLearn — by Sahara Hub Limited" },
      {
        property: "og:description",
        content:
          "Why Sahara Hub Limited built DiaLearn for diaspora families and African teachers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    title: "Teachers first",
    body: "African teachers are the product, not an afterthought. They set their rates and keep ownership of how they teach.",
  },
  {
    title: "Calm over urgency",
    body: "No countdown timers, no discount theatre. Families should choose a tutor the way they choose a school.",
  },
  {
    title: "Culture is curriculum",
    body: "Language, history and identity sit alongside maths and science, because that is what families ask us for.",
  },
];

function AboutPage() {
  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-16">
          <p className="eyebrow">{BRAND.company}</p>
          <h1 className="display-hero mt-3 max-w-3xl">
            Built for families who left, and teachers who stayed.
          </h1>
          <p className="lead mt-4 max-w-2xl">
            {BRAND.name} exists because diaspora parents keep asking the same question: who can
            teach my child the curriculum they sit, and still speak to them about home?
          </p>
        </div>
      </section>

      <section className="container-site section-y grid gap-8 lg:grid-cols-[minmax(20rem,1fr)_minmax(20rem,1fr)]">
        <div className="w-full min-w-0">
          <h2 className="display-section">Our story</h2>
          <div className="mt-4 space-y-4 text-sm text-muted-foreground">
            <p>
              {BRAND.company} works across education and technology in Africa. DiaLearn started as a
              simple observation: families abroad were paying a premium for tutoring that had no
              connection to their child's exam board or their heritage, while excellent teachers
              across the continent were under-booked.
            </p>
            <p>
              DiaLearn puts the two sides in the same place, with the structure a marketplace needs
              — verification, secure payments, clear cancellation terms and a parent who stays in
              control.
            </p>
            <p>
              We are deliberately unhurried about growth. Every tutor listed has been checked by a
              person, and every feature is judged by whether a parent thousands of miles away can
              trust it.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {VALUES.map((value) => (
            <div key={value.title} className="card-warm p-5">
              <h3 className="text-lg">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="container-site section-y text-center">
          <h2 className="display-section">{BRAND.tagline}</h2>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg">
              <Link to="/tutors">Find a tutor</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/become-a-tutor">Teach with us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
