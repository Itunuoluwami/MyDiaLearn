import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AgencyShell } from "@/components/agency/AgencyShell";
import { CardSkeletonList, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgency, useSubmitAgencyVerification, useUpdateAgency } from "@/lib/agency-data";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agency/profile")({
  head: () => ({
    meta: [
      { title: "Agency profile — DiaLearn" },
      {
        name: "description",
        content: "Your agency's details and its verification with DiaLearn.",
      },
    ],
  }),
  component: AgencyProfilePage,
});

type Form = {
  name: string;
  registrationNumber: string;
  countryCode: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  about: string;
};

const EMPTY: Form = {
  name: "",
  registrationNumber: "",
  countryCode: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  about: "",
};

function AgencyProfilePage() {
  const agency = useAgency();
  const update = useUpdateAgency();
  const submit = useSubmitAgencyVerification();
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    const a = agency.data;
    if (!a) return;
    setForm({
      name: a.name ?? "",
      registrationNumber: a.registrationNumber ?? "",
      countryCode: a.countryCode ?? "",
      contactEmail: a.contactEmail ?? "",
      contactPhone: a.contactPhone ?? "",
      website: a.website ?? "",
      about: a.about ?? "",
    });
  }, [agency.data]);

  const status = agency.data?.verificationStatus;
  const canSubmit = status === "unverified" || status === "rejected";
  const steps = agency.data?.verificationSteps ?? [];

  function set<K extends keyof Form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Please enter your agency's name.");
      return;
    }
    try {
      await update.mutateAsync({
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim() || null,
        countryCode: form.countryCode.trim().toUpperCase() || null,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
        website: form.website.trim() || null,
        about: form.about.trim() || null,
      });
      toast.success("Agency details saved");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't save those details.");
    }
  }

  async function handleSubmit() {
    if (!form.registrationNumber.trim()) {
      toast.error("Add your business registration number before submitting.");
      return;
    }
    try {
      await submit.mutateAsync();
      toast.success("Submitted — our team will review your agency.");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't submit your agency.");
    }
  }

  return (
    <AgencyShell
      title="Agency profile"
      description="How your agency appears to DiaLearn, and its verification."
    >
      {agency.isLoading ? (
        <CardSkeletonList rows={2} height="h-48" />
      ) : agency.isError ? (
        <LoadError
          message={(agency.error as Error).message || "We couldn't load your agency."}
          onRetry={() => void agency.refetch()}
        />
      ) : (
        <div className="grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <SectionCard
            title="Agency details"
            description="Families see your agency's name on your tutors' profiles."
          >
            <form className="space-y-4" onSubmit={(event) => void handleSave(event)} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="agency-name">Agency name</Label>
                <Input
                  id="agency-name"
                  className="min-h-11"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="agency-reg">Business registration number</Label>
                  <Input
                    id="agency-reg"
                    className="min-h-11"
                    value={form.registrationNumber}
                    onChange={(event) => set("registrationNumber", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-country">Country (2-letter code)</Label>
                  <Input
                    id="agency-country"
                    className="min-h-11 uppercase"
                    maxLength={2}
                    value={form.countryCode}
                    onChange={(event) => set("countryCode", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-email">Contact email</Label>
                  <Input
                    id="agency-email"
                    type="email"
                    className="min-h-11"
                    value={form.contactEmail}
                    onChange={(event) => set("contactEmail", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-phone">Contact phone</Label>
                  <Input
                    id="agency-phone"
                    type="tel"
                    className="min-h-11"
                    value={form.contactPhone}
                    onChange={(event) => set("contactPhone", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agency-web">Website</Label>
                <Input
                  id="agency-web"
                  type="url"
                  placeholder="https://"
                  className="min-h-11"
                  value={form.website}
                  onChange={(event) => set("website", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agency-about">About your agency</Label>
                <Textarea
                  id="agency-about"
                  rows={5}
                  value={form.about}
                  onChange={(event) => set("about", event.target.value)}
                />
              </div>
              <Button type="submit" variant="cta" className="min-h-11" disabled={update.isPending}>
                {update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save details
              </Button>
            </form>
          </SectionCard>

          <div className="space-y-5">
            <SectionCard title="Verification">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" aria-hidden="true" />
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      status ? VERIFICATION_TONE[status] : "",
                    )}
                  >
                    {status ? VERIFICATION_LABEL[status] : "—"}
                  </span>
                </div>
                <ul className="space-y-3">
                  {steps.map((step) => (
                    <li key={step.id} className="rounded-xl border border-border bg-surface/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{step.name}</p>
                        {step.status ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold",
                              VERIFICATION_TONE[step.status],
                            )}
                          >
                            {VERIFICATION_LABEL[step.status]}
                          </span>
                        ) : null}
                      </div>
                      {step.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                      ) : null}
                      {step.reviewer_notes ? (
                        <p className="mt-2 text-xs">
                          <span className="font-semibold">Reviewer: </span>
                          {step.reviewer_notes}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {canSubmit ? (
                  <Button
                    variant="cta"
                    className="min-h-11 w-full"
                    disabled={submit.isPending}
                    onClick={() => void handleSubmit()}
                  >
                    {submit.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Submit for verification
                  </Button>
                ) : status === "verified" ? (
                  <p className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="size-4" /> Your agency is verified.
                  </p>
                ) : (
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    Our team is reviewing your agency. We'll update this page when it's done.
                  </p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </AgencyShell>
  );
}
