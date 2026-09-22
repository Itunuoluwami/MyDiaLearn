import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, FileText, ShieldCheck, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteTutorDocument,
  useSubmitVerification,
  useTutorDocuments,
  useTutorRecord,
  useTutorSummary,
  useUploadTutorDocument,
  useVerificationProgress,
  useVerificationSteps,
  VERIFICATION_LABEL,
  VERIFICATION_TONE,
} from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/verification")({
  head: () => ({
    meta: [
      { title: "Verification — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Upload your identity and qualification documents. Every DiaLearn tutor is verified by our team before appearing in search.",
      },
      { property: "og:title", content: "Verification — DiaLearn tutor" },
      {
        property: "og:description",
        content:
          "Complete the DiaLearn verification steps so families can book you with confidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorVerificationPage,
});

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function TutorVerificationPage() {
  const tutor = useTutorRecord();
  const summary = useTutorSummary();
  const steps = useVerificationSteps();
  const progress = useVerificationProgress();
  const documents = useTutorDocuments();
  const upload = useUploadTutorDocument();
  const removeDoc = useDeleteTutorDocument();
  const submit = useSubmitVerification();

  const [stepId, setStepId] = useState("");
  const [label, setLabel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const record = tutor.data;
  const stepList = steps.data ?? [];
  const docs = documents.data ?? [];
  const progressByStep = useMemo(
    () => new Map((progress.data ?? []).map((row) => [row.step_id, row])),
    [progress.data],
  );

  const requiredSteps = stepList.filter((step) => step.is_required);
  const coveredRequired = requiredSteps.filter((step) =>
    docs.some((doc) => doc.step_id === step.id),
  ).length;
  const completion = requiredSteps.length
    ? Math.round((coveredRequired / requiredSteps.length) * 100)
    : 0;

  const canSubmit =
    Boolean(record) &&
    ["unverified", "rejected"].includes(record?.verification_status ?? "") &&
    coveredRequired === requiredSteps.length &&
    requiredSteps.length > 0 &&
    Boolean(summary.data?.profile_complete);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Files must be 10MB or smaller.");
      return;
    }
    const cleanLabel = label.trim();
    if (cleanLabel.length < 3 || cleanLabel.length > 120) {
      toast.error("Give the document a short name (3–120 characters).");
      return;
    }
    try {
      await upload.mutateAsync({ file, label: cleanLabel, stepId: stepId || null });
      setLabel("");
      setStepId("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Document uploaded");
    } catch {
      toast.error("We couldn't upload that document.");
    }
  }

  async function handleSubmit() {
    try {
      await submit.mutateAsync();
      toast.success("Submitted — our team will review your documents.");
    } catch {
      toast.error("We couldn't submit your verification.");
    }
  }

  if (tutor.isLoading) {
    return (
      <TutorShell title="Verification">
        <CardSkeletonList rows={3} height="h-32" />
      </TutorShell>
    );
  }

  if (tutor.isError || !record) {
    return (
      <TutorShell title="Verification">
        <LoadError
          message="We couldn't load your verification status right now."
          onRetry={() => void tutor.refetch()}
        />
      </TutorShell>
    );
  }

  return (
    <TutorShell
      title="Verification"
      description="Trust is the product. Every tutor is reviewed by the DiaLearn team before families can book them."
    >
      <div className="max-w-4xl space-y-5">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current status
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
                {record.verification_status === "verified" ? (
                  <BadgeCheck className="size-5 text-success" />
                ) : (
                  <ShieldCheck className="size-5 text-primary" />
                )}
                {VERIFICATION_LABEL[record.verification_status]}
              </p>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                {record.verification_status === "verified"
                  ? "You're verified. Control whether you appear in tutor search from your teaching profile."
                  : record.verification_status === "pending" ||
                      record.verification_status === "in_review"
                    ? "Your documents are with our review team. We'll notify you as soon as there's a decision."
                    : record.verification_status === "suspended"
                      ? "Your account is suspended. Please contact the DiaLearn team."
                      : "Upload the required documents below, then submit for review. Your profile stays private until you're approved."}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                VERIFICATION_TONE[record.verification_status],
              )}
            >
              {VERIFICATION_LABEL[record.verification_status]}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Progress value={completion} className="h-2 min-w-40 flex-1" />
            <span className="text-sm font-semibold tabular-nums">
              {coveredRequired}/{requiredSteps.length} required
            </span>
          </div>

          {!summary.data?.profile_complete ? (
            <p className="mt-4 rounded-xl bg-secondary-soft/70 p-3 text-xs text-muted-foreground">
              Add your biography, hourly rate, subjects and availability before submitting.{" "}
              <Link to="/tutor/profile" className="font-semibold text-primary-deep underline">
                Open teaching profile
              </Link>
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="cta"
              className="min-h-11"
              disabled={!canSubmit || submit.isPending}
              onClick={() => void handleSubmit()}
            >
              Submit for review
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/tutor/profile">Edit teaching profile</Link>
            </Button>
          </div>
        </section>

        <SectionCard
          title="Required steps"
          description="Verification steps are defined by DiaLearn and can change over time."
        >
          {steps.isLoading ? (
            <CardSkeletonList rows={3} height="h-16" />
          ) : steps.isError ? (
            <LoadError
              message="We couldn't load the verification steps."
              onRetry={() => void steps.refetch()}
            />
          ) : stepList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No verification steps are configured yet. Please check back shortly.
            </p>
          ) : (
            <ul className="space-y-3">
              {stepList.map((step) => {
                const stepDocs = docs.filter((doc) => doc.step_id === step.id);
                const state = progressByStep.get(step.id);
                return (
                  <li key={step.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {step.name}
                          {step.is_required ? null : (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              Optional
                            </span>
                          )}
                        </p>
                        {step.description ? (
                          <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          VERIFICATION_TONE[
                            state?.status ?? (stepDocs.length ? "pending" : "unverified")
                          ],
                        )}
                      >
                        {
                          VERIFICATION_LABEL[
                            state?.status ?? (stepDocs.length ? "pending" : "unverified")
                          ]
                        }
                      </span>
                    </div>
                    {state?.reviewer_notes ? (
                      <p className="mt-3 rounded-lg bg-surface/70 p-3 text-xs text-muted-foreground">
                        Reviewer note: {state.reviewer_notes}
                      </p>
                    ) : null}
                    {stepDocs.length > 0 ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {stepDocs.length} {stepDocs.length === 1 ? "document" : "documents"}{" "}
                        attached
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upload a document"
          description="Stored privately. Only you and the DiaLearn review team can open your files."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-step">Verification step</Label>
              <Select value={stepId} onValueChange={setStepId}>
                <SelectTrigger id="doc-step" className="min-h-11">
                  <SelectValue placeholder="Choose a step" />
                </SelectTrigger>
                <SelectContent>
                  {stepList.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-label">Document name</Label>
              <Input
                id="doc-label"
                className="min-h-11"
                maxLength={120}
                placeholder="Passport data page"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="doc-file">File (PDF or image, max 10MB)</Label>
              <Input
                id="doc-file"
                ref={fileRef}
                type="file"
                className="min-h-11"
                accept="application/pdf,image/png,image/jpeg,image/webp"
              />
            </div>
          </div>
          <Button
            variant="cta"
            className="mt-4 min-h-11"
            disabled={upload.isPending}
            onClick={() => void handleUpload()}
          >
            <Upload className="size-4" /> Upload document
          </Button>
        </SectionCard>

        <SectionCard title="Your documents">
          {documents.isLoading ? (
            <CardSkeletonList rows={2} height="h-16" />
          ) : documents.isError ? (
            <LoadError
              message="We couldn't load your documents."
              onRetry={() => void documents.refetch()}
            />
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {VERIFICATION_LABEL[doc.status]}
                        {doc.size_bytes ? ` · ${(doc.size_bytes / 1024 / 1024).toFixed(2)} MB` : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${doc.label}`}
                    className="size-11 shrink-0 sm:size-9"
                    disabled={removeDoc.isPending || record.verification_status === "verified"}
                    onClick={() =>
                      void removeDoc.mutateAsync({ id: doc.id, storage_path: doc.storage_path })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </TutorShell>
  );
}
