import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import {
  formatDayInZone,
  formatMoney,
  useBookings,
  useChildren,
  usePayments,
  useTutorCards,
  useViewerTimezone,
  type Booking,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "A month-by-month summary of your family's lessons and spend, with a CSV you can download.",
      },
      { property: "og:title", content: "Reports — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "A month-by-month summary of lessons and spend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

interface MonthRow {
  key: string;
  label: string;
  lessons: number;
  completed: number;
  cancelled: number;
  minutes: number;
  spendByCurrency: Map<string, number>;
}

const MONTH = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function buildMonths(
  bookings: Booking[],
  paidByBooking: Map<string, { amount: number; currency: string }>,
): MonthRow[] {
  const months = new Map<string, MonthRow>();

  for (const booking of bookings) {
    const key = monthKey(booking.starts_at);
    const row =
      months.get(key) ??
      ({
        key,
        label: MONTH.format(new Date(booking.starts_at)),
        lessons: 0,
        completed: 0,
        cancelled: 0,
        minutes: 0,
        spendByCurrency: new Map<string, number>(),
      } satisfies MonthRow);

    row.lessons += 1;
    if (booking.status === "completed") {
      row.completed += 1;
      row.minutes += booking.duration_minutes;
    }
    if (booking.status === "cancelled") row.cancelled += 1;

    // Spend is what was actually charged, not what the lesson was quoted at —
    // a cancelled lesson may have been refunded, and an unpaid one cost
    // nothing yet.
    const payment = paidByBooking.get(booking.id);
    if (payment) {
      row.spendByCurrency.set(
        payment.currency,
        (row.spendByCurrency.get(payment.currency) ?? 0) + payment.amount,
      );
    }

    months.set(key, row);
  }

  return [...months.values()].sort((a, b) => b.key.localeCompare(a.key));
}

function formatSpend(spend: Map<string, number>): string {
  if (spend.size === 0) return "—";
  return [...spend.entries()]
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" · ");
}

function toCsv(rows: MonthRow[]): string {
  const header = ["Month", "Lessons", "Completed", "Cancelled", "Minutes taught", "Spend"];
  const body = rows.map((row) => [
    row.label,
    String(row.lessons),
    String(row.completed),
    String(row.cancelled),
    String(row.minutes),
    formatSpend(row.spendByCurrency).replace(/,/g, ""),
  ]);
  return [header, ...body].map((cells) => cells.map((c) => `"${c}"`).join(",")).join("\n");
}

function ReportsPage() {
  const timezone = useViewerTimezone();
  const children = useChildren();
  const [childId, setChildId] = useState<string | null>(null);
  const bookings = useBookings(childId ? { studentId: childId } : undefined);
  const payments = usePayments();

  const paidByBooking = useMemo(() => {
    const map = new Map<string, { amount: number; currency: string }>();
    for (const payment of payments.data ?? []) {
      if (payment.status !== "paid") continue;
      const net = payment.amount - payment.refunded_amount;
      map.set(payment.booking_id, { amount: net, currency: payment.currency });
    }
    return map;
  }, [payments.data]);

  const rows = useMemo(
    () => buildMonths(bookings.data ?? [], paidByBooking),
    [bookings.data, paidByBooking],
  );

  const tutors = useTutorCards((bookings.data ?? []).map((booking) => booking.tutor_id));

  function handleDownload() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dialearn-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const loading = bookings.isLoading || payments.isLoading;

  return (
    <ParentShell
      title="Reports"
      description="A month-by-month view of your family's lessons and what they cost."
      actions={
        rows.length > 0 ? (
          <Button variant="outline" className="min-h-11" onClick={handleDownload}>
            <Download className="size-4" /> Download CSV
          </Button>
        ) : undefined
      }
    >
      <SectionCard
        title="By month"
        description="Spend counts what was actually charged, less anything refunded."
      >
        {loading ? (
          <CardSkeletonList rows={3} height="h-16" />
        ) : bookings.isError ? (
          <LoadError
            message="We couldn't build your report right now."
            onRetry={() => void bookings.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyPanel
            icon={BarChart3}
            title="Nothing to report yet"
            body="Once your family has lessons, this page summarises them month by month and lets you download the figures."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/find-tutor">Find a tutor</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Month
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    Lessons
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    Completed
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    Cancelled
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    Taught
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Spend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className="py-3 pr-4 text-left font-semibold">
                      {row.label}
                    </th>
                    <td className="py-3 pr-4 text-right tabular-nums">{row.lessons}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{row.completed}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{row.cancelled}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {Math.round(row.minutes / 60)}h
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {formatSpend(row.spendByCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Recent lessons"
        description="The last ten lessons across your family, newest first."
      >
        {loading ? (
          <CardSkeletonList rows={3} height="h-14" />
        ) : (bookings.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {[...(bookings.data ?? [])]
              .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
              .slice(0, 10)
              .map((booking) => (
                <li key={booking.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {booking.subjects?.name ?? "Lesson"} ·{" "}
                      {tutors.map.get(booking.tutor_id)?.full_name ?? "Tutor"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDayInZone(booking.starts_at, timezone)} · {booking.duration_minutes}{" "}
                      min
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatMoney(booking.total_amount, booking.currency)}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </SectionCard>
    </ParentShell>
  );
}
