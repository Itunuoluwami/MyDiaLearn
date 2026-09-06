import { Check } from "lucide-react";

import type { PaymentStatus, BookingStatus } from "@/lib/parent-data";
import { PAYMENT_STATUS_LABEL } from "@/lib/parent-data";
import { cn } from "@/lib/utils";

/**
 * Four honest states, in order. Booking status and payment status are separate
 * backend fields — a lesson is only confirmed once the tutor has accepted AND
 * the payment record reports success.
 */
export function BookingLifecycle({
  status,
  paymentStatus,
  acceptedAt,
  className,
}: {
  status: BookingStatus;
  paymentStatus: PaymentStatus | null;
  acceptedAt: string | null;
  className?: string;
}) {
  const paid = paymentStatus === "paid";
  const confirmed = status === "confirmed" || status === "in_progress" || status === "completed";

  const steps = [
    { label: "Lesson requested", done: true },
    { label: "Tutor accepted", done: Boolean(acceptedAt) || confirmed },
    {
      label: paymentStatus ? `Payment ${PAYMENT_STATUS_LABEL[paymentStatus].toLowerCase()}` : "Payment pending",
      done: paid,
    },
    { label: "Booking confirmed", done: confirmed },
  ];

  return (
    <ol className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.6rem] font-semibold transition-colors duration-200",
              step.done
                ? "border-success/30 bg-success/15 text-success"
                : "border-border bg-surface text-muted-foreground",
            )}
            aria-hidden="true"
          >
            {step.done ? <Check className="size-3" /> : index + 1}
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              step.done ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {step.label}
            <span className="sr-only">{step.done ? " — done" : " — not yet"}</span>
          </span>
          {index < steps.length - 1 ? (
            <span className="hidden h-px w-6 bg-border sm:block" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
