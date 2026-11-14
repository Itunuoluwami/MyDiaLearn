import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Lt as Clock3, R as Plus, _ as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { h as useTutorRecord, i as useAddAvailabilityWindow, o as useAvailabilityWindows, r as WEEKDAYS, s as useDeleteAvailabilityWindow, y as useUpdateAvailabilityWindow } from "./tutor-data-BgedrW1M.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.availability-Ln5sieZX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toMinutes(value) {
	const [h = "0", m = "0"] = value.split(":");
	return Number(h) * 60 + Number(m);
}
function TutorAvailabilityPage() {
	const tutor = useTutorRecord();
	const windows = useAvailabilityWindows();
	const addWindow = useAddAvailabilityWindow();
	const updateWindow = useUpdateAvailabilityWindow();
	const deleteWindow = useDeleteAvailabilityWindow();
	const [day, setDay] = (0, import_react.useState)("1");
	const [start, setStart] = (0, import_react.useState)("16:00");
	const [end, setEnd] = (0, import_react.useState)("19:00");
	const timezone = tutor.data?.timezone ?? "UTC";
	const rows = windows.data ?? [];
	const byDay = (0, import_react.useMemo)(() => {
		return WEEKDAYS.map((label, index) => ({
			label,
			index,
			items: rows.filter((row) => row.day_of_week === index)
		}));
	}, [rows]);
	const weeklyHours = (0, import_react.useMemo)(() => {
		return (rows.filter((row) => row.is_active).reduce((total, row) => total + Math.max(toMinutes(row.end_time) - toMinutes(row.start_time), 0), 0) / 60).toFixed(1);
	}, [rows]);
	async function handleAdd() {
		if (toMinutes(end) <= toMinutes(start)) {
			toast.error("The end time must be after the start time.");
			return;
		}
		if (rows.some((row) => row.day_of_week === Number(day) && toMinutes(row.start_time) < toMinutes(end) && toMinutes(row.end_time) > toMinutes(start))) {
			toast.error("That window overlaps one you already have on this day.");
			return;
		}
		try {
			await addWindow.mutateAsync({
				dayOfWeek: Number(day),
				startTime: start,
				endTime: end
			});
			toast.success("Availability added");
		} catch {
			toast.error("We couldn't save that window.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Availability",
		description: `Weekly teaching hours in your timezone · ${timezone}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
				title: "Add a weekly window",
				description: "Repeats every week. Bookings can only land inside an active window.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "day",
								children: "Day"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: day,
								onValueChange: setDay,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "day",
									className: "min-h-11",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: WEEKDAYS.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: String(index),
									children: label
								}, label)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "start",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "start",
								type: "time",
								className: "min-h-11",
								value: start,
								onChange: (event) => setStart(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "end",
								children: "To"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "end",
								type: "time",
								className: "min-h-11",
								value: end,
								onChange: (event) => setEnd(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "cta",
							className: "min-h-11",
							disabled: addWindow.isPending,
							onClick: () => void handleAdd(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [weeklyHours, " teaching hours published each week."]
				})]
			}), windows.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 3,
				height: "h-20"
			}) : windows.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your availability right now.",
				onRetry: () => void windows.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: Clock3,
				title: "No availability yet",
				body: "Add the hours you can teach each week. You can pause any window without deleting it."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "Your weekly schedule",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: byDay.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: group.label
						}), group.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Not teaching"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: group.items.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-2 rounded-lg bg-surface/70 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm tabular-nums",
									children: [
										row.start_time.slice(0, 5),
										" – ",
										row.end_time.slice(0, 5)
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: row.is_active,
										"aria-label": row.is_active ? "Pause this window" : "Activate this window",
										onCheckedChange: (checked) => void updateWindow.mutateAsync({
											id: row.id,
											isActive: checked
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										"aria-label": "Delete window",
										className: "size-11 sm:size-9",
										onClick: () => void deleteWindow.mutateAsync(row.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})]
								})]
							}, row.id))
						})]
					}, group.label))
				})
			})]
		})
	});
}
//#endregion
export { TutorAvailabilityPage as component };
