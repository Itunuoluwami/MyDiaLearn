import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Jt as CheckCheck, an as Bell, on as BellOff } from "../_libs/lucide-react.mjs";
import { c as formatRelative } from "./parent-data-Dj0LJH5W.mjs";
import { a as useMarkAllStudentNotificationsRead, t as StudentShell, u as useStudentNotifications } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.notifications-Di_MrW0W.js
var import_jsx_runtime = require_jsx_runtime();
var EMOJI = {
	booking_confirmed: "✅",
	booking_cancelled: "❌",
	booking_reminder: "🔔",
	new_message: "💬",
	assignment_graded: "📝",
	class_starting: "🚀",
	default: "📢"
};
function StudentNotificationsPage() {
	const notifications = useStudentNotifications();
	const markAll = useMarkAllStudentNotificationsRead();
	const items = notifications.data ?? [];
	const unreadCount = items.filter((n) => !n.read_at).length;
	function getEmoji(title) {
		for (const [key, emoji] of Object.entries(EMOJI)) if (title.toLowerCase().includes(key.replace("_", " "))) return emoji;
		return EMOJI["default"];
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "🔔 Notifications",
		description: "Stay on top of your classes, assignments and messages.",
		actions: unreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "outline",
			className: "min-h-10 rounded-xl font-bold",
			onClick: () => void markAll.mutateAsync(),
			disabled: markAll.isPending,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4 mr-1" }), " Mark all read"]
		}) : void 0,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl space-y-3",
			children: [unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-bold text-primary",
					children: [
						unreadCount,
						" unread notification",
						unreadCount === 1 ? "" : "s"
					]
				})]
			}), notifications.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-2xl bg-muted" }, i))
			}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-12 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-extrabold text-foreground",
						children: "All caught up!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No new notifications right now."
					})
				]
			}) : items.map((n) => {
				const isUnread = !n.read_at;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-start gap-4 rounded-2xl border p-4 transition-all", isUnread ? "border-primary/25 bg-primary/5 shadow-sm" : "border-border bg-card opacity-75"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl", isUnread ? "bg-primary/10" : "bg-muted"),
						children: getEmoji(n.title ?? "")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("font-bold text-sm", isUnread ? "text-foreground" : "text-muted-foreground"),
									children: n.title
								}), isUnread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 shrink-0 rounded-full bg-accent mt-1.5" })]
							}),
							n.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground leading-relaxed",
								children: n.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: formatRelative(n.created_at)
							})
						]
					})]
				}, n.id);
			})]
		})
	});
}
//#endregion
export { StudentNotificationsPage as component };
