import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminPayouts, useRejectPayout, useSettlePayout, type PayoutStatus } from "@/lib/admin-data";
import { formatMoney } from "@/lib/parent-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — DiaLearn admin" },
      { name: "description", content: "Review and settle tutor payout requests." },
    ],
  }),
  component: AdminPayoutsPage,
});

const STATUS_FILTERS: (PayoutStatus | "all")[] = ["all", "requested", "processing", "paid", "rejected", "cancelled"];

const STATUS_LABEL: Record<PayoutStatus, string> = {
  requested: "Requested",
  processing: "Processing",
  paid: "Paid",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<PayoutStatus, string> = {
  requested: "bg-secondary-soft text-foreground",
  processing: "bg-primary-soft text-primary-deep",
  paid: "bg-success/12 text-success",
  rejected: "bg-destructive/12 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function AdminPayoutsPage() {
  const { hasPermission, loading } = useAuth();
  const [status, setStatus] = useState<PayoutStatus | "all">("requested");

  const payouts = useAdminPayouts({ status });
  const settle = useSettlePayout();
  const reject = useRejectPayout();

  if (loading) {
    return (
      <AdminShell title="Payouts">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.payouts")) {
    return (
      <AdminShell title="Payouts">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include payout management permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Payouts" description="Tutor payout requests, from request to settlement.">
      <div className="panel-portal p-4 md:p-6">
        <Select value={status} onValueChange={(value) => setStatus(value as PayoutStatus | "all")}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? "All statuses" : STATUS_LABEL[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Settled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : (payouts.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No payout requests here.
                  </TableCell>
                </TableRow>
              ) : (
                (payouts.data ?? []).map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(payout.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{payout.tutors?.profiles?.full_name ?? "—"}</TableCell>
                    <TableCell>{formatMoney(payout.amount, payout.currency)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_TONE[payout.status]}>{STATUS_LABEL[payout.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payout.settled_at ? new Date(payout.settled_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status === "requested" || payout.status === "processing" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            disabled={reject.isPending}
                            onClick={() =>
                              reject.mutate(payout.id, {
                                onSuccess: () => toast.success("Payout rejected"),
                                onError: (error) => toast.error((error as Error).message),
                              })
                            }
                          >
                            <XCircle className="size-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={settle.isPending}
                            onClick={() =>
                              settle.mutate(payout.id, {
                                onSuccess: () => toast.success("Payout marked as paid"),
                                onError: (error) => toast.error((error as Error).message),
                              })
                            }
                          >
                            {settle.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            Mark paid
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}
