import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BanknoteIcon, Coins, PiggyBank, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney, formatRelative } from "@/lib/parent-data";
import {
  PAYOUT_LABEL,
  PAYOUT_TONE,
  useEarningsRecords,
  useEarningsSummary,
  usePayouts,
  useRequestPayout,
} from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings & payouts — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Track your available balance, pending earnings, platform commission per lesson and request payouts in your settlement currency.",
      },
      { property: "og:title", content: "Earnings & payouts — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Every lesson's gross, commission and net amount, plus payout history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorEarningsPage,
});

function TutorEarningsPage() {
  const summary = useEarningsSummary();
  const records = useEarningsRecords();
  const payouts = usePayouts();
  const requestPayout = useRequestPayout();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  const totals = summary.data;
  const currency = totals?.currency ?? "USD";
  const available = Number(totals?.available_balance ?? 0);
  const minimum = Number(totals?.minimum_payout ?? 0);
  const eligible = available > 0 && available >= minimum;

  async function handleRequest() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    try {
      await requestPayout.mutateAsync(value);
      setOpen(false);
      setAmount("");
      toast.success("Payout requested");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("BELOW_MINIMUM")
          ? `Payouts start at ${formatMoney(minimum, currency)}.`
          : message.includes("INSUFFICIENT_BALANCE")
            ? "That's more than your available balance."
            : "We couldn't request that payout.",
      );
    }
  }

  return (
    <TutorShell
      title="Earnings"
      description={
        totals?.schedule_label
          ? `${totals.schedule_label} · figures come from your confirmed lessons`
          : "Balances, commission and payouts from your confirmed lessons"
      }
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" className="min-h-11 sm:min-h-10" disabled={!eligible}>
              <Wallet className="size-4" /> Request payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a payout</DialogTitle>
              <DialogDescription>
                Available now: {formatMoney(available, currency)}. Minimum payout{" "}
                {formatMoney(minimum, currency)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="payout-amount">Amount ({currency})</Label>
              <Input
                id="payout-amount"
                inputMode="decimal"
                className="min-h-11"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={String(available)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="cta"
                className="min-h-11 sm:min-h-10"
                disabled={requestPayout.isPending}
                onClick={() => void handleRequest()}
              >
                {requestPayout.isPending ? "Requesting…" : "Request payout"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="max-w-5xl space-y-5">
        {summary.isLoading ? (
          <KpiSkeletonGrid />
        ) : summary.isError ? (
          <LoadError
            message="We couldn't load your earnings right now."
            onRetry={() => void summary.refetch()}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                label="Available"
                value={formatMoney(available, currency)}
                hint={eligible ? "Ready to withdraw" : `Minimum ${formatMoney(minimum, currency)}`}
                icon={Wallet}
                variant="primary"
              />
              <KpiCard
                label="Pending"
                value={formatMoney(Number(totals?.pending_earnings ?? 0), currency)}
                hint="Lessons not yet settled"
                icon={Coins}
              />
              <KpiCard
                label="Net earnings"
                value={formatMoney(Number(totals?.net_earnings ?? 0), currency)}
                hint={`Gross ${formatMoney(Number(totals?.gross_revenue ?? 0), currency)}`}
                icon={PiggyBank}
              />
              <KpiCard
                label="Paid out"
                value={formatMoney(Number(totals?.paid_out ?? 0), currency)}
                hint={
                  Number(totals?.pending_payouts ?? 0) > 0
                    ? `${formatMoney(Number(totals?.pending_payouts ?? 0), currency)} in progress`
                    : "Settled to you"
                }
                icon={BanknoteIcon}
              />
            </div>

            <SectionCard
              title="How your lesson value breaks down"
              description="Commission and fees are set by DiaLearn's pricing rules, never fixed in this screen."
            >
              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-surface/70 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Gross lesson revenue
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {formatMoney(Number(totals?.gross_revenue ?? 0), currency)}
                  </dd>
                </div>
                <div className="rounded-xl bg-surface/70 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Platform commission
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    −{formatMoney(Number(totals?.platform_commission ?? 0), currency)}
                  </dd>
                </div>
                <div className="rounded-xl bg-surface/70 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Payment fees
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    −{formatMoney(Number(totals?.payment_fees ?? 0), currency)}
                  </dd>
                </div>
              </dl>
              {totals?.next_payout_date ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Next scheduled settlement {formatRelative(totals.next_payout_date)}.
                </p>
              ) : null}
            </SectionCard>
          </>
        )}

        <Tabs defaultValue="lessons">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="lessons" className="min-h-11">
              Per lesson
            </TabsTrigger>
            <TabsTrigger value="payouts" className="min-h-11">
              Payout history
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-4">
            {records.isLoading ? (
              <CardSkeletonList rows={4} height="h-20" />
            ) : records.isError ? (
              <LoadError
                message="We couldn't load your lesson earnings."
                onRetry={() => void records.refetch()}
              />
            ) : (records.data ?? []).length === 0 ? (
              <EmptyPanel
                icon={Receipt}
                title="No earnings yet"
                body="Once a family pays for a confirmed lesson, that lesson's gross, commission and net amount appear here."
              />
            ) : (
              <div className="space-y-3">
                {(records.data ?? []).map((row) => (
                  <article
                    key={row.payment_id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow duration-200 hover:shadow-lift"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {row.subject_name ?? "Lesson"}
                          {row.student_first_name ? (
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              · {row.student_first_name}
                            </span>
                          ) : null}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRelative(row.occurred_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PaymentStatusBadge status={row.status} />
                        <span className="text-sm font-semibold tabular-nums">
                          {formatMoney(Number(row.net_amount ?? 0), row.settlement_currency ?? row.currency)}
                        </span>
                      </div>
                    </div>
                    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex gap-1">
                        <dt>Gross</dt>
                        <dd className="font-medium text-foreground">
                          {formatMoney(Number(row.gross_amount ?? 0), row.currency)}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Commission</dt>
                        <dd className="font-medium text-foreground">
                          {formatMoney(Number(row.commission_amount ?? 0), row.currency)}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Platform fee</dt>
                        <dd className="font-medium text-foreground">
                          {formatMoney(Number(row.platform_fee ?? 0), row.currency)}
                        </dd>
                      </div>
                      {row.settlement_currency && row.settlement_currency !== row.currency ? (
                        <div className="flex gap-1">
                          <dt>Rate</dt>
                          <dd className="font-medium text-foreground">
                            1 {row.currency} = {row.exchange_rate} {row.settlement_currency}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payouts" className="mt-4">
            {payouts.isLoading ? (
              <CardSkeletonList rows={3} height="h-20" />
            ) : payouts.isError ? (
              <LoadError
                message="We couldn't load your payouts."
                onRetry={() => void payouts.refetch()}
              />
            ) : (payouts.data ?? []).length === 0 ? (
              <EmptyPanel
                icon={Wallet}
                title="No payouts requested"
                body="When your available balance reaches the minimum, you can request a payout and follow its settlement here."
              />
            ) : (
              <div className="space-y-3">
                {(payouts.data ?? []).map((row) => (
                  <article
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatMoney(Number(row.amount), row.currency)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Requested {formatRelative(row.requested_at)}
                        {row.settled_at ? ` · settled ${formatRelative(row.settled_at)}` : ""}
                        {row.reference ? ` · ref ${row.reference}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        PAYOUT_TONE[row.status],
                      )}
                    >
                      {PAYOUT_LABEL[row.status]}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TutorShell>
  );
}
