import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Gt as ChevronRight, R as Plus, T as ShieldCheck, a as Users, c as UserRound, it as LoaderCircle, rt as Lock } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as apiPost, i as apiPatch } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { _ as useChildren, b as useLevelOptions, i as childName, r as childInitials, v as useCurriculaOptions } from "./parent-data-Dj0LJH5W.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/children.index-BG3BDODK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_FORM = {
	first_name: "",
	last_name: "",
	date_of_birth: "",
	curriculum_id: "",
	education_level_id: "",
	school_name: "",
	learning_goals: ""
};
function ChildrenPage() {
	const { user, hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const children = useChildren();
	const canManage = hasPermission("students.manage");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const curricula = useCurriculaOptions();
	const levels = useLevelOptions(form.curriculum_id || void 0);
	(0, import_react.useEffect)(() => {
		if (!dialogOpen) return;
		if (editing) setForm({
			first_name: editing.first_name ?? "",
			last_name: editing.last_name ?? "",
			date_of_birth: editing.date_of_birth ?? "",
			curriculum_id: editing.curriculum_id ?? "",
			education_level_id: editing.education_level_id ?? "",
			school_name: editing.school_name ?? "",
			learning_goals: editing.learning_goals ?? ""
		});
		else setForm(EMPTY_FORM);
	}, [dialogOpen, editing]);
	const saveChild = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Not signed in");
			const payload = {
				first_name: form.first_name.trim(),
				last_name: form.last_name.trim() || null,
				date_of_birth: form.date_of_birth || null,
				curriculum_id: form.curriculum_id || null,
				education_level_id: form.education_level_id || null,
				school_name: form.school_name.trim() || null,
				learning_goals: form.learning_goals.trim() || null
			};
			const apiBody = {
				firstName: payload.first_name,
				lastName: payload.last_name ?? void 0,
				dateOfBirth: payload.date_of_birth ?? void 0,
				curriculumId: payload.curriculum_id ?? void 0,
				educationLevelId: payload.education_level_id ?? void 0,
				schoolName: payload.school_name ?? void 0,
				learningGoals: payload.learning_goals ?? void 0
			};
			if (editing) await apiPatch(`/students/${editing.id}`, apiBody);
			else await apiPost("/students", apiBody);
		},
		onSuccess: async () => {
			setDialogOpen(false);
			setEditing(null);
			await queryClient.invalidateQueries({ queryKey: ["parent-children"] });
			await queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
			toast.success(editing ? "Child profile updated" : "Child profile added");
		},
		onError: () => toast.error("We couldn't save this profile. Please try again.")
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
			await queryClient.invalidateQueries({ queryKey: ["parent-children"] });
		},
		onError: () => toast.error("We couldn't update that permission. Please try again.")
	});
	const kids = children.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ParentShell, {
		title: "My children",
		description: "Each learner keeps their own education profile. You stay in control of payments and permissions.",
		actions: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "cta",
			className: "min-h-11",
			onClick: () => {
				setEditing(null);
				setDialogOpen(true);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add child"]
		}) : null,
		children: [
			children.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 2,
				height: "h-44"
			}) : children.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your children right now.",
				onRetry: () => void children.refetch()
			}) : kids.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: Users,
				title: "Add your first learner",
				body: "Create a profile to start finding tutors and managing their learning journey.",
				action: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11",
					onClick: () => setDialogOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add child"]
				}) : null
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 xl:grid-cols-2",
				children: kids.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card-elevated p-4 md:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-base font-semibold text-primary-deep",
									children: childInitials(child)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "truncate text-base font-semibold",
											children: childName(child)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-sm text-muted-foreground",
											children: [
												child.education_levels?.name ?? "Level not set",
												" ·",
												" ",
												child.curricula?.name ?? "Curriculum not set"
											]
										}),
										child.school_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs text-muted-foreground",
											children: child.school_name
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: child.is_active ? "secondary" : "outline",
									className: "shrink-0",
									children: child.is_active ? "Active" : "Inactive"
								})
							]
						}),
						child.learning_goals ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 line-clamp-2 text-sm text-muted-foreground",
							children: child.learning_goals
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-2.5 border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									className: "size-3.5",
									"aria-hidden": "true"
								}), " Permissions you control"]
							}), [
								["can_self_login", "Can sign in to their own account"],
								["can_book_lessons", "Can request lessons"],
								["can_message_tutors", "Can message tutors"]
							].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-h-11 items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: `${child.id}-${key}`,
									className: "text-sm font-normal",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									id: `${child.id}-${key}`,
									checked: Boolean(child[key]),
									disabled: !canManage,
									onCheckedChange: (checked) => updatePermission.mutate({
										id: child.id,
										patch: { [key]: checked }
									})
								})]
							}, key))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "min-h-11 sm:min-h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/children/$studentId",
									params: { studentId: child.id },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }),
										" View profile",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
									]
								})
							}), canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "min-h-11 sm:min-h-9",
								onClick: () => {
									setEditing(child);
									setDialogOpen(true);
								},
								children: "Edit details"
							}) : null]
						})
					]
				}, child.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				className: "mt-6",
				title: "Why we ask for a child's details",
				description: "DiaLearn serves minors, so we collect only what tutors need to teach well.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "grid gap-2 text-sm text-muted-foreground sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "mt-0.5 size-4 shrink-0 text-primary",
								"aria-hidden": "true"
							}), "Date of birth is used to match age-appropriate tutors and permissions."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "mt-0.5 size-4 shrink-0 text-primary",
								"aria-hidden": "true"
							}), "Curriculum and level help tutors prepare the right material."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "mt-0.5 size-4 shrink-0 text-primary",
								"aria-hidden": "true"
							}), "Tutors only see what is needed for a booked lesson."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "mt-0.5 size-4 shrink-0 text-primary",
								"aria-hidden": "true"
							}), "You can withdraw a child's sign-in or messaging access at any time."]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: dialogOpen,
				onOpenChange: (open) => {
					setDialogOpen(open);
					if (!open) setEditing(null);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hidden" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit child profile" : "Add a child profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This learner profile is linked to your account. You can grant sign-in access later." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-4 sm:grid-cols-2",
						onSubmit: (event) => {
							event.preventDefault();
							saveChild.mutate();
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
									onChange: (event) => setForm({
										...form,
										first_name: event.target.value
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
									onChange: (event) => setForm({
										...form,
										last_name: event.target.value
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
									onChange: (event) => setForm({
										...form,
										date_of_birth: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "school",
									children: "School (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "school",
									value: form.school_name,
									onChange: (event) => setForm({
										...form,
										school_name: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "curriculum",
									children: "Curriculum"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.curriculum_id,
									onValueChange: (value) => setForm({
										...form,
										curriculum_id: value,
										education_level_id: ""
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "curriculum",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select curriculum" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (curricula.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: item.id,
										children: item.name
									}, item.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "level",
									children: "Education level / grade"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.education_level_id,
									onValueChange: (value) => setForm({
										...form,
										education_level_id: value
									}),
									disabled: !form.curriculum_id,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "level",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select level" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (levels.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: item.id,
										children: item.name
									}, item.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "goals",
									children: "Learning goals & preferences"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "goals",
									rows: 3,
									placeholder: "What would you like this child to achieve?",
									value: form.learning_goals,
									onChange: (event) => setForm({
										...form,
										learning_goals: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									variant: "cta",
									className: "min-h-11",
									disabled: saveChild.isPending,
									children: [saveChild.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, editing ? "Save changes" : "Save child"]
								})
							})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
export { ChildrenPage as component };
