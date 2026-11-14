import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { m as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as PAYMENT_STATUS_LABEL, t as BOOKING_STATUS_LABEL } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-bAhnOVkK.js
var import_jsx_runtime = require_jsx_runtime();
var BOOKING_TONE = {
	pending: "bg-secondary-soft text-foreground",
	confirmed: "bg-primary-soft text-primary-deep",
	in_progress: "bg-accent/15 text-accent",
	completed: "bg-success/12 text-success",
	cancelled: "bg-muted text-muted-foreground",
	rejected: "bg-muted text-muted-foreground",
	no_show: "bg-destructive/12 text-destructive"
};
function BookingStatusBadge({ status, startingSoon }) {
	const label = startingSoon && status === "confirmed" ? "Starting soon" : BOOKING_STATUS_LABEL[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", BOOKING_TONE[status]),
		children: [status === "in_progress" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-1.5 animate-pulse rounded-full bg-current",
			"aria-hidden": "true"
		}) : null, label]
	});
}
var PAYMENT_TONE = {
	pending: "bg-secondary-soft text-foreground",
	processing: "bg-primary-soft text-primary-deep",
	paid: "bg-success/12 text-success",
	failed: "bg-destructive/12 text-destructive",
	refunded: "bg-muted text-muted-foreground",
	partially_refunded: "bg-muted text-muted-foreground"
};
function PaymentStatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", PAYMENT_TONE[status]),
		children: PAYMENT_STATUS_LABEL[status]
	});
}
function KpiCard({ label, value, hint, icon: Icon, variant = "secondary" }) {
	const primary = variant === "primary";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border p-4 transition-all duration-200 hover:shadow-lift", primary ? "border-primary/15 bg-primary-soft/60 shadow-soft" : "border-border bg-card shadow-soft"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-8 shrink-0 items-center justify-center rounded-lg", primary ? "bg-primary text-primary-foreground" : "bg-surface text-primary"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-3 font-semibold tabular-nums", primary ? "text-3xl text-primary-deep" : "text-2xl"),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
function SectionCard({ title, description, action, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("card-elevated p-4 md:p-6", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section text-lg md:text-xl",
					children: title
				}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: description
				}) : null]
			}), action]
		}), children]
	});
}
function CardSkeletonList({ rows = 3, height = "h-24" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		"aria-hidden": "true",
		children: Array.from({ length: rows }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: cn("w-full rounded-2xl shimmer", height) }, index))
	});
}
function KpiSkeletonGrid({ count = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
		"aria-hidden": "true",
		children: Array.from({ length: count }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-2xl shimmer" }, index))
	});
}
function LoadError({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "flex flex-col items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
				className: "mt-0.5 size-5 shrink-0 text-destructive",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-foreground",
				children: message
			})]
		}), onRetry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			className: "min-h-11 sm:min-h-9",
			onClick: onRetry,
			children: "Try again"
		}) : null]
	});
}
function EmptyPanel({ icon: Icon, title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/60 px-5 py-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-6",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-sm text-sm text-muted-foreground",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: action
			}) : null
		]
	});
}
function VerifiedChip({ status }) {
	if (status !== "verified") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "secondary",
		className: "gap-1 text-[0.7rem]",
		children: "Verified tutor"
	});
}
function MetaItem({ icon: Icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-3.5 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children
		})]
	});
}
//#endregion
export { KpiSkeletonGrid as a, PaymentStatusBadge as c, KpiCard as i, SectionCard as l, CardSkeletonList as n, LoadError as o, EmptyPanel as r, MetaItem as s, BookingStatusBadge as t, VerifiedChip as u };
