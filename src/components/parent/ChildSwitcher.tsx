import { Link } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { childInitials, childName, type Child } from "@/lib/parent-data";
import { EmptyPanel } from "@/components/parent/ui";

/**
 * Reusable child selector. Horizontal and thumb-friendly on mobile, compact
 * chips on desktop. Selection is owned by the caller so every screen can scope
 * its data to exactly one child.
 */
export function ChildSwitcher({
  children: kids,
  selectedId,
  onSelect,
  allowAll = true,
  className,
}: {
  children: Child[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  allowAll?: boolean;
  className?: string;
}) {
  if (kids.length === 0) {
    return (
      <EmptyPanel
        icon={Users}
        title="Add your first learner"
        body="Create a profile to start finding tutors and managing their learning journey."
        action={
          <Button asChild variant="cta" className="min-h-11">
            <Link to="/children">
              <Plus className="size-4" /> Add child
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Select a child"
      className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}
    >
      {allowAll ? (
        <button
          type="button"
          role="tab"
          aria-selected={selectedId === null}
          onClick={() => onSelect(null)}
          className={cn(
            "focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200",
            selectedId === null
              ? "border-primary bg-primary text-primary-foreground shadow-soft"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Users className="size-4" aria-hidden="true" /> All children
        </button>
      ) : null}

      {kids.map((child) => {
        const active = selectedId === child.id;
        return (
          <button
            key={child.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(child.id)}
            className={cn(
              "focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-full border pl-1.5 pr-4 text-sm font-medium transition-all duration-200",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary-soft text-primary-deep",
              )}
            >
              {childInitials(child)}
            </span>
            <span className="max-w-28 truncate">{childName(child)}</span>
          </button>
        );
      })}
    </div>
  );
}
