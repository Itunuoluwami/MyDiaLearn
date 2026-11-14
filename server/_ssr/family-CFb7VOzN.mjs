import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { R as Plus, _ as Trash2, c as UserRound, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as apiPost, i as apiPatch, n as apiDelete, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useRedirectToPortalHome, t as PortalShell } from "./PortalShell-BYbUJZ2R.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/family-CFb7VOzN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	first_name: "",
	last_name: "",
	date_of_birth: "",
	curriculum_id: "",
	education_level_id: "",
	school_name: "",
	learning_goals: ""
};
function FamilyPage() {
	useRedirectToPortalHome();
	const { user, hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const canManage = hasPermission("students.manage");
	const students = useQuery({
		queryKey: ["students", user?.id],
		queryFn: async () => {
			return (await apiGet("/students?limit=100")).data.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((st) => ({
				id: st.id,
				first_name: st.firstName,
				last_name: st.lastName,
				date_of_birth: st.dateOfBirth,
				school_name: st.schoolName,
				learning_goals: st.learningGoals,
				can_self_login: st.canSelfLogin,
				can_book_lessons: st.canBookLessons,
				can_message_tutors: st.canMessageTutors,
				is_active: st.isActive,
				curriculum_id: st.curriculumId,
				education_level_id: st.educationLevelId,
				curricula: st.curriculumName ? { name: st.curriculumName } : null,
				education_levels: st.educationLevelName ? { name: st.educationLevelName } : null
			}));
		}
	});
	const curricula = useQuery({
		queryKey: ["curricula"],
		queryFn: async () => {
			return (await apiGet("/catalogue/curricula")).map(({ id, name }) => ({
				id,
				name
			}));
		}
	});
	const levels = useQuery({
		queryKey: ["education-levels", form.curriculum_id],
		enabled: Boolean(form.curriculum_id),
		queryFn: async () => {
			return (await apiGet("/catalogue/education-levels")).filter((row) => row.curriculum_id === form.curriculum_id).map(({ id, name }) => ({
				id,
				name
			}));
		}
	});
	const createStudent = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Not signed in");
			await apiPost("/students", {
				firstName: form.first_name,
				lastName: form.last_name || void 0,
				dateOfBirth: form.date_of_birth || void 0,
				curriculumId: form.curriculum_id || void 0,
				educationLevelId: form.education_level_id || void 0,
				schoolName: form.school_name || void 0,
				learningGoals: form.learning_goals || void 0
			});
		},
		onSuccess: async () => {
			setForm(EMPTY);
			setOpen(false);
			await queryClient.invalidateQueries({ queryKey: ["students"] });
			toast.success("Student profile added");
		},
		onError: (error) => toast.error(error.message)
	});
	const updatePermission = useMutation({
		mutationFn: async ({ id, patch }) => {
			await apiPatch(`/students/${id}`, {
				canSelfLogin: patch.can_self_login,
				canBookLessons: patch.can_book_lessons,
				canMessageTutors: patch.can_message_tutors
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["students"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const removeStudent = useMutation({
		mutationFn: async (id) => {
			await apiDelete(`/students/${id}`);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["students"] });
			toast.success("Student profile removed");
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PortalShell, {
		title: "Family & students",
		description: "Each child gets their own education profile. You keep control of payments and permissions.",
		children: [canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full sm:w-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add a student"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a student profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This child profile is linked to your account. You can add sign-in access later." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-4 sm:grid-cols-2",
					onSubmit: (event) => {
						event.preventDefault();
						createStudent.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "first-name",
								children: "First name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "first-name",
								required: true,
								value: form.first_name,
								onChange: (e) => setForm({
									...form,
									first_name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "last-name",
								children: "Last name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "last-name",
								value: form.last_name,
								onChange: (e) => setForm({
									...form,
									last_name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "dob",
								children: "Date of birth"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "dob",
								type: "date",
								value: form.date_of_birth,
								onChange: (e) => setForm({
									...form,
									date_of_birth: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "school",
								children: "School"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "school",
								value: form.school_name,
								onChange: (e) => setForm({
									...form,
									school_name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Curriculum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.curriculum_id,
								onValueChange: (value) => setForm({
									...form,
									curriculum_id: value,
									education_level_id: ""
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select curriculum" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (curricula.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: item.id,
									children: item.name
								}, item.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Education level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.education_level_id,
								onValueChange: (value) => setForm({
									...form,
									education_level_id: value
								}),
								disabled: !form.curriculum_id,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select level" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (levels.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: item.id,
									children: item.name
								}, item.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "goals",
								children: "Learning goals"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "goals",
								rows: 3,
								value: form.learning_goals,
								onChange: (e) => setForm({
									...form,
									learning_goals: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: createStudent.isPending,
								children: [createStudent.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save student"]
							})
						})
					]
				})]
			})]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 md:grid-cols-2",
			children: students.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading students…"
			}) : (students.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No student profiles yet. Add your first child profile to get started."
			}) : (students.data ?? []).map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "card-warm p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-deep",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-base font-semibold",
								children: [
									student.first_name,
									" ",
									student.last_name ?? ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									student.curricula?.name ?? "No curriculum",
									" ·",
									" ",
									student.education_levels?.name ?? "No level"
								]
							})] })]
						}), canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Remove student",
							onClick: () => removeStudent.mutate(student.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						}) : null]
					}),
					student.learning_goals ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: student.learning_goals
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3 border-t border-border pt-3",
						children: [
							["can_self_login", "Can sign in"],
							["can_book_lessons", "Can book lessons"],
							["can_message_tutors", "Can message tutors"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-11 items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${student.id}-${key}`,
								className: "text-sm font-normal",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								id: `${student.id}-${key}`,
								checked: student[key],
								disabled: !canManage,
								onCheckedChange: (checked) => updatePermission.mutate({
									id: student.id,
									patch: { [key]: checked }
								})
							})]
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: student.is_active ? "secondary" : "outline",
							children: student.is_active ? "Active" : "Inactive"
						})
					})
				]
			}, student.id))
		})]
	});
}
//#endregion
export { FamilyPage as component };
