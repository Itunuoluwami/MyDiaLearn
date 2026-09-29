import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { AgencyShell } from "@/components/agency/AgencyShell";
import {
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { useAgencyDashboard, useAgencyTutors } from "@/lib/agency-data";
import { formatMoney } from "@/lib/parent-data";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agency/dashboard")({
  head: () => ({
    meta: [
      { title: "Agency dashboard — DiaLearn" },
      {
        name: "description",
        content: "Your tutoring team at a glance: tutors, verification, bookings and earnings.",
      },
    ],
  }),
  component: AgencyDashboardPage,
});

function AgencyDashboardPage() {
  const dashboard = useAgencyDashboard();
  const tutors = useAgencyTutors();
  const data = dashboard.data;
  const counts = data?.counts;
  const earnings = data?.earnings;
  const roster = (tutors.data ?? []).slice(0, 5);

  return (
    <AgencyShell
      title={data ? data.agency.name : "Agency dashboard"}
      description="Your tutors, their verification and your team's lessons and earnings."
      actions={
        <Button asChild variant="cta" className="min-h-11">
          <Link to="/agency/tutors">
            <UserPlus className="size-4" /> Add a tutor
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">
        {dashboard.isLoading ? (
          <KpiSkeletonGrid count={4} />
        ) : dashboard.isError ? (
          <LoadError
            message={(dashboard.error as Error).message || "We couldn't load your dashboard."}
            onRetry={() => void dashboard.refetch()}
          />
        ) : counts ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Tutors"
              value={counts.tutors_total}
              hint={`${counts.tutors_listed} visible to families`}
              icon={Users}
              variant="primary"
            />
            <KpiCard
              label="Verified"
              value={counts.tutors_verified}
              hint={`${counts.tutors_in_review} awaiting review`}
              icon={BadgeCheck}
            />
            <KpiCard
              label="Upcoming lessons"
              value={counts.upcoming_bookings}
              hint={`${counts.completed_lessons} completed`}
              icon={CalendarDays}
            />
            <KpiCard
              label="Agency balance"
              value={earnings ? formatMoney(earnings.availableBalance, earnings.currency) : "—"}
              {...(earnings
                ? { hint: `${Number(earnings.revenueSharePercentage)}% share of tutor earnings` }
                : {})}
              icon={Wallet}
            />
          </div>
        ) : null}

        <SectionCard
          title="Your tutors"
          description="Verification is done by DiaLearn. Tutors appear in search once they and your agency are verified."
          action={
            <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Link to="/agency/tutors">View all</Link>
            </Button>
          }
        >
          {tutors.isLoading ? (
            <KpiSkeletonGrid count={2} />
          ) : tutors.isError ? (
            <LoadError
              message="We couldn't load your tutors."
              onRetry={() => void tutors.refetch()}
            />
          ) : roster.length === 0 ? (
            <EmptyPanel
              icon={Users}
              title="No tutors yet"
              body="Add your first tutor. We'll email them a link to set their password, and you can complete their profile for them."
              action={
                <Button asChild variant="cta" className="min-h-11">
                  <Link to="/agency/tutors">
                    <UserPlus className="size-4" /> Add a tutor
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {roster.map((tutor) => (
                <li key={tutor.tutorId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/agency/tutors/$tutorId"
                      params={{ tutorId: tutor.tutorId }}
                      className="focus-ring truncate rounded font-medium hover:underline"
                    >
                      {tutor.fullName ?? tutor.email ?? "Tutor"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {tutor.lessonsCompleted} lessons ·{" "}
                      {formatMoney(tutor.grossAmount, tutor.currency)} billed
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      VERIFICATION_TONE[tutor.verificationStatus],
                    )}
                  >
                    {tutor.isListed ? "Listed" : VERIFICATION_LABEL[tutor.verificationStatus]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {data && data.agency.verificationStatus !== "verified" ? (
          <SectionCard title="Agency verification">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  DiaLearn checks your business registration and agency agreement before any of your
                  tutors are listed.
                </p>
              </div>
              <Button asChild variant="outline" className="min-h-11 shrink-0">
                <Link to="/agency/profile">
                  <CheckCircle2 className="size-4" /> Review agency details
                </Link>
              </Button>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AgencyShell>
  );
}
