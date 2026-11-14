import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { It as Clock, Qt as CalendarDays, kt as Earth, r as Video } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatDayInZone, d as isJoinable, f as minutesUntil, i as childName, l as formatTimeInZone, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { s as MetaItem, t as BookingStatusBadge } from "./ui-bAhnOVkK.mjs";
import { t as LazyImage } from "./lazy-image-ELIP8TVW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ClassCard-Dq9EP8Zw.js
var import_jsx_runtime = require_jsx_runtime();
/**
* A single class/booking card. Every value shown comes from the booking row,
* the linked class session, and the tutor lookup function.
*/
function ClassCard({ booking, child, tutor, viewerTimezone, compact = false }) {
	const session = booking.class_sessions?.[0];
	const joinable = isJoinable(booking);
	const until = minutesUntil(booking.starts_at);
	const startingSoon = booking.status === "confirmed" && until <= 60 && until >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-lift",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-12 shrink-0 overflow-hidden rounded-xl bg-primary-soft",
					children: tutor?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
						src: tutor.avatar_url,
						alt: tutor.full_name ?? "Tutor",
						className: "size-12 object-cover transition-transform duration-300 group-hover:scale-105"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-12 items-center justify-center text-sm font-semibold text-primary-deep",
						children: (tutor?.full_name ?? "T").charAt(0)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate text-base font-semibold",
								children: booking.subjects?.name ?? "Lesson"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusBadge, {
								status: booking.status,
								startingSoon
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 truncate text-sm text-muted-foreground",
							children: [tutor?.full_name ?? "Tutor", tutor?.verification_status === "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1.5 text-xs font-semibold text-success",
								children: "· Verified"
							}) : null]
						}),
						child ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 truncate text-xs text-muted-foreground",
							children: ["For ", childName(child)]
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
						icon: CalendarDays,
						children: formatDayInZone(booking.starts_at, viewerTimezone)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
						icon: Clock,
						children: [
							formatTimeInZone(booking.starts_at, viewerTimezone),
							"–",
							formatTimeInZone(booking.ends_at, viewerTimezone),
							" · ",
							booking.duration_minutes,
							" min"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
						icon: Earth,
						children: ["Your time · ", viewerTimezone]
					})
				]
			}),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: formatMoney(booking.total_amount, booking.currency)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/bookings",
							search: { booking: booking.id },
							children: "View details"
						})
					}), joinable ? session?.meeting_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: session.meeting_url,
							target: "_blank",
							rel: "noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }), " Join class"]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "cta",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						disabled: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }), " Join link pending"]
					}) : null]
				})]
			}) : null
		]
	});
}
//#endregion
export { ClassCard as t };
