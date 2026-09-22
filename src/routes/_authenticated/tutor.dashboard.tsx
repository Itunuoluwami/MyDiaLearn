import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Inbox,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { TutorBookingCard } from "@/components/tutor/TutorBookingCard";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useEarningsSummary } from "@/lib/tutor-workspace";
import { formatMoney } from "@/lib/parent-data";
import {
  useRespondToBooking,
  useTutorBookings,
  useTutorRecord,
  useTutorSummary,
  useTutorTimezone,
} from "@/lib/tutor-data";

export const Route = createFileRoute("/_authenticated/tutor/dashboard")({
  head: () => ({
    meta: [
      { title: "Tutor dashboard — DiaLearn" },
      {
        name: "description",
        content:
          "Your teaching day at a glance: today's classes, lesson requests, students and verification status.",
      },
      { property: "og:title", content: "Tutor dashboard — DiaLearn" },
      {
        property: "og:description",
        content:
          "Teach with confidence: classes, requests, students and verification in one calm view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorDashboardPage,
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function TutorDashboardPage() {
  const { profile } = useAuth();
  const timezone = useTutorTimezone();
  const tutor = useTutorRecord();
  const summary = useTutorSummary();
  const bookings = useTutorBookings();
  const respond = useRespondToBooking();
  const earnings = useEarningsSummary();

  const s = summary.data;
  const firstName = (profile?.full_name ?? "").split(" ")[0];

  const requests = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (row) => row.status === "pending" && new Date(row.ends_at) > new Date(),
      ),
    [bookings.data],
  );

  const upcoming = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (row) =>
          new Date(row.ends_at) > new Date() && ["confirmed", "in_progress"].includes(row.status),
      ),
    [bookings.data],
  );

  async function handleRespond(bookingId: string, accept: boolean) {
    try {
      await respond.mutateAsync({ bookingId, accept });
      toast.success(accept ? "Lesson confirmed" : "Request declined");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(
        message.includes("BOOKING_OVERLAP")
          ? "That slot clashes with another confirmed class."
          : message.includes("BOOKING_NOT_PENDING")
            ? "This request was already handled."
            : "We couldn't update that request.",
      );
    }
  }

  const readiness = useMemo(() => {
    const t = tutor.data;
    if (!t) return 0;
    const checks = [
      Boolean(t.headline),
      Boolean(t.biography && t.biography.trim().length > 40),
      t.hourly_rate !== null,
      Boolean(s?.profile_complete),
      t.verification_status === "verified",
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [tutor.data, s?.profile_complete]);

  return (
    <TutorShell title="Dashboard">
      <div className="max-w-6xl space-y-6">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft md:p-7">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
              Educator workspace
            </p>
            <h2 className="display-section mt-2 text-2xl text-primary-foreground md:text-3xl">
              {greeting()}
              {firstName ? `, ${firstName}` : ""}
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/85 md:text-base">
              {Number(s?.classes_today ?? 0) > 0
                ? `You have ${s?.classes_today} ${Number(s?.classes_today) === 1 ? "class" : "classes"} today · ${timezone}`
                : `No classes scheduled today · times shown in ${timezone}`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/tutor/classes">
                  <CalendarDays className="size-4" /> Open my classes
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="min-h-11 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                <Link to="/tutor/availability">
                  <Clock3 className="size-4" /> Set availability
                </Link>
              </Button>
            </div>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-secondary/25 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-accent/20 blur-2xl"
          />
        </section>

        {/* KPI strip */}
        {summary.isLoading ? (
          <KpiSkeletonGrid count={4} />
        ) : summary.isError ? (
          <LoadError
            message="We couldn't load your teaching summary right now."
            onRetry={() => void summary.refetch()}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              variant="primary"
              label="Classes today"
              value={Number(s?.classes_today ?? 0)}
              hint={
                upcoming[0] ? `Next: ${upcoming[0].subject_name ?? "lesson"}` : "Nothing scheduled"
              }
              icon={CalendarCheck2}
            />
            <KpiCard
              label="Lesson requests"
              value={requests.length}
              hint={requests.length > 0 ? "Waiting on you" : "All caught up"}
              icon={Inbox}
            />
            <KpiCard label="Active students" value={Number(s?.active_students ?? 0)} icon={Users} />
            <KpiCard
              label="Lessons taught"
              value={Number(s?.completed_lessons ?? 0)}
              icon={CheckCircle2}
            />
          </div>
        )}

        {/* Earnings snapshot — figures come from the backend pricing rules */}
        <SectionCard
          title="Earnings snapshot"
          description="Balances after DiaLearn's commission and payment fees."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/tutor/earnings">Open earnings</Link>
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-primary-soft/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Available
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-primary-deep">
                {formatMoney(
                  Number(earnings.data?.available_balance ?? 0),
                  earnings.data?.currency ?? s?.currency ?? "USD",
                )}
              </p>
            </div>
            <div className="rounded-xl bg-surface/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pending
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {formatMoney(
                  Number(earnings.data?.pending_earnings ?? 0),
                  earnings.data?.currency ?? s?.currency ?? "USD",
                )}
              </p>
            </div>
            <div className="rounded-xl bg-surface/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Net earned
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {formatMoney(
                  Number(earnings.data?.net_earnings ?? 0),
                  earnings.data?.currency ?? s?.currency ?? "USD",
                )}
              </p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="size-3.5 text-primary" aria-hidden="true" />
            {earnings.data?.schedule_label ?? "Payouts follow the platform payout policy."}
          </p>
        </SectionCard>

        {/* Teaching readiness */}
        <SectionCard
          title="Teaching readiness"
          description="Everything families look for before they book you."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/tutor/profile">Open profile</Link>
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <Progress value={readiness} className="h-2 min-w-40 flex-1" />
            <span className="text-sm font-semibold tabular-nums">{readiness}%</span>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            <ReadyItem done={Boolean(tutor.data?.headline)} label="Profile headline" />
            <ReadyItem
              done={Boolean(tutor.data?.biography && tutor.data.biography.trim().length > 40)}
              label="Biography families can trust"
            />
            <ReadyItem done={tutor.data?.hourly_rate !== null} label="Hourly rate set" />
            <ReadyItem
              done={Boolean(s?.profile_complete)}
              label="Subjects and availability added"
            />
            <ReadyItem
              done={tutor.data?.verification_status === "verified"}
              label="Verified by the DiaLearn team"
              href="/tutor/verification"
            />
            <ReadyItem
              done={Boolean(tutor.data?.is_listed)}
              label="Listed in tutor search"
              href="/tutor/profile"
            />
          </ul>
        </SectionCard>

        {/* Requests */}
        {requests.length > 0 ? (
          <SectionCard
            title="Lesson requests"
            description="Families waiting for you to confirm. Accepting checks your calendar for clashes."
          >
            <div className="space-y-3">
              {requests.slice(0, 4).map((booking) => (
                <TutorBookingCard
                  key={booking.id}
                  booking={booking}
                  timezone={timezone}
                  onAccept={() => void handleRespond(booking.id, true)}
                  onDecline={() => void handleRespond(booking.id, false)}
                  busy={respond.isPending}
                />
              ))}
            </div>
            {requests.length > 4 ? (
              <Button asChild variant="ghost" size="sm" className="mt-3">
                <Link to="/tutor/classes">See all {requests.length} requests</Link>
              </Button>
            ) : null}
          </SectionCard>
        ) : null}

        {/* Upcoming */}
        <SectionCard
          title="Upcoming classes"
          description={`Times shown in your timezone · ${timezone}`}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/tutor/classes">Open calendar</Link>
            </Button>
          }
        >
          {bookings.isLoading ? (
            <CardSkeletonList rows={2} height="h-32" />
          ) : bookings.isError ? (
            <LoadError
              message="We couldn't load your classes right now."
              onRetry={() => void bookings.refetch()}
            />
          ) : upcoming.length === 0 ? (
            <EmptyPanel
              icon={GraduationCap}
              title="No classes scheduled yet"
              body={
                tutor.data?.verification_status === "verified"
                  ? "Add availability so families can book you — confirmed lessons will appear here."
                  : "Once you're verified and listed, confirmed lessons will appear here."
              }
              action={
                <Button asChild variant="cta" className="min-h-11">
                  <Link
                    to={
                      tutor.data?.verification_status === "verified"
                        ? "/tutor/availability"
                        : "/tutor/verification"
                    }
                  >
                    {tutor.data?.verification_status === "verified"
                      ? "Set availability"
                      : "Continue verification"}
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3">
              {upcoming.slice(0, 4).map((booking) => (
                <TutorBookingCard key={booking.id} booking={booking} timezone={timezone} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </TutorShell>
  );
}

function ReadyItem({ done, label, href }: { done: boolean; label: string; href?: string }) {
  const content = (
    <>
      <span
        className={
          done
            ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-success/12 text-success"
            : "flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
        }
      >
        {done ? <BadgeCheck className="size-4" /> : <ShieldCheck className="size-4" />}
      </span>
      <span className="min-w-0 text-sm">{label}</span>
    </>
  );

  return (
    <li>
      {href && !done ? (
        <Link
          to={href}
          className="focus-ring flex min-h-11 items-center gap-2.5 rounded-lg px-1 transition-colors hover:bg-surface"
        >
          {content}
        </Link>
      ) : (
        <span className="flex min-h-11 items-center gap-2.5 px-1">{content}</span>
      )}
    </li>
  );
}
