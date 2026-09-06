import { useState, type ReactNode } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISPUTE_CATEGORY_LABEL, DISPUTE_CATEGORY_OPTIONS, useRaiseDispute, type DisputeCategory } from "@/lib/disputes";

/**
 * "Report an issue" — the Parent/Student/Tutor-side UI for raise_dispute(),
 * which existed as a callable RPC (Admin Portal Phase 4A) with no UI trigger
 * in any portal until now. Works the same in all three portals since the
 * RPC itself checks the caller is actually party to the booking; each portal
 * just needs to render this next to its booking.
 */
export function ReportIssueDialog({ bookingId, trigger }: { bookingId: string; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DisputeCategory>("other");
  const [description, setDescription] = useState("");
  const raiseDispute = useRaiseDispute();

  function reset() {
    setCategory("other");
    setDescription("");
  }

  async function handleSubmit() {
    if (description.trim().length < 10) {
      toast.error("Give us a few more details (at least 10 characters).");
      return;
    }
    try {
      await raiseDispute.mutateAsync({ bookingId, category, description: description.trim() });
      toast.success("Reported — the DiaLearn team will review it.");
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit your report. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="min-h-11 text-muted-foreground sm:min-h-9">
            <Flag className="size-4" />
            Report an issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Tell us what happened with this lesson. DiaLearn will review it and follow up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>What kind of issue?</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as DisputeCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {DISPUTE_CATEGORY_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-description">What happened?</Label>
            <Textarea
              id="issue-description"
              rows={4}
              placeholder="Share as much detail as you can — dates, what was said, what you expected instead."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={raiseDispute.isPending} onClick={() => void handleSubmit()}>
            {raiseDispute.isPending ? <Loader2 className="size-4 animate-spin" /> : <Flag className="size-4" />}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
