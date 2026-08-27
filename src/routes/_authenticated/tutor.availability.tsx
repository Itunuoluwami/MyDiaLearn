import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddAvailabilityWindow,
  useAvailabilityWindows,
  useDeleteAvailabilityWindow,
  useTutorRecord,
  useUpdateAvailabilityWindow,
  WEEKDAYS,
} from "@/lib/tutor-data";

export const Route = createFileRoute("/_authenticated/tutor/availability")({
  head: () => ({
    meta: [
      { title: "Availability — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Set the weekly hours you teach. Families only ever see slots inside your own availability windows.",
      },
      { property: "og:title", content: "Availability — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Publish the weekly hours you teach, in your own timezone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorAvailabilityPage,
});

function toMinutes(value: string) {
  const [h = "0", m = "0"] = value.split(":");
  return Number(h) * 60 + Number(m);
}

function TutorAvailabilityPage() {
  const tutor = useTutorRecord();
  const windows = useAvailabilityWindows();
  const addWindow = useAddAvailabilityWindow();
  const updateWindow = useUpdateAvailabilityWindow();
  const deleteWindow = useDeleteAvailabilityWindow();

  const [day, setDay] = useState("1");
  const [start, setStart] = useState("16:00");
  const [end, setEnd] = useState("19:00");

  const timezone = tutor.data?.timezone ?? "UTC";
  const rows = windows.data ?? [];

  const byDay = useMemo(() => {
    return WEEKDAYS.map((label, index) => ({
      label,
      index,
      items: rows.filter((row) => row.day_of_week === index),
    }));
  }, [rows]);

  const weeklyHours = useMemo(() => {
    const minutes = rows
      .filter((row) => row.is_active)
      .reduce((total, row) => total + Math.max(toMinutes(row.end_time) - toMinutes(row.start_time), 0), 0);
    return (minutes / 60).toFixed(1);
  }, [rows]);

  async function handleAdd() {
    if (toMinutes(end) <= toMinutes(start)) {
      toast.error("The end time must be after the start time.");
      return;
    }
    const overlapping = rows.some(
      (row) =>
        row.day_of_week === Number(day) &&
        toMinutes(row.start_time) < toMinutes(end) &&
        toMinutes(row.end_time) > toMinutes(start),
    );
    if (overlapping) {
      toast.error("That window overlaps one you already have on this day.");
      return;
    }
    try {
      await addWindow.mutateAsync({ dayOfWeek: Number(day), startTime: start, endTime: end });
      toast.success("Availability added");
    } catch {
      toast.error("We couldn't save that window.");
    }
  }

  return (
    <TutorShell
      title="Availability"
      description={`Weekly teaching hours in your timezone · ${timezone}`}
    >
      <div className="max-w-4xl space-y-5">
        <SectionCard
          title="Add a weekly window"
          description="Repeats every week. Bookings can only land inside an active window."
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="day">Day</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger id="day" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start">From</Label>
              <Input
                id="start"
                type="time"
                className="min-h-11"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">To</Label>
              <Input
                id="end"
                type="time"
                className="min-h-11"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </div>
            <Button
              variant="cta"
              className="min-h-11"
              disabled={addWindow.isPending}
              onClick={() => void handleAdd()}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {weeklyHours} teaching hours published each week.
          </p>
        </SectionCard>

        {windows.isLoading ? (
          <CardSkeletonList rows={3} height="h-20" />
        ) : windows.isError ? (
          <LoadError
            message="We couldn't load your availability right now."
            onRetry={() => void windows.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyPanel
            icon={Clock3}
            title="No availability yet"
            body="Add the hours you can teach each week. You can pause any window without deleting it."
          />
        ) : (
          <SectionCard title="Your weekly schedule">
            <div className="grid gap-3 sm:grid-cols-2">
              {byDay.map((group) => (
                <div key={group.label} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-sm font-semibold">{group.label}</p>
                  {group.items.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">Not teaching</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {group.items.map((row) => (
                        <li
                          key={row.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-surface/70 px-3 py-2"
                        >
                          <span className="text-sm tabular-nums">
                            {row.start_time.slice(0, 5)} – {row.end_time.slice(0, 5)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Switch
                              checked={row.is_active}
                              aria-label={row.is_active ? "Pause this window" : "Activate this window"}
                              onCheckedChange={(checked) =>
                                void updateWindow.mutateAsync({ id: row.id, isActive: checked })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete window"
                              className="size-11 sm:size-9"
                              onClick={() => void deleteWindow.mutateAsync(row.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </TutorShell>
  );
}
