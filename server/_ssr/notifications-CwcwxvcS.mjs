import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Jt as CheckCheck, an as Bell } from "../_libs/lucide-react.mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as formatRelative, x as useNotifications } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CwcwxvcS.js
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	const notifications = useNotifications();
	const queryClient = useQueryClient();
	const rows = notifications.data ?? [];
	const unread = rows.filter((row) => !row.read_at);
	const markRead = useMutation({
		mutationFn: async (ids) => {
			if (ids.length) await apiPost("/notifications/read", { ids });
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["parent-notifications"] });
		},
		onError: () => toast.error("We couldn't update your notifications. Please try again.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Notifications",
		description: "Reminders and updates generated from the platform's notification templates.",
		actions: unread.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			className: "min-h-11",
			onClick: () => markRead.mutate(unread.map((row) => row.id)),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4" }), " Mark all as read"]
		}) : void 0,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Your alerts",
			description: unread.length > 0 ? `${unread.length} unread` : "You're all caught up.",
			children: notifications.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 4,
				height: "h-16"
			}) : notifications.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your notifications right now.",
				onRetry: () => void notifications.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: Bell,
				title: "No notifications yet",
				body: "Class reminders and booking updates will show up here."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("rounded-xl border p-3 transition-colors", row.read_at ? "border-border bg-card" : "border-primary/30 bg-primary-soft/40"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: row.title ?? "DiaLearn update"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-sm text-muted-foreground",
								children: row.body
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: formatRelative(row.created_at)
							}), !row.read_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: "New"
							}) : null]
						})]
					}), !row.read_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "mt-2 min-h-11 sm:min-h-9",
						onClick: () => markRead.mutate([row.id]),
						children: "Mark as read"
					}) : null]
				}, row.id))
			})
		})
	});
}
//#endregion
export { NotificationsPage as component };
