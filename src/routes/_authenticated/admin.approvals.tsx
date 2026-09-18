import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminBeforeLoad } from "@/lib/admin-guard";
import {
  REQUEST_ACTION_LABEL,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_TONE,
  friendlyAdminError,
  summarizeRequestPayload,
  useActionRequests,
  useReviewActionRequest,
  type ActionRequest,
} from "@/lib/admin-governance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/approvals")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Approvals — DiaLearn admin" },
      {
        name: "description",
        content: "Review and approve admin actions that move money or change who has access.",
      },
    ],
  }),
  component: AdminApprovalsPage,
});

function relativeAge(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function ReviewDialog({
  request,
  approve,
  onClose,
}: {
  request: ActionRequest;
  approve: boolean;
  onClose: () => void;
}) {
  const review = useReviewActionRequest();
  const [notes, setNotes] = useState("");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{approve ? "Approve this action?" : "Reject this action?"}</DialogTitle>
          <DialogDescription>
            {REQUEST_ACTION_LABEL[request.action]} —{" "}
            {summarizeRequestPayload(request.action, request.payload)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {approve ? (
            <p className="rounded-md bg-secondary-soft px-3 py-2.5 text-sm text-foreground">
              Approving applies this immediately and permanently. Both the request and its effect
              are recorded in the audit log against your name.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="review-notes">Notes {approve ? "(optional)" : "— say why"}</Label>
            <Textarea
              id="review-notes"
              rows={3}
              placeholder={
                approve
                  ? "Anything worth recording alongside this decision"
                  : "The reason you're turning this down"
              }
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={approve ? "default" : "destructive"}
            disabled={review.isPending || (!approve && notes.trim().length === 0)}
            onClick={() =>
              review.mutate(
                { requestId: request.id, approve, notes: notes.trim() || undefined },
                {
                  onSuccess: (result) => {
                    if (result.status === "failed") {
                      toast.error("Approved, but the action could not be applied", {
                        description: result.execution_error ?? undefined,
                      });
                    } else {
                      toast.success(approve ? "Approved and applied" : "Request rejected");
                    }
                    onClose();
                  },
                  onError: (error) => toast.error(friendlyAdminError(error)),
                },
              )
            }
          >
            {review.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {approve ? "Approve and apply" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestsTable({
  status,
  emptyMessage,
}: {
  status: "pending" | "all";
  emptyMessage: string;
}) {
  const { user } = useAuth();
  const requests = useActionRequests(status);
  const [reviewing, setReviewing] = useState<{ request: ActionRequest; approve: boolean } | null>(
    null,
  );

  const rows = requests.data ?? [];

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Raised by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((request) => {
                const isOwn = request.requested_by === user?.id;
                const isPending = request.status === "pending";
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {REQUEST_ACTION_LABEL[request.action]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {summarizeRequestPayload(request.action, request.payload)}
                      {request.execution_error ? (
                        <span className="mt-1 block text-xs text-destructive">
                          {request.execution_error}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="block">
                        {request.requester?.full_name ?? request.requester?.email ?? "—"}
                      </span>
                      <span className="text-xs">{relativeAge(request.requested_at)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(REQUEST_STATUS_TONE[request.status])}>
                        {REQUEST_STATUS_LABEL[request.status]}
                      </Badge>
                      {request.reviewer ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          by {request.reviewer.full_name ?? request.reviewer.email}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isPending ? (
                        <span className="text-xs text-muted-foreground">
                          {request.review_notes ? request.review_notes : "—"}
                        </span>
                      ) : isOwn ? (
                        <span className="text-xs text-muted-foreground">
                          You raised this request
                        </span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setReviewing({ request, approve: false })}
                          >
                            <XCircle className="size-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setReviewing({ request, approve: true })}
                          >
                            <CheckCircle2 className="size-4" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {reviewing ? (
        <ReviewDialog
          request={reviewing.request}
          approve={reviewing.approve}
          onClose={() => setReviewing(null)}
        />
      ) : null}
    </>
  );
}

function AdminApprovalsPage() {
  const { hasPermission, loading } = useAuth();
  const pending = useActionRequests("pending");

  if (loading) {
    return (
      <AdminShell title="Approvals">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.approvals")) {
    return (
      <AdminShell title="Approvals">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include approval permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  const pendingCount = (pending.data ?? []).length;

  return (
    <AdminShell
      title="Approvals"
      description="Refunds, payouts, admin access and account suspensions wait here for a second pair of eyes."
    >
      <div className="panel-portal mb-5 flex flex-wrap items-center gap-4 p-4 md:p-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
          {pendingCount > 0 ? <Clock className="size-5" /> : <ShieldCheck className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">
            {pendingCount === 0
              ? "Nothing is waiting on a decision."
              : pendingCount === 1
                ? "request waiting on a decision"
                : "requests waiting on a decision"}
          </p>
        </div>
        <p className="ml-auto max-w-sm text-xs text-muted-foreground">
          You can't approve a request you raised yourself. Everything decided here is written to the
          audit log.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="pending" className="min-h-11">
            Pending{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </TabsTrigger>
          <TabsTrigger value="all" className="min-h-11">
            All requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <section className="panel-portal mt-4 p-4 md:p-6">
            <RequestsTable status="pending" emptyMessage="Nothing is waiting for approval." />
          </section>
        </TabsContent>

        <TabsContent value="all">
          <section className="panel-portal mt-4 p-4 md:p-6">
            <RequestsTable status="all" emptyMessage="No requests have been raised yet." />
          </section>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
