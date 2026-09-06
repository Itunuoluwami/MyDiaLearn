import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/parent-data";

/* ---------------- status badges (labels only, values are backend enums) ---------------- */

const BOOKING_TONE: Record<BookingStatus, string> = {
  pending: "bg-secondary-soft text-foreground",
  confirmed: "bg-primary-soft text-primary-deep",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-success/12 text-success",
  cancelled: "bg-muted text-muted-foreground",
  rejected: "bg-muted text-muted-foreground",
  no_show: "bg-destructive/12 text-destructive",
};

export function BookingStatusBadge({
  status,
  startingSoon,
}: {
  status: BookingStatus;
  startingSoon?: boolean;
}) {
  const label = startingSoon && status === "confirmed" ? "Starting soon" : BOOKING_STATUS_LABEL[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        BOOKING_TONE[status],
      )}
    >
      {status === "in_progress" ? (
        <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {label}
    </span>
  );
}

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  pending: "bg-secondary-soft text-foreground",
  processing: "bg-primary-soft text-primary-deep",
  paid: "bg-success/12 text-success",
  failed: "bg-destructive/12 text-destructive",
  refunded: "bg-muted text-muted-foreground",
  partially_refunded: "bg-muted text-muted-foreground",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        PAYMENT_TONE[status],
      )}
    >
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}

/* ---------------- KPI cards ---------------- */

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "secondary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary";
}) {
  const primary = variant === "primary";
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-200 hover:shadow-lift",
        primary
          ? "border-primary/15 bg-primary-soft/60 shadow-soft"
          : "border-border bg-card shadow-soft",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            primary ? "bg-primary text-primary-foreground" : "bg-surface text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 font-semibold tabular-nums",
          primary ? "text-3xl text-primary-deep" : "text-2xl",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* ---------------- section wrapper ---------------- */

export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("card-elevated p-4 md:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="display-section text-lg md:text-xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ---------------- loading + error + empty ---------------- */

export function CardSkeletonList({ rows = 3, height = "h-24" }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className={cn("w-full rounded-2xl shimmer", height)} />
      ))}
    </div>
  );
}

export function KpiSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-2xl shimmer" />
      ))}
    </div>
  );
}

export function LoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <p className="text-sm text-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" className="min-h-11 sm:min-h-9" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyPanel({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/60 px-5 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ---------------- trust + meta chips ---------------- */

export function VerifiedChip({ status }: { status?: string | null }) {
  if (status !== "verified") return null;
  return (
    <Badge variant="secondary" className="gap-1 text-[0.7rem]">
      Verified tutor
    </Badge>
  );
}

export function MetaItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Used where a capability exists in the product but has no backend support yet. */
export function NotAvailableYet({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="card-elevated flex flex-col items-center px-5 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary-soft text-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="display-section mt-5 text-xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      <Badge variant="outline" className="mt-5">
        Coming soon
      </Badge>
    </div>
  );
}
