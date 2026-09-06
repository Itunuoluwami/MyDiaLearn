import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  useAdminBookings,
  useAdminPayments,
  useAdminReportSummary,
  useAdminUsers,
} from "@/lib/admin-data";
import { formatMoney } from "@/lib/parent-data";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — DiaLearn admin" },
      { name: "description", content: "Growth, revenue, engagement and quality figures for a chosen date range, exportable as CSV." },
    ],
  }),
  component: AdminReportsPage,
});

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function AdminReportsPage() {
  const { hasPermission, loading } = useAuth();
  const today = useMemo(() => new Date(), []);
  const monthAgo = useMemo(() => new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), [today]);

  const [fromDate, setFromDate] = useState(isoDate(monthAgo));
  const [toDate, setToDate] = useState(isoDate(today));

  const fromIso = `${fromDate}T00:00:00.000Z`;
  const toIso = `${toDate}T23:59:59.999Z`;

  const summary = useAdminReportSummary(fromIso, toIso);
  const bookings = useAdminBookings({ from: fromIso, to: toIso });
  const payments = useAdminPayments({ from: fromIso, to: toIso });
  const users = useAdminUsers({ from: fromIso, to: toIso });

  if (loading) {
    return (
      <AdminShell title="Reports">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.settings") && !hasPermission("admin.users")) {
    return (
      <AdminShell title="Reports">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your account type doesn't include reporting permissions.</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  const s = summary.data;

  function exportBookings() {
    const rows = bookings.data ?? [];
    const csv = toCsv(
      rows.map((b) => ({
        starts_at: b.starts_at,
        status: b.status,
        student: `${b.students?.first_name ?? ""} ${b.students?.last_name ?? ""}`.trim(),
        tutor: b.tutors?.profiles?.full_name ?? "",
        subject: b.subjects?.name ?? "",
        amount: b.total_amount,
        currency: b.currency,
      })),
      [
        { key: "starts_at", label: "Starts at" },
        { key: "status", label: "Status" },
        { key: "student", label: "Student" },
        { key: "tutor", label: "Tutor" },
        { key: "subject", label: "Subject" },
        { key: "amount", label: "Amount" },
        { key: "currency", label: "Currency" },
      ],
    );
    downloadCsv(`bookings_${fromDate}_to_${toDate}.csv`, csv);
  }

  function exportPayments() {
    const rows = payments.data ?? [];
    const csv = toCsv(
      rows.map((p) => ({
        created_at: p.created_at,
        status: p.status,
        amount: p.amount,
        refunded_amount: p.refunded_amount,
        currency: p.currency,
        provider: p.provider ?? "",
      })),
      [
        { key: "created_at", label: "Created at" },
        { key: "status", label: "Status" },
        { key: "amount", label: "Amount" },
        { key: "refunded_amount", label: "Refunded" },
        { key: "currency", label: "Currency" },
        { key: "provider", label: "Provider" },
      ],
    );
    downloadCsv(`payments_${fromDate}_to_${toDate}.csv`, csv);
  }

  function exportUsers() {
    const rows = users.data ?? [];
    const csv = toCsv(
      rows.map((u) => ({
        full_name: u.full_name ?? "",
        email: u.email ?? "",
        primary_role: u.primary_role,
        is_active: u.is_active,
        created_at: u.created_at,
      })),
      [
        { key: "full_name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "primary_role", label: "Role" },
        { key: "is_active", label: "Active" },
        { key: "created_at", label: "Joined" },
      ],
    );
    downloadCsv(`new_users_${fromDate}_to_${toDate}.csv`, csv);
  }

  return (
    <AdminShell
      title="Reports"
      description="Growth, revenue, engagement and quality for a chosen window — export any table below as CSV."
    >
      <div className="panel-portal p-4 md:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="report-from">From</Label>
            <Input id="report-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} max={toDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-to">To</Label>
            <Input id="report-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate} />
          </div>
        </div>

        {summary.isLoading || !s ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className={cn("mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4")}>
              <StatTile label="New students" value={String(s.new_students ?? 0)} />
              <StatTile label="New parents" value={String(s.new_parents ?? 0)} />
              <StatTile label="New tutors" value={String(s.new_tutors ?? 0)} />
              <StatTile label="Active users" value={String(s.active_users ?? 0)} />
              <StatTile label="Bookings" value={String(s.bookings_count ?? 0)} />
              <StatTile label="Completed" value={String(s.completed_count ?? 0)} />
              <StatTile label="Cancelled" value={String(s.cancelled_count ?? 0)} />
              <StatTile label="No-shows" value={String(s.no_show_count ?? 0)} />
              <StatTile label="GMV" value={formatMoney(s.gmv, s.gmv_currency)} />
              <StatTile label="Commission revenue" value={formatMoney(s.commission_revenue, s.gmv_currency)} />
              <StatTile label="Avg transaction" value={formatMoney(s.avg_transaction_value, s.gmv_currency)} />
              <StatTile label="Avg tutor rating" value={s.avg_tutor_rating != null ? String(s.avg_tutor_rating) : "—"} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportBookings} disabled={bookings.isLoading}>
                <Download className="size-4" />
                Export bookings CSV
              </Button>
              <Button variant="outline" onClick={exportPayments} disabled={payments.isLoading}>
                <Download className="size-4" />
                Export payments CSV
              </Button>
              <Button variant="outline" onClick={exportUsers} disabled={users.isLoading}>
                <Download className="size-4" />
                Export new users CSV
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
