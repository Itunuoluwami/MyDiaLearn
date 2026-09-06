import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { StudentShell } from "@/components/student/StudentShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatRelative } from "@/lib/parent-data";
import { useStudentRecord } from "@/lib/student-data";
import {
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/messages")({
  head: () => ({
    meta: [
      { title: "Messages — DiaLearn Student Portal" },
      { name: "description", content: "Send and receive messages with your tutors securely on DiaLearn." },
    ],
  }),
  component: StudentMessagesPage,
});

function StudentMessagesPage() {
  const { user } = useAuth();
  const { data: student } = useStudentRecord();
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

  // Guard: student may not be allowed to message tutors
  if (student && !student.can_message_tutors) {
    return (
      <StudentShell title="💬 Messages">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center max-w-md mx-auto">
          <span className="text-5xl">🔒</span>
          <p className="text-xl font-extrabold text-foreground">Messaging not enabled</p>
          <p className="text-sm text-muted-foreground">Ask your parent to enable messaging in your account settings.</p>
        </div>
      </StudentShell>
    );
  }

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
    <StudentShell
      title="💬 Messages"
      description="Chat with your tutors — all conversations stay safe on DiaLearn."
    >
      {conversations.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center max-w-md mx-auto">
          <span className="text-5xl">💬</span>
          <p className="text-xl font-extrabold text-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground">After your first class, you can message your tutor here.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          {/* Conversation List */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-primary/5 px-4 py-3">
              <p className="text-sm font-extrabold text-primary-deep">Conversations</p>
            </div>
            <ul className="max-h-[32rem] overflow-y-auto divide-y divide-border/50">
              {rows.map((row) => {
                const selected = row.id === active?.id;
                const initials = (row.student_first_name ?? "T").charAt(0).toUpperCase();
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(row.id)}
                      className={cn(
                        "focus-ring flex w-full min-h-16 items-center gap-3 px-4 py-3 text-left transition-colors",
                        selected ? "bg-primary/10" : "hover:bg-muted/50",
                      )}
                    >
                      <Avatar className="size-10 shrink-0">
                        <AvatarFallback className={cn("text-sm font-extrabold", selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-extrabold text-foreground">
                            {row.student_first_name ?? row.subject ?? "Tutor"}
                          </span>
                          {row.unread_count > 0 && (
                            <span className="shrink-0 flex size-5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-white">
                              {row.unread_count}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {row.last_message ?? "No messages yet"}
                        </span>
                        {row.last_message_at && (
                          <span className="text-[0.65rem] text-muted-foreground">
                            {formatRelative(row.last_message_at)}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Chat Window */}
          <div className="flex h-[32rem] flex-col rounded-2xl border border-border bg-card overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-primary text-sm font-extrabold text-primary-foreground">
                    {(active?.student_first_name ?? "T").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-extrabold text-foreground truncate text-sm">
                    {active?.student_first_name ?? "Tutor"}
                  </p>
                  <p className="text-xs text-muted-foreground">{active?.subject ?? "Your tutor"}</p>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <ShieldCheck className="size-3.5 text-primary" /> On-platform only
              </span>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.isLoading ? (
                <>
                  <Skeleton className="h-10 w-2/3 rounded-2xl" />
                  <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
                  <Skeleton className="h-10 w-3/5 rounded-2xl" />
                </>
              ) : (messages.data ?? []).length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="text-3xl">👋</span>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Say hi to start the conversation!
                  </p>
                </div>
              ) : (
                (messages.data ?? []).map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                        mine
                          ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p className={cn("mt-1 text-[0.65rem]", mine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {formatRelative(message.created_at)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form
              className="flex gap-3 border-t border-border bg-card/80 p-4"
              onSubmit={(e) => { e.preventDefault(); void handleSend(); }}
            >
              <label className="sr-only" htmlFor="student-message-input">Message</label>
              <Input
                id="student-message-input"
                className="min-h-11 flex-1 rounded-2xl"
                value={draft}
                placeholder="Type a message…"
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="min-h-11 min-w-11 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Send message"
                disabled={send.isPending || !active}
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </StudentShell>
  );
}
