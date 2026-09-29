import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Loader2, Search, XCircle } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { apiPost, useApiData } from "@/lib/api/data-client";
import { ParentShell } from "@/components/parent/ParentShell";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { ClassCard } from "@/components/parent/ClassCard";
import { PayNowButton } from "@/components/shared/PayNowButton";
import { ReportIssueDialog } from "@/components/shared/ReportIssueDialog";
import {
  BookingStatusBadge,
  CardSkeletonList,
  EmptyPanel,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDayInZone,
  formatMoney,
  formatTimeInZone,
  isBookingPaid,
  useBookings,
  useChildren,
  useTutorCards,
  useViewerTimezone,
  type Booking,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings & schedule — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "See every scheduled, completed and cancelled class across all your children, in your own timezone.",
      },
      { property: "og:title", content: "Bookings & schedule — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "One family schedule across every child and tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const timezone = useViewerTimezone();
  const children = useChildren();
  const [childId, setChildId] = useState<string | null>(null);
  const bookings = useBookings(childId ? { studentId: childId } : undefined);
  const queryClient = useQueryClient();
  const viaApi = useApiData();

  const tutorIds = useMemo(() => (bookings.data ?? []).map((row) => row.tutor_id), [bookings.data]);
  const tutors = useTutorCards(tutorIds);
  const kids = children.data ?? [];

  const cancelBooking = useMutation({
    mutationFn: async (booking: Booking) => {
      if (viaApi) {
        // The API allows this for a pending, unpaid lesson — the case this
        // button is shown for.
        await apiPost(`/bookings/${booking.id}/cancel`, { reason: "Cancelled by parent" });
        return;
      }
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: "Cancelled by parent",
        })
        .eq("id", booking.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
      toast.success("Class cancelled");
    },
    onError: () => toast.error("We couldn't cancel that class. Please try again."),
  });

  const now = Date.now();
  const rows = bookings.data ?? [];
  const upcoming = rows
    .filter(
      (row) =>
        new Date(row.ends_at).getTime() > now &&
        ["pending", "confirmed", "in_progress"].includes(row.status),
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const past = rows
    .filter((row) => new Date(row.ends_at).getTime() <= now || row.status === "completed")
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  const cancelled = rows.filter((row) => ["cancelled", "rejected", "no_show"].includes(row.status));

  function childFor(booking: Booking) {
    return kids.find((child) => child.id === booking.student_id);
  }

  return (
    <ParentShell
      title="Bookings"
      description={`Every class across your family · times shown in ${timezone}`}
      actions={
        <Button asChild variant="cta" className="min-h-11">
          <Link to="/find-tutor" search={{}}>
            <Search className="size-4" /> Book a class
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {kids.length > 1 ? (
          <SectionCard title="Filter by child">
            <ChildSwitcher children={kids} selectedId={childId} onSelect={setChildId} />
          </SectionCard>
        ) : null}

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {bookings.isLoading ? (
              <CardSkeletonList rows={3} height="h-36" />
            ) : bookings.isError ? (
              <LoadError
                message="We couldn't load your schedule right now."
                onRetry={() => void bookings.refetch()}
              />
            ) : upcoming.length === 0 ? (
              <EmptyPanel
                icon={CalendarDays}
                title="No upcoming classes"
                body="When you book a lesson it will appear here with the tutor, time and join link."
                action={
                  <Button asChild variant="cta" className="min-h-11">
                    <Link to="/find-tutor" search={{}}>
                      Find a tutor
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {upcoming.map((booking) => (
                  <div key={booking.id} className="space-y-2">
                    <ClassCard
                      booking={booking}
                      child={childFor(booking)}
                      tutor={tutors.map.get(booking.tutor_id)}
                      viewerTimezone={timezone}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {booking.status === "pending" && !isBookingPaid(booking) ? (
                        <PayNowButton
                          bookingId={booking.id}
                          amount={booking.total_amount}
                          currency={booking.currency}
                        />
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 text-destructive sm:min-h-9"
                        disabled={cancelBooking.isPending}
                        onClick={() => cancelBooking.mutate(booking)}
                      >
                        {cancelBooking.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                        Cancel this class
                      </Button>
                      <ReportIssueDialog bookingId={booking.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <HistoryList
              rows={past}
              timezone={timezone}
              tutorName={(id) => tutors.map.get(id)?.full_name ?? "Tutor"}
              childLabel={(booking) => childFor(booking)?.first_name ?? "Learner"}
              emptyBody="Completed classes will be listed here with notes and receipts."
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            <HistoryList
              rows={cancelled}
              timezone={timezone}
              tutorName={(id) => tutors.map.get(id)?.full_name ?? "Tutor"}
              childLabel={(booking) => childFor(booking)?.first_name ?? "Learner"}
              emptyBody="Nothing has been cancelled — that's a good sign."
            />
          </TabsContent>
        </Tabs>
      </div>
    </ParentShell>
  );
}

function HistoryList({
  rows,
  timezone,
  tutorName,
  childLabel,
  emptyBody,
}: {
  rows: Booking[];
  timezone: string;
  tutorName: (id: string) => string;
  childLabel: (booking: Booking) => string;
  emptyBody: string;
}) {
  if (rows.length === 0) {
    return <EmptyPanel icon={CalendarDays} title="Nothing here yet" body={emptyBody} />;
  }

  return (
    <SectionCard title="Class history">
      <ul className="divide-y divide-border">
        {rows.map((booking) => (
          <li key={booking.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {booking.subjects?.name ?? "Lesson"} · {tutorName(booking.tutor_id)}
              </p>
              <p className="text-xs text-muted-foreground">
                {childLabel(booking)} · {formatDayInZone(booking.starts_at, timezone)} ·{" "}
                {formatTimeInZone(booking.starts_at, timezone)} · {booking.duration_minutes} min
              </p>
            </div>
            <p className="text-sm font-medium">
              {formatMoney(booking.total_amount, booking.currency)}
            </p>
            <BookingStatusBadge status={booking.status} />
            <ReportIssueDialog
              bookingId={booking.id}
              trigger={
                <Button variant="ghost" size="sm" className="min-h-9 text-muted-foreground">
                  Report an issue
                </Button>
              }
            />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
