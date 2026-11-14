import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Qt as CalendarDays, Rt as ClipboardList, X as MessageSquareQuote, _t as GraduationCap, c as UserRound, in as BookOpen, k as Search, v as Timer } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { E as useTutorCards, O as useViewerTimezone, _ as useChildren, a as formatDayInZone, g as useChildProgress, h as useBookings, i as childName, l as formatTimeInZone, o as formatHoursFromMinutes } from "./parent-data-Dj0LJH5W.mjs";
import { i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, t as BookingStatusBadge } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { t as ClassCard } from "./ClassCard-Dq9EP8Zw.mjs";
import { t as Route } from "./children._studentId-CaJRDlz1.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/children._studentId-ChKBIUXk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChildProfilePage() {
	const { studentId } = Route.useParams();
	const timezone = useViewerTimezone();
	const children = useChildren();
	const bookings = useBookings({ studentId });
	const progress = useChildProgress(studentId);
	const tutorIds = (0, import_react.useMemo)(() => (bookings.data ?? []).map((row) => row.tutor_id), [bookings.data]);
	const tutors = useTutorCards(tutorIds);
	const child = (children.data ?? []).find((item) => item.id === studentId) ?? null;
	const rows = progress.data ?? [];
	const upcoming = (bookings.data ?? []).filter((row) => new Date(row.ends_at).getTime() > Date.now() && [
		"pending",
		"confirmed",
		"in_progress"
	].includes(row.status)).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
	const history = (bookings.data ?? []).filter((row) => new Date(row.ends_at).getTime() <= Date.now() || row.status === "completed");
	const notes = (bookings.data ?? []).flatMap((row) => (row.class_sessions ?? []).filter((session) => session.tutor_notes || session.homework).map((session) => ({
		booking: row,
		session
	})));
	const totalMinutes = rows.reduce((sum, row) => sum + Number(row.learning_minutes ?? 0), 0);
	const totalCompleted = rows.reduce((sum, row) => sum + Number(row.completed_lessons ?? 0), 0);
	const attended = rows.reduce((sum, row) => sum + Number(row.attended_count ?? 0), 0);
	const missed = rows.reduce((sum, row) => sum + Number(row.missed_count ?? 0), 0);
	const cancelled = rows.reduce((sum, row) => sum + Number(row.cancelled_count ?? 0), 0);
	const maxLessons = Math.max(1, ...rows.map((row) => Number(row.completed_lessons ?? 0)));
	const childTutors = [...new Set((bookings.data ?? []).map((row) => row.tutor_id))].map((id) => tutors.map.get(id)).filter(Boolean);
	if (children.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Child profile",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "We couldn't load this profile right now.",
			onRetry: () => void children.refetch()
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: child ? childName(child) : "Child profile",
		description: child ? `${child.education_levels?.name ?? "Level not set"} · ${child.curricula?.name ?? "Curriculum not set"}` : "Loading learner details…",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "cta",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/find-tutor",
				search: { child: studentId },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Find a tutor"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/children",
				children: "All children"
			})
		})] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Completed lessons",
						value: totalCompleted,
						icon: GraduationCap
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Learning hours",
						value: formatHoursFromMinutes(totalMinutes),
						icon: Timer
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Classes attended",
						value: attended,
						icon: CalendarDays
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Missed classes",
						value: missed,
						icon: ClipboardList
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "overview",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full justify-start overflow-x-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "overview",
								children: "Overview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "classes",
								children: "Classes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "progress",
								children: "Progress"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "history",
								children: "History"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "notes",
								children: "Tutor notes"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "mt-4 space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Education profile",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
										label: "Curriculum",
										value: child?.curricula?.name ?? "Not set"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
										label: "Level / grade",
										value: child?.education_levels?.name ?? "Not set"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
										label: "School",
										value: child?.school_name ?? "Not provided"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
										label: "Timezone",
										value: child?.timezone ?? timezone
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
											label: "Learning goals",
											value: child?.learning_goals ?? "No goals recorded yet."
										})
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Current tutors",
							children: tutors.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
								rows: 2,
								height: "h-20"
							}) : childTutors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								icon: UserRound,
								title: "No tutors yet",
								body: "Once you book a lesson, the tutor will appear here.",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									className: "min-h-11",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/find-tutor",
										search: { child: studentId },
										children: "Find a tutor"
									})
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "grid gap-3 sm:grid-cols-2",
								children: childTutors.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-10 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary-deep",
											children: (tutor.full_name ?? "T").charAt(0)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-semibold",
												children: tutor.full_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs text-muted-foreground",
												children: (tutor.subjects ?? []).slice(0, 3).join(" · ") || "Subjects on request"
											})]
										}),
										tutor.verification_status === "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "ml-auto shrink-0 text-[0.7rem]",
											children: "Verified"
										}) : null
									]
								}, tutor.id))
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "classes",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Upcoming classes",
							description: `Your time · ${timezone}`,
							children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
								rows: 2,
								height: "h-36"
							}) : upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								icon: CalendarDays,
								title: "No upcoming classes",
								body: "Scheduled lessons for this learner will appear here.",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									className: "min-h-11",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/find-tutor",
										search: { child: studentId },
										children: "Find a tutor"
									})
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 xl:grid-cols-2",
								children: upcoming.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassCard, {
									booking,
									child: child ?? void 0,
									tutor: tutors.map.get(booking.tutor_id),
									viewerTimezone: timezone
								}, booking.id))
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "progress",
						className: "mt-4 space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Subject progress",
							description: "Based on lessons actually completed on DiaLearn.",
							children: progress.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
								rows: 3,
								height: "h-16"
							}) : progress.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
								message: "We couldn't load learning progress right now.",
								onRetry: () => void progress.refetch()
							}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								icon: BookOpen,
								title: "No learning data yet",
								body: "Progress appears after this learner's first completed lesson."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-4",
								children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: row.subject_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											Number(row.completed_lessons),
											" completed ·",
											" ",
											formatHoursFromMinutes(Number(row.learning_minutes)),
											" ·",
											" ",
											Number(row.scheduled_lessons),
											" scheduled"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									className: "mt-2 h-2",
									value: Number(row.completed_lessons) / maxLessons * 100
								})] }, row.subject_id ?? row.subject_name))
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Attendance",
							description: "Recorded by the tutor after each class.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
										label: "Attended",
										value: attended,
										icon: CalendarDays
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
										label: "Missed",
										value: missed,
										icon: ClipboardList
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
										label: "Cancelled",
										value: cancelled,
										icon: Timer
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "history",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Class history",
							children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
								rows: 3,
								height: "h-16"
							}) : history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								icon: ClipboardList,
								title: "No past classes yet",
								body: "Completed and cancelled lessons will be listed here."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: history.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center gap-3 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-sm font-semibold",
											children: [
												booking.subjects?.name ?? "Lesson",
												" ·",
												" ",
												tutors.map.get(booking.tutor_id)?.full_name ?? "Tutor"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												formatDayInZone(booking.starts_at, timezone),
												" ·",
												" ",
												formatTimeInZone(booking.starts_at, timezone),
												" ·",
												" ",
												booking.duration_minutes,
												" min"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusBadge, { status: booking.status })]
								}, booking.id))
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "notes",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
							title: "Tutor notes & homework",
							children: notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								icon: MessageSquareQuote,
								title: "No notes yet",
								body: "After a class, tutor notes and homework will appear here."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-3",
								children: notes.map(({ booking, session }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-xl border border-border bg-surface/50 p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-semibold",
											children: [
												booking.subjects?.name ?? "Lesson",
												" ·",
												" ",
												formatDayInZone(booking.starts_at, timezone)
											]
										}),
										session.tutor_notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-sm text-muted-foreground",
											children: session.tutor_notes
										}) : null,
										session.homework ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1.5 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Homework: "
											}), session.homework]
										}) : null
									]
								}, session.id))
							})
						})
					})
				]
			})]
		})
	});
}
function Detail({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 text-sm",
		children: value
	})] });
}
//#endregion
export { ChildProfilePage as component };
