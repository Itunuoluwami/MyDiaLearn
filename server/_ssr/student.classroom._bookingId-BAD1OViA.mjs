import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { T as ShieldCheck } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { t as Route } from "./student.classroom._bookingId-C87UtU4_.mjs";
import { c as useStudentBookings, i as useJoinClass, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
import { i as useLocalMedia, n as DeviceControls, r as Whiteboard, t as ClassStage } from "./use-local-media-CCd1zjbf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.classroom._bookingId-BAD1OViA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** How long the class has been running, from the tutor's start. */
function elapsedLabel(from, until, now) {
	if (!from) return "Not started";
	const end = until ? new Date(until).getTime() : now;
	const seconds = Math.max(0, Math.floor((end - new Date(from).getTime()) / 1e3));
	const minutes = Math.floor(seconds / 60);
	return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function StudentClassroomPage() {
	const { bookingId } = Route.useParams();
	const navigate = useNavigate();
	const session = useJoinClass(bookingId);
	const booking = (useStudentBookings({ statuses: ["confirmed", "in_progress"] }).data ?? []).find((row) => row.id === bookingId);
	const media = useLocalMedia();
	const [handRaised, setHandRaised] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const data = session.data;
	const live = data?.status === "in_progress" || Boolean(data?.started_at && !data.ended_at);
	(0, import_react.useEffect)(() => {
		if (!live) return;
		const timer = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(timer);
	}, [live]);
	const subject = data?.subject_name ?? "Class";
	const tutor = data?.tutor_name ?? "your tutor";
	if (session.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "Classroom",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-video w-full rounded-2xl" })
	});
	if (session.isError || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "Classroom",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-6xl",
					children: "🚫"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-extrabold text-foreground",
					children: "You can't open this class"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: "Only the learner and the family on this booking can join, and the lesson has to be confirmed first."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "min-h-11 rounded-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/student/dashboard",
						children: "Back to dashboard"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: `📡 ${subject}`,
		description: `Live class with ${tutor}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassStage, {
						meetingUrl: data.meeting_url,
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
								navigate({ to: "/student/dashboard" });
							},
							leaveLabel: "Leave class"
						})
					}),
					!live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground",
						children: "Your tutor hasn't started the class yet. You can turn your camera on and check how you look while you wait — this page updates on its own when they begin."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-start gap-2 rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							className: "mt-0.5 size-4 shrink-0 text-primary",
							"aria-hidden": "true"
						}), "Only you and your tutor can open this room, and your attendance is recorded against the lesson."]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "whiteboard",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "whiteboard",
								className: "min-h-11 flex-1",
								children: "Whiteboard"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "lesson",
								className: "min-h-11 flex-1",
								children: "Lesson"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "whiteboard",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whiteboard, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "lesson",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-elevated space-y-3 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
										children: "Subject"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm",
										children: subject
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
										children: "Tutor"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm",
										children: tutor
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
										children: "Planned length"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm",
										children: [data.duration_minutes, " minutes"]
									})] }),
									booking?.class_sessions?.[0]?.homework ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-secondary/30 bg-secondary/10 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-extrabold uppercase tracking-widest text-secondary-foreground",
											children: "Homework from last session"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-foreground",
											children: booking.class_sessions[0].homework
										})]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										variant: "outline",
										className: "min-h-11 w-full rounded-xl",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/student/materials",
											children: "Open my assignments"
										})
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
//#endregion
export { StudentClassroomPage as component };
