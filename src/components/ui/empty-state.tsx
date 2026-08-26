import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared empty state: icon in a soft brand medallion, a plain-language title,
 * one helpful sentence and an optional next action. Never "No data".
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-warm flex flex-col items-center justify-center px-6 py-10 text-center animate-fade-in",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-secondary-soft text-primary-deep shadow-soft"
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-lg">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
