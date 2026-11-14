import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { O as Send, T as ShieldCheck, W as NotebookPen, a as Users, b as Square, fn as ArrowLeft, zt as Circle } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate, y as useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { p as useTutorBookings, v as useTutorTimezone } from "./tutor-data-BgedrW1M.mjs";
import { a as formatDayInZone, l as formatTimeInZone } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, t as BookingStatusBadge } from "./ui-bAhnOVkK.mjs";
import { D as useStartConversation, E as useStartClass, T as useSendMessage, c as useClassSession, h as useEndClass, l as useConversations, y as useMessages } from "./tutor-workspace-DMY2LNJP.mjs";
import { i as useLocalMedia, n as DeviceControls, r as Whiteboard, t as ClassStage } from "./use-local-media-CCd1zjbf.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.classroom._bookingId-Bhm2qCaS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function elapsedLabel(from, until, now) {
	if (!from) return "Not started";
	const end = until ? new Date(until).getTime() : now;
	const seconds = Math.max(0, Math.floor((end - new Date(from).getTime()) / 1e3));
	return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function ClassroomPage() {
	const { bookingId } = useParams({ from: "/_authenticated/tutor/classroom/$bookingId" });
	const timezone = useTutorTimezone();
	const session = useClassSession(bookingId);
	const bookings = useTutorBookings();
	const startClass = useStartClass();
	const endClass = useEndClass();
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const navigate = useNavigate();
	const media = useLocalMedia();
	const [handRaised, setHandRaised] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	const booking = (bookings.data ?? []).find((row) => row.id === bookingId);
	const data = session.data;
	const live = data?.status === "in_progress";
	async function handleStart() {
		try {
			await startClass.mutateAsync(bookingId);
			toast.success("Class started");
		} catch {
			toast.error("We couldn't start this class yet.");
		}
	}
	async function handleEnd(studentAttended) {
		try {
			await endClass.mutateAsync({
				bookingId,
				studentAttended
			});
			toast.success("Class ended — add your lesson notes while it's fresh");
		} catch {
			toast.error("We couldn't end this class.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Live classroom",
		description: data ? `${data.subject_name ?? "Lesson"} with ${data.student_first_name ?? "your learner"}` : "Your teaching room",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11 sm:min-h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/tutor/classes",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back to classes"]
			})
		}),
		children: session.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 2,
			height: "h-56"
		}) : session.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "This class isn't available to you. Only the tutor and family on the booking can open a classroom.",
			onRetry: () => void session.refetch()
		}) : !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, { message: "We couldn't find that class." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassStage, {
						meetingUrl: data.meeting_url ?? null,
						live,
						elapsed: elapsedLabel(data.started_at, data.ended_at, now),
						media,
						selfLabel: "You"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-2xl border border-border bg-ink shadow-soft",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceControls, {
							media,
							handRaised,
							onToggleHand: () => setHandRaised((value) => !value),
							onLeave: () => {
								media.stopAll();
								navigate({ to: "/tutor/classes" });
							},
							leaveLabel: "Leave room",
							children: live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								disabled: endClass.isPending,
								onClick: () => void handleEnd(false),
								children: "Learner didn't join"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								disabled: endClass.isPending,
								onClick: () => void handleEnd(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), " End class"]
							})] }) : data.status === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tutor/notes/$bookingId",
									params: { bookingId },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, { className: "size-4" }), " Lesson notes"]
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								disabled: startClass.isPending,
								onClick: () => void handleStart(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-4 fill-current" }), " Start class"]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
						title: "Lesson details",
						description: "Times shown in your own timezone",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusBadge, { status: data.status }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Scheduled"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "mt-1 text-sm",
									children: [
										formatDayInZone(data.starts_at, timezone),
										" ·",
										" ",
										formatTimeInZone(data.starts_at, timezone),
										" –",
										" ",
										formatTimeInZone(data.ends_at, timezone),
										" (",
										timezone,
										")"
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Planned length"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "mt-1 text-sm",
									children: [data.duration_minutes, " minutes"]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Learner"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 text-sm",
									children: data.student_first_name ?? "Student"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Subject"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 text-sm",
									children: data.subject_name ?? "Lesson"
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 flex items-start gap-2 rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "mt-0.5 size-4 shrink-0 text-primary",
								"aria-hidden": "true"
							}), "Only you and the family on this booking can open this room. Attendance and timings are recorded against the lesson."]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "chat",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "w-full",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "chat",
									className: "min-h-11 flex-1",
									children: "Chat"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "whiteboard",
									className: "min-h-11 flex-1",
									children: "Whiteboard"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "people",
									className: "min-h-11 flex-1",
									children: "People"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "chat",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassChat, {
								studentId: booking?.student_id ?? null,
								subject: data.subject_name
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "whiteboard",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whiteboard, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "people",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-elevated p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-sm font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
											className: "size-4 text-primary",
											"aria-hidden": "true"
										}), " In this class"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-3 space-y-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center justify-between rounded-xl bg-surface/70 px-3 py-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "You (tutor)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Host"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center justify-between rounded-xl bg-surface/70 px-3 py-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: data.student_first_name ?? "Student" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Learner"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs text-muted-foreground",
										children: "Guardians can follow the lesson from their own portal."
									})
								]
							})
						})
					]
				})
			})]
		})
	});
}
function ClassChat({ studentId, subject }) {
	const conversations = useConversations();
	const startConversation = useStartConversation();
	const [draft, setDraft] = (0, import_react.useState)("");
	const listRef = (0, import_react.useRef)(null);
	const conversationId = (0, import_react.useMemo)(() => {
		if (!studentId) return void 0;
		return (conversations.data ?? []).find((row) => row.student_id === studentId)?.id;
	}, [conversations.data, studentId]);
	const messages = useMessages(conversationId);
	const send = useSendMessage(conversationId);
	(0, import_react.useEffect)(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [messages.data]);
	async function handleSend() {
		const body = draft.trim();
		if (!body) return;
		try {
			if (!conversationId) {
				if (!studentId) throw new Error("no student");
				await startConversation.mutateAsync({
					studentId,
					...subject ? { subject } : {}
				});
				await conversations.refetch();
			}
			setDraft("");
			await send.mutateAsync(body);
		} catch {
			toast.error("Message not sent. Please try again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-elevated flex h-[26rem] flex-col p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Class chat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: listRef,
				className: "mt-3 flex-1 space-y-2 overflow-y-auto pr-1",
				children: messages.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-3/4 rounded-xl shimmer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto h-10 w-2/3 rounded-xl shimmer" })] }) : (messages.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground",
					children: "Messages sent here stay on DiaLearn and are visible to the learner and their guardian."
				}) : (messages.data ?? []).map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl bg-surface/70 p-3 text-sm",
					children: message.body
				}, message.id))
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
						htmlFor: "class-chat-input",
						children: "Message"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "class-chat-input",
						value: draft,
						onChange: (event) => setDraft(event.target.value),
						placeholder: "Write a message…",
						className: "min-h-11",
						disabled: !studentId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "cta",
						size: "icon",
						className: "min-h-11 min-w-11",
						"aria-label": "Send message",
						disabled: !studentId || send.isPending,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})
				]
			})
		]
	});
}
//#endregion
export { ClassroomPage as component };
