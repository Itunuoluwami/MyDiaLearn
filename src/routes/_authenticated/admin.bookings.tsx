import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  useAdminBookings,
  useAdminCancelBooking,
  useAdminUpdateBookingStatus,
  type AdminBooking,
  type BookingStatus,
} from "@/lib/admin-data";
import { BOOKING_STATUS_LABEL, formatMoney } from "@/lib/parent-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — DiaLearn admin" },
      { name: "description", content: "Search, override and cancel bookings across the platform." },
    ],
  }),
  component: AdminBookingsPage,
});

const STATUS_FILTERS: (BookingStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
];

/** Overrides that don't touch money — cancellation is a separate flow so the
 * refund calculation can never be skipped by accident. */
const OVERRIDE_OPTIONS: BookingStatus[] = ["pending", "confirmed", "in_progress", "completed", "no_show", "rejected"];

function CancelDialog({ booking, onClose }: { booking: AdminBooking; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [refundPct, setRefundPct] = useState("");
  const cancel = useAdminCancelBooking();

  const studentName = `${booking.students?.first_name ?? ""} ${booking.students?.last_name ?? ""}`.trim() || "Student";
  const tutorName = booking.tutors?.profiles?.full_name ?? "Tutor";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            {studentName} with {tutorName} · {formatMoney(booking.total_amount, booking.currency)}. Leave the refund
            % blank to use the booking's cancellation policy.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this booking being cancelled?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancel-refund">Refund % (optional override)</Label>
            <Input
              id="cancel-refund"
              type="number"
              min={0}
              max={100}
              placeholder="Use policy default"
              value={refundPct}
              onChange={(e) => setRefundPct(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="destructive"
            disabled={cancel.isPending || !reason.trim()}
            onClick={() =>
              cancel.mutate(
                {
                  bookingId: booking.id,
                  reason: reason.trim(),
                  refundPercentage: refundPct ? Number(refundPct) : null,
                },
                {
                  onSuccess: (result) => {
                    toast.success(
                      result?.refund_amount
                        ? `Cancelled — refunded ${formatMoney(result.refund_amount, result.refund_currency)}`
                        : "Booking cancelled",
                    );
                    onClose();
                  },
                  onError: (error) => toast.error((error as Error).message),
                },
              )
            }
          >
            {cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
            Cancel & refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminBookingsPage() {
  const { hasPermission, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [cancelling, setCancelling] = useState<AdminBooking | null>(null);

  const bookings = useAdminBookings({ search, status });
  const updateStatus = useAdminUpdateBookingStatus();

  if (loading) {
    return (
      <AdminShell title="Bookings">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.bookings")) {
    return (
      <AdminShell title="Bookings">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include booking management permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Bookings" description="Every lesson booked across the platform.">
      <div className="panel-portal p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student or tutor name"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "all")}>
            <SelectTrigger className="sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all" ? "All statuses" : BOOKING_STATUS_LABEL[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : (bookings.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No bookings match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                (bookings.data ?? []).map((booking) => {
                  const studentName =
                    `${booking.students?.first_name ?? ""} ${booking.students?.last_name ?? ""}`.trim() || "—";
                  const tutorName = booking.tutors?.profiles?.full_name ?? "—";
                  const cancellable = !["cancelled", "completed", "rejected"].includes(booking.status);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(booking.starts_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{studentName}</TableCell>
                      <TableCell>{tutorName}</TableCell>
                      <TableCell className="text-muted-foreground">{booking.subjects?.name ?? "—"}</TableCell>
                      <TableCell>{formatMoney(booking.total_amount, booking.currency)}</TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) =>
                            updateStatus.mutate(
                              { id: booking.id, status: value as BookingStatus },
                              { onError: (error) => toast.error((error as Error).message) },
                            )
                          }
                          disabled={!cancellable && booking.status !== "no_show"}
                        >
                          <SelectTrigger className="h-8 w-40">
                            <SelectValue>
                              <Badge variant="outline">{BOOKING_STATUS_LABEL[booking.status]}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {OVERRIDE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {BOOKING_STATUS_LABEL[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={!cancellable}
                          onClick={() => setCancelling(booking)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {cancelling ? <CancelDialog booking={cancelling} onClose={() => setCancelling(null)} /> : null}
    </AdminShell>
  );
}
