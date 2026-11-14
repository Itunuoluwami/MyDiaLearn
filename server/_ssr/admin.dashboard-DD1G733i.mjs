import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { $t as CalendarClock, Bt as CircleX, E as ShieldAlert, H as Percent, P as Repeat, _t as GraduationCap, a as Users, cn as BadgePercent, g as TrendingDown, h as TrendingUp, l as UserPlus, m as TriangleAlert, n as Wallet, pn as Activity, y as Star } from "../_libs/lucide-react.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { d as useAdminSummary } from "./admin-data-uZ6jnAG3.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.dashboard-DD1G733i.js
var import_jsx_runtime = require_jsx_runtime();
function pct(value) {
	if (value === null || value === void 0) return "—";
	return `${value}%`;
}
function num(value) {
	if (value === null || value === void 0) return "—";
	return new Intl.NumberFormat().format(value);
}
function StatCard({ icon: Icon, label, value, hint, tone = "primary" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-start justify-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex size-9 items-center justify-center rounded-lg", {
					primary: "bg-primary/10 text-primary",
					secondary: "bg-secondary/15 text-secondary-foreground",
					success: "bg-success/10 text-success",
					warning: "bg-warning/10 text-warning",
					destructive: "bg-destructive/10 text-destructive"
				}[tone]),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-4.5",
					"aria-hidden": "true"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-bold tabular-nums text-foreground",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[0.7rem] text-muted-foreground/80",
				children: hint
			}) : null
		] })]
	});
}
function Section({ title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 first:mt-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold text-foreground",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: description
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4",
				children
			})
		]
	});
}
function AdminDashboardPage() {
	const { hasPermission, loading } = useAuth();
	const summary = useAdminSummary();
	const s = summary.data;
	if (loading || summary.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Admin dashboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.users") && !hasPermission("admin.settings")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Admin dashboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include admin dashboard permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Admin dashboard",
		description: "Platform-wide figures across every portal — refreshed live from the database, trailing 30 days where noted.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Growth",
				description: "New signups and marketplace liquidity in the last 30 days.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: UserPlus,
						label: "New students",
						value: num(s?.new_students),
						hint: "Last 30 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: UserPlus,
						label: "New parents",
						value: num(s?.new_parents),
						hint: "Last 30 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: GraduationCap,
						label: "New tutors",
						value: num(s?.new_tutors),
						hint: "Last 30 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Percent,
						label: "Tutor activation rate",
						value: pct(s?.tutor_activation_rate),
						hint: "Verified & listed / all tutors"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Activity,
						label: "Monthly active users",
						value: num(s?.mau),
						hint: "Last 30 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: CalendarClock,
						label: "Booking demand",
						value: num(s?.booking_demand),
						hint: "Bookings, last 30 days"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Marketplace",
				description: "Revenue and engagement across all completed and in-flight bookings.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Wallet,
						label: "GMV",
						value: formatMoney(s?.gmv, s?.gmv_currency),
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: BadgePercent,
						label: "Commission revenue",
						value: formatMoney(s?.commission_revenue, s?.gmv_currency),
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: TrendingUp,
						label: "Avg transaction value",
						value: formatMoney(s?.avg_transaction_value, s?.gmv_currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Users,
						label: "Classes per student",
						value: s?.classes_per_student != null ? String(s.classes_per_student) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Repeat,
						label: "Repeat booking rate",
						value: pct(s?.repeat_booking_rate),
						hint: "Students with 2+ completed classes"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Quality & trust",
				description: "Signals that matter for marketplace health.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Star,
						label: "Avg tutor rating",
						value: s?.avg_tutor_rating != null ? String(s.avg_tutor_rating) : "—",
						tone: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: TrendingDown,
						label: "Cancellation rate",
						value: pct(s?.cancellation_rate),
						tone: "destructive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: CircleX,
						label: "No-show rate",
						value: pct(s?.no_show_rate),
						tone: "destructive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: TriangleAlert,
						label: "Dispute rate",
						value: "—",
						hint: "Available once dispute tracking ships",
						tone: "secondary"
					})
				]
			})
		]
	});
}
//#endregion
export { AdminDashboardPage as component };
