import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Wallet } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerificationSteps } from "@/lib/public-data";

export const Route = createFileRoute("/become-a-tutor")({
  head: () => ({
    meta: [
      { title: "Become a DiaLearn tutor" },
      {
        name: "description",
        content:
          "Teach diaspora students from anywhere in Africa. See the DiaLearn verification steps, how you set your rate and how payouts work.",
      },
      { property: "og:title", content: "Become a DiaLearn tutor" },
      {
        property: "og:description",
        content: "Teach diaspora families, set your own rate and get paid reliably with DiaLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BecomeTutorPage,
});

const BENEFITS = [
  {
    title: "Teach the curriculum you know",
    body: "Match with families sitting the exams you already teach — WAEC, IGCSE, AP, IB and more.",
  },
  {
    title: "Set your own hourly rate",
    body: "You choose your rate and currency. Lesson prices are calculated from it automatically.",
  },
  {
    title: "Reliable, transparent payouts",
    body: "Fees and commission are published up front, and payouts follow the platform's payout policy.",
  },
  {
    title: "Your calendar, your rules",
    body: "Publish weekly availability windows in your own timezone. DiaLearn never double-books you.",
  },
];

function BecomeTutorPage() {
  const { data: steps, isLoading } = useVerificationSteps();
  const tutorSteps = (steps ?? []).filter((step) => step.applies_to === "tutor");

  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-16">
          <p className="eyebrow">For teachers across Africa</p>
          <h1 className="display-hero mt-3 max-w-3xl">
            Teach diaspora students, from wherever you are.
          </h1>
          <p className="lead mt-4 max-w-2xl">
            DiaLearn brings you students whose families want a teacher who understands both their
            curriculum and where they come from.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg">
              <Link to="/auth">Start your tutor application</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">See fees and payouts</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-site section-y">
        <h2 className="display-section">Why teach with DiaLearn</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="card-warm p-5">
              <CheckCircle2 className="size-5 text-primary" />
              <h3 className="mt-3 text-lg">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{benefit.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-site section-y">
          <h2 className="display-section">Your onboarding, step by step</h2>
          <p className="lead mt-3 max-w-2xl">
            These are the checks DiaLearn currently requires before a tutor profile goes live.
          </p>
          <ol className="mt-6 space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))
              : tutorSteps.map((step, index) => (
                  <li key={step.id} className="panel-portal flex items-start gap-4 p-5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">
                        {step.name}
                        {step.is_required ? null : (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            optional
                          </span>
                        )}
                      </h3>
                      {step.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
          </ol>
          {!isLoading && tutorSteps.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Verification steps are being finalised. Create an account and we will guide you through
              them.
            </p>
          ) : null}
        </div>
      </section>

      <section className="container-site section-y">
        <div className="card-warm flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <Wallet className="size-6 text-primary" />
            <h2 className="display-section mt-3">Ready to apply?</h2>
            <p className="lead mt-2 max-w-xl">
              Create a tutor account, complete verification and publish your profile.
            </p>
          </div>
          <Button asChild variant="cta" size="lg" className="shrink-0">
            <Link to="/auth">Create a tutor account</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
