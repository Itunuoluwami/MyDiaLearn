import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminDisputes, useResolveDispute, type AdminDispute, type DisputeStatus } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { adminBeforeLoad } from "@/lib/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/disputes")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Disputes — DiaLearn admin" },
      { name: "description", content: "Review and resolve disputes raised between platform users." },
    ],
  }),
  component: AdminDisputesPage,
});

const STATUS_FILTERS: (DisputeStatus | "all")[] = ["open", "investigating", "resolved", "dismissed", "all"];

const STATUS_LABEL: Record<DisputeStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const STATUS_TONE: Record<DisputeStatus, string> = {
  open: "bg-destructive/12 text-destructive",
  investigating: "bg-primary-soft text-primary-deep",
  resolved: "bg-success/12 text-success",
  dismissed: "bg-muted text-muted-foreground",
};

const CATEGORY_LABEL: Record<string, string> = {
  payment: "Payment",
  conduct: "Conduct",
  quality: "Lesson quality",
  scheduling: "Scheduling",
  other: "Other",
};

function DisputeCard({ dispute }: { dispute: AdminDispute }) {
  const [notes, setNotes] = useState(dispute.resolution_notes ?? "");
  const resolve = useResolveDispute();

  const raisedBy = dispute.raised_by_profile?.full_name ?? "Unknown";
  const against = dispute.against_profile?.full_name;
  const subject = dispute.bookings?.subjects?.name;

  const open = dispute.status === "open" || dispute.status === "investigating";

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {raisedBy}
            {against ? <span className="text-muted-foreground"> vs {against}</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {CATEGORY_LABEL[dispute.category] ?? dispute.category}
            {subject ? ` · ${subject}` : ""} · {new Date(dispute.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge className={STATUS_TONE[dispute.status]}>{STATUS_LABEL[dispute.status]}</Badge>
      </div>
      <p className="mt-3 text-sm">{dispute.description}</p>

      {open ? (
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <Label className="text-xs">Resolution notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            {dispute.status === "open" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={resolve.isPending}
                onClick={() =>
                  resolve.mutate(
                    { disputeId: dispute.id, status: "investigating", notes },
                    { onError: (error) => toast.error((error as Error).message) },
                  )
                }
              >
                Start investigating
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={resolve.isPending}
              onClick={() =>
                resolve.mutate(
                  { disputeId: dispute.id, status: "dismissed", notes },
                  { onSuccess: () => toast.success("Dispute dismissed"), onError: (error) => toast.error((error as Error).message) },
                )
              }
            >
              <XCircle className="size-4" />
              Dismiss
            </Button>
            <Button
              size="sm"
              disabled={resolve.isPending}
              onClick={() =>
                resolve.mutate(
                  { disputeId: dispute.id, status: "resolved", notes },
                  { onSuccess: () => toast.success("Dispute resolved"), onError: (error) => toast.error((error as Error).message) },
                )
              }
            >
              {resolve.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Mark resolved
            </Button>
          </div>
        </div>
      ) : dispute.resolution_notes ? (
        <p className="mt-3 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          Resolution: {dispute.resolution_notes}
        </p>
      ) : null}
    </div>
  );
}

function AdminDisputesPage() {
  const { hasPermission, loading } = useAuth();
  const [status, setStatus] = useState<DisputeStatus | "all">("open");
  const disputes = useAdminDisputes(status);

  if (loading) {
    return (
      <AdminShell title="Disputes">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.disputes")) {
    return (
      <AdminShell title="Disputes">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include dispute resolution permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Disputes"
      description="Raised via raise_dispute() by a party to a booking. No portal has a 'report an issue' button wired up to it yet, so this queue reflects only what's been raised directly."
    >
      <div className="panel-portal p-4 md:p-6">
        <Select value={status} onValueChange={(value) => setStatus(value as DisputeStatus | "all")}>
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

        <div className={cn("mt-5 space-y-3")}>
          {disputes.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (disputes.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No disputes in this view.</p>
          ) : (
            (disputes.data ?? []).map((dispute) => <DisputeCard key={dispute.id} dispute={dispute} />)
          )}
        </div>
      </div>
    </AdminShell>
  );
}
