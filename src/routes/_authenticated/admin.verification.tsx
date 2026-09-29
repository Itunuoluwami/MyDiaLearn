import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  useApproveTutor,
  useDocumentUrl,
  useRejectTutor,
  useReviewTutorDocument,
  useSetTutorHourlyRate,
  useTutorVerificationDetail,
  useVerificationQueue,
  type VerificationQueueItem,
  type VerificationStatus,
} from "@/lib/admin-data";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "@/lib/tutor-data";
import { formatMoney } from "@/lib/parent-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import { adminBeforeLoad } from "@/lib/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/verification")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Tutor verification — DiaLearn admin" },
      {
        name: "description",
        content:
          "Review tutor qualifications and identity documents before they go live in search.",
      },
    ],
  }),
  component: AdminVerificationPage,
});

const QUEUE_FILTERS: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All submitted" },
];

function DocumentRow({
  document,
}: {
  document: {
    id: string;
    label: string;
    storage_path: string;
    status: VerificationStatus;
    mime_type: string | null;
  };
}) {
  const getUrl = useDocumentUrl();
  const review = useReviewTutorDocument();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{document.label}</p>
          <p className="text-xs text-muted-foreground">{document.mime_type ?? "file"}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn(VERIFICATION_TONE[document.status])}>
          {VERIFICATION_LABEL[document.status]}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          disabled={getUrl.isPending}
          onClick={() =>
            getUrl.mutate(document.storage_path, {
              onSuccess: (url) => window.open(url, "_blank", "noopener,noreferrer"),
              onError: (error) => toast.error((error as Error).message),
            })
          }
        >
          {getUrl.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={review.isPending || document.status === "verified"}
          onClick={() => review.mutate({ documentId: document.id, status: "verified" })}
        >
          Mark reviewed
        </Button>
      </div>
    </div>
  );
}

function HourlyRateEditor({ tutor }: { tutor: VerificationQueueItem }) {
  const setRate = useSetTutorHourlyRate();
  const [draft, setDraft] = useState(tutor.hourly_rate === null ? "" : String(tutor.hourly_rate));

  useEffect(() => {
    setDraft(tutor.hourly_rate === null ? "" : String(tutor.hourly_rate));
  }, [tutor.id, tutor.hourly_rate]);

  const dirty = draft !== (tutor.hourly_rate === null ? "" : String(tutor.hourly_rate));

  function handleSave() {
    const value = Number(draft);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid hourly rate.");
      return;
    }
    setRate.mutate(
      { tutorId: tutor.id, hourlyRate: value },
      {
        onSuccess: () => toast.success("Hourly rate updated"),
        onError: (error) => toast.error((error as Error).message),
      },
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface/50 p-3">
      <Label
        htmlFor="tutor-hourly-rate"
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Hourly rate ({tutor.currency ?? "USD"}) — set by DiaLearn, tutors can't edit this
      </Label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Input
          id="tutor-hourly-rate"
          type="number"
          min={0}
          step="0.01"
          className="w-32"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!dirty || setRate.isPending}
          onClick={handleSave}
        >
          {setRate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save rate
        </Button>
        {tutor.hourly_rate !== null ? (
          <span className="text-xs text-muted-foreground">
            Currently {formatMoney(tutor.hourly_rate, tutor.currency ?? "USD")}/hr
          </span>
        ) : (
          <span className="text-xs text-warning">
            Not set yet — this tutor can't be booked until it is.
          </span>
        )}
      </div>
    </div>
  );
}

