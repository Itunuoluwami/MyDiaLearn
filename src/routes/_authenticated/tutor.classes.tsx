import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Inbox } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { TutorClassCard } from "@/components/tutor/TutorClassCard";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRespondToBooking,
  useTutorBookings,
  useTutorTimezone,
  type BookingStatus,
} from "@/lib/tutor-data";
import { formatDayInZone } from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/tutor/classes")({
  head: () => ({
    meta: [
      { title: "My classes — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Review lesson requests, confirmed classes and past lessons, grouped by day in your own timezone.",
      },
      { property: "og:title", content: "My classes — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Your teaching calendar: requests, confirmed lessons and history in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorClassesPage,
});

type View = "requests" | "upcoming" | "past";

function TutorClassesPage() {
  const timezone = useTutorTimezone();
  const [view, setView] = useState<View>("upcoming");
  const bookings = useTutorBookings();
  const respond = useRespondToBooking();

  const rows = bookings.data ?? [];

  const filtered = useMemo(() => {
    const now = Date.now();
    const upcomingStatuses: BookingStatus[] = ["confirmed", "in_progress"];
    if (view === "requests") {
      return rows.filter((row) => row.status === "pending" && new Date(row.ends_at).getTime() > now);
    }
    if (view === "upcoming") {
      return rows.filter(
        (row) => new Date(row.ends_at).getTime() > now && upcomingStatuses.includes(row.status),
      );
    }
    return rows
      .filter((row) => new Date(row.ends_at).getTime() <= now || row.status === "completed")
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  }, [rows, view]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const row of filtered) {
      const key = formatDayInZone(row.starts_at, timezone);
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return [...map.entries()];
  }, [filtered, timezone]);

  const requestCount = rows.filter(
    (row) => row.status === "pending" && new Date(row.ends_at).getTime() > Date.now(),
  ).length;

  async function handleRespond(bookingId: string, accept: boolean) {
    try {
      await respond.mutateAsync({ bookingId, accept });
      toast.success(accept ? "Lesson confirmed" : "Request declined");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("BOOKING_OVERLAP")
          ? "That slot clashes with another confirmed class."
          : "We couldn't update that request.",
      );
    }
  }

  return (
    <TutorShell
      title="My classes"
      description={`Every lesson in your own timezone · ${timezone}`}
      actions={
        <Button asChild variant="outline" className="min-h-11 sm:min-h-10">
          <Link to="/tutor/availability">
            <CalendarPlus className="size-4" /> Availability
          </Link>
        </Button>
      }
    >
      <div className="max-w-5xl space-y-5">
        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="requests" className="min-h-11">
              Requests{requestCount > 0 ? ` (${requestCount})` : ""}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="min-h-11">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="min-h-11">
              Past
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {bookings.isLoading ? (
          <CardSkeletonList rows={3} height="h-32" />
        ) : bookings.isError ? (
          <LoadError
            message="We couldn't load your classes right now."
            onRetry={() => void bookings.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyPanel
            icon={Inbox}
            title={
              view === "requests"
                ? "No lesson requests"
                : view === "upcoming"
                  ? "No upcoming classes"
                  : "No past classes yet"
            }
            body={
              view === "past"
                ? "Completed lessons will be listed here with the learner and subject."
                : "Keep your availability up to date so families can find and book your open hours."
            }
            action={
              view === "past" ? undefined : (
                <Button asChild variant="cta" className="min-h-11">
                  <Link to="/tutor/availability">Set availability</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, items]) => (
              <SectionCard key={day} title={day} description={`${items.length} ${items.length === 1 ? "class" : "classes"}`}>
                <div className="grid gap-3">
                  {items.map((booking) => (
                    <TutorClassCard
                      key={booking.id}
                      booking={booking}
                      timezone={timezone}
                      busy={respond.isPending}
                      {...(booking.status === "pending"
                        ? {
                            onAccept: () => void handleRespond(booking.id, true),
                            onDecline: () => void handleRespond(booking.id, false),
                          }
                        : {})}
                    />
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </TutorShell>
  );
}
