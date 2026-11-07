import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api/data-client";
import { formatRelative, useNotifications } from "@/lib/parent-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Booking requests, verification decisions and platform updates, all generated from DiaLearn's notification templates.",
      },
      { property: "og:title", content: "Notifications — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Everything DiaLearn needs to tell you, in one quiet inbox.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorNotificationsPage,
});

function TutorNotificationsPage() {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      await apiPost("/notifications/read", { ids });
      return;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent-notifications"] });
    },
  });

  const rows = notifications.data ?? [];
  const unread = rows.filter((row) => !row.read_at);

  return (
    <TutorShell
      title="Notifications"
      description="Message content comes from DiaLearn's editable notification templates."
      actions={
        unread.length > 0 ? (
          <Button
            variant="outline"
            className="min-h-11 sm:min-h-10"
            disabled={markRead.isPending}
            onClick={async () => {
              try {
                await markRead.mutateAsync(unread.map((row) => row.id));
                toast.success("All caught up");
              } catch {
                toast.error("We couldn't update your notifications.");
              }
            }}
          >
            <Check className="size-4" /> Mark all read
          </Button>
        ) : null
      }
    >
      <div className="max-w-3xl space-y-5">
        {notifications.isLoading ? (
          <CardSkeletonList rows={4} height="h-20" />
        ) : notifications.isError ? (
          <LoadError
            message="We couldn't load your notifications right now."
            onRetry={() => void notifications.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyPanel
            icon={BellOff}
            title="Nothing to read"
            body="Booking requests, verification updates and reminders will land here."
          />
        ) : (
          <SectionCard title={unread.length > 0 ? `${unread.length} unread` : "All notifications"}>
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    row.read_at ? "border-border bg-card" : "border-primary/20 bg-primary-soft/40",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary-deep shadow-soft">
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{row.title}</p>
                    {row.body ? (
                      <p className="mt-1 text-sm text-muted-foreground">{row.body}</p>
                    ) : null}
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatRelative(row.created_at)}
                    </p>
                  </div>
                  {!row.read_at ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 shrink-0 sm:min-h-9"
                      onClick={() => void markRead.mutateAsync([row.id])}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </TutorShell>
  );
}
