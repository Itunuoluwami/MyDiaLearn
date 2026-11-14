import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { M as Save, R as Plus, _ as Trash2, in as BookOpen, o as User, wt as Eye } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { a as useAddTutorSubject, b as useUpdateTutor, h as useTutorRecord, l as useMyTutorSubjects, u as useRemoveTutorSubject } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { b as useLevelOptions, s as formatMoney, w as useSubjectOptions } from "./parent-data-Dj0LJH5W.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError } from "./ui-bAhnOVkK.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.profile-85DajUuj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TutorProfilePage() {
	const tutor = useTutorRecord();
	const update = useUpdateTutor();
	const subjects = useSubjectOptions();
	const levels = useLevelOptions();
	const mySubjects = useMyTutorSubjects();
	const addSubject = useAddTutorSubject();
	const removeSubject = useRemoveTutorSubject();
	const [form, setForm] = (0, import_react.useState)({
		headline: "",
		biography: "",
		methodology: "",
		teaching_context: "",
		years_experience: "",
		intro_video_url: ""
	});
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [levelId, setLevelId] = (0, import_react.useState)("");
	const record = tutor.data;
	(0, import_react.useEffect)(() => {
		if (!record) return;
		setForm({
			headline: record.headline ?? "",
			biography: record.biography ?? "",
			methodology: record.methodology ?? "",
			teaching_context: record.teaching_context ?? "",
			years_experience: record.years_experience === null ? "" : String(record.years_experience),
			intro_video_url: record.intro_video_url ?? ""
		});
	}, [record?.id, record?.updated_at]);
	async function handleSave() {
		if (form.headline.trim().length > 0 && form.headline.trim().length < 8) {
			toast.error("Give your headline a little more detail.");
			return;
		}
		if (form.biography.trim().length > 0 && form.biography.trim().length < 40) {
			toast.error("Biographies need at least 40 characters so families can trust them.");
			return;
		}
		const years = form.years_experience === "" ? null : Number(form.years_experience);
		if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
			toast.error("Enter your years of experience as a whole number.");
			return;
		}
		try {
			await update.mutateAsync({
				headline: form.headline.trim() || null,
				biography: form.biography.trim() || null,
				methodology: form.methodology.trim() || null,
				teaching_context: form.teaching_context.trim() || null,
				years_experience: years,
				intro_video_url: form.intro_video_url.trim() || null
			});
			toast.success("Profile saved");
		} catch {
			toast.error("We couldn't save your profile.");
		}
	}
	async function handleAddSubject() {
		if (!subjectId) {
			toast.error("Pick a subject first.");
			return;
		}
		try {
			await addSubject.mutateAsync({
				subjectId,
				educationLevelId: levelId || null
			});
			setSubjectId("");
			setLevelId("");
			toast.success("Subject added");
		} catch {
			toast.error("That subject and level combination is already on your profile.");
		}
	}
	async function handleListing(next) {
		try {
			await update.mutateAsync({ is_listed: next });
			toast.success(next ? "Your profile is now listed" : "Your profile is hidden from search");
		} catch {
			toast.error("We couldn't change your listing.");
		}
	}
	if (tutor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Teaching profile",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 3,
			height: "h-40"
		})
	});
	if (tutor.isError || !record) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Teaching profile",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "We couldn't load your teaching profile right now.",
			onRetry: () => void tutor.refetch()
		})
	});
	const verified = record.verification_status === "verified";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Teaching profile",
		description: "This is what families read before they book you.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "cta",
			className: "min-h-11 sm:min-h-10",
			disabled: update.isPending,
			onClick: () => void handleSave(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), " Save changes"]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Visibility",
					description: "Only the DiaLearn team can verify a tutor. Listing is yours to control once verified.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface/70 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), " Listed in tutor search"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: verified ? "Turn this off any time you need a break from new bookings." : "Available once your verification is approved."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: record.is_listed,
							disabled: !verified || update.isPending,
							"aria-label": "Listed in tutor search",
							onCheckedChange: (checked) => void handleListing(checked)
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "About your teaching",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Profile Photo" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-16 rounded-full bg-muted flex items-center justify-center border border-dashed border-border text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-6" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											children: "Upload photo"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Clear, well-lit photo of your face."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "headline",
									children: "Headline"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "headline",
									className: "min-h-11",
									maxLength: 120,
									placeholder: "Cambridge-trained maths teacher for GCSE and WAEC",
									value: form.headline,
									onChange: (event) => setForm((prev) => ({
										...prev,
										headline: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "biography",
										children: "Biography"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "biography",
										rows: 6,
										maxLength: 2e3,
										placeholder: "Share your background, the learners you work best with, and the results you help them reach.",
										value: form.biography,
										onChange: (event) => setForm((prev) => ({
											...prev,
											biography: event.target.value
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [form.biography.length, "/2000"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "methodology",
									children: "Teaching methodology"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "methodology",
									rows: 4,
									maxLength: 1200,
									placeholder: "How you run a lesson: diagnostics, pacing, homework, feedback to parents.",
									value: form.methodology,
									onChange: (event) => setForm((prev) => ({
										...prev,
										methodology: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "context",
									children: "Where you have taught"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "context",
									rows: 3,
									maxLength: 800,
									placeholder: "Schools, tutoring centres, exam boards or online platforms you have taught with.",
									value: form.teaching_context,
									onChange: (event) => setForm((prev) => ({
										...prev,
										teaching_context: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "years",
										children: "Years of experience"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "years",
										className: "min-h-11",
										inputMode: "numeric",
										value: form.years_experience,
										onChange: (event) => setForm((prev) => ({
											...prev,
											years_experience: event.target.value
										}))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "rate",
											children: "Hourly rate"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "rate",
											className: "min-h-11 bg-muted",
											readOnly: true,
											disabled: true,
											value: record.hourly_rate === null ? "Not yet set" : formatMoney(record.hourly_rate, record.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: record.hourly_rate === null ? "DiaLearn sets your hourly rate as part of verification — you'll be listed once it's set." : "Set by DiaLearn. Lesson prices are calculated from this rate and the lesson length."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "video",
									children: "Intro video URL"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "video",
									className: "min-h-11",
									type: "url",
									maxLength: 500,
									placeholder: "https://",
									value: form.intro_video_url,
									onChange: (event) => setForm((prev) => ({
										...prev,
										intro_video_url: event.target.value
									}))
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
					title: "Subjects and levels you teach",
					description: "Subjects, curricula and levels are managed by DiaLearn — pick from the approved list.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "subject",
									children: "Subject"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: subjectId,
									onValueChange: setSubjectId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "subject",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a subject" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (subjects.data ?? []).map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: subject.id,
										children: subject.name
									}, subject.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "level",
									children: "Level (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: levelId,
									onValueChange: setLevelId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "level",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any level" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (levels.data ?? []).map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: level.id,
										children: level.name
									}, level.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "min-h-11",
								disabled: addSubject.isPending,
								onClick: () => void handleAddSubject(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: (mySubjects.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), " No subjects added yet."]
						}) : (mySubjects.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "gap-1.5 py-1.5 pl-3 pr-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [row.subjects?.name ?? "Subject", row.education_levels?.name ? ` · ${row.education_levels.name}` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Remove subject",
								className: "focus-ring rounded-full p-1 hover:bg-background/60",
								onClick: () => void removeSubject.mutateAsync(row.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
							})]
						}, row.id))
					})]
				})
			]
		})
	});
}
//#endregion
export { TutorProfilePage as component };
