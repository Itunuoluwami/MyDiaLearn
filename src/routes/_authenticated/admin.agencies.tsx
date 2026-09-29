import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/use-auth";
import {
  useAdminAgencies,
  useAdminAgency,
  useDecideAgency,
  useReviewAgencyStep,
  useSetAgencyShare,
  type VerificationStatus,
} from "@/lib/admin-data";
import { adminBeforeLoad } from "@/lib/admin-guard";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "@/lib/tutor-data";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/agencies")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Agencies — DiaLearn admin" },
      {
        name: "description",
        content: "Review tutoring agencies, verify them and set their agreed share.",
      },
    ],
  }),
  component: AdminAgenciesPage,
});

const FILTERS: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "pending", label: "Awaiting review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Needs changes" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Not submitted" },
  { value: "all", label: "All agencies" },
];

function AgencyReview({ agencyId, canSetShare }: { agencyId: string; canSetShare: boolean }) {
  const detail = useAdminAgency(agencyId);
  const reviewStep = useReviewAgencyStep();
  const decide = useDecideAgency();
  const setShare = useSetAgencyShare();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [share, setShareValue] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (detail.data) setShareValue(String(Number(detail.data.agency.revenue_share_percentage)));
  }, [detail.data]);

  if (detail.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (detail.isError || !detail.data)
    return <p className="text-sm text-destructive">We couldn't load this agency.</p>;

  const { agency, steps, tutors } = detail.data;

  async function step(stepId: string, status: VerificationStatus) {
    try {
      await reviewStep.mutateAsync({
        agencyId,
        stepId,
        status,
        reviewerNotes: notes[stepId] ?? null,
      });
      toast.success("Step updated");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't update that step.");
    }
  }

  async function decision(status: "verified" | "rejected" | "suspended") {
    try {
      await decide.mutateAsync({
        agencyId,
        status,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      toast.success(
        status === "verified"
          ? "Agency verified — its verified tutors are now listed."
          : status === "rejected"
            ? "Agency sent back for changes."
            : "Agency suspended — its tutors are unlisted.",
      );
      setReason("");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't record that decision.");
    }
  }

  async function saveShare() {
    const value = Number(share);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      toast.error("Enter a percentage between 0 and 100.");
      return;
    }
    try {
      await setShare.mutateAsync({ agencyId, revenueSharePercentage: value });
      toast.success("Agency share updated for future payments.");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't update the share.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="panel-portal p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{agency.name}</h2>
            <p className="text-sm text-muted-foreground">
              {agency.owner_name} · {agency.owner_email}
            </p>
          </div>
          <Badge className={cn(VERIFICATION_TONE[agency.verification_status])}>
            {VERIFICATION_LABEL[agency.verification_status]}
          </Badge>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Registration number</dt>
            <dd className="font-medium">{agency.registration_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Country</dt>
            <dd className="font-medium">{agency.country_code ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contact</dt>
            <dd className="font-medium">
              {agency.contact_email ?? "—"}
              {agency.contact_phone ? ` · ${agency.contact_phone}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Website</dt>
            <dd className="truncate font-medium">{agency.website ?? "—"}</dd>
          </div>
        </dl>
        {agency.about ? <p className="mt-4 text-sm text-muted-foreground">{agency.about}</p> : null}
      </div>

      <div className="panel-portal p-4 md:p-6">
        <h3 className="text-base font-semibold">Verification steps</h3>
        <ul className="mt-3 space-y-3">
          {steps.map((s) => (
            <li key={s.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{s.name}</p>
                {s.status ? (
                  <Badge className={cn(VERIFICATION_TONE[s.status])}>
                    {VERIFICATION_LABEL[s.status]}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Not submitted</span>
                )}
              </div>
              {s.description ? (
                <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
              ) : null}
              <Textarea
                className="mt-2"
                rows={2}
                placeholder="Notes for the agency (optional)"
                value={notes[s.id] ?? s.reviewer_notes ?? ""}
                onChange={(event) => setNotes((prev) => ({ ...prev, [s.id]: event.target.value }))}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reviewStep.isPending}
                  onClick={() => void step(s.id, "verified")}
                >
                  <CheckCircle2 className="size-4" /> Approve step
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reviewStep.isPending}
                  onClick={() => void step(s.id, "rejected")}
                >
                  <XCircle className="size-4" /> Needs changes
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-portal p-4 md:p-6">
        <h3 className="text-base font-semibold">Decision</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Verifying lists the agency's already-verified tutors; rejecting or suspending unlists
          them.
        </p>
        <Textarea
          className="mt-3"
          rows={2}
          placeholder="Reason (optional, recorded in the audit log)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="cta"
            disabled={decide.isPending || agency.verification_status === "verified"}
            onClick={() => void decision("verified")}
          >
            {decide.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Verify agency
          </Button>
          <Button
            variant="outline"
            disabled={decide.isPending}
            onClick={() => void decision("rejected")}
          >
            Send back for changes
          </Button>
          <Button
            variant="outline"
            disabled={decide.isPending || agency.verification_status === "suspended"}
            onClick={() => void decision("suspended")}
          >
            Suspend
          </Button>
        </div>
      </div>

      <div className="panel-portal p-4 md:p-6">
        <h3 className="text-base font-semibold">Agency share</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The percentage of each tutor's earnings (after DiaLearn's commission) paid to the agency,
          from the agency agreement. Applies to payments made from now on.
        </p>
        <div className="mt-3 flex items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="share">Share (%)</Label>
            <Input
              id="share"
              inputMode="decimal"
              className="w-32"
              value={share}
              disabled={!canSetShare}
              onChange={(event) => setShareValue(event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            disabled={!canSetShare || setShare.isPending}
            onClick={() => void saveShare()}
          >
            Save share
          </Button>
        </div>
        {!canSetShare ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Changing the share needs the platform settings permission.
          </p>
        ) : null}
      </div>

      <div className="panel-portal p-4 md:p-6">
        <h3 className="text-base font-semibold">Tutors ({tutors.length})</h3>
        {tutors.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No tutors added yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {tutors.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-medium">{t.full_name ?? "Tutor"}</span>
                  <span className="text-muted-foreground"> · {t.email}</span>
                </span>
                <Badge className={cn(VERIFICATION_TONE[t.verification_status])}>
                  {t.is_listed ? "Listed" : VERIFICATION_LABEL[t.verification_status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Review each tutor's own documents in Tutor verification.
        </p>
      </div>
    </div>
  );
}

function AdminAgenciesPage() {
  const { hasPermission, loading } = useAuth();
  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const agencies = useAdminAgencies(filter);
  const rows = agencies.data ?? [];
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;

  if (loading) {
    return (
      <AdminShell title="Agencies">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.verification")) {
    return (
      <AdminShell title="Agencies">
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
      title="Agencies"
      description="Tutoring agencies are verified here before any of their tutors can be listed."
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
              {FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 space-y-2">
            {agencies.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : agencies.isError ? (
              <p className="text-sm text-destructive">{(agencies.error as Error).message}</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing in this queue.</p>
            ) : (
              rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className={cn(
                    "focus-ring flex w-full flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors",
                    selected?.id === row.id
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:bg-surface",
                  )}
                >
                  <span className="font-medium">{row.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.tutor_count} tutor{row.tutor_count === 1 ? "" : "s"} ·{" "}
                    {Number(row.revenue_share_percentage)}% share
                  </span>
                  <Badge className={cn("mt-1 w-fit", VERIFICATION_TONE[row.verification_status])}>
                    {VERIFICATION_LABEL[row.verification_status]}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>
        <div>
          {selected ? (
            <AgencyReview agencyId={selected.id} canSetShare={hasPermission("admin.settings")} />
          ) : (
            <div className="panel-portal flex flex-col items-center p-10 text-center">
              <Building2 className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Select an agency to review.</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
