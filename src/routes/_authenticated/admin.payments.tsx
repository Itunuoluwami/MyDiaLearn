import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminPayments, useAdminRefunds, useIssueRefund, type AdminPayment, type PaymentStatus } from "@/lib/admin-data";
import { PAYMENT_STATUS_LABEL, formatMoney } from "@/lib/parent-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { adminBeforeLoad } from "@/lib/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Payments — DiaLearn admin" },
      { name: "description", content: "Transaction history, flagged payments and refunds across the platform." },
    ],
  }),
  component: AdminPaymentsPage,
});

const STATUS_FILTERS: (PaymentStatus | "all" | "flagged")[] = [
  "all",
  "flagged",
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

function paymentParty(payment: AdminPayment) {
  const student = payment.bookings?.students;
  const tutor = payment.bookings?.tutors?.profiles?.full_name;
  const studentName = `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim();
  return { studentName: studentName || "—", tutorName: tutor ?? "—" };
}

function RefundDialog({ payment, onClose }: { payment: AdminPayment; onClose: () => void }) {
  const [amount, setAmount] = useState(String(payment.amount - payment.refunded_amount));
  const [reason, setReason] = useState("");
  const issueRefund = useIssueRefund();
  const { studentName } = paymentParty(payment);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue a refund</DialogTitle>
          <DialogDescription>
            {studentName} · original amount {formatMoney(payment.amount, payment.currency)}
            {payment.refunded_amount > 0 ? ` · already refunded ${formatMoney(payment.refunded_amount, payment.currency)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Refund amount ({payment.currency})</Label>
            <Input
              id="refund-amount"
              type="number"
              min={0}
              max={payment.amount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea id="refund-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={issueRefund.isPending || !amount || Number(amount) <= 0}
            onClick={() =>
              issueRefund.mutate(
                { paymentId: payment.id, amount: Number(amount), reason: reason.trim() || undefined },
                {
                  onSuccess: () => {
                    toast.success("Refund issued");
                    onClose();
                  },
                  onError: (error) => toast.error((error as Error).message),
                },
              )
            }
          >
            {issueRefund.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Issue refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentsTable({ payments, isLoading, onRefund }: { payments: AdminPayment[]; isLoading: boolean; onRefund: (p: AdminPayment) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Tutor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Refunded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                Nothing here.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => {
              const { studentName, tutorName } = paymentParty(payment);
              const refundable = payment.status === "paid" || payment.status === "partially_refunded";
              return (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{studentName}</TableCell>
                  <TableCell>{tutorName}</TableCell>
                  <TableCell>{formatMoney(payment.amount, payment.currency)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.refunded_amount > 0 ? formatMoney(payment.refunded_amount, payment.currency) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        payment.status === "failed" ? "bg-destructive/12 text-destructive" : undefined,
                        payment.status === "paid" ? "bg-success/12 text-success" : undefined,
                      )}
                      variant={payment.status === "failed" || payment.status === "paid" ? "default" : "outline"}
                    >
                      {PAYMENT_STATUS_LABEL[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled={!refundable} onClick={() => onRefund(payment)}>
                      Refund
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function AdminPaymentsPage() {
  const { hasPermission, loading } = useAuth();
  const [status, setStatus] = useState<PaymentStatus | "all" | "flagged">("all");
  const [refunding, setRefunding] = useState<AdminPayment | null>(null);

  const payments = useAdminPayments({ status });
  const refunds = useAdminRefunds();

  if (loading) {
    return (
      <AdminShell title="Payments">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.payments")) {
    return (
      <AdminShell title="Payments">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include payment monitoring permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Payments" description="Transaction history, flagged payments and refunds.">
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="panel-portal mt-4 p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus | "all" | "flagged")}>
                <SelectTrigger className="sm:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "all" ? "All statuses" : option === "flagged" ? "Flagged" : PAYMENT_STATUS_LABEL[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {status === "flagged" ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="size-3.5" />
                  Failed payments, plus pending/processing ones stuck over 24 hours.
                </p>
              ) : null}
            </div>
            <div className="mt-5">
              <PaymentsTable payments={payments.data ?? []} isLoading={payments.isLoading} onRefund={setRefunding} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <div className="panel-portal mt-4 p-4 md:p-6">
            <p className="text-sm text-muted-foreground">Every payment with a recorded refund, newest first.</p>
            <div className="mt-5">
              <PaymentsTable payments={refunds.data ?? []} isLoading={refunds.isLoading} onRefund={setRefunding} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {refunding ? <RefundDialog payment={refunding} onClose={() => setRefunding(null)} /> : null}
    </AdminShell>
  );
}
