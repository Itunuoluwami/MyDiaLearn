import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient, n as ApiError } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { $t as CalendarClock, Ot as Ellipsis, Qt as CalendarDays, Y as MessagesSquare, Yt as ChartLine, an as Bell, c as UserRound, in as BookOpen, k as Search, lt as LayoutDashboard, nt as LogOut } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as apiPost, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CrATILuI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StudentShell-CJwiZRhj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function tutorRef(id, name, avatarUrl) {
	return {
		id,
		profiles: {
			full_name: name,
			avatar_url: avatarUrl ?? null
		}
	};
}
function toStudentRow(s) {
	return {
		id: s.id,
		profile_id: s.profileId,
		parent_id: s.parentId,
		first_name: s.firstName,
		last_name: s.lastName,
		date_of_birth: s.dateOfBirth,
		gender: s.gender,
		curriculum_id: s.curriculumId,
		education_level_id: s.educationLevelId,
		school_name: s.schoolName,
		learning_goals: s.learningGoals,
		special_needs: s.specialNeeds,
		timezone: s.timezone,
		avatar_url: s.avatarUrl,
		can_self_login: s.canSelfLogin,
		can_book_lessons: s.canBookLessons,
		can_message_tutors: s.canMessageTutors,
		is_active: s.isActive,
		created_at: s.createdAt,
		updated_at: s.createdAt,
		curricula: s.curriculumName ? { name: s.curriculumName } : null,
		education_levels: s.educationLevelName ? { name: s.educationLevelName } : null
	};
}
function toStudentBooking(b) {
	return {
		id: b.id,
		student_id: b.studentId,
		tutor_id: b.tutorId,
		subject_id: b.subjectId,
		starts_at: b.startsAt,
		ends_at: b.endsAt,
		duration_minutes: b.durationMinutes,
		status: b.status,
		total_amount: Number(b.totalAmount),
		currency: b.currency,
		tutor_accepted_at: b.tutorAcceptedAt,
		tutors: tutorRef(b.tutorId, b.tutorName, b.tutorAvatarUrl),
		subjects: b.subjectName ? { name: b.subjectName } : null,
		class_sessions: b.sessionId ? [{
			id: b.sessionId,
			meeting_url: b.sessionMeetingUrl,
			status: b.sessionStatus,
			tutor_notes: b.sessionTutorNotes,
			homework: b.sessionHomework
		}] : [],
		payments: b.paid ? [{ status: "paid" }] : []
	};
}
function toStudentAssignment(a) {
	return {
		id: a.id,
		tutor_id: a.tutorId,
		student_id: a.studentId,
		booking_id: a.bookingId,
		subject_id: a.subjectId,
		title: a.title,
		instructions: a.instructions,
		submission_requirements: a.submissionRequirements,
		due_at: a.dueAt,
		resource_id: null,
		status: a.status,
		assigned_at: null,
		submission_text: a.submissionText,
		submission_path: null,
		submitted_at: a.submittedAt,
		feedback: a.feedback,
		reviewed_at: a.reviewedAt,
		created_at: a.createdAt,
		updated_at: a.createdAt,
		tutors: tutorRef(a.tutorId, a.tutorName),
		subjects: a.subjectName ? { name: a.subjectName } : null
	};
}
function toStudentMaterial(r) {
	return {
		id: r.id,
		tutor_id: r.tutorId,
		title: r.title,
		description: r.description,
		resource_type: r.resourceType,
		external_url: r.externalUrl,
		storage_path: null,
		mime_type: null,
		size_bytes: null,
		subject_id: r.subjectId,
		student_id: r.studentId,
		is_shared: r.isShared,
		created_at: r.createdAt,
		updated_at: r.createdAt,
		tutors: tutorRef(r.tutorId, r.tutorName)
	};
}
function useStudentRecord() {
	const { user, profile, roles, loading } = useAuth();
	return useQuery({
		queryKey: ["student-record", user?.id],
		enabled: Boolean(user?.id) && !loading,
		queryFn: async () => {
			try {
				return toStudentRow(await apiGet("/students/me"));
			} catch (error) {
				if (error instanceof ApiError && error.status === 404) return null;
				throw error;
			}
		}
	});
}
function useStudentBookings(params) {
	const { data: student } = useStudentRecord();
	return useQuery({
		queryKey: [
			"student-bookings",
			student?.id,
			params?.from,
			params?.to,
			params?.statuses
		],
		enabled: Boolean(student?.id),
		queryFn: async () => {
			const search = new URLSearchParams({ limit: "100" });
			if (params?.from) search.set("from", params.from);
			if (params?.to) search.set("to", params.to);
			const page = await apiGet(`/bookings?${search.toString()}`);
			const statuses = params?.statuses?.length ? new Set(params.statuses) : null;
			return page.data.filter((b) => b.studentId === student.id).filter((b) => !statuses || statuses.has(b.status)).map(toStudentBooking);
		}
	});
}
function useStudentAssignments(status) {
	const { data: student } = useStudentRecord();
	return useQuery({
		queryKey: [
			"student-assignments",
			student?.id,
			status
		],
		enabled: Boolean(student?.id),
		queryFn: async () => {
			const search = new URLSearchParams({
				studentId: student.id,
				limit: "100"
			});
			if (status) search.set("status", status);
			return (await apiGet(`/assignments?${search.toString()}`)).data.map(toStudentAssignment).sort((a, b) => a.due_at === b.due_at ? 0 : a.due_at === null ? 1 : b.due_at === null ? -1 : a.due_at.localeCompare(b.due_at));
		}
	});
}
function useStudentMaterials() {
	const { data: student } = useStudentRecord();
	return useQuery({
		queryKey: ["student-materials", student?.id],
		enabled: Boolean(student?.id),
		queryFn: async () => {
			return (await apiGet("/learning-resources?limit=100")).data.filter((r) => r.studentId === student.id || r.isShared).map(toStudentMaterial);
		}
	});
}
function useSubmitAssignment() {
	const queryClient = useQueryClient();
	const { data: student } = useStudentRecord();
	return useMutation({
		mutationFn: async ({ id, text, path }) => {
			if (!student) throw new Error("Not a student");
			await apiPost(`/assignments/${id}/submit`, {
				...text ? { submissionText: text } : {},
				...path ? { submissionPath: path } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
		}
	});
}
function useStudentNotifications() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["student-notifications", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet("/notifications?limit=50")).data.map((n) => ({
				id: n.id,
				title: n.subject ?? "",
				body: n.body ?? "",
				created_at: n.createdAt,
				read_at: n.readAt
			}));
		}
	});
}
function useMarkAllStudentNotificationsRead() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			if (!user?.id) return;
			await apiPost("/notifications/read-all", {});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
		}
	});
}
function useSubmitReview() {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	return useMutation({
		mutationFn: async ({ bookingId, tutorId, score, comment }) => {
			if (!user) throw new Error("Not signed in");
			await apiPost(`/bookings/${bookingId}/rating`, {
				score,
				...comment ? { comment } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
		}
	});
}
/**
* Requests a lesson. Under the API the server prices it from booking_quote()
* and fills the money fields itself; the client sends only what the student
* chose.
*/
function useCreateStudentBooking() {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const { data: student } = useStudentRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!user || !student) throw new Error("You need to be signed in.");
			await apiPost("/bookings", {
				studentId: student.id,
				tutorId: input.tutorId,
				...input.subjectId ? { subjectId: input.subjectId } : {},
				...student.education_level_id ? { educationLevelId: student.education_level_id } : {},
				startsAt: input.startsAt,
				durationMinutes: input.quote.duration_minutes,
				timezone: input.timezone,
				...input.notes ? { studentNotes: input.notes } : {}
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
			await queryClient.invalidateQueries({ queryKey: ["tutor-slots"] });
		}
	});
}
function formatTimeInZone(iso, tz) {
	if (!iso) return "—";
	try {
		return new Intl.DateTimeFormat(void 0, {
			hour: "numeric",
			minute: "2-digit",
			timeZone: tz || void 0
		}).format(new Date(iso));
	} catch {
		return new Date(iso).toLocaleTimeString();
	}
}
/**
* Joins the lesson, which is also how the learner's attendance is recorded.
*
* The student screen used to read `meeting_url` off the bookings list, which
* meant no authorization of its own and no record that the learner turned up.
* The endpoint checks the same `can_access_booking()` the row-level security
* policies use, so a parent, the learner and nobody else may open it.
*
* Joining is idempotent — arriving twice is normal — so this is a query rather
* than something the screen has to fire exactly once.
*/
function useJoinClass(bookingId) {
	return useQuery({
		queryKey: ["class-join", bookingId],
		enabled: Boolean(bookingId),
		refetchInterval: 3e4,
		queryFn: async () => {
			return apiPost(`/bookings/${bookingId}/class/join`, {});
		}
	});
}
/**
* The learner's own progress, by subject.
*
* The endpoint takes a student id and is already used by the parent portal
* for each child; a learner with their own login reads their own row through
* the same route, and row-level security limits them to it.
*/
function useMyProgress() {
	const { data: student } = useStudentRecord();
	return useQuery({
		queryKey: ["student-progress", student?.id],
		enabled: Boolean(student?.id),
		queryFn: async () => {
			return apiGet(`/students/${student?.id}/progress`);
		}
	});
}
var NAV = [
	{
		to: "/student/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/student/my-tutors",
		label: "My Tutors",
		icon: UserRound
	},
	{
		to: "/student/find-tutor",
		label: "Find a Tutor",
		icon: Search
	},
	{
		to: "/student/history",
		label: "My Classes",
		icon: CalendarDays
	},
	{
		to: "/student/schedule",
		label: "Schedule",
		icon: CalendarClock
	},
	{
		to: "/student/materials",
		label: "Assignments & Materials",
		icon: BookOpen
	},
	{
		to: "/student/progress",
		label: "Progress",
		icon: ChartLine
	},
	{
		to: "/student/messages",
		label: "Messages",
		icon: MessagesSquare
	},
	{
		to: "/student/notifications",
		label: "Notifications",
		icon: Bell
	}
];
var MOBILE_PRIMARY = [
	"/student/dashboard",
	"/student/find-tutor",
	"/student/materials",
	"/student/messages"
];
function useActivePath() {
	return useRouterState({ select: (state) => state.location.pathname });
}
function isActive(pathname, to) {
	return pathname === to || pathname.startsWith(`${to}/`);
}
function NavList({ onNavigate }) {
	const pathname = useActivePath();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Student portal sections",
		className: "flex flex-col gap-1",
		children: NAV.map((item) => {
			const Icon = item.icon;
			const active = isActive(pathname, item.to);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				"aria-current": active ? "page" : void 0,
				className: cn("focus-ring flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-all duration-200", active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5 shrink-0",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: item.label
				})]
			}, item.to);
		})
	});
}
function StudentShell({ title, description, actions, children }) {
	const { profile } = useAuth();
	const { data: student } = useStudentRecord();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useActivePath();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
	const { data: notifications } = useStudentNotifications();
	const unread = (notifications ?? []).filter((item) => !item.read_at).length;
	const firstName = student?.first_name || (profile?.full_name ?? "").split(" ")[0];
	async function handleSignOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await authClient.signOut();
		toast.success("Signed out");
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background selection:bg-secondary/30",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-site flex min-h-16 items-center justify-between gap-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
								open: menuOpen,
								onOpenChange: setMenuOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
									asChild: true,
									className: "lg:hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										"aria-label": "Open navigation",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-5 text-primary" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
									side: "left",
									className: "w-[18rem] border-r-0 p-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
											className: "sr-only",
											children: "Student portal navigation"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "border-b border-border p-4 bg-primary/5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: BRAND.logoUrl,
												alt: BRAND.name,
												className: "h-10 w-auto"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { onNavigate: () => setMenuOpen(false) })
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/student/dashboard",
								className: "focus-ring flex items-center gap-2 rounded-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: BRAND.logoUrl,
									alt: BRAND.name,
									className: "h-10 w-auto md:h-11"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary-foreground md:inline-flex ml-2",
								children: "Student Portal"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 sm:gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "icon",
							className: "relative text-primary",
							"aria-label": unread > 0 ? `Notifications, ${unread} unread` : "Notifications",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/student/notifications",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									className: "size-5",
									"aria-hidden": "true"
								}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 size-2.5 rounded-full bg-accent ring-2 ring-card" }) : null]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								className: "min-h-11 gap-2 px-2 hover:bg-primary/5",
								"aria-label": "Account menu",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm",
									children: firstName ? firstName.charAt(0).toUpperCase() : "?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden max-w-32 truncate text-sm font-bold text-primary sm:inline",
									children: firstName || "Account"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							className: "w-56 rounded-xl p-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
									className: "space-y-0.5 px-2 py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-bold",
										children: student ? `${student.first_name} ${student.last_name || ""}` : profile?.full_name ?? "Account"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs font-medium text-muted-foreground",
										children: profile?.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onSelect: () => void handleSignOut(),
									className: "rounded-lg font-medium text-destructive focus:bg-destructive/10 focus:text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 mr-2" }), " Sign out"]
								})
							]
						})] })]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site flex gap-8 pb-28 pt-6 lg:pb-12 lg:pt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-64 shrink-0 lg:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sticky top-24 rounded-2xl bg-card p-4 shadow-sm border border-border/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-extrabold tracking-tight text-primary-deep md:text-4xl",
								children: title
							}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-base font-medium text-muted-foreground",
								children: description
							}) : null]
						}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex shrink-0 flex-wrap gap-2",
							children: actions
						}) : null]
					}), children]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Primary",
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden pb-safe",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-lg grid-cols-5",
					children: [NAV.filter((item) => MOBILE_PRIMARY.includes(item.to)).map((item) => {
						const Icon = item.icon;
						const active = isActive(pathname, item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							"aria-current": active ? "page" : void 0,
							className: cn("focus-ring flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-bold transition-all", active ? "text-primary" : "text-muted-foreground hover:text-primary/70"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("flex items-center justify-center rounded-full p-1.5 transition-colors", active && "bg-primary/10"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									"aria-hidden": "true"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: item.label
							})]
						}, item.to);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
						open: moreOpen,
						onOpenChange: setMoreOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "focus-ring flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-bold text-muted-foreground hover:text-primary/70",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-center rounded-full p-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
										className: "size-5",
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "More" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "bottom",
							className: "rounded-t-3xl p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "mb-4 text-lg font-extrabold text-primary-deep",
								children: "Menu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { onNavigate: () => setMoreOpen(false) })]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { useMarkAllStudentNotificationsRead as a, useStudentBookings as c, useStudentRecord as d, useSubmitAssignment as f, useJoinClass as i, useStudentMaterials as l, formatTimeInZone as n, useMyProgress as o, useSubmitReview as p, useCreateStudentBooking as r, useStudentAssignments as s, StudentShell as t, useStudentNotifications as u };
