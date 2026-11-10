import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Receipt } from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
  PaymentStatusBadge,
  SectionCard,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import {
  formatDayInZone,
  formatMoney,
  useBookings,
  usePayments,
  useViewerTimezone,
  type Payment,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payments — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Every lesson charge and refund on your family account, with what each one paid for.",
      },
      { property: "og:title", content: "Payments — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "Every lesson charge and refund on your family account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentsPage,
});

/** Money only adds up within one currency, so totals are kept per currency. */
function totalsByCurrency(payments: Payment[], predicate: (p: Payment) => boolean) {
  const totals = new Map<string, number>();
  for (const payment of payments.filter(predicate)) {
    totals.set(payment.currency, (totals.get(payment.currency) ?? 0) + payment.amount);
  }
  return [...totals.entries()];
}

function formatTotals(totals: [string, number][]) {
  if (totals.length === 0) return formatMoney(0, "USD");
  return totals.map(([currency, amount]) => formatMoney(amount, currency)).join(" · ");
}

function PaymentsPage() {
  const timezone = useViewerTimezone();
  const payments = usePayments();
  const bookings = useBookings();

  // What each payment bought. The API returns the booking id but not the
  // lesson, so the family's bookings are the lookup.
  const bookingById = useMemo(
    () => new Map((bookings.data ?? []).map((booking) => [booking.id, booking])),
    [bookings.data],
  );

  const rows = useMemo(
    () =>
      [...(payments.data ?? [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [payments.data],
  );

  const paidTotals = totalsByCurrency(rows, (p) => p.status === "paid");
  const refundedTotals = totalsByCurrency(
    rows.filter((p) => p.refunded_amount > 0),
    () => true,
  );

  return (
    <ParentShell
      title="Payments"
      description="Every charge and refund on your family account, newest first."
    >
      {payments.isLoading ? (
        <KpiSkeletonGrid count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Paid" value={formatTotals(paidTotals)} icon={CreditCard} />
          <KpiCard label="Payments" value={String(rows.length)} icon={Receipt} />
          <KpiCard label="Refunded" value={formatTotals(refundedTotals)} icon={Receipt} />
        </div>
      )}

      <SectionCard
        title="Payment history"
        description="Charges are taken per lesson. Refunds follow the cancellation policy on the booking."
      >
        {payments.isLoading ? (
          <CardSkeletonList rows={3} height="h-20" />
        ) : payments.isError ? (
          <LoadError
            message="We couldn't load your payments right now."
            onRetry={() => void payments.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyPanel
            icon={CreditCard}
            title="No payments yet"
            body="Once you book a lesson and pay for it, the charge appears here."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/find-tutor">Find a tutor</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((payment) => {
              const booking = bookingById.get(payment.booking_id);
              return (
                <li key={payment.id} className="flex flex-wrap items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {booking?.subjects?.name ?? "Lesson"}
                      {booking ? ` · ${booking.duration_minutes} min` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.paid_at
                        ? `Paid ${formatDayInZone(payment.paid_at, timezone)}`
                        : `Created ${formatDayInZone(payment.created_at, timezone)}`}
                      {payment.refunded_amount > 0
                        ? ` · ${formatMoney(payment.refunded_amount, payment.currency)} refunded`
                        : ""}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(payment.amount, payment.currency)}
                  </span>
                  <PaymentStatusBadge status={payment.status} />
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </ParentShell>
  );
}
