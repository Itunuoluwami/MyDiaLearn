import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { O as Send, T as ShieldCheck, Y as MessagesSquare } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { c as formatRelative } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { T as useSendMessage, l as useConversations, v as useMarkConversationRead, y as useMessages } from "./tutor-workspace-DMY2LNJP.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-C7Z5PUu0.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.messages-Crs78VIC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TutorMessagesPage() {
	const { user } = useAuth();
	const conversations = useConversations();
	const markRead = useMarkConversationRead();
	const [activeId, setActiveId] = (0, import_react.useState)(void 0);
	const [draft, setDraft] = (0, import_react.useState)("");
	const listRef = (0, import_react.useRef)(null);
	const rows = conversations.data ?? [];
	const active = rows.find((row) => row.id === activeId) ?? rows[0];
	const messages = useMessages(active?.id);
	const send = useSendMessage(active?.id);
	(0, import_react.useEffect)(() => {
		if (active?.id) markRead.mutateAsync(active.id).catch(() => void 0);
	}, [active?.id]);
	(0, import_react.useEffect)(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [messages.data]);
	async function handleSend() {
		const body = draft.trim();
		if (!body) return;
		setDraft("");
		try {
			await send.mutateAsync(body);
		} catch {
			toast.error("Message not sent. Please try again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Messages",
		description: "Conversations with your learners and their guardians stay inside DiaLearn.",
		children: conversations.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 4,
			height: "h-20"
		}) : conversations.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "We couldn't load your conversations.",
			onRetry: () => void conversations.refetch()
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
			icon: MessagesSquare,
			title: "No conversations yet",
			body: "Once you have a lesson with a learner you can message them and their guardian from the learner's page."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-elevated max-h-[32rem] overflow-y-auto p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: rows.map((row) => {
						const selected = row.id === active?.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveId(row.id),
							className: cn("focus-ring flex w-full min-h-16 items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-200", selected ? "bg-primary-soft" : "hover:bg-surface"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								className: "size-9 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "bg-card text-xs font-semibold text-primary-deep",
									children: (row.student_first_name ?? "?").charAt(0).toUpperCase()
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-sm font-semibold",
											children: row.student_first_name ?? row.subject ?? "Conversation"
										}), row.unread_count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "shrink-0 rounded-full bg-secondary px-1.5 text-[0.65rem] font-bold text-foreground",
											children: row.unread_count
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block truncate text-xs text-muted-foreground",
										children: row.last_message ?? "No messages yet"
									}),
									row.last_message_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block text-[0.7rem] text-muted-foreground",
										children: formatRelative(row.last_message_at)
									}) : null
								]
							})]
						}) }, row.id);
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-elevated flex h-[32rem] min-w-0 flex-col p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 border-b border-border pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "truncate text-sm font-semibold md:text-base",
								children: active?.student_first_name ?? "Conversation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: active?.subject ?? "Learner and guardian"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "size-3.5 text-primary",
								"aria-hidden": "true"
							}), " On-platform only"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: listRef,
						className: "mt-3 flex-1 space-y-2 overflow-y-auto pr-1",
						children: messages.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-2/3 rounded-xl shimmer" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto h-10 w-1/2 rounded-xl shimmer" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-3/5 rounded-xl shimmer" })
						] }) : (messages.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground",
							children: "Say hello and share how you plan to support this learner."
						}) : (messages.data ?? []).map((message) => {
							const mine = message.sender_id === user?.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", mine ? "ml-auto bg-primary text-primary-foreground" : "bg-surface text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap break-words",
									children: message.body
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("mt-1 text-[0.65rem]", mine ? "text-primary-foreground/70" : "text-muted-foreground"),
									children: formatRelative(message.created_at)
								})]
							}, message.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							handleSend();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "sr-only",
								htmlFor: "message-input",
								children: "Message"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "message-input",
								className: "min-h-11",
								value: draft,
								placeholder: "Write a message…",
								onChange: (event) => setDraft(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "cta",
								size: "icon",
								className: "min-h-11 min-w-11",
								"aria-label": "Send message",
								disabled: send.isPending || !active,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
							})
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { TutorMessagesPage as component };
