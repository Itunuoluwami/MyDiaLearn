import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { ClassStage } from "@/components/classroom/ClassStage";
import { DeviceControls } from "@/components/classroom/DeviceControls";
import { Whiteboard } from "@/components/classroom/Whiteboard";
import { useLocalMedia } from "@/components/classroom/use-local-media";
import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJoinClass, useStudentBookings } from "@/lib/student-data";

export const Route = createFileRoute("/_authenticated/student/classroom/$bookingId")({
  head: () => ({
    meta: [
      { title: "Live Classroom — DiaLearn Student Portal" },
      { name: "description", content: "Join your live class with your tutor." },
    ],
  }),
  component: StudentClassroomPage,
});

/** How long the class has been running, from the tutor's start. */
function elapsedLabel(from: string | null, until: string | null, now: number): string {
  if (!from) return "Not started";
  const end = until ? new Date(until).getTime() : now;
  const seconds = Math.max(0, Math.floor((end - new Date(from).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function StudentClassroomPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();

  // Joining is what authorizes this screen and records that the learner
  // turned up — the page used to read a meeting URL off the bookings list,
  // which did neither.
  const session = useJoinClass(bookingId);
  const bookings = useStudentBookings({ statuses: ["confirmed", "in_progress"] });
  const booking = (bookings.data ?? []).find((row) => row.id === bookingId);

  const media = useLocalMedia();
  const [handRaised, setHandRaised] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const data = session.data;
  const live = data?.status === "in_progress" || Boolean(data?.started_at && !data.ended_at);

  // Only tick while the clock is actually moving.
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [live]);

  const subject = data?.subject_name ?? "Class";
  const tutor = data?.tutor_name ?? "your tutor";

  if (session.isLoading) {
    return (
      <StudentShell title="Classroom">
        <Skeleton className="aspect-video w-full rounded-2xl" />
      </StudentShell>
    );
  }

  if (session.isError || !data) {
    return (
      <StudentShell title="Classroom">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
          <span className="text-6xl">🚫</span>
          <p className="text-xl font-extrabold text-foreground">You can't open this class</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Only the learner and the family on this booking can join, and the lesson has to be
            confirmed first.
          </p>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <Link to="/student/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell title={`📡 ${subject}`} description={`Live class with ${tutor}`}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <ClassStage
            meetingUrl={data.meeting_url}
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
                void navigate({ to: "/student/dashboard" });
              }}
              leaveLabel="Leave class"
            />
          </div>

          {!live ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Your tutor hasn't started the class yet. You can turn your camera on and check how you
              look while you wait — this page updates on its own when they begin.
            </div>
          ) : null}

          <p className="flex items-start gap-2 rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Only you and your tutor can open this room, and your attendance is recorded against the
            lesson.
          </p>
        </div>

        <div className="min-w-0">
          <Tabs defaultValue="whiteboard">
            <TabsList className="w-full">
              <TabsTrigger value="whiteboard" className="min-h-11 flex-1">
                Whiteboard
              </TabsTrigger>
              <TabsTrigger value="lesson" className="min-h-11 flex-1">
                Lesson
              </TabsTrigger>
            </TabsList>

            <TabsContent value="whiteboard" className="mt-4">
              <Whiteboard />
            </TabsContent>

            <TabsContent value="lesson" className="mt-4">
              <div className="card-elevated space-y-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Subject
                  </p>
                  <p className="mt-1 text-sm">{subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tutor
                  </p>
                  <p className="mt-1 text-sm">{tutor}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Planned length
                  </p>
                  <p className="mt-1 text-sm">{data.duration_minutes} minutes</p>
                </div>
                {booking?.class_sessions?.[0]?.homework ? (
                  <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-3">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-secondary-foreground">
                      Homework from last session
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {booking.class_sessions[0].homework}
                    </p>
                  </div>
                ) : null}
                <Button asChild variant="outline" className="min-h-11 w-full rounded-xl">
                  <Link to="/student/materials">Open my assignments</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StudentShell>
  );
}
