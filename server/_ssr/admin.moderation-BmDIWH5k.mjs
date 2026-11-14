import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { E as ShieldAlert, Tt as EyeOff, k as Search, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { D as useSetReviewPublished, E as useSetMessageHidden, v as useModerationMessages, y as useModerationReviews } from "./admin-data-uZ6jnAG3.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.moderation-BmDIWH5k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReviewsTab() {
	const reviews = useModerationReviews();
	const setPublished = useSetReviewPublished();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel-portal mt-4 p-4 md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Every review, newest first. Unpublish anything that shouldn't be shown publicly."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3",
			children: reviews.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}) : (reviews.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No reviews yet."
			}) : (reviews.data ?? []).map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "flex items-center gap-1 text-sm font-medium",
						children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: i < review.score ? "size-3.5 fill-warning text-warning" : "size-3.5 text-muted" }, i))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: [
							review.profiles?.full_name ?? "Anonymous",
							" →",
							" ",
							review.tutors?.profiles?.full_name ?? "Tutor",
							" ·",
							" ",
							new Date(review.created_at).toLocaleDateString()
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: review.is_published,
							"aria-label": "Published",
							onCheckedChange: (checked) => setPublished.mutate({
								id: review.id,
								isPublished: checked
							}, { onError: (error) => toast.error(error.message) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: review.is_published ? "Published" : "Hidden"
						})]
					})]
				}), review.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: review.comment
				}) : null]
			}, review.id))
		})]
	});
}
function MessagesTab() {
	const [search, setSearch] = (0, import_react.useState)("");
	const messages = useModerationMessages(search);
	const setHidden = useSetMessageHidden();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel-portal mt-4 p-4 md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search message content (2+ characters)",
				className: "pl-9",
				value: search,
				onChange: (e) => setSearch(e.target.value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: search.trim().length <= 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Search for a word or phrase to find messages to moderate."
			}) : messages.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}) : (messages.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No messages match."
			}) : (messages.data ?? []).map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm",
						children: message.body
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: [
							message.profiles?.full_name ?? "Unknown",
							" ·",
							" ",
							new Date(message.created_at).toLocaleString()
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [message.is_hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Hidden"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: message.is_hidden ? "outline" : "ghost",
						size: "sm",
						className: message.is_hidden ? void 0 : "text-destructive",
						onClick: () => setHidden.mutate({
							id: message.id,
							isHidden: !message.is_hidden,
							reason: "Hidden by admin"
						}, { onError: (error) => toast.error(error.message) }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }), message.is_hidden ? "Unhide" : "Hide"]
					})]
				})]
			}, message.id))
		})]
	});
}
function AdminModerationPage() {
	const { hasPermission, loading } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Moderation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.moderation")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Moderation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include content moderation permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Moderation",
		description: "Reviews and messages. Flagged profiles are suspended from the Users page — no separate flow needed.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "reviews",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "reviews",
					children: "Reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "messages",
					children: "Messages"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "reviews",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewsTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "messages",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesTab, {})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-xs text-muted-foreground",
			children: [
				"Looking to suspend an account? Head to",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin/users",
					className: "underline underline-offset-2",
					children: "Users"
				}),
				"."
			]
		})]
	});
}
//#endregion
export { AdminModerationPage as component };
