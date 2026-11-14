import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Ht as CircleCheck, It as Clock, J as MessageSquare, Vt as CirclePlay, in as BookOpen, tn as CalendarCheck2, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { d as isJoinable } from "./parent-data-Dj0LJH5W.mjs";
import { c as useStudentBookings, d as useStudentRecord, n as formatTimeInZone, s as useStudentAssignments, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.dashboard-CkO8OhfY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function greeting() {
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}
function StudentDashboardPage() {
	const { profile } = useAuth();
	const { data: student } = useStudentRecord();
	const bookings = useStudentBookings();
	const assignments = useStudentAssignments();
	const firstName = student?.first_name || (profile?.full_name ?? "").split(" ")[0];
	const tz = student?.timezone || "UTC";
	const upcoming = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((b) => new Date(b.ends_at) > /* @__PURE__ */ new Date() && ["confirmed", "in_progress"].includes(b.status)).slice(0, 3), [bookings.data]);
	const liveNow = (0, import_react.useMemo)(() => upcoming.find((b) => isJoinable(b)), [upcoming]);
	const dueAssignments = (0, import_react.useMemo)(() => (assignments.data ?? []).filter((a) => a.status === "assigned").slice(0, 3), [assignments.data]);
	const recentFeedback = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((b) => b.status === "completed" && b.class_sessions?.[0]?.tutor_notes).slice(0, 2), [bookings.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: `${greeting()}${firstName ? `, ${firstName}` : ""}! 👋`,
		description: "Here's what's happening with your learning today.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6 max-w-4xl",
			children: [
				liveNow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-secondary p-5 text-white shadow-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "size-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold uppercase tracking-widest opacity-80",
								children: "Class is live now!"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xl font-extrabold",
								children: liveNow.subjects?.name ?? "Your class"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "min-h-12 rounded-xl bg-white font-bold text-accent hover:bg-white/90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/student/classroom/$bookingId",
								params: { bookingId: liveNow.id },
								children: "Join Class Now"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: CalendarCheck2,
							label: "Upcoming Classes",
							value: upcoming.length,
							color: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: BookOpen,
							label: "Tasks Due",
							value: dueAssignments.length,
							color: "secondary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: CircleCheck,
							label: "Classes Completed",
							value: (bookings.data ?? []).filter((b) => b.status === "completed").length,
							color: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Star,
							label: "Feedback Notes",
							value: recentFeedback.length,
							color: "warning"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "📅 Upcoming Classes",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "font-bold text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/student/history",
							children: "View all"
						})
					}),
					children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { rows: 2 }) : upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: "🎓",
						message: "No upcoming classes. Ask your parent to book one!"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: upcoming.map((booking) => {
							const tutorName = booking.tutors?.profiles?.full_name ?? "Your Tutor";
							const subject = booking.subjects?.name ?? "Lesson";
							const joinable = isJoinable(booking);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl",
										children: "📘"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-foreground truncate",
												children: subject
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-muted-foreground",
												children: ["with ", tutorName]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
													formatTimeInZone(booking.starts_at, tz),
													" · ",
													booking.duration_minutes,
													" min"
												]
											})
										]
									}),
									joinable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										className: "min-h-10 rounded-xl bg-accent font-bold text-white hover:bg-accent/90",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/student/classroom/$bookingId",
											params: { bookingId: booking.id },
											children: "Join"
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "rounded-full text-xs font-bold",
										children: "Soon"
									})
								]
							}, booking.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "📝 Assignments Due",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "font-bold text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/student/materials",
							children: "View all"
						})
					}),
					children: assignments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { rows: 2 }) : dueAssignments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: "✅",
						message: "You're all caught up — no pending assignments!"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: dueAssignments.map((a) => {
							const overdue = a.due_at && new Date(a.due_at) < /* @__PURE__ */ new Date();
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex items-center gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md", overdue ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-2xl",
										children: "📋"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-foreground truncate",
												children: a.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted-foreground",
												children: a.subjects?.name
											}),
											a.due_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: cn("mt-1 text-xs font-bold", overdue ? "text-destructive" : "text-muted-foreground"),
												children: [overdue ? "⚠️ Overdue — " : "Due: ", new Date(a.due_at).toLocaleDateString()]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										className: "min-h-10 rounded-xl font-bold",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/student/materials",
											children: "Submit"
										})
									})
								]
							}, a.id);
						})
					})
				}),
				recentFeedback.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "💬 Latest Feedback from your Tutor",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: recentFeedback.map((booking) => {
							const session = booking.class_sessions?.[0];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-2xl border border-primary/20 bg-primary/5 p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mt-0.5 size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-bold text-primary-deep",
											children: [
												booking.subjects?.name ?? "Class",
												" ",
												"· ",
												new Date(booking.starts_at).toLocaleDateString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-sm text-foreground leading-relaxed",
											children: session?.tutor_notes
										}),
										session?.homework && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs font-bold text-secondary-foreground",
											children: ["📌 Homework: ", session.homework]
										})
									] })]
								})
							}, booking.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "⚡ Quick Actions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
								to: "/student/find-tutor",
								emoji: "🔍",
								label: "Find a Tutor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
								to: "/student/materials",
								emoji: "📚",
								label: "Assignments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
								to: "/student/messages",
								emoji: "💬",
								label: "Message Tutor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
								to: "/student/history",
								emoji: "📊",
								label: "My Progress"
							})
						]
					})
				})
			]
		})
	});
}
function StatCard({ icon: Icon, label, value, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex size-10 items-center justify-center rounded-xl", {
				primary: "bg-primary/10 text-primary",
				secondary: "bg-secondary/15 text-secondary-foreground",
				success: "bg-success/10 text-success",
				warning: "bg-warning/10 text-warning"
			}[color]),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xl font-extrabold tabular-nums text-foreground",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold text-muted-foreground",
			children: label
		})] })]
	});
}
function SectionCard({ title, action, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-extrabold text-foreground",
				children: title
			}), action]
		}), children]
	});
}
function EmptyState({ icon, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-2 py-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-4xl",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-muted-foreground",
			children: message
		})]
	});
}
function SkeletonList({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-2xl bg-muted" }, i))
	});
}
function QuickAction({ to, emoji, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "focus-ring flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-3xl",
			children: emoji
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-bold text-foreground",
			children: label
		})]
	});
}
//#endregion
export { StudentDashboardPage as component };
