import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  Plus,
  Receipt,
  Search,
  Timer,
  Users,
  Wallet,
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
  formatHoursFromMinutes,
  formatMoney,
  formatRelative,
  useBookings,
  useChildren,
  useNotifications,
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
  const notifications = useNotifications();
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

  const unread = (notifications.data ?? []).filter((row) => !row.read_at).slice(0, 4);
  const s = summary.data;
  const firstName = (profile?.full_name ?? "").split(" ")[0];

  return (
    <ParentShell
      title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
      description={
        kids.length === 0
          ? "Start by adding a learner — then we can help you find the right tutor."
          : `Here's what's happening across ${kids.length} ${kids.length === 1 ? "learner" : "learners"} today.`
      }
      actions={
        <>
          <Button asChild variant="cta" className="min-h-11">
            <Link to="/find-tutor">
              <Search className="size-4" /> Find a tutor
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/children">
              <Plus className="size-4" /> Add child
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
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

        {/* KPIs — two primary, the rest secondary */}
        {summary.isLoading ? (
          <KpiSkeletonGrid count={4} />
        ) : summary.isError ? (
          <LoadError
            message="We couldn't load your family summary right now."
            onRetry={() => void summary.refetch()}
          />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KpiCard
                variant="primary"
                label="Upcoming classes"
                value={Number(s?.upcoming_classes ?? 0)}
                hint={upcoming[0] ? `Next: ${upcoming[0].subjects?.name ?? "lesson"}` : "Nothing scheduled"}
                icon={CalendarDays}
              />
              <KpiCard
                variant="primary"
                label="Active students"
                value={Number(s?.active_students ?? 0)}
                hint="Learners on your account"
                icon={Users}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <KpiCard label="Active tutors" value={Number(s?.active_tutors ?? 0)} icon={GraduationCap} />
              <KpiCard label="Completed lessons" value={Number(s?.completed_lessons ?? 0)} icon={CheckCircle2} />
              <KpiCard
                label="Learning hours"
                value={formatHoursFromMinutes(Number(s?.learning_minutes ?? 0))}
                icon={Timer}
              />
              <KpiCard
                label="This month"
                value={formatMoney(s?.month_spend ?? 0, s?.month_spend_currency ?? profile?.preferred_currency)}
                hint="Spending"
                icon={Wallet}
              />
              <KpiCard
                label="Outstanding"
                value={formatMoney(s?.outstanding_amount ?? 0, s?.outstanding_currency ?? profile?.preferred_currency)}
                hint={`${Number(s?.outstanding_count ?? 0)} payment(s)`}
                icon={CreditCard}
              />
            </div>
            {s?.attendance_rate != null ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Attendance rate across recorded classes: {Number(s.attendance_rate)}%
              </p>
            ) : null}
          </div>
        )}

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
            <div className="grid gap-3 xl:grid-cols-2">
              {upcoming.slice(0, 4).map((booking) => (
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

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Notifications preview — content comes from the template system */}
          <SectionCard
            title="Recent updates"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/notifications">View all</Link>
              </Button>
            }
          >
            {notifications.isLoading ? (
              <CardSkeletonList rows={3} height="h-14" />
            ) : unread.length === 0 ? (
              <EmptyPanel
                icon={Bell}
                title="You're all caught up"
                body="Booking, class and payment updates will appear here."
              />
            ) : (
              <ul className="space-y-2">
                {unread.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface/50 p-3"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title ?? item.trigger_key}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                      <p className="mt-1 text-[0.7rem] text-muted-foreground">
                        {formatRelative(item.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
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
