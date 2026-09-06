import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlayCircle,
  Star,
  Zap,
} from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  useStudentRecord,
  useStudentBookings,
  useStudentAssignments,
  formatTimeInZone,
} from "@/lib/student-data";
import { isJoinable } from "@/lib/parent-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — DiaLearn Student Portal" },
      { name: "description", content: "See your upcoming classes, assignments due and latest tutor feedback." },
    ],
  }),
  component: StudentDashboardPage,
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StudentDashboardPage() {
  const { profile } = useAuth();
  const { data: student } = useStudentRecord();
  const bookings = useStudentBookings();
  const assignments = useStudentAssignments();

  const firstName = student?.first_name || (profile?.full_name ?? "").split(" ")[0];
  const tz = student?.timezone || "UTC";

  const upcoming = useMemo(
    () =>
      (bookings.data ?? [])
        .filter((b) => new Date(b.ends_at) > new Date() && ["confirmed", "in_progress"].includes(b.status))
        .slice(0, 3),
    [bookings.data],
  );

  const liveNow = useMemo(() => upcoming.find((b) => isJoinable(b)), [upcoming]);

  const dueAssignments = useMemo(
    () =>
      (assignments.data ?? [])
        .filter((a) => a.status === "assigned" || a.status === "pending")
        .slice(0, 3),
    [assignments.data],
  );

  const recentFeedback = useMemo(
    () =>
      (bookings.data ?? [])
        .filter((b) => b.status === "completed" && b.class_sessions?.[0]?.tutor_notes)
        .slice(0, 2),
    [bookings.data],
  );

  return (
    <StudentShell title={`${greeting()}${firstName ? `, ${firstName}` : ""}! 👋`} description="Here's what's happening with your learning today.">
      <div className="space-y-6 max-w-4xl">

        {/* Live Now Banner */}
        {liveNow && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-secondary p-5 text-white shadow-lg">
            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <PlayCircle className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80">Class is live now!</p>
                  <p className="text-xl font-extrabold">{(liveNow as typeof liveNow & { subjects?: { name: string } | null }).subjects?.name ?? "Your class"}</p>
                </div>
              </div>
              <Button asChild className="min-h-12 rounded-xl bg-white font-bold text-accent hover:bg-white/90">
                <Link to="/student/classroom/$bookingId" params={{ bookingId: liveNow.id }}>
                  Join Class Now
                </Link>
              </Button>
            </div>
            <span aria-hidden className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={CalendarCheck2} label="Upcoming Classes" value={upcoming.length} color="primary" />
          <StatCard icon={BookOpen} label="Tasks Due" value={dueAssignments.length} color="secondary" />
          <StatCard
            icon={CheckCircle2}
            label="Classes Completed"
            value={(bookings.data ?? []).filter((b) => b.status === "completed").length}
            color="success"
          />
          <StatCard
            icon={Star}
            label="Feedback Notes"
            value={recentFeedback.length}
            color="warning"
          />
        </div>

        {/* Upcoming Classes */}
        <SectionCard
          title="📅 Upcoming Classes"
          action={
            <Button asChild variant="ghost" size="sm" className="font-bold text-primary">
              <Link to="/student/history">View all</Link>
            </Button>
          }
        >
          {bookings.isLoading ? (
            <SkeletonList rows={2} />
          ) : upcoming.length === 0 ? (
            <EmptyState icon="🎓" message="No upcoming classes. Ask your parent to book one!" />
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => {
                const tutor = (booking as typeof booking & { tutors?: { profiles?: { full_name?: string; avatar_url?: string } | null } | null }).tutors;
                const tutorName = tutor?.profiles?.full_name ?? "Your Tutor";
                const subject = (booking as typeof booking & { subjects?: { name: string } | null }).subjects?.name ?? "Lesson";
                const joinable = isJoinable(booking);
                return (
                  <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                      📘
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{subject}</p>
                      <p className="text-sm text-muted-foreground">with {tutorName}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3.5" />
                        {formatTimeInZone(booking.starts_at, tz)}
                        {" · "}
                        {booking.duration_minutes} min
                      </p>
                    </div>
                    {joinable ? (
                      <Button asChild size="sm" className="min-h-10 rounded-xl bg-accent font-bold text-white hover:bg-accent/90">
                        <Link to="/student/classroom/$bookingId" params={{ bookingId: booking.id }}>
                          Join
                        </Link>
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="rounded-full text-xs font-bold">Soon</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Assignments Due */}
        <SectionCard
          title="📝 Assignments Due"
          action={
            <Button asChild variant="ghost" size="sm" className="font-bold text-primary">
              <Link to="/student/materials">View all</Link>
            </Button>
          }
        >
          {assignments.isLoading ? (
            <SkeletonList rows={2} />
          ) : dueAssignments.length === 0 ? (
            <EmptyState icon="✅" message="You're all caught up — no pending assignments!" />
          ) : (
            <div className="space-y-3">
              {dueAssignments.map((a) => {
                const overdue = a.due_at && new Date(a.due_at) < new Date();
                return (
                  <div key={a.id} className={cn("flex items-center gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md", overdue ? "border-destructive/40 bg-destructive/5" : "border-border bg-card")}>
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-2xl">
                      📋
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{(a as typeof a & { subjects?: { name: string } | null }).subjects?.name}</p>
                      {a.due_at && (
                        <p className={cn("mt-1 text-xs font-bold", overdue ? "text-destructive" : "text-muted-foreground")}>
                          {overdue ? "⚠️ Overdue — " : "Due: "}
                          {new Date(a.due_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline" className="min-h-10 rounded-xl font-bold">
                      <Link to="/student/materials">Submit</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Recent Tutor Feedback */}
        {recentFeedback.length > 0 && (
          <SectionCard title="💬 Latest Feedback from your Tutor">
            <div className="space-y-4">
              {recentFeedback.map((booking) => {
                const session = booking.class_sessions?.[0];
                return (
                  <div key={booking.id} className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-bold text-primary-deep">
                          {(booking as typeof booking & { subjects?: { name: string } | null }).subjects?.name ?? "Class"} · {new Date(booking.starts_at).toLocaleDateString()}
                        </p>
                        <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                          {session?.tutor_notes}
                        </p>
                        {session?.homework && (
                          <p className="mt-2 text-xs font-bold text-secondary-foreground">
                            📌 Homework: {session.homework}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Quick Actions */}
        <SectionCard title="⚡ Quick Actions">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickAction to="/student/find-tutor" emoji="🔍" label="Find a Tutor" />
            <QuickAction to="/student/materials" emoji="📚" label="Assignments" />
            <QuickAction to="/student/messages" emoji="💬" label="Message Tutor" />
            <QuickAction to="/student/history" emoji="📊" label="My Progress" />
          </div>
        </SectionCard>
      </div>
    </StudentShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "primary" | "secondary" | "success" | "warning";
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/15 text-secondary-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className={cn("flex size-10 items-center justify-center rounded-xl", colorMap[color])}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold tabular-nums text-foreground">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}

function SkeletonList({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

function QuickAction({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link
      to={to}
      className="focus-ring flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-xs font-bold text-foreground">{label}</span>
    </Link>
  );
}
