import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { O as Send, T as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { c as formatRelative } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { T as useSendMessage, l as useConversations, v as useMarkConversationRead, y as useMessages } from "./tutor-workspace-DMY2LNJP.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-C7Z5PUu0.mjs";
import { d as useStudentRecord, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.messages-DLOBLY4G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudentMessagesPage() {
	const { user } = useAuth();
	const { data: student } = useStudentRecord();
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
	if (student && !student.can_message_tutors) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "💬 Messages",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center max-w-md mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-5xl",
					children: "🔒"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-extrabold text-foreground",
					children: "Messaging not enabled"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Ask your parent to enable messaging in your account settings."
				})
			]
		})
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "💬 Messages",
		description: "Chat with your tutors — all conversations stay safe on DiaLearn.",
		children: conversations.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-2xl bg-muted" }, i))
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center max-w-md mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-5xl",
					children: "💬"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-extrabold text-foreground",
					children: "No conversations yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "After your first class, you can message your tutor here."
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border bg-primary/5 px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-extrabold text-primary-deep",
						children: "Conversations"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-[32rem] overflow-y-auto divide-y divide-border/50",
					children: rows.map((row) => {
						const selected = row.id === active?.id;
						const initials = (row.student_first_name ?? "T").charAt(0).toUpperCase();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveId(row.id),
							className: cn("focus-ring flex w-full min-h-16 items-center gap-3 px-4 py-3 text-left transition-colors", selected ? "bg-primary/10" : "hover:bg-muted/50"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								className: "size-10 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: cn("text-sm font-extrabold", selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"),
									children: initials
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-sm font-extrabold text-foreground",
											children: row.student_first_name ?? row.subject ?? "Tutor"
										}), row.unread_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "shrink-0 flex size-5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-white",
											children: row.unread_count
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block truncate text-xs text-muted-foreground",
										children: row.last_message ?? "No messages yet"
									}),
									row.last_message_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[0.65rem] text-muted-foreground",
										children: formatRelative(row.last_message_at)
									})
								]
							})]
						}) }, row.id);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-[32rem] flex-col rounded-2xl border border-border bg-card overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								className: "size-9 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "bg-primary text-sm font-extrabold text-primary-foreground",
									children: (active?.student_first_name ?? "T").charAt(0).toUpperCase()
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-extrabold text-foreground truncate text-sm",
								children: active?.student_first_name ?? "Tutor"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: active?.subject ?? "Your tutor"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-primary" }), " On-platform only"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: listRef,
						className: "flex-1 space-y-3 overflow-y-auto p-4",
						children: messages.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-2/3 rounded-2xl" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto h-10 w-1/2 rounded-2xl" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-3/5 rounded-2xl" })
						] }) : (messages.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-2 py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-3xl",
								children: "👋"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-muted-foreground",
								children: "Say hi to start the conversation!"
							})]
						}) : (messages.data ?? []).map((message) => {
							const mine = message.sender_id === user?.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", mine ? "ml-auto bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"),
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
						onSubmit: (e) => {
							e.preventDefault();
							handleSend();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "sr-only",
								htmlFor: "student-message-input",
								children: "Message"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "student-message-input",
								className: "min-h-11 flex-1 rounded-2xl",
								value: draft,
								placeholder: "Type a message…",
								onChange: (e) => setDraft(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "icon",
								className: "min-h-11 min-w-11 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90",
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
export { StudentMessagesPage as component };
