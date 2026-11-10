import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessagesSquare, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ParentShell } from "@/components/parent/ParentShell";
import { EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
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

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "Messages — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Talk to your children's tutors. Every conversation stays on DiaLearn so there is a record.",
      },
      { property: "og:title", content: "Messages — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "Talk to your children's tutors, on the record.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParentMessagesPage,
});

function ParentMessagesPage() {
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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
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
    <ParentShell
      title="Messages"
      description="Conversations with your children's tutors stay inside DiaLearn."
    >
      {conversations.isLoading ? (
        <SectionCard title="Conversations">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        </SectionCard>
      ) : conversations.isError ? (
        <SectionCard title="Conversations">
          <LoadError
            message="We couldn't load your conversations right now."
            onRetry={() => void conversations.refetch()}
          />
        </SectionCard>
      ) : rows.length === 0 ? (
        <SectionCard title="Conversations">
          <EmptyPanel
            icon={MessagesSquare}
            title="No conversations yet"
            body="Once a lesson is booked, you can message that tutor here. Keeping it on DiaLearn means there is always a record."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/find-tutor">Find a tutor</Link>
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border bg-primary/5 px-4 py-3">
              <p className="text-sm font-extrabold text-primary-deep">Conversations</p>
            </div>
            <ul className="max-h-[32rem] divide-y divide-border/50 overflow-y-auto">
              {rows.map((row) => {
                const selected = row.id === active?.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(row.id)}
                      className={cn(
                        "focus-ring flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                        selected ? "bg-primary/10" : "hover:bg-muted/50",
                      )}
                    >
                      <Avatar className="size-10 shrink-0">
                        <AvatarFallback
                          className={cn(
                            "text-sm font-extrabold",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {(row.student_first_name ?? "T").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-extrabold text-foreground">
                            {row.student_first_name ?? row.subject ?? "Tutor"}
                          </span>
                          {row.unread_count > 0 ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-white">
                              {row.unread_count}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {row.last_message ?? "No messages yet"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-primary text-sm font-extrabold text-primary-foreground">
                    {(active?.student_first_name ?? "T").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-foreground">
                    {active?.student_first_name ?? "Tutor"}
                  </p>
                  <p className="text-xs text-muted-foreground">{active?.subject ?? "Your tutor"}</p>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <ShieldCheck className="size-3.5 text-primary" /> On-platform only
              </span>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.isLoading ? (
                <>
                  <Skeleton className="h-10 w-2/3 rounded-2xl" />
                  <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
                </>
              ) : (messages.data ?? []).length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No messages yet — say hello.
                </p>
              ) : (
                (messages.data ?? []).map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                        mine
                          ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-[0.65rem]",
                          mine ? "text-primary-foreground/60" : "text-muted-foreground",
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
              className="flex gap-3 border-t border-border bg-card/80 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              <label className="sr-only" htmlFor="parent-message-input">
                Message
              </label>
              <Input
                id="parent-message-input"
                className="min-h-11 flex-1 rounded-2xl"
                value={draft}
                placeholder="Type a message…"
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="min-h-11 min-w-11 rounded-2xl"
                disabled={send.isPending || draft.trim().length === 0}
              >
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </ParentShell>
  );
}
