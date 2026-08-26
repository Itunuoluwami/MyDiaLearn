import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Eye, Lock, UserCheck } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancellationPolicies, useVerificationSteps } from "@/lib/public-data";

export const Route = createFileRoute("/trust-and-safety")({
  head: () => ({
    meta: [
      { title: "Trust & safety at DiaLearn" },
      {
        name: "description",
        content:
          "How DiaLearn verifies tutors, protects children, secures payments and handles cancellations and refunds.",
      },
      { property: "og:title", content: "Trust & safety at DiaLearn" },
      {
        property: "og:description",
        content: "Tutor verification, child safety, secure payments and clear refund windows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrustPage,
});

const PILLARS = [
  {
    icon: UserCheck,
    title: "Verified before listed",
    body: "No tutor appears in search until every required verification step is complete and approved by our team.",
  },
  {
    icon: Eye,
    title: "Parents keep oversight",
    body: "Parents control whether a child can sign in, book lessons or message tutors, and can review every session afterwards.",
  },
  {
    icon: Lock,
    title: "Payments held safely",
    body: "Lesson fees are held after booking and only released to the tutor once the lesson has been delivered.",
  },
  {
    icon: BadgeCheck,
    title: "Reviews that stay honest",
    body: "Only families who have completed a lesson can review a tutor, and reviews are published as written.",
  },
];

function TrustPage() {
  const { data: steps, isLoading } = useVerificationSteps();
  const { data: policies } = useCancellationPolicies();

  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-16">
          <p className="eyebrow">Trust & safety</p>
          <h1 className="display-hero mt-3 max-w-3xl">
            Careful with your child, careful with your money.
          </h1>
          <p className="lead mt-4 max-w-2xl">
            DiaLearn is built for parents who are far from the classroom. These are the safeguards
            that make that workable.
          </p>
        </div>
      </section>

      <section className="container-site section-y">
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="card-warm p-5">
              <pillar.icon className="size-5 text-primary" />
              <h2 className="mt-3 text-lg">{pillar.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-site section-y">
          <h2 className="display-section">Our verification checks</h2>
          <p className="lead mt-3 max-w-2xl">
            The current checklist, straight from our verification configuration.
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-xl" />
                ))
              : (steps ?? []).map((step) => (
                  <li key={step.id} className="panel-portal p-5">
                    <h3 className="text-base font-semibold">{step.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">
                      {step.applies_to} · {step.is_required ? "required" : "optional"}
                    </p>
                    {step.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                    ) : null}
                  </li>
                ))}
          </ul>
        </div>
      </section>

      {(policies ?? []).length > 0 ? (
        <section className="container-site section-y">
          <h2 className="display-section">Cancellations and refunds</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {(policies ?? []).map((policy) => (
              <li key={policy.name} className="card-warm p-5">
                <h3 className="text-base font-semibold">{policy.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cancel at least {policy.hours_before} hours before the lesson for a{" "}
                  {policy.refund_percentage}% refund.
                </p>
                {policy.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{policy.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="band-ink">
        <div className="container-site section-y">
          <h2 className="display-section max-w-2xl">Something doesn't feel right?</h2>
          <p className="lead mt-3 max-w-2xl text-ink-foreground/80">
            Report any concern about a tutor, a lesson or a payment and our team will investigate.
          </p>
          <Button asChild variant="onInk" size="lg" className="mt-6">
            <Link to="/contact">Contact our team</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
