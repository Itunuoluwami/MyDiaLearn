import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BadgePercent,
  CalendarClock,
  GraduationCap,
  Percent,
  Repeat,
  ShieldAlert,
  Star,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminSummary } from "@/lib/admin-data";
import { formatMoney } from "@/lib/parent-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — DiaLearn" },
      {
        name: "description",
        content: "Platform-wide growth, marketplace and quality KPIs for the DiaLearn admin team.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function pct(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

function num(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat().format(value);
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "secondary" | "success" | "warning" | "destructive";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/15 text-secondary-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", toneMap[tone])}>
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {hint ? <p className="mt-0.5 text-[0.7rem] text-muted-foreground/80">{hint}</p> : null}
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function AdminDashboardPage() {
  const { hasPermission, loading } = useAuth();
  const summary = useAdminSummary();
  const s = summary.data;

  if (loading || summary.isLoading) {
    return (
      <AdminShell title="Admin dashboard">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.users") && !hasPermission("admin.settings")) {
    return (
      <AdminShell title="Admin dashboard">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include admin dashboard permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Admin dashboard"
      description="Platform-wide figures across every portal — refreshed live from the database, trailing 30 days where noted."
    >
      <Section title="Growth" description="New signups and marketplace liquidity in the last 30 days.">
        <StatCard icon={UserPlus} label="New students" value={num(s?.new_students)} hint="Last 30 days" />
        <StatCard icon={UserPlus} label="New parents" value={num(s?.new_parents)} hint="Last 30 days" />
        <StatCard icon={GraduationCap} label="New tutors" value={num(s?.new_tutors)} hint="Last 30 days" />
        <StatCard
          icon={Percent}
          label="Tutor activation rate"
          value={pct(s?.tutor_activation_rate)}
          hint="Verified & listed / all tutors"
        />
        <StatCard icon={Activity} label="Monthly active users" value={num(s?.mau)} hint="Last 30 days" />
        <StatCard icon={CalendarClock} label="Booking demand" value={num(s?.booking_demand)} hint="Bookings, last 30 days" />
      </Section>

      <Section title="Marketplace" description="Revenue and engagement across all completed and in-flight bookings.">
        <StatCard icon={Wallet} label="GMV" value={formatMoney(s?.gmv, s?.gmv_currency)} tone="success" />
        <StatCard
          icon={BadgePercent}
          label="Commission revenue"
          value={formatMoney(s?.commission_revenue, s?.gmv_currency)}
          tone="success"
        />
        <StatCard icon={TrendingUp} label="Avg transaction value" value={formatMoney(s?.avg_transaction_value, s?.gmv_currency)} />
        <StatCard icon={Users} label="Classes per student" value={s?.classes_per_student != null ? String(s.classes_per_student) : "—"} />
        <StatCard icon={Repeat} label="Repeat booking rate" value={pct(s?.repeat_booking_rate)} hint="Students with 2+ completed classes" />
      </Section>

      <Section title="Quality & trust" description="Signals that matter for marketplace health.">
        <StatCard icon={Star} label="Avg tutor rating" value={s?.avg_tutor_rating != null ? String(s.avg_tutor_rating) : "—"} tone="warning" />
        <StatCard icon={TrendingDown} label="Cancellation rate" value={pct(s?.cancellation_rate)} tone="destructive" />
        <StatCard icon={XCircle} label="No-show rate" value={pct(s?.no_show_rate)} tone="destructive" />
        <StatCard
          icon={AlertTriangle}
          label="Dispute rate"
          value="—"
          hint="Available once dispute tracking ships"
          tone="secondary"
        />
      </Section>
    </AdminShell>
  );
}
