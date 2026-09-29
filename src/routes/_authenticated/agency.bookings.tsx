import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { AgencyShell } from "@/components/agency/AgencyShell";
import {
  BookingStatusBadge,
  CardSkeletonList,
  EmptyPanel,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgencyBookings } from "@/lib/agency-data";
import { BOOKING_STATUS_LABEL, formatMoney, type BookingStatus } from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/agency/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — DiaLearn agency" },
      { name: "description", content: "Every lesson booked with your agency's tutors." },
    ],
  }),
  component: AgencyBookingsPage,
});

const FILTERS: (BookingStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

function AgencyBookingsPage() {
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const bookings = useAgencyBookings({ status });
  const rows = bookings.data ?? [];

  return (
    <AgencyShell
      title="Bookings"
      description="Every lesson booked with your tutors, newest first."
      actions={
        <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "all")}>
          <SelectTrigger className="min-h-11 w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All bookings" : BOOKING_STATUS_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {bookings.isLoading ? (
        <CardSkeletonList rows={4} height="h-16" />
      ) : bookings.isError ? (
        <LoadError
          message={(bookings.error as Error).message || "We couldn't load bookings."}
          onRetry={() => void bookings.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={CalendarDays}
          title="No bookings yet"
          body="Lessons appear here as soon as families book your tutors."
        />
      ) : (
        <SectionCard title={`${rows.length} booking${rows.length === 1 ? "" : "s"}`}>
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {row.tutor_name ?? "Tutor"}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      with {row.student_first_name ?? "a student"}
                      {row.subject_name ? ` · ${row.subject_name}` : ""}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.starts_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {row.duration_minutes} min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums">
                    {formatMoney(row.total_amount, row.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.paid ? "Paid" : "Unpaid"}
                  </span>
                  <BookingStatusBadge status={row.status as BookingStatus} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </AgencyShell>
  );
}
