import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Receipt, ShieldCheck } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancellationPolicies, useCommissionExample } from "@/lib/public-data";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "How payment works on DiaLearn" },
      {
        name: "description",
        content:
          "Lesson prices come from the tutor's hourly rate and the lesson length. See how DiaLearn's commission, platform fee and refund windows work.",
      },
      { property: "og:title", content: "How payment works on DiaLearn" },
      {
        property: "og:description",
        content: "Tutor rate times lesson length, plus a transparent platform fee. No packages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { data: rules, isLoading } = useCommissionExample();
  const { data: policies } = useCancellationPolicies();

  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-16">
          <p className="eyebrow">Pricing</p>
          <h1 className="display-hero mt-3 max-w-3xl">No packages. You pay per lesson.</h1>
          <p className="lead mt-4 max-w-2xl">
            Each tutor sets their own hourly rate. The price of a lesson is simply that rate applied
            to the length of the lesson you book.
          </p>
        </div>
      </section>

      <section className="container-site section-y">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-warm p-5">
            <Calculator className="size-5 text-primary" />
            <h2 className="mt-3 text-lg">Lesson price</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tutor's hourly rate × lesson length. A shorter lesson costs proportionally less — there
              is no minimum bundle.
            </p>
          </div>
          <div className="card-warm p-5">
            <Receipt className="size-5 text-primary" />
            <h2 className="mt-3 text-lg">DiaLearn's share</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A commission and platform fee are deducted from the lesson total before the tutor is
              paid. The applicable terms are shown below.
            </p>
          </div>
          <div className="card-warm p-5">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="mt-3 text-lg">Held until delivered</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Payment is held after booking and released to the tutor once the lesson has taken
              place.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-site section-y">
          <h2 className="display-section">Current commission terms</h2>
          <p className="lead mt-3 max-w-2xl">
            These figures are read live from DiaLearn's fee configuration, so this page is always
            accurate.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 rounded-2xl" />
                ))
              : (rules ?? []).map((rule) => (
                  <div key={rule.name} className="panel-portal p-5">
                    <h3 className="text-base font-semibold">{rule.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">
                      Applies to {rule.applies_to} · {rule.model} model
                    </p>
                    <dl className="mt-4 space-y-2 text-sm">
                      {rule.model === "percentage" && rule.percentage !== null ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">Commission</dt>
                          <dd className="font-medium">{rule.percentage}% of the lesson total</dd>
                        </div>
                      ) : null}
                      {rule.model === "fixed" && rule.fixed_amount !== null ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">Commission</dt>
                          <dd className="font-medium">
                            {rule.fixed_amount} {rule.currency ?? ""} per lesson
                          </dd>
                        </div>
                      ) : null}
                      {rule.model === "tiered" ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">Commission</dt>
                          <dd className="font-medium">Tiered by monthly volume</dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Platform fee</dt>
                        <dd className="font-medium">
                          {rule.platform_fee_percentage}%
                          {Number(rule.platform_fee_fixed) > 0
                            ? ` + ${rule.platform_fee_fixed} ${rule.currency ?? ""}`
                            : ""}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
          </div>
          {!isLoading && (rules ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Fee terms are being published. Contact us and we will share the current structure.
            </p>
          ) : null}
        </div>
      </section>

      {(policies ?? []).length > 0 ? (
        <section className="container-site section-y">
          <h2 className="display-section">Cancellations and refunds</h2>
          <p className="lead mt-3 max-w-2xl">
            How much is refunded depends on how much notice is given before the lesson.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-semibold">Policy</th>
                  <th className="py-3 pr-4 font-semibold">Notice given</th>
                  <th className="py-3 font-semibold">Refunded</th>
                </tr>
              </thead>
              <tbody>
                {(policies ?? []).map((policy) => (
                  <tr key={policy.name} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4">
                      {policy.name}
                      {policy.is_default ? (
                        <span className="ml-2 text-xs text-muted-foreground">default</span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {policy.hours_before}+ hours before
                    </td>
                    <td className="py-3 font-medium">{policy.refund_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="container-site section-y text-center">
        <h2 className="display-section">See real tutor rates</h2>
        <p className="lead mx-auto mt-3 max-w-xl">
          Rates vary by subject, experience and country. Browse tutors to compare.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="cta" size="lg">
            <Link to="/tutors">Browse tutors</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/trust-and-safety">Trust & safety</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
