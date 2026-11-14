import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { O as Send, T as ShieldCheck, Y as MessagesSquare } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { c as formatRelative } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { l as SectionCard, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { T as useSendMessage, l as useConversations, v as useMarkConversationRead, y as useMessages } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-C7Z5PUu0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/messages-CuOlUX_6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ParentMessagesPage() {
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
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight,
			behavior: "smooth"
		});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Messages",
		description: "Conversations with your children's tutors stay inside DiaLearn.",
		children: conversations.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Conversations",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-2xl" }, index))
			})
		}) : conversations.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Conversations",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your conversations right now.",
				onRetry: () => void conversations.refetch()
			})
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Conversations",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: MessagesSquare,
				title: "No conversations yet",
				body: "Once a lesson is booked, you can message that tutor here. Keeping it on DiaLearn means there is always a record.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cta",
					className: "min-h-11",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/find-tutor",
						children: "Find a tutor"
					})
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-2xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border bg-primary/5 px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-extrabold text-primary-deep",
						children: "Conversations"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-[32rem] divide-y divide-border/50 overflow-y-auto",
					children: rows.map((row) => {
						const selected = row.id === active?.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveId(row.id),
							className: cn("focus-ring flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors", selected ? "bg-primary/10" : "hover:bg-muted/50"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								className: "size-10 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: cn("text-sm font-extrabold", selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"),
									children: (row.student_first_name ?? "T").charAt(0).toUpperCase()
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm font-extrabold text-foreground",
										children: row.student_first_name ?? row.subject ?? "Tutor"
									}), row.unread_count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-white",
										children: row.unread_count
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block truncate text-xs text-muted-foreground",
									children: row.last_message ?? "No messages yet"
								})]
							})]
						}) }, row.id);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								className: "size-9 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "bg-primary text-sm font-extrabold text-primary-foreground",
									children: (active?.student_first_name ?? "T").charAt(0).toUpperCase()
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-extrabold text-foreground",
									children: active?.student_first_name ?? "Tutor"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: active?.subject ?? "Your tutor"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-primary" }), " On-platform only"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: listRef,
						className: "flex-1 space-y-3 overflow-y-auto p-4",
						children: messages.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-2/3 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto h-10 w-1/2 rounded-2xl" })] }) : (messages.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-10 text-center text-sm text-muted-foreground",
							children: "No messages yet — say hello."
						}) : (messages.data ?? []).map((message) => {
							const mine = message.sender_id === user?.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", mine ? "ml-auto rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap break-words",
									children: message.body
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("mt-1 text-[0.65rem]", mine ? "text-primary-foreground/60" : "text-muted-foreground"),
									children: formatRelative(message.created_at)
								})]
							}, message.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex gap-3 border-t border-border bg-card/80 p-4",
						onSubmit: (event) => {
							event.preventDefault();
							handleSend();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "sr-only",
								htmlFor: "parent-message-input",
								children: "Message"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "parent-message-input",
								className: "min-h-11 flex-1 rounded-2xl",
								value: draft,
								placeholder: "Type a message…",
								onChange: (event) => setDraft(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								size: "icon",
								className: "min-h-11 min-w-11 rounded-2xl",
								disabled: send.isPending || draft.trim().length === 0,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Send"
								})]
							})
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { ParentMessagesPage as component };
