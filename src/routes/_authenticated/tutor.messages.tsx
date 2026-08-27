import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, EmptyPanel, LoadError } from "@/components/parent/ui";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatRelative } from "@/lib/parent-data";
import {
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/messages")({
  head: () => ({
    meta: [
      { title: "Messages — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Message learners and their guardians securely inside DiaLearn, with every conversation kept on the platform.",
      },
      { property: "og:title", content: "Messages — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Secure in-platform conversations with the families you teach.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorMessagesPage,
});

function TutorMessagesPage() {
  const { user } = useAuth();
  const conversations = useConversations();
  const markRead = useMarkConversationRead();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const rows = conversations.data ?? [];
  const active = rows.find((row) => row.id === activeId) ?? rows[0];
  const messages = useMessages(active?.id);
  const send = useSendMessage(active?.id);

  useEffect(() => {
    if (active?.id) void markRead.mutateAsync(active.id).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.data]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      await send.mutateAsync(body);
    } catch {
      toast.error("Message not sent. Please try again.");
    }
  }

  return (
    <TutorShell
      title="Messages"
      description="Conversations with your learners and their guardians stay inside DiaLearn."
    >
      {conversations.isLoading ? (
        <CardSkeletonList rows={4} height="h-20" />
      ) : conversations.isError ? (
        <LoadError
          message="We couldn't load your conversations."
          onRetry={() => void conversations.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={MessagesSquare}
          title="No conversations yet"
          body="Once you have a lesson with a learner you can message them and their guardian from the learner's page."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="card-elevated max-h-[32rem] overflow-y-auto p-2">
            <ul className="space-y-1">
              {rows.map((row) => {
                const selected = row.id === active?.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(row.id)}
                      className={cn(
                        "focus-ring flex w-full min-h-16 items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-200",
                        selected ? "bg-primary-soft" : "hover:bg-surface",
                      )}
                    >
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-card text-xs font-semibold text-primary-deep">
                          {(row.student_first_name ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {row.student_first_name ?? row.subject ?? "Conversation"}
                          </span>
                          {row.unread_count > 0 ? (
                            <span className="shrink-0 rounded-full bg-secondary px-1.5 text-[0.65rem] font-bold text-foreground">
                              {row.unread_count}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {row.last_message ?? "No messages yet"}
                        </span>
                        {row.last_message_at ? (
                          <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                            {formatRelative(row.last_message_at)}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card-elevated flex h-[32rem] min-w-0 flex-col p-4">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold md:text-base">
                  {active?.student_first_name ?? "Conversation"}
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {active?.subject ?? "Learner and guardian"}
                </p>
              </div>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" /> On-platform only
              </span>
            </div>

            <div ref={listRef} className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
              {messages.isLoading ? (
                <>
                  <Skeleton className="h-10 w-2/3 rounded-xl shimmer" />
                  <Skeleton className="ml-auto h-10 w-1/2 rounded-xl shimmer" />
                  <Skeleton className="h-10 w-3/5 rounded-xl shimmer" />
                </>
              ) : (messages.data ?? []).length === 0 ? (
                <p className="rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground">
                  Say hello and share how you plan to support this learner.
                </p>
              ) : (
                (messages.data ?? []).map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        mine
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-surface text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-[0.65rem]",
                          mine ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {formatRelative(message.created_at)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              <label className="sr-only" htmlFor="message-input">
                Message
              </label>
              <Input
                id="message-input"
                className="min-h-11"
                value={draft}
                placeholder="Write a message…"
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                type="submit"
                variant="cta"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label="Send message"
                disabled={send.isPending || !active}
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </TutorShell>
  );
}
