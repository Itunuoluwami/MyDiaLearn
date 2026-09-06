import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneCall, Video, Wifi, WifiOff } from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { useStudentBookings } from "@/lib/student-data";
import { useStudentRecord } from "@/lib/student-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/classroom/$bookingId")({
  head: () => ({
    meta: [
      { title: "Live Classroom — DiaLearn Student Portal" },
      { name: "description", content: "Join your live class with your tutor." },
    ],
  }),
  component: StudentClassroomPage,
});

function StudentClassroomPage() {
  const { bookingId } = Route.useParams();
  const { data: student } = useStudentRecord();
  const bookings = useStudentBookings({ statuses: ["confirmed", "in_progress"] });

  const booking = (bookings.data ?? []).find((b) => b.id === bookingId);
  const session = booking?.class_sessions?.[0];
  const meetingUrl = session?.meeting_url;

  const tutorName = (booking as typeof booking & { tutors?: { profiles?: { full_name?: string } | null } | null })?.tutors?.profiles?.full_name ?? "Your Tutor";
  const subjectName = (booking as typeof booking & { subjects?: { name: string } | null })?.subjects?.name ?? "Class";

  if (!booking && !bookings.isLoading) {
    return (
      <StudentShell title="Classroom">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
          <span className="text-6xl">🚫</span>
          <p className="text-xl font-extrabold text-foreground">Class not found</p>
          <p className="text-sm text-muted-foreground">This class may not exist or hasn't started yet.</p>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <Link to="/student/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell title={`📡 ${subjectName}`} description={`Live class with ${tutorName}`}>
      <div className="max-w-4xl space-y-5">
        {/* Live Indicator */}
        <div className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
            <Video className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-75">Live Now</p>
            <p className="font-extrabold">{subjectName} with {tutorName}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-white" />
            </span>
            <span className="text-sm font-bold">LIVE</span>
          </div>
        </div>

        {/* Video Area */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary-deep via-primary to-secondary aspect-video w-full shadow-xl",
        )}>
          {meetingUrl ? (
            <iframe
              src={meetingUrl}
              title="Live class"
              allow="camera; microphone; fullscreen; speaker-selection"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            /* Placeholder UI for MVP */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <div className="flex size-24 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <Video className="size-12 text-white" />
              </div>
              <p className="text-2xl font-extrabold">Waiting for your tutor…</p>
              <p className="text-sm opacity-75">The class will begin shortly.</p>
              <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                <Wifi className="size-4" />
                <span className="text-sm font-semibold">Connection ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4">
          <ControlBtn
            icon={Video}
            label="Camera"
            active
          />
          <ControlBtn
            icon={PhoneCall}
            label="Microphone"
            active
          />
          <ControlBtn
            icon={Wifi}
            label="Connection"
            active
          />
          <Button
            asChild
            variant="outline"
            className="ml-auto min-h-11 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Link to="/student/dashboard">Leave Class</Link>
          </Button>
        </div>

        {/* Homework / Notes from tutor if available */}
        {session?.homework && (
          <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary-foreground">
              Homework from last session
            </p>
            <p className="text-sm text-foreground">{session.homework}</p>
          </div>
        )}
      </div>
    </StudentShell>
  );
}

function ControlBtn({ icon: Icon, label, active }: { icon: React.ElementType; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        className={cn(
          "flex size-12 items-center justify-center rounded-full border-2 transition-all",
          active
            ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
            : "border-muted bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </button>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
