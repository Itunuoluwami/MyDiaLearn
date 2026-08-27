import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  GraduationCap,
  Plus,
  Receipt,
  Search,
  Users,
} from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { ClassCard } from "@/components/parent/ClassCard";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  childName,
  useBookings,
  useChildren,
  useParentSummary,
  useTutorCards,
  useViewerTimezone,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Parent dashboard — DiaLearn" },
      {
        name: "description",
        content:
          "See every child's upcoming classes, learning hours, tutors, payments and approvals in one calm family view.",
      },
      { property: "og:title", content: "Parent dashboard — DiaLearn" },
      {
        property: "og:description",
        content: "Your family's education command centre: classes, tutors, progress and payments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const { profile } = useAuth();
  const timezone = useViewerTimezone();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const children = useChildren();
  const summary = useParentSummary();
  const bookings = useBookings(selectedChild ? { studentId: selectedChild } : undefined);
  const tutorIds = useMemo(() => (bookings.data ?? []).map((row) => row.tutor_id), [bookings.data]);
  const tutors = useTutorCards(tutorIds);

  const kids = children.data ?? [];
  const childById = useMemo(() => new Map(kids.map((child) => [child.id, child])), [kids]);

  const upcoming = useMemo(
    () =>
      (bookings.data ?? [])
        .filter(
          (row) =>
            new Date(row.ends_at).getTime() > Date.now() &&
            ["pending", "confirmed", "in_progress"].includes(row.status),
        )
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [bookings.data],
  );

  const approvals = useMemo(
    () => (bookings.data ?? []).filter((row) => row.status === "pending"),
    [bookings.data],
  );

  const s = summary.data;
  const firstName = (profile?.full_name ?? "").split(" ")[0];

  return (
    <ParentShell title="Dashboard">
      <div className="max-w-6xl space-y-6">
        {/* ---------------- main column ---------------- */}
        <div className="min-w-0 space-y-6">
          {/* Welcome banner */}
          <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft md:p-7">
            <div className="relative z-10 max-w-xl">
              <h2 className="display-section text-2xl text-primary-foreground md:text-3xl">
                {greeting()}
                {firstName ? `, ${firstName}` : ""}
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/85 md:text-base">
                {kids.length === 0
                  ? "Start by adding a learner — then we can help you find the right tutor."
                  : `Here's what's happening across ${kids.length} ${kids.length === 1 ? "learner" : "learners"} today.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="cta" className="min-h-11">
                  <Link to="/find-tutor">
                    <Search className="size-4" /> Find a tutor
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="min-h-11 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <Link to="/children">
                    <Plus className="size-4" /> Add child
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
              message="We couldn't load your family summary right now."
              onRetry={() => void summary.refetch()}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                variant="primary"
                label="Upcoming classes"
                value={Number(s?.upcoming_classes ?? 0)}
                hint={upcoming[0] ? `Next: ${upcoming[0].subjects?.name ?? "lesson"}` : "Nothing scheduled"}
                icon={CalendarDays}
              />
              <KpiCard
                label="Active students"
                value={Number(s?.active_students ?? 0)}
                hint="On your account"
                icon={Users}
              />
              <KpiCard label="Active tutors" value={Number(s?.active_tutors ?? 0)} icon={GraduationCap} />
              <KpiCard
                label="Completed lessons"
                value={Number(s?.completed_lessons ?? 0)}
                icon={CheckCircle2}
              />
            </div>
          )}

          {/* Children */}
          <SectionCard
            title="My children"
            description="Switch a child to focus every section below on them."
            action={
              kids.length > 0 ? (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/children">Manage</Link>
                </Button>
              ) : null
            }
          >
            {children.isLoading ? (
              <CardSkeletonList rows={1} height="h-14" />
            ) : children.isError ? (
              <LoadError
                message="We couldn't load your children right now."
                onRetry={() => void children.refetch()}
              />
            ) : (
              <ChildSwitcher children={kids} selectedId={selectedChild} onSelect={setSelectedChild} />
            )}
          </SectionCard>

          {/* Approvals — only shown when something actually needs the parent */}
          {approvals.length > 0 ? (
            <SectionCard
              title="Needs your approval"
              description="Requests waiting on you before a lesson is confirmed."
            >
              <div className="space-y-3">
                {approvals.slice(0, 3).map((booking) => (
                  <ClassCard
                    key={booking.id}
                    booking={booking}
                    child={childById.get(booking.student_id)}
                    tutor={tutors.map.get(booking.tutor_id)}
                    viewerTimezone={timezone}
                  />
                ))}
              </div>
              {approvals.length > 3 ? (
                <Button asChild variant="ghost" size="sm" className="mt-3">
                  <Link to="/bookings">See all {approvals.length} requests</Link>
                </Button>
              ) : null}
            </SectionCard>
          ) : null}

          {/* Upcoming classes */}
          <SectionCard
            title="Upcoming classes"
            description={`Times shown in your timezone · ${timezone}`}
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/bookings">Open calendar</Link>
              </Button>
            }
          >
            {bookings.isLoading ? (
              <CardSkeletonList rows={2} height="h-36" />
            ) : bookings.isError ? (
              <LoadError
                message="We couldn't load your classes right now."
                onRetry={() => void bookings.refetch()}
              />
            ) : upcoming.length === 0 ? (
              <EmptyPanel
                icon={CalendarPlus}
                title="No upcoming classes"
                body="Your scheduled lessons will appear here as soon as a booking is confirmed."
                action={
                  <Button asChild variant="cta" className="min-h-11">
                    <Link to="/find-tutor">Find a tutor</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3">
                {upcoming.slice(0, 3).map((booking) => (
                  <ClassCard
                    key={booking.id}
                    booking={booking}
                    child={childById.get(booking.student_id)}
                    tutor={tutors.map.get(booking.tutor_id)}
                    viewerTimezone={timezone}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Quick actions relevant to current state */}
          <SectionCard title="Quick actions">
            <div className="grid gap-3 sm:grid-cols-2">
              {kids.length === 0 ? (
                <QuickAction to="/children" icon={Plus} label="Add child" hint="Start a learner profile" />
              ) : (
                <QuickAction to="/find-tutor" icon={Search} label="Find a tutor" hint="Search the marketplace" />
              )}
              <QuickAction to="/bookings" icon={CalendarDays} label="View calendar" hint="All classes" />
              <QuickAction to="/payments" icon={Receipt} label="View payments" hint="History & receipts" />
              <QuickAction to="/progress" icon={Clock} label="Learning progress" hint="Per child" />
            </div>
            {kids.length > 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Booking for{" "}
                {kids
                  .slice(0, 3)
                  .map((child) => childName(child))
                  .join(", ")}
                {kids.length > 3 ? ` +${kids.length - 3} more` : ""}
              </p>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </ParentShell>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="focus-ring group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:shadow-lift"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}
