import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { It as Clock, J as MessageSquare, Qt as CalendarDays, W as NotebookPen, _t as GraduationCap, kt as Earth, qt as Check, r as Video, v as Timer } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatDayInZone, l as formatTimeInZone, n as PAYMENT_STATUS_LABEL, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CAdlRg97.mjs";
import { c as PaymentStatusBadge, s as MetaItem, t as BookingStatusBadge } from "./ui-bAhnOVkK.mjs";
import { t as ReportIssueDialog } from "./ReportIssueDialog-DKUG413I.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-C7Z5PUu0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TutorBookingCard-DRobNGBc.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Four honest states, in order. Booking status and payment status are separate
* backend fields — a lesson is only confirmed once the tutor has accepted AND
* the payment record reports success.
*/
function BookingLifecycle({ status, paymentStatus, acceptedAt, className }) {
	const paid = paymentStatus === "paid";
	const confirmed = status === "confirmed" || status === "in_progress" || status === "completed";
	const steps = [
		{
			label: "Lesson requested",
			done: true
		},
		{
			label: "Tutor accepted",
			done: Boolean(acceptedAt) || confirmed
		},
		{
			label: paymentStatus ? `Payment ${PAYMENT_STATUS_LABEL[paymentStatus].toLowerCase()}` : "Payment pending",
			done: paid
		},
		{
			label: "Booking confirmed",
			done: confirmed
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className),
		children: steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.6rem] font-semibold transition-colors duration-200", step.done ? "border-success/30 bg-success/15 text-success" : "border-border bg-surface text-muted-foreground"),
					"aria-hidden": "true",
					children: step.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : index + 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("text-xs font-medium", step.done ? "text-foreground" : "text-muted-foreground"),
					children: [step.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: step.done ? " — done" : " — not yet"
					})]
				}),
				index < steps.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden h-px w-6 bg-border sm:block",
					"aria-hidden": "true"
				}) : null
			]
		}, step.label))
	});
}
/** A class is joinable only when the backend says it is confirmed or running. */
function isJoinableForTutor(booking) {
	if (booking.status === "in_progress") return true;
	if (booking.status !== "confirmed") return false;
	const start = new Date(booking.starts_at).getTime();
	const end = new Date(booking.ends_at).getTime();
	const now = Date.now();
	return now >= start - 9e5 && now <= end + 18e5;
}
function TutorBookingCard({ booking, timezone, onAccept, onDecline, busy, showLifecycle = true, className }) {
	const startsSoon = booking.status === "confirmed" && new Date(booking.starts_at).getTime() - Date.now() < 36e5 && new Date(booking.starts_at).getTime() > Date.now();
	const joinable = isJoinableForTutor(booking);
	const notesReady = booking.status === "completed" || booking.status === "in_progress";
	const initial = (booking.student_first_name ?? "?").charAt(0).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: cn("rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-11 shrink-0",
				children: [booking.student_avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: booking.student_avatar_url,
					alt: "",
					loading: "lazy"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-primary-soft text-sm font-semibold text-primary-deep",
					children: initial
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "truncate text-sm font-semibold md:text-base",
								children: [booking.subject_name ?? "Lesson", booking.education_level_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: [
										" ",
										"· ",
										booking.education_level_name
									]
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 truncate text-sm text-muted-foreground",
								children: ["with ", booking.student_first_name ?? "Student"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 flex-wrap items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusBadge, {
								status: booking.status,
								startingSoon: startsSoon
							}), booking.payment_status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentStatusBadge, { status: booking.payment_status }) : null]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-x-4 gap-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
								icon: CalendarDays,
								children: formatDayInZone(booking.starts_at, timezone)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
								icon: Clock,
								children: [
									formatTimeInZone(booking.starts_at, timezone),
									" –",
									" ",
									formatTimeInZone(booking.ends_at, timezone)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
								icon: Timer,
								children: [booking.duration_minutes, " min"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
								icon: Earth,
								children: timezone
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
								icon: GraduationCap,
								children: [formatMoney(booking.total_amount, booking.currency), " lesson value"]
							})
						]
					}),
					booking.student_notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground",
						children: [
							"“",
							booking.student_notes,
							"”"
						]
					}) : null,
					booking.cancellation_reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground",
						children: ["Cancelled: ", booking.cancellation_reason]
					}) : null,
					showLifecycle && booking.status !== "cancelled" && booking.status !== "rejected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingLifecycle, {
						className: "mt-4",
						status: booking.status,
						paymentStatus: booking.payment_status,
						acceptedAt: booking.tutor_accepted_at
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							onAccept ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "cta",
									size: "sm",
									className: "min-h-11 flex-1 sm:min-h-10 sm:flex-none",
									disabled: busy,
									children: "Accept"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Accept this lesson?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
								formatDayInZone(booking.starts_at, timezone),
								" at",
								" ",
								formatTimeInZone(booking.starts_at, timezone),
								" (",
								timezone,
								") with",
								" ",
								booking.student_first_name ?? "this learner",
								". The lesson is confirmed once the family's payment clears."
							] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
								className: "min-h-11 sm:min-h-10",
								children: "Not now"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
								className: "min-h-11 sm:min-h-10",
								onClick: onAccept,
								children: "Accept lesson"
							})] })] })] }) : null,
							onDecline ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									className: "min-h-11 flex-1 sm:min-h-10 sm:flex-none",
									disabled: busy,
									children: "Decline"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Decline this request?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "The family will be able to book another time with you. This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
								className: "min-h-11 sm:min-h-10",
								children: "Keep request"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
								className: "min-h-11 sm:min-h-10",
								onClick: onDecline,
								children: "Decline"
							})] })] })] }) : null,
							joinable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tutor/classroom/$bookingId",
									params: { bookingId: booking.id },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }), " Join class"]
								})
							}) : null,
							notesReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tutor/notes/$bookingId",
									params: { bookingId: booking.id },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, { className: "size-4" }),
										" ",
										booking.has_notes ? "Lesson notes" : "Add notes"
									]
								})
							}) : null,
							booking.student_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tutor/students/$studentId",
									params: { studentId: booking.student_id },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }), " Learner"]
								})
							}) : null,
							booking.status !== "cancelled" && booking.status !== "rejected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportIssueDialog, {
								bookingId: booking.id,
								trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "min-h-11 text-muted-foreground sm:min-h-10",
									children: "Report an issue"
								})
							}) : null
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { TutorBookingCard as t };
