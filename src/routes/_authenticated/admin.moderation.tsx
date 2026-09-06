import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EyeOff, Search, ShieldAlert, Star } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  useModerationMessages,
  useModerationReviews,
  useSetMessageHidden,
  useSetReviewPublished,
} from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin/moderation")({
  head: () => ({
    meta: [
      { title: "Moderation — DiaLearn admin" },
      { name: "description", content: "Moderate reviews and messages; suspend accounts from Users." },
    ],
  }),
  component: AdminModerationPage,
});

function ReviewsTab() {
  const reviews = useModerationReviews();
  const setPublished = useSetReviewPublished();

  return (
    <div className="panel-portal mt-4 p-4 md:p-6">
      <p className="text-sm text-muted-foreground">Every review, newest first. Unpublish anything that shouldn't be shown publicly.</p>
      <ul className="mt-4 space-y-3">
        {reviews.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (reviews.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          (reviews.data ?? []).map((review) => (
            <li key={review.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={i < review.score ? "size-3.5 fill-warning text-warning" : "size-3.5 text-muted"} />
                    ))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.profiles?.full_name ?? "Anonymous"} → {review.tutors?.profiles?.full_name ?? "Tutor"} ·{" "}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={review.is_published}
                    aria-label="Published"
                    onCheckedChange={(checked) =>
                      setPublished.mutate(
                        { id: review.id, isPublished: checked },
                        { onError: (error) => toast.error((error as Error).message) },
                      )
                    }
                  />
                  <span className="text-xs text-muted-foreground">{review.is_published ? "Published" : "Hidden"}</span>
                </div>
              </div>
              {review.comment ? <p className="mt-2 text-sm">{review.comment}</p> : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function MessagesTab() {
  const [search, setSearch] = useState("");
  const messages = useModerationMessages(search);
  const setHidden = useSetMessageHidden();

  return (
    <div className="panel-portal mt-4 p-4 md:p-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search message content (2+ characters)"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {search.trim().length <= 1 ? (
          <p className="text-sm text-muted-foreground">Search for a word or phrase to find messages to moderate.</p>
        ) : messages.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (messages.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages match.</p>
        ) : (
          (messages.data ?? []).map((message) => (
            <li key={message.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{message.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {message.profiles?.full_name ?? "Unknown"} · {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {message.is_hidden ? <Badge variant="outline">Hidden</Badge> : null}
                <Button
                  variant={message.is_hidden ? "outline" : "ghost"}
                  size="sm"
                  className={message.is_hidden ? undefined : "text-destructive"}
                  onClick={() =>
                    setHidden.mutate(
                      { id: message.id, isHidden: !message.is_hidden, reason: "Hidden by admin" },
                      { onError: (error) => toast.error((error as Error).message) },
                    )
                  }
                >
                  <EyeOff className="size-4" />
                  {message.is_hidden ? "Unhide" : "Hide"}
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function AdminModerationPage() {
  const { hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <AdminShell title="Moderation">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.moderation")) {
    return (
      <AdminShell title="Moderation">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include content moderation permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Moderation"
      description="Reviews and messages. Flagged profiles are suspended from the Users page — no separate flow needed."
    >
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>
      </Tabs>
      <p className="mt-4 text-xs text-muted-foreground">
        Looking to suspend an account? Head to{" "}
        <Link to="/admin/users" className="underline underline-offset-2">
          Users
        </Link>
        .
      </p>
    </AdminShell>
  );
}
