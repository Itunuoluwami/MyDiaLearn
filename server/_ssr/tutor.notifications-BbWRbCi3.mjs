import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { an as Bell, on as BellOff, qt as Check } from "../_libs/lucide-react.mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as formatRelative, x as useNotifications } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.notifications-BbWRbCi3.js
var import_jsx_runtime = require_jsx_runtime();
function TutorNotificationsPage() {
	const notifications = useNotifications();
	const queryClient = useQueryClient();
	const markRead = useMutation({
		mutationFn: async (ids) => {
			if (ids.length === 0) return;
			await apiPost("/notifications/read", { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["parent-notifications"] });
		}
	});
	const rows = notifications.data ?? [];
	const unread = rows.filter((row) => !row.read_at);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Notifications",
		description: "Message content comes from DiaLearn's editable notification templates.",
		actions: unread.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			className: "min-h-11 sm:min-h-10",
			disabled: markRead.isPending,
			onClick: async () => {
				try {
					await markRead.mutateAsync(unread.map((row) => row.id));
					toast.success("All caught up");
				} catch {
					toast.error("We couldn't update your notifications.");
				}
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), " Mark all read"]
		}) : null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-3xl space-y-5",
			children: notifications.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 4,
				height: "h-20"
			}) : notifications.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your notifications right now.",
				onRetry: () => void notifications.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: BellOff,
				title: "Nothing to read",
				body: "Booking requests, verification updates and reminders will land here."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: unread.length > 0 ? `${unread.length} unread` : "All notifications",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-start gap-3 rounded-xl border p-3 transition-colors", row.read_at ? "border-border bg-card" : "border-primary/20 bg-primary-soft/40"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary-deep shadow-soft",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: row.title
									}),
									row.body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: row.body
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-xs text-muted-foreground",
										children: formatRelative(row.created_at)
									})
								]
							}),
							!row.read_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "min-h-11 shrink-0 sm:min-h-9",
								onClick: () => void markRead.mutateAsync([row.id]),
								children: "Mark read"
							}) : null
						]
					}, row.id))
				})
			})
		})
	});
}
//#endregion
export { TutorNotificationsPage as component };
