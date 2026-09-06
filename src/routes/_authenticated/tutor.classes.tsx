import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Inbox } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { TutorBookingCard } from "@/components/tutor/TutorBookingCard";
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
          "Review lesson requests, confirmed classes, past lessons and cancellations, grouped by day in your own timezone.",
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

type View = "requests" | "upcoming" | "past" | "cancelled";

const TAB_COPY: Record<View, { empty: string; body: string }> = {
  requests: {
    empty: "No lesson requests",
    body: "Keep your availability up to date so families can find and book your open hours.",
  },
  upcoming: {
    empty: "No upcoming classes",
    body: "Confirmed lessons appear here once a family has booked and their payment has cleared.",
  },
  past: {
    empty: "No past classes yet",
    body: "Completed lessons will be listed here with the learner, subject and your lesson notes.",
  },
  cancelled: {
    empty: "Nothing cancelled",
    body: "Declined requests and cancelled lessons are kept here for your records.",
  },
};

function TutorClassesPage() {
  const timezone = useTutorTimezone();
  const [view, setView] = useState<View>("upcoming");
  const bookings = useTutorBookings();
  const respond = useRespondToBooking();

  const rows = bookings.data ?? [];

  const filtered = useMemo(() => {
    const now = Date.now();
    const liveStatuses: BookingStatus[] = ["confirmed", "in_progress"];
    if (view === "requests") {
      return rows.filter((row) => row.status === "pending" && new Date(row.ends_at).getTime() > now);
    }
    if (view === "upcoming") {
      return rows.filter(
        (row) => new Date(row.ends_at).getTime() > now && liveStatuses.includes(row.status),
      );
    }
    if (view === "cancelled") {
      return rows
        .filter(
          (row) => row.status === "cancelled" || row.status === "rejected" || row.status === "no_show",
        )
        .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
    }
    return rows
      .filter(
        (row) =>
          row.status === "completed" ||
          (new Date(row.ends_at).getTime() <= now &&
            row.status !== "cancelled" &&
            row.status !== "rejected" &&
            row.status !== "pending"),
      )
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

  const awaitingPayment = rows.filter(
    (row) => row.tutor_accepted_at && row.status === "pending" && row.payment_status !== "paid",
  ).length;

  async function handleRespond(bookingId: string, accept: boolean) {
    try {
      await respond.mutateAsync({ bookingId, accept });
      toast.success(
        accept ? "Accepted — confirmed once payment clears" : "Request declined",
      );
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
        {awaitingPayment > 0 ? (
          <p className="rounded-2xl border border-secondary/40 bg-secondary-soft/60 p-3 text-sm">
            {awaitingPayment} accepted {awaitingPayment === 1 ? "lesson is" : "lessons are"} waiting on
            the family's payment. They move to Upcoming automatically once payment succeeds.
          </p>
        ) : null}

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
            <TabsTrigger value="cancelled" className="min-h-11">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {bookings.isLoading ? (
          <CardSkeletonList rows={3} height="h-40" />
        ) : bookings.isError ? (
          <LoadError
            message="We couldn't load your classes right now."
            onRetry={() => void bookings.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyPanel
            icon={Inbox}
            title={TAB_COPY[view].empty}
            body={TAB_COPY[view].body}
            action={
              view === "past" || view === "cancelled" ? undefined : (
                <Button asChild variant="cta" className="min-h-11">
                  <Link to="/tutor/availability">Set availability</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, items]) => (
              <SectionCard
                key={day}
                title={day}
                description={`${items.length} ${items.length === 1 ? "class" : "classes"}`}
              >
                <div className="grid gap-3">
                  {items.map((booking) => (
                    <TutorBookingCard
                      key={booking.id}
                      booking={booking}
                      timezone={timezone}
                      busy={respond.isPending}
                      showLifecycle={view !== "past"}
                      {...(booking.status === "pending" && !booking.tutor_accepted_at
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