function QueueDetail({ tutor }: { tutor: VerificationQueueItem }) {
  const detail = useTutorVerificationDetail(tutor.id);
  const approve = useApproveTutor();
  const reject = useRejectTutor();
  const [rejectOpen, setRejectOpen] = useState(false);

  const profile = tutor.profiles as {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;

  return (
    <div className="panel-portal p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{profile?.full_name ?? "Tutor"}</h2>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          {tutor.headline ? (
            <p className="mt-1 text-sm text-muted-foreground">{tutor.headline}</p>
          ) : null}
        </div>
        <Badge className={cn(VERIFICATION_TONE[tutor.verification_status])}>
          {VERIFICATION_LABEL[tutor.verification_status]}
        </Badge>
      </div>

      <div className="mt-4">
        <HourlyRateEditor tutor={tutor} />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold">Verification steps</h3>
        <div className="mt-2 space-y-2">
          {(detail.data?.steps ?? []).map((step) => {
            const progress = (detail.data?.progress ?? []).find((p) => p.step_id === step.id);
            const status = progress?.status ?? "unverified";
            return (
              <div
                key={step.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {step.name}
                    {step.is_required ? (
                      <span className="ml-1 text-xs text-destructive">*</span>
                    ) : null}
                  </p>
                  {step.description ? (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  ) : null}
                </div>
                <Badge className={cn(VERIFICATION_TONE[status])}>
                  {VERIFICATION_LABEL[status]}
                </Badge>
              </div>
            );
          })}
          {detail.data && detail.data.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verification steps configured yet.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold">Submitted documents</h3>
        <div className="mt-2 space-y-2">
          {(detail.data?.documents ?? []).map((document) => (
            <DocumentRow key={document.id} document={document} />
          ))}
          {detail.data && detail.data.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="size-4" />
            Reject
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this tutor's verification?</AlertDialogTitle>
              <AlertDialogDescription>
                {profile?.full_name ?? "This tutor"} will stay hidden from search until they
                resubmit and are re-reviewed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  reject.mutate(
                    { tutorId: tutor.id },
                    {
                      onSuccess: () => toast.success("Verification rejected"),
                      onError: (error) => toast.error((error as Error).message),
                    },
                  );
                }}
              >
                Reject verification
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          disabled={approve.isPending}
          onClick={() =>
            approve.mutate(tutor.id, {
              onSuccess: () => toast.success("Tutor verified and listed"),
              onError: (error) => toast.error((error as Error).message),
            })
          }
        >
          {approve.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Approve & list
        </Button>
      </div>
    </div>
  );
}

function AdminVerificationPage() {
  const { hasPermission, loading } = useAuth();
  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queue = useVerificationQueue(filter);
  const selected =
    (queue.data ?? []).find((item) => item.id === selectedId) ?? (queue.data ?? [])[0] ?? null;

  if (loading) {
    return (
      <AdminShell title="Tutor verification">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.verification")) {
    return (
      <AdminShell title="Tutor verification">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include verification review permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Tutor verification"
      description="Every tutor stays unlisted until qualifications and identity documents are reviewed here."
    >
      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <div className="panel-portal p-4">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as VerificationStatus | "all")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUEUE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 space-y-2">
            {queue.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (queue.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing in this queue.</p>
            ) : (
              (queue.data ?? []).map((item) => {
                const profile = item.profiles as {
                  full_name: string | null;
                  email: string | null;
                } | null;
                const active = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "focus-ring flex w-full flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors",
                      active ? "border-primary bg-primary-soft" : "border-border hover:bg-surface",
                    )}
                  >
                    <span className="font-medium">{profile?.full_name ?? "Tutor"}</span>
                    <span className="text-xs text-muted-foreground">{profile?.email}</span>
                    {item.agency_name ? (
                      <span className="text-xs text-muted-foreground">
                        Agency: {item.agency_name}
                      </span>
                    ) : null}
                    <Badge
                      className={cn("mt-1 w-fit", VERIFICATION_TONE[item.verification_status])}
                    >
                      {VERIFICATION_LABEL[item.verification_status]}
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selected ? (
          <QueueDetail tutor={selected} />
        ) : (
          <div className="panel-portal flex flex-col items-center justify-center gap-2 p-10 text-center">
            <ShieldCheck className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select a tutor from the queue to review.
            </p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
