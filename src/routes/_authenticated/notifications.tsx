import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { apiPost } from "@/lib/api/data-client";
import { ParentShell } from "@/components/parent/ParentShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelative, useNotifications } from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Class reminders, booking confirmations, payment receipts and tutor messages for your whole family.",
      },
      { property: "og:title", content: "Notifications — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "Every DiaLearn alert for your family in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const rows = notifications.data ?? [];
  const unread = rows.filter((row) => !row.read_at);

  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length) await apiPost("/notifications/read", { ids });
      return;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["parent-notifications"] });
    },
    onError: () => toast.error("We couldn't update your notifications. Please try again."),
  });

  return (
    <ParentShell
      title="Notifications"
      description="Reminders and updates generated from the platform's notification templates."
      actions={
        unread.length > 0 ? (
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => markRead.mutate(unread.map((row) => row.id))}
          >
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        ) : undefined
      }
    >
      <SectionCard
        title="Your alerts"
        description={unread.length > 0 ? `${unread.length} unread` : "You're all caught up."}
      >
        {notifications.isLoading ? (
          <CardSkeletonList rows={4} height="h-16" />
        ) : notifications.isError ? (
          <LoadError
            message="We couldn't load your notifications right now."
            onRetry={() => void notifications.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyPanel
            icon={Bell}
            title="No notifications yet"
            body="Class reminders and booking updates will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  row.read_at ? "border-border bg-card" : "border-primary/30 bg-primary-soft/40",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{row.title ?? "DiaLearn update"}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{row.body}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(row.created_at)}
                    </span>
                    {!row.read_at ? <Badge variant="secondary">New</Badge> : null}
                  </div>
                </div>
                {!row.read_at ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 min-h-11 sm:min-h-9"
                    onClick={() => markRead.mutate([row.id])}
                  >
                    Mark as read
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </ParentShell>
  );
}
