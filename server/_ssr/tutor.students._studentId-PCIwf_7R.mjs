import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { J as MessageSquare, Rt as ClipboardList, W as NotebookPen, en as CalendarCheck, fn as ArrowLeft, h as TrendingUp, v as Timer } from "../_libs/lucide-react.mjs";
import { _ as Link, y as useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as useTutorStudents, p as useTutorBookings, v as useTutorTimezone } from "./tutor-data-BgedrW1M.mjs";
import { c as formatRelative, o as formatHoursFromMinutes } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { D as useStartConversation, l as useConversations, n as ASSIGNMENT_TONE, s as useAssignments, t as ASSIGNMENT_LABEL } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
import { t as TutorBookingCard } from "./TutorBookingCard-DRobNGBc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.students._studentId-PCIwf_7R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudentProgressPage() {
	const { studentId } = useParams({ from: "/_authenticated/tutor/students/$studentId" });
	const timezone = useTutorTimezone();
	const students = useTutorStudents();
	const bookings = useTutorBookings();
	const assignments = useAssignments({ studentId });
	const conversations = useConversations();
	const startConversation = useStartConversation();
	const [tab, setTab] = (0, import_react.useState)("lessons");
	const student = (students.data ?? []).find((row) => row.student_id === studentId);
	const rows = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((row) => row.student_id === studentId), [bookings.data, studentId]);
	const completed = rows.filter((row) => row.status === "completed");
	const minutes = completed.reduce((total, row) => total + (row.duration_minutes ?? 0), 0);
	const attendedKnown = rows.filter((row) => row.status === "completed" || row.status === "no_show");
	const attendance = attendedKnown.length === 0 ? null : Math.round(completed.length / attendedKnown.length * 100);
	const upcoming = rows.filter((row) => new Date(row.ends_at).getTime() > Date.now() && (row.status === "confirmed" || row.status === "in_progress"));
	const withNotes = completed.filter((row) => row.has_notes).length;
	async function openConversation() {
		if (!(conversations.data ?? []).find((row) => row.student_id === studentId)) try {
			await startConversation.mutateAsync({ studentId });
		} catch {
			toast.error("We couldn't open a conversation.");
			return;
		}
		window.location.assign("/tutor/messages");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: student?.first_name ? `${student.first_name}'s progress` : "Learner progress",
		description: student ? [
			student.education_level_name,
			student.curriculum_name,
			student.student_timezone
		].filter(Boolean).join(" · ") : "Hours, attendance and assignments",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "min-h-11 sm:min-h-10",
				disabled: startConversation.isPending,
				onClick: () => void openConversation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }), " Message"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				className: "min-h-11 sm:min-h-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tutor/students",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " All learners"]
				})
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-5xl space-y-5",
			children: [
				bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, {}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: "We couldn't load this learner's lessons.",
					onRetry: () => void bookings.refetch()
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Learning hours",
							value: formatHoursFromMinutes(minutes),
							hint: `${completed.length} completed ${completed.length === 1 ? "lesson" : "lessons"}`,
							icon: Timer,
							variant: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Attendance",
							value: attendance === null ? "—" : `${attendance}%`,
							hint: attendance === null ? "No completed lessons yet" : "Lessons attended",
							icon: TrendingUp
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Upcoming",
							value: upcoming.length,
							hint: student?.next_class_at ? `Next ${formatRelative(student.next_class_at)}` : "Nothing booked",
							icon: CalendarCheck
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Lessons with notes",
							value: `${withNotes}/${completed.length || 0}`,
							hint: "Shared with the family",
							icon: NotebookPen
						})
					]
				}),
				student?.subjects?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Subjects you teach together",
					description: "Taken from your lessons",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: student.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface px-3 py-1.5 text-sm",
							children: subject
						}, subject))
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: tab === "lessons" ? "cta" : "outline",
						size: "sm",
						className: "min-h-11 sm:min-h-10",
						onClick: () => setTab("lessons"),
						children: "Lesson history"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: tab === "assignments" ? "cta" : "outline",
						size: "sm",
						className: "min-h-11 sm:min-h-10",
						onClick: () => setTab("assignments"),
						children: "Assignments"
					})]
				}),
				tab === "lessons" ? bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 3,
					height: "h-32"
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
					icon: CalendarCheck,
					title: "No lessons yet",
					body: "Lessons with this learner will be listed here with attendance and your notes."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: rows.slice().sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()).map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorBookingCard, {
						booking,
						timezone,
						showLifecycle: false
					}, booking.id))
				}) : assignments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 3,
					height: "h-24"
				}) : (assignments.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
					icon: ClipboardList,
					title: "No assignments yet",
					body: "Set homework to keep this learner practising between lessons.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						className: "min-h-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutor/assignments",
							children: "New assignment"
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: (assignments.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: row.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: [row.due_at ? `Due ${formatRelative(row.due_at)}` : "No due date", row.submitted_at ? ` · submitted ${formatRelative(row.submitted_at)}` : ""]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", ASSIGNMENT_TONE[row.status]),
							children: ASSIGNMENT_LABEL[row.status]
						})]
					}, row.id))
				})
			]
		})
	});
}
//#endregion
export { StudentProgressPage as component };
