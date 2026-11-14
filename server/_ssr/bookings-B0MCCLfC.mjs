import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Bt as CircleX, Qt as CalendarDays, it as LoaderCircle, k as Search } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { E as useTutorCards, O as useViewerTimezone, _ as useChildren, a as formatDayInZone, h as useBookings, l as formatTimeInZone, s as formatMoney, u as isBookingPaid } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, t as BookingStatusBadge } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { t as ChildSwitcher } from "./ChildSwitcher-D_zmULnc.mjs";
import { t as ClassCard } from "./ClassCard-Dq9EP8Zw.mjs";
import { t as PayNowButton } from "./PayNowButton-6m7HSur6.mjs";
import { t as ReportIssueDialog } from "./ReportIssueDialog-DKUG413I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bookings-B0MCCLfC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BookingsPage() {
	const timezone = useViewerTimezone();
	const children = useChildren();
	const [childId, setChildId] = (0, import_react.useState)(null);
	const bookings = useBookings(childId ? { studentId: childId } : void 0);
	const queryClient = useQueryClient();
	const tutorIds = (0, import_react.useMemo)(() => (bookings.data ?? []).map((row) => row.tutor_id), [bookings.data]);
	const tutors = useTutorCards(tutorIds);
	const kids = children.data ?? [];
	const cancelBooking = useMutation({
		mutationFn: async (booking) => {
			await apiPost(`/bookings/${booking.id}/cancel`, { reason: "Cancelled by parent" });
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
			await queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
			toast.success("Class cancelled");
		},
		onError: () => toast.error("We couldn't cancel that class. Please try again.")
	});
	const now = Date.now();
	const rows = bookings.data ?? [];
	const upcoming = rows.filter((row) => new Date(row.ends_at).getTime() > now && [
		"pending",
		"confirmed",
		"in_progress"
	].includes(row.status)).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
	const past = rows.filter((row) => new Date(row.ends_at).getTime() <= now || row.status === "completed").sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
	const cancelled = rows.filter((row) => [
		"cancelled",
		"rejected",
		"no_show"
	].includes(row.status));
	function childFor(booking) {
		return kids.find((child) => child.id === booking.student_id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Bookings",
		description: `Every class across your family · times shown in ${timezone}`,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "cta",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/find-tutor",
				search: {},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Book a class"]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [kids.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "Filter by child",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChildSwitcher, {
					children: kids,
					selectedId: childId,
					onSelect: setChildId
				})
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "upcoming",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full justify-start overflow-x-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "upcoming",
								children: [
									"Upcoming (",
									upcoming.length,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "past",
								children: [
									"Past (",
									past.length,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "cancelled",
								children: [
									"Cancelled (",
									cancelled.length,
									")"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "upcoming",
						className: "mt-4",
						children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 3,
							height: "h-36"
						}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
							message: "We couldn't load your schedule right now.",
							onRetry: () => void bookings.refetch()
						}) : upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							icon: CalendarDays,
							title: "No upcoming classes",
							body: "When you book a lesson it will appear here with the tutor, time and join link.",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								className: "min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/find-tutor",
									search: {},
									children: "Find a tutor"
								})
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 xl:grid-cols-2",
							children: upcoming.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassCard, {
									booking,
									child: childFor(booking),
									tutor: tutors.map.get(booking.tutor_id),
									viewerTimezone: timezone
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										booking.status === "pending" && !isBookingPaid(booking) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayNowButton, {
											bookingId: booking.id,
											amount: booking.total_amount,
											currency: booking.currency
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "sm",
											className: "min-h-11 text-destructive sm:min-h-9",
											disabled: cancelBooking.isPending,
											onClick: () => cancelBooking.mutate(booking),
											children: [cancelBooking.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Cancel this class"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportIssueDialog, { bookingId: booking.id })
									]
								})]
							}, booking.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "past",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, {
							rows: past,
							timezone,
							tutorName: (id) => tutors.map.get(id)?.full_name ?? "Tutor",
							childLabel: (booking) => childFor(booking)?.first_name ?? "Learner",
							emptyBody: "Completed classes will be listed here with notes and receipts."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "cancelled",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, {
							rows: cancelled,
							timezone,
							tutorName: (id) => tutors.map.get(id)?.full_name ?? "Tutor",
							childLabel: (booking) => childFor(booking)?.first_name ?? "Learner",
							emptyBody: "Nothing has been cancelled — that's a good sign."
						})
					})
				]
			})]
		})
	});
}
function HistoryList({ rows, timezone, tutorName, childLabel, emptyBody }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
		icon: CalendarDays,
		title: "Nothing here yet",
		body: emptyBody
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
		title: "Class history",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: rows.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center gap-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm font-semibold",
							children: [
								booking.subjects?.name ?? "Lesson",
								" · ",
								tutorName(booking.tutor_id)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								childLabel(booking),
								" · ",
								formatDayInZone(booking.starts_at, timezone),
								" ·",
								" ",
								formatTimeInZone(booking.starts_at, timezone),
								" · ",
								booking.duration_minutes,
								" min"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: formatMoney(booking.total_amount, booking.currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusBadge, { status: booking.status }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportIssueDialog, {
						bookingId: booking.id,
						trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "min-h-9 text-muted-foreground",
							children: "Report an issue"
						})
					})
				]
			}, booking.id))
		})
	});
}
//#endregion
export { BookingsPage as component };
