import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { formatMoney } from "@/lib/parent-data";
import { usePayForBooking } from "@/lib/payments";

/**
 * "Pay now" — completes payment for a booking so it can move to confirmed.
 * DiaLearn doesn't have a live payment gateway wired into this codebase, so
 * this is explicit about simulating an instant successful charge rather than
 * showing a fake card form; it still records a real payments row and drives
 * the real (already-built) payment-gated confirmation flow.
 */
export function PayNowButton({
  bookingId,
  amount,
  currency,
  size = "sm",
}: {
  bookingId: string;
  amount: number;
  currency: string;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const pay = usePayForBooking();

  async function handleConfirm() {
    try {
      await pay.mutateAsync(bookingId);
      toast.success("Payment complete — this lesson is confirmed once your tutor accepts.");
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("ALREADY_PAID")) {
        toast.info("This lesson is already paid for.");
        setOpen(false);
        return;
      }
      toast.error("We couldn't process that payment. Please try again.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="cta"
        size={size}
        className={size === "sm" ? "min-h-11 sm:min-h-9" : "min-h-12 w-full"}
        onClick={() => setOpen(true)}
      >
        <CreditCard className="size-4" />
        Pay {formatMoney(amount, currency)}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete payment</AlertDialogTitle>
          <AlertDialogDescription>
            {formatMoney(amount, currency)} for this lesson. DiaLearn doesn't have a live payment
            gateway connected in this build, so confirming here simulates a successful charge and
            immediately marks the lesson as paid — it moves to confirmed once your tutor also
            accepts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pay.isPending} onClick={() => void handleConfirm()}>
            {pay.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
