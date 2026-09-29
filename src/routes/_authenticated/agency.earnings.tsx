import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Loader2, PiggyBank, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AgencyShell } from "@/components/agency/AgencyShell";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
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
import {
  useAgencyEarnings,
  useAgencyPayouts,
  useAgencyTutors,
  useRequestAgencyPayout,
} from "@/lib/agency-data";
import { formatMoney } from "@/lib/parent-data";
import { PAYOUT_LABEL, PAYOUT_TONE, type PayoutStatus } from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agency/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — DiaLearn agency" },
      {
        name: "description",
        content: "Your agency's share, each tutor's totals, and your payouts.",
      },
    ],
  }),
  component: AgencyEarningsPage,
});

function AgencyEarningsPage() {
  const earnings = useAgencyEarnings();
  const payouts = useAgencyPayouts();
  const tutors = useAgencyTutors();
  const request = useRequestAgencyPayout();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const totals = earnings.data;
  const currency = totals?.currency ?? "USD";
  const available = Number(totals?.availableBalance ?? 0);
  const minimum = Number(totals?.minimumPayout ?? 0);

  async function handleRequest() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (minimum > 0 && value < minimum) {
      toast.error(`The minimum payout is ${formatMoney(minimum, currency)}.`);
      return;
    }
    if (value > available) {
      toast.error("That is more than your available balance.");
      return;
    }
    try {
      await request.mutateAsync(value);
      toast.success("Payout requested");
      setAmount("");
      setOpen(false);
    } catch (error) {
      toast.error((error as Error).message || "We couldn't request that payout.");
    }
  }

  return (
    <AgencyShell
      title="Earnings"
      description={
        totals
          ? `Your agency receives ${Number(totals.revenueSharePercentage)}% of each tutor's lesson earnings. Tutors are paid their share separately.`
          : "Your agency's share of your tutors' lessons, and your payouts."
      }
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" className="min-h-11" disabled={!totals || available <= 0}>
              <Wallet className="size-4" /> Request payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request an agency payout</DialogTitle>
              <DialogDescription>
                Available now: {formatMoney(available, currency)}.
                {minimum > 0 ? ` Minimum payout ${formatMoney(minimum, currency)}.` : ""}
                {totals?.scheduleLabel ? ` ${totals.scheduleLabel}` : ""}
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
              />
            </div>
            <DialogFooter>
              <Button variant="outline" className="min-h-11" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="cta"
                className="min-h-11"
                disabled={request.isPending}
                onClick={() => void handleRequest()}
              >
                {request.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Request payout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-5">
        {earnings.isLoading ? (
          <KpiSkeletonGrid count={4} />
        ) : earnings.isError ? (
          <LoadError
            message={(earnings.error as Error).message || "We couldn't load your earnings."}
            onRetry={() => void earnings.refetch()}
          />
        ) : totals ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Available"
              value={formatMoney(totals.availableBalance, currency)}
              icon={Wallet}
              variant="primary"
            />
            <KpiCard
              label="Agency earnings"
              value={formatMoney(totals.agencyEarnings, currency)}
              hint={`From ${formatMoney(totals.grossRevenue, currency)} billed`}
              icon={PiggyBank}
            />
            <KpiCard
              label="Paid out"
              value={formatMoney(totals.paidOut, currency)}
              icon={Banknote}
            />
            <KpiCard
              label="Payouts pending"
              value={formatMoney(totals.pendingPayouts, currency)}
              {...(totals.nextPayoutDate ? { hint: `Next payout ${totals.nextPayoutDate}` } : {})}
              icon={Banknote}
            />
          </div>
        ) : null}

        <SectionCard
          title="Earnings by tutor"
          description="What each tutor has billed and earned, and your agency's share."
        >
          {tutors.isLoading ? (
            <CardSkeletonList rows={3} height="h-12" />
          ) : tutors.isError ? (
            <LoadError
              message="We couldn't load your tutors."
              onRetry={() => void tutors.refetch()}
            />
          ) : (tutors.data ?? []).length === 0 ? (
            <EmptyPanel
              icon={Users}
              title="No tutors yet"
              body="Tutor earnings appear here once your tutors start teaching."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Tutor</th>
                    <th className="py-2 pr-3 text-right font-semibold">Lessons</th>
                    <th className="py-2 pr-3 text-right font-semibold">Billed</th>
                    <th className="py-2 pr-3 text-right font-semibold">Tutor share</th>
                    <th className="py-2 text-right font-semibold">Agency share</th>
                  </tr>
                </thead>
                <tbody>
                  {(tutors.data ?? []).map((tutor) => (
                    <tr key={tutor.tutorId} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 font-medium">{tutor.fullName ?? "Tutor"}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {tutor.lessonsCompleted}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {formatMoney(tutor.grossAmount, tutor.currency)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {formatMoney(tutor.tutorEarnings, tutor.currency)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatMoney(tutor.agencyEarnings, tutor.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Payout history">
          {payouts.isLoading ? (
            <CardSkeletonList rows={2} height="h-12" />
          ) : payouts.isError ? (
            <LoadError message="We couldn't load payouts." onRetry={() => void payouts.refetch()} />
          ) : (payouts.data ?? []).length === 0 ? (
            <EmptyPanel
              icon={Banknote}
              title="No payouts yet"
              body="Request a payout once your available balance reaches the minimum."
            />
          ) : (
            <ul className="divide-y divide-border">
              {(payouts.data ?? []).map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatMoney(row.amount, row.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested {new Date(row.requested_at).toLocaleDateString()}
                      {row.settled_at
                        ? ` · settled ${new Date(row.settled_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      PAYOUT_TONE[row.status as PayoutStatus],
                    )}
                  >
                    {PAYOUT_LABEL[row.status as PayoutStatus] ?? row.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </AgencyShell>
  );
}
