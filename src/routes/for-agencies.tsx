import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Users } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerificationSteps } from "@/lib/public-data";

export const Route = createFileRoute("/for-agencies")({
  head: () => ({
    meta: [
      { title: "DiaLearn for tutor agencies" },
      {
        name: "description",
        content:
          "Bring your tutoring team onto DiaLearn: manage a verified roster, agency-level commission terms and consolidated reporting.",
      },
      { property: "og:title", content: "DiaLearn for tutor agencies" },
      {
        property: "og:description",
        content: "Manage a verified roster of tutors, agency commission terms and reporting in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForAgenciesPage,
});

const VALUE = [
  {
    title: "One roster, one dashboard",
    body: "Add your tutors, track their verification status and see every booking across the agency.",
  },
  {
    title: "Agency-level commission terms",
    body: "DiaLearn can apply commission rules specific to your agency rather than the platform default.",
  },
  {
    title: "Demand you don't have to chase",
    body: "Your tutors appear in the same search diaspora parents already use, with your agency name on their profile.",
  },
  {
    title: "Consolidated reporting",
    body: "Lessons delivered, earnings and payouts summarised across your whole team.",
  },
];

function ForAgenciesPage() {
  const { data: steps, isLoading } = useVerificationSteps();
  const agencySteps = (steps ?? []).filter((step) => step.applies_to === "agency");

  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-16">
          <p className="eyebrow">For tutoring organisations</p>
          <h1 className="display-hero mt-3 max-w-3xl">Bring your teaching team to DiaLearn</h1>
          <p className="lead mt-4 max-w-2xl">
            If you already run a tutoring business in Africa, DiaLearn gives your team access to
            diaspora families — with the oversight an agency needs.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg">
              <Link to="/auth">Register your agency</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-site section-y">
        <h2 className="display-section">What an agency gets</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {VALUE.map((item) => (
            <div key={item.title} className="card-warm p-5">
              <Users className="size-5 text-primary" />
              <h3 className="mt-3 text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-site section-y">
          <h2 className="display-section">Agency verification</h2>
          <p className="lead mt-3 max-w-2xl">
            Agencies complete their own checks before their tutors can be listed.
          </p>
          <ol className="mt-6 space-y-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))
              : agencySteps.map((step, index) => (
                  <li key={step.id} className="panel-portal flex items-start gap-4 p-5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-sm font-semibold text-secondary-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{step.name}</h3>
                      {step.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
          </ol>
          {!isLoading && agencySteps.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Agency verification steps are being finalised — register and our team will walk you
              through them.
            </p>
          ) : null}
        </div>
      </section>

      <section className="container-site section-y">
        <div className="card-warm flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <Building2 className="size-6 text-primary" />
            <h2 className="display-section mt-3">Register your agency</h2>
            <p className="lead mt-2 max-w-xl">
              Create an agency account, verify your organisation and start adding tutors.
            </p>
          </div>
          <Button asChild variant="cta" size="lg" className="shrink-0">
            <Link to="/auth">Create an agency account</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
