import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Circle,
  ExternalLink,
  Hand,
  Mic,
  MicOff,
  MonitorUp,
  NotebookPen,
  PenLine,
  Send,
  ShieldCheck,
  Square,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, LoadError, SectionCard } from "@/components/parent/ui";
import { BookingStatusBadge } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassStage } from "@/components/classroom/ClassStage";
import { DeviceControls } from "@/components/classroom/DeviceControls";
import { Whiteboard } from "@/components/classroom/Whiteboard";
import { useLocalMedia } from "@/components/classroom/use-local-media";
import { formatDayInZone, formatTimeInZone } from "@/lib/parent-data";
import { useTutorBookings, useTutorTimezone } from "@/lib/tutor-data";
import {
  useClassSession,
  useConversations,
  useEndClass,
  useMessages,
  useSendMessage,
  useStartClass,
  useStartConversation,
} from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/classroom/$bookingId")({
  head: () => ({
    meta: [
      { title: "Live classroom — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Run your DiaLearn lesson: video area, shared whiteboard, class chat and a lesson timer, with access limited to the people in the booking.",
      },
      { property: "og:title", content: "Live classroom — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Your teaching room for confirmed DiaLearn lessons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassroomPage,
});

function elapsedLabel(from: string | null, until: string | null, now: number) {
  if (!from) return "Not started";
  const end = until ? new Date(until).getTime() : now;
  const seconds = Math.max(0, Math.floor((end - new Date(from).getTime()) / 1000));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function ClassroomPage() {
  const { bookingId } = useParams({ from: "/_authenticated/tutor/classroom/$bookingId" });
  const timezone = useTutorTimezone();
  const session = useClassSession(bookingId);
  const bookings = useTutorBookings();
  const startClass = useStartClass();
  const endClass = useEndClass();
  const [now, setNow] = useState(() => Date.now());
  // Real devices, not just button state: the mic and camera buttons open the
  // tutor's own hardware so they can check framing before the learner arrives.
  const navigate = useNavigate();
  const media = useLocalMedia();
  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const booking = (bookings.data ?? []).find((row) => row.id === bookingId);
  const data = session.data;
  const live = data?.status === "in_progress";

  async function handleStart() {
    try {
      await startClass.mutateAsync(bookingId);
      toast.success("Class started");
    } catch {
      toast.error("We couldn't start this class yet.");
    }
  }

  async function handleEnd(studentAttended: boolean) {
    try {
      await endClass.mutateAsync({ bookingId, studentAttended });
      toast.success("Class ended — add your lesson notes while it's fresh");
    } catch {
      toast.error("We couldn't end this class.");
    }
  }

  return (
    <TutorShell
      title="Live classroom"
      description={
        data
          ? `${data.subject_name ?? "Lesson"} with ${data.student_first_name ?? "your learner"}`
          : "Your teaching room"
      }
      actions={
        <Button asChild variant="outline" className="min-h-11 sm:min-h-10">
          <Link to="/tutor/classes">
            <ArrowLeft className="size-4" /> Back to classes
          </Link>
        </Button>
      }
    >
      {session.isLoading ? (
        <CardSkeletonList rows={2} height="h-56" />
      ) : session.isError ? (
        <LoadError
          message="This class isn't available to you. Only the tutor and family on the booking can open a classroom."
          onRetry={() => void session.refetch()}
        />
      ) : !data ? (
        <LoadError message="We couldn't find that class." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-4">
            <ClassStage
              meetingUrl={data.meeting_url ?? null}
              live={live}
              elapsed={elapsedLabel(data.started_at, data.ended_at, now)}
              media={media}
              selfLabel="You"
            />

            <div className="overflow-hidden rounded-2xl border border-border bg-ink shadow-soft">
              <DeviceControls
                media={media}
                handRaised={handRaised}
                onToggleHand={() => setHandRaised((value) => !value)}
                onLeave={() => {
                  media.stopAll();
                  void navigate({ to: "/tutor/classes" });
                }}
                leaveLabel="Leave room"
              >
                {live ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 sm:min-h-10"
                      disabled={endClass.isPending}
                      onClick={() => void handleEnd(false)}
                    >
                      Learner didn't join
                    </Button>
                    <Button
                      variant="cta"
                      size="sm"
                      className="min-h-11 sm:min-h-10"
                      disabled={endClass.isPending}
                      onClick={() => void handleEnd(true)}
                    >
                      <Square className="size-4" /> End class
                    </Button>
                  </>
                ) : data.status === "completed" ? (
                  <Button asChild variant="cta" size="sm" className="min-h-11 sm:min-h-10">
                    <Link to="/tutor/notes/$bookingId" params={{ bookingId }}>
                      <NotebookPen className="size-4" /> Lesson notes
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="cta"
                    size="sm"
                    className="min-h-11 sm:min-h-10"
                    disabled={startClass.isPending}
                    onClick={() => void handleStart()}
                  >
                    <Circle className="size-4 fill-current" /> Start class
                  </Button>
                )}
              </DeviceControls>
            </div>

            <SectionCard
              title="Lesson details"
              description="Times shown in your own timezone"
              action={<BookingStatusBadge status={data.status} />}
            >
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Scheduled
                  </dt>
                  <dd className="mt-1 text-sm">
                    {formatDayInZone(data.starts_at, timezone)} ·{" "}
                    {formatTimeInZone(data.starts_at, timezone)} –{" "}
                    {formatTimeInZone(data.ends_at, timezone)} ({timezone})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Planned length
                  </dt>
                  <dd className="mt-1 text-sm">{data.duration_minutes} minutes</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Learner
                  </dt>
                  <dd className="mt-1 text-sm">{data.student_first_name ?? "Student"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Subject
                  </dt>
                  <dd className="mt-1 text-sm">{data.subject_name ?? "Lesson"}</dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Only you and the family on this booking can open this room. Attendance and timings
                are recorded against the lesson.
              </p>
            </SectionCard>
          </div>

          <div className="min-w-0">
            <Tabs defaultValue="chat">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="min-h-11 flex-1">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="whiteboard" className="min-h-11 flex-1">
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value="people" className="min-h-11 flex-1">
                  People
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <ClassChat studentId={booking?.student_id ?? null} subject={data.subject_name} />
              </TabsContent>

              <TabsContent value="whiteboard" className="mt-4">
                <Whiteboard />
              </TabsContent>

              <TabsContent value="people" className="mt-4">
                <div className="card-elevated p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="size-4 text-primary" aria-hidden="true" /> In this class
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center justify-between rounded-xl bg-surface/70 px-3 py-2">
                      <span>You (tutor)</span>
                      <span className="text-xs text-muted-foreground">Host</span>
                    </li>
                    <li className="flex items-center justify-between rounded-xl bg-surface/70 px-3 py-2">
                      <span>{data.student_first_name ?? "Student"}</span>
                      <span className="text-xs text-muted-foreground">Learner</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Guardians can follow the lesson from their own portal.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </TutorShell>
  );
}

function ClassChat({ studentId, subject }: { studentId: string | null; subject: string | null }) {
  const conversations = useConversations();
  const startConversation = useStartConversation();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const conversationId = useMemo(() => {
    if (!studentId) return undefined;
    return (conversations.data ?? []).find((row) => row.student_id === studentId)?.id;
  }, [conversations.data, studentId]);

  const messages = useMessages(conversationId);
  const send = useSendMessage(conversationId);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.data]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;
    try {
      if (!conversationId) {
        if (!studentId) throw new Error("no student");
        await startConversation.mutateAsync({ studentId, ...(subject ? { subject } : {}) });
        await conversations.refetch();
      }
      setDraft("");
      await send.mutateAsync(body);
    } catch {
      toast.error("Message not sent. Please try again.");
    }
  }

  return (
    <div className="card-elevated flex h-[26rem] flex-col p-4">
      <h3 className="text-sm font-semibold">Class chat</h3>
      <div ref={listRef} className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.isLoading ? (
          <>
            <Skeleton className="h-10 w-3/4 rounded-xl shimmer" />
            <Skeleton className="ml-auto h-10 w-2/3 rounded-xl shimmer" />
          </>
        ) : (messages.data ?? []).length === 0 ? (
          <p className="rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground">
            Messages sent here stay on DiaLearn and are visible to the learner and their guardian.
          </p>
        ) : (
          (messages.data ?? []).map((message) => (
            <p key={message.id} className="rounded-xl bg-surface/70 p-3 text-sm">
              {message.body}
            </p>
          ))
        )}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <label className="sr-only" htmlFor="class-chat-input">
          Message
        </label>
        <Input
          id="class-chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message…"
          className="min-h-11"
          disabled={!studentId}
        />
        <Button
          type="submit"
          variant="cta"
          size="icon"
          className="min-h-11 min-w-11"
          aria-label="Send message"
          disabled={!studentId || send.isPending}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
