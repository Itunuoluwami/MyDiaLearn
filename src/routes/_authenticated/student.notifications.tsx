import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentNotifications } from "@/lib/student-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatRelative } from "@/lib/parent-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DiaLearn Student Portal" },
      { name: "description", content: "Your latest notifications from DiaLearn." },
    ],
  }),
  component: StudentNotificationsPage,
});

function useMarkAllRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });
}

const EMOJI: Record<string, string> = {
  booking_confirmed: "✅",
  booking_cancelled: "❌",
  booking_reminder: "🔔",
  new_message: "💬",
  assignment_graded: "📝",
  class_starting: "🚀",
  default: "📢",
};

function StudentNotificationsPage() {
  const notifications = useStudentNotifications();
  const markAll = useMarkAllRead();

  const items = notifications.data ?? [];
  const unreadCount = items.filter((n) => !n.read_at).length;

  function getEmoji(title: string) {
    for (const [key, emoji] of Object.entries(EMOJI)) {
      if (title.toLowerCase().includes(key.replace("_", " "))) return emoji;
    }
    return EMOJI.default;
  }

  return (
    <StudentShell
      title="🔔 Notifications"
      description="Stay on top of your classes, assignments and messages."
      actions={
        unreadCount > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className="min-h-10 rounded-xl font-bold"
            onClick={() => void markAll.mutateAsync()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="size-4 mr-1" /> Mark all read
          </Button>
        ) : undefined
      }
    >
      <div className="max-w-2xl space-y-3">
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3">
            <Bell className="size-4 text-primary" />
            <p className="text-sm font-bold text-primary">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {notifications.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
            <BellOff className="size-12 text-muted-foreground" />
            <p className="font-extrabold text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">No new notifications right now.</p>
          </div>
        ) : (
          items.map((n) => {
            const isUnread = !n.read_at;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-4 transition-all",
                  isUnread
                    ? "border-primary/25 bg-primary/5 shadow-sm"
                    : "border-border bg-card opacity-75",
                )}
              >
                <div className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl",
                  isUnread ? "bg-primary/10" : "bg-muted",
                )}>
                  {getEmoji(n.title ?? "")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("font-bold text-sm", isUnread ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    {isUnread && (
                      <span className="size-2 shrink-0 rounded-full bg-accent mt-1.5" />
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{n.body}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelative(n.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}
