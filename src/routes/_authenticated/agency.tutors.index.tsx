import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail, UserPlus, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";

import { AgencyShell } from "@/components/agency/AgencyShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddAgencyTutor,
  useAgencyTutors,
  useRemoveAgencyTutor,
  type AgencyTutor,
} from "@/lib/agency-data";
import { formatMoney } from "@/lib/parent-data";
import { VERIFICATION_LABEL, VERIFICATION_TONE } from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agency/tutors/")({
  head: () => ({
    meta: [
      { title: "Tutors — DiaLearn agency" },
      { name: "description", content: "Add and manage the tutors under your agency." },
    ],
  }),
  component: AgencyTutorsPage,
});

function AddTutorDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const add = useAddAgencyTutor();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (fullName.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      toast.error("Enter the tutor's full name and a valid email address.");
      return;
    }
    try {
      const result = await add.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      toast.success(
        result.emailed
          ? `Tutor added. We've emailed ${email.trim()} a link to set their password.`
          : "Tutor added, but the email couldn't be sent. Ask them to use 'Forgot password' to sign in.",
      );
      setFullName("");
      setEmail("");
      onClose();
    } catch (error) {
      toast.error((error as Error).message || "We couldn't add that tutor.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a tutor</DialogTitle>
          <DialogDescription>
            We'll create their DiaLearn account under your agency and email them a link to set a
            password, so they can sign in and teach. You complete their profile next.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="tutor-name">Full name</Label>
            <Input
              id="tutor-name"
              className="min-h-11"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tutor-email">Email</Label>
            <Input
              id="tutor-email"
              type="email"
              className="min-h-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" className="min-h-11" disabled={add.isPending}>
              {add.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Add and send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AgencyTutorsPage() {
  const tutors = useAgencyTutors();
  const remove = useRemoveAgencyTutor();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AgencyTutor | null>(null);
  const rows = tutors.data ?? [];

  async function confirmRemove() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.tutorId);
      toast.success(`${removing.fullName ?? "Tutor"} is no longer part of your agency.`);
    } catch (error) {
      toast.error((error as Error).message || "We couldn't remove that tutor.");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <AgencyShell
      title="Tutors"
      description="Everyone teaching under your agency, their verification and earnings."
      actions={
        <Button variant="cta" className="min-h-11" onClick={() => setAdding(true)}>
          <UserPlus className="size-4" /> Add a tutor
        </Button>
      }
    >
      <AddTutorDialog open={adding} onClose={() => setAdding(false)} />

      {tutors.isLoading ? (
        <CardSkeletonList rows={4} height="h-20" />
      ) : tutors.isError ? (
        <LoadError
          message={(tutors.error as Error).message || "We couldn't load your tutors."}
          onRetry={() => void tutors.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={Users}
          title="No tutors yet"
          body="Add a tutor to create their account under your agency. You can then fill in their profile, subjects and availability and submit them for verification."
          action={
            <Button variant="cta" className="min-h-11" onClick={() => setAdding(true)}>
              <UserPlus className="size-4" /> Add a tutor
            </Button>
          }
        />
      ) : (
        <SectionCard title={`${rows.length} tutor${rows.length === 1 ? "" : "s"}`}>
          <ul className="divide-y divide-border">
            {rows.map((tutor) => (
              <li
                key={tutor.tutorId}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/agency/tutors/$tutorId"
                      params={{ tutorId: tutor.tutorId }}
                      className="focus-ring truncate rounded font-semibold hover:underline"
                    >
                      {tutor.fullName ?? "Tutor"}
                    </Link>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        VERIFICATION_TONE[tutor.verificationStatus],
                      )}
                    >
                      {tutor.isListed ? "Listed" : VERIFICATION_LABEL[tutor.verificationStatus]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tutor.email}
                    {tutor.headline ? ` · ${tutor.headline}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:justify-end">
                  <span>
                    <span className="font-semibold text-foreground">{tutor.lessonsCompleted}</span>{" "}
                    lessons
                  </span>
                  <span>
                    Tutor{" "}
                    <span className="font-semibold text-foreground">
                      {formatMoney(tutor.tutorEarnings, tutor.currency)}
                    </span>
                  </span>
                  <span>
                    Agency{" "}
                    <span className="font-semibold text-foreground">
                      {formatMoney(tutor.agencyEarnings, tutor.currency)}
                    </span>
                  </span>
                  <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9">
                    <Link to="/agency/tutors/$tutorId" params={{ tutorId: tutor.tutorId }}>
                      Manage
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 sm:size-9"
                    aria-label={`Remove ${tutor.fullName ?? "tutor"} from agency`}
                    onClick={() => setRemoving(tutor)}
                  >
                    <UserMinus className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <AlertDialog open={Boolean(removing)} onOpenChange={(next) => !next && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.fullName ?? "this tutor"}?</AlertDialogTitle>
            <AlertDialogDescription>
              They keep their DiaLearn account and bookings, but leave your agency, stop appearing
              in search under your name, and you'll no longer receive a share of their lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction disabled={remove.isPending} onClick={() => void confirmRemove()}>
              Remove from agency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AgencyShell>
  );
}
