import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { $ as MapPin, Ct as FileText, Lt as Clock3, S as Sparkles, T as ShieldCheck, _ as Trash2, _t as GraduationCap, dn as ArrowRight, fn as ArrowLeft, jt as DollarSign, o as User, p as Upload, qt as Check } from "../_libs/lucide-react.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as apiPatch } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { C as useVerificationSteps, a as useAddTutorSubject, b as useUpdateTutor, c as useDeleteTutorDocument, f as useSubmitVerification, h as useTutorRecord, i as useAddAvailabilityWindow, l as useMyTutorSubjects, m as useTutorDocuments, o as useAvailabilityWindows, r as WEEKDAYS, t as VERIFICATION_LABEL, x as useUploadTutorDocument } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { b as useLevelOptions, w as useSubjectOptions } from "./parent-data-Dj0LJH5W.mjs";
import { n as CardSkeletonList, o as LoadError } from "./ui-bAhnOVkK.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.onboarding-Ulg7oZdz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		id: 1,
		title: "Profile",
		icon: User
	},
	{
		id: 2,
		title: "Subjects",
		icon: GraduationCap
	},
	{
		id: 3,
		title: "Experience",
		icon: Sparkles
	},
	{
		id: 4,
		title: "Location",
		icon: MapPin
	},
	{
		id: 5,
		title: "Rate",
		icon: DollarSign
	},
	{
		id: 6,
		title: "Availability",
		icon: Clock3
	},
	{
		id: 7,
		title: "Verification",
		icon: ShieldCheck
	}
];
function TutorOnboardingPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	useQueryClient();
	const tutor = useTutorRecord();
	const update = useUpdateTutor();
	const subjects = useSubjectOptions();
	const levels = useLevelOptions();
	const mySubjects = useMyTutorSubjects();
	const addSubject = useAddTutorSubject();
	const windows = useAvailabilityWindows();
	const addWindow = useAddAvailabilityWindow();
	const steps = useVerificationSteps();
	const documents = useTutorDocuments();
	const uploadDoc = useUploadTutorDocument();
	const removeDoc = useDeleteTutorDocument();
	const submitVerification = useSubmitVerification();
	const [step, setStep] = (0, import_react.useState)(1);
	const [form, setForm] = (0, import_react.useState)({
		headline: "",
		biography: "",
		methodology: "",
		teaching_context: "",
		years: "",
		timezone: "UTC",
		country: ""
	});
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [levelId, setLevelId] = (0, import_react.useState)("");
	const [slot, setSlot] = (0, import_react.useState)({
		day: "1",
		start: "16:00",
		end: "19:00"
	});
	const record = tutor.data;
	const [docStepId, setDocStepId] = (0, import_react.useState)("");
	const [docLabel, setDocLabel] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!record) return;
		setForm({
			headline: record.headline ?? "",
			biography: record.biography ?? "",
			methodology: record.methodology ?? "",
			teaching_context: record.teaching_context ?? "",
			years: record.years_experience === null ? "" : String(record.years_experience),
			timezone: record.timezone ?? "UTC",
			country: ""
		});
		setStep(Math.min(Math.max(record.onboarding_step, 1), 7));
	}, [record?.id]);
	const timezones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];
	async function persistStep(next) {
		try {
			await update.mutateAsync({ onboarding_step: next });
		} catch {}
	}
	async function handleProfileNext() {
		if (form.headline.trim().length < 8) {
			toast.error("Headline is too short.");
			return;
		}
		if (form.biography.trim().length < 40) {
			toast.error("Biography is too short.");
			return;
		}
		try {
			await update.mutateAsync({
				headline: form.headline.trim(),
				biography: form.biography.trim(),
				onboarding_step: 2
			});
			setStep(2);
		} catch {
			toast.error("Couldn't save step 1.");
		}
	}
	async function handleAddSubject() {
		if (!subjectId) {
			toast.error("Choose a subject.");
			return;
		}
		try {
			await addSubject.mutateAsync({
				subjectId,
				educationLevelId: levelId || null
			});
			setSubjectId("");
			setLevelId("");
		} catch {
			toast.error("Subject already added.");
		}
	}
	async function handleExperienceNext() {
		const years = form.years === "" ? null : Number(form.years);
		try {
			await update.mutateAsync({
				years_experience: years,
				methodology: form.methodology.trim(),
				teaching_context: form.teaching_context.trim(),
				onboarding_step: 4
			});
			setStep(4);
		} catch {
			toast.error("Couldn't save step 3.");
		}
	}
	async function handleLocationNext() {
		try {
			await update.mutateAsync({
				timezone: form.timezone,
				onboarding_step: 5
			});
			if (user) await apiPatch("/users/me", {
				timezone: form.timezone,
				...form.country ? { countryCode: form.country } : {}
			});
			setStep(5);
		} catch {
			toast.error("Couldn't save step 4.");
		}
	}
	async function handleRateNext() {
		try {
			await update.mutateAsync({ onboarding_step: 6 });
			setStep(6);
		} catch {
			toast.error("Couldn't save step 5.");
		}
	}
	async function handleAddWindow() {
		try {
			await addWindow.mutateAsync({
				dayOfWeek: Number(slot.day),
				startTime: slot.start,
				endTime: slot.end
			});
		} catch {
			toast.error("Couldn't save that window.");
		}
	}
	async function handleDocUpload() {
		const file = fileRef.current?.files?.[0];
		if (!file) {
			toast.error("Choose a file to upload.");
			return;
		}
		if (file.size > 10485760) {
			toast.error("File must be 10MB or smaller.");
			return;
		}
		if (docLabel.trim().length < 3) {
			toast.error("Provide a document name.");
			return;
		}
		try {
			await uploadDoc.mutateAsync({
				file,
				label: docLabel.trim(),
				stepId: docStepId || null
			});
			setDocLabel("");
			setDocStepId("");
			if (fileRef.current) fileRef.current.value = "";
			toast.success("Document uploaded");
		} catch {
			toast.error("Couldn't upload document.");
		}
	}
	async function handleSubmitVerification() {
		try {
			await submitVerification.mutateAsync();
			toast.success("Submitted for review!");
			navigate({ to: "/tutor/dashboard" });
		} catch {
			toast.error("Couldn't submit verification.");
		}
	}
	if (tutor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Get set up",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 2,
			height: "h-40"
		})
	});
	if (tutor.isError || !record) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Get set up",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "Error loading.",
			onRetry: () => tutor.refetch()
		})
	});
	const subjectCount = (mySubjects.data ?? []).length;
	const windowCount = (windows.data ?? []).length;
	const stepList = steps.data ?? [];
	const docs = documents.data ?? [];
	const requiredSteps = stepList.filter((s) => s.is_required);
	const canSubmit = requiredSteps.filter((s) => docs.some((d) => d.step_id === s.id)).length === requiredSteps.length && requiredSteps.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Get set up to teach",
		description: "Complete these 7 steps to get verified and listed.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-elevated p-4 md:p-5 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: step / 7 * 100,
						className: "h-2"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex gap-2 text-sm overflow-x-auto pb-2 custom-scrollbar",
						children: STEPS.map((item) => {
							const Icon = item.icon;
							const done = step > item.id;
							const active = step === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: cn("flex items-center gap-2 rounded-xl px-3 py-2 whitespace-nowrap", active ? "bg-primary-soft text-primary-deep font-semibold" : "text-muted-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[10px]", done ? "bg-success/15 text-success" : active ? "bg-primary text-primary-foreground" : "bg-muted"),
									children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.title })]
							}, item.id);
						})
					})]
				}),
				step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Introduce yourself"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
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
										htmlFor: "ob-headline",
										children: "Headline"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ob-headline",
										value: form.headline,
										onChange: (e) => setForm((p) => ({
											...p,
											headline: e.target.value
										})),
										placeholder: "Physics teacher for IGCSE and A-Level"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ob-bio",
										children: "Biography"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "ob-bio",
										rows: 4,
										value: form.biography,
										onChange: (e) => setForm((p) => ({
											...p,
											biography: e.target.value
										})),
										placeholder: "Your background and teaching style"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								onClick: handleProfileNext,
								children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})
						})
					]
				}),
				step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Choose your subjects"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: subjectId,
										onValueChange: setSubjectId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "min-h-11",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: subjects.data?.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: s.id,
											children: s.name
										}, s.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Level (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: levelId,
										onValueChange: setLevelId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "min-h-11",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: levels.data?.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: l.id,
											children: l.name
										}, l.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "min-h-11",
									onClick: handleAddSubject,
									children: "Add"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex flex-wrap gap-2",
							children: mySubjects.data?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-deep",
								children: [
									row.subjects?.name,
									" ",
									row.education_levels?.name ? `· ${row.education_levels.name}` : ""
								]
							}, row.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => {
									setStep(1);
									persistStep(1);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								disabled: subjectCount === 0,
								onClick: () => {
									setStep(3);
									persistStep(3);
								},
								children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})]
						})
					]
				}),
				step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Teaching Experience"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Years of experience" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "min-h-11",
										type: "number",
										value: form.years,
										onChange: (e) => setForm((p) => ({
											...p,
											years: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Where you have taught" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "min-h-11",
										rows: 2,
										value: form.teaching_context,
										onChange: (e) => setForm((p) => ({
											...p,
											teaching_context: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Teaching methodology" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "min-h-11",
										rows: 3,
										value: form.methodology,
										onChange: (e) => setForm((p) => ({
											...p,
											methodology: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => {
									setStep(2);
									persistStep(2);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								onClick: handleExperienceNext,
								children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})]
						})
					]
				}),
				step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Location & Timezone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country Code (e.g. GB, NG, US)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "min-h-11",
									value: form.country,
									onChange: (e) => setForm((p) => ({
										...p,
										country: e.target.value.toUpperCase()
									})),
									maxLength: 2
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Timezone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.timezone,
									onValueChange: (v) => setForm((p) => ({
										...p,
										timezone: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "max-h-72",
										children: timezones.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: z,
											children: z
										}, z))
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => {
									setStep(3);
									persistStep(3);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								onClick: handleLocationNext,
								children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})]
						})
					]
				}),
				step === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Your hourly rate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 rounded-xl border border-dashed border-border bg-surface/50 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: record.hourly_rate === null ? "Not yet set" : `${record.hourly_rate} ${record.currency}/hour`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "DiaLearn sets every tutor's hourly rate — you don't set your own. It's assigned as part of verification review, before you're listed and bookable. Lesson prices are calculated from that rate and the lesson length."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => {
									setStep(4);
									persistStep(4);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								onClick: handleRateNext,
								children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})]
						})
					]
				}),
				step === 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Add your teaching hours"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"In your timezone (",
								record.timezone,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Day" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: slot.day,
										onValueChange: (v) => setSlot((p) => ({
											...p,
											day: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "min-h-11",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: WEEKDAYS.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: String(i),
											children: l
										}, l)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "From" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "min-h-11",
										type: "time",
										value: slot.start,
										onChange: (e) => setSlot((p) => ({
											...p,
											start: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "To" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "min-h-11",
										type: "time",
										value: slot.end,
										onChange: (e) => setSlot((p) => ({
											...p,
											end: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "min-h-11",
									onClick: handleAddWindow,
									children: "Add"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex flex-wrap gap-2",
							children: windows.data?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-full bg-surface px-3 py-1.5 text-xs font-medium",
								children: [
									WEEKDAYS[row.day_of_week],
									" ",
									row.start_time.slice(0, 5),
									"-",
									row.end_time.slice(0, 5)
								]
							}, row.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => {
									setStep(5);
									persistStep(5);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								disabled: windowCount === 0,
								onClick: () => {
									setStep(7);
									persistStep(7);
								},
								children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})]
						})
					]
				}),
				step === 7 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-xl",
							children: "Verify your identity & qualifications"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "DiaLearn requires all tutors to be verified before they can be booked."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2 mt-4 bg-surface/50 p-4 rounded-xl border border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Requirement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: docStepId,
										onValueChange: setDocStepId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "min-h-11",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose type" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: stepList.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: s.id,
											children: [
												s.name,
												" ",
												s.is_required ? "*" : ""
											]
										}, s.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Document Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "min-h-11",
										value: docLabel,
										onChange: (e) => setDocLabel(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "File (PDF/Image, max 10MB)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "min-h-11",
										type: "file",
										ref: fileRef
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "sm:col-span-2 min-h-11 mt-2",
									onClick: handleDocUpload,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-2" }), " Upload Document"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 mt-4",
							children: docs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between items-center bg-card p-3 rounded-xl border border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: doc.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: VERIFICATION_LABEL[doc.status]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "min-h-11 sm:min-h-9",
									variant: "ghost",
									size: "icon",
									onClick: () => removeDoc.mutateAsync({
										id: doc.id,
										storage_path: doc.storage_path
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							}, doc.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => {
									setStep(6);
									persistStep(6);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								disabled: !canSubmit || submitVerification.isPending,
								onClick: handleSubmitVerification,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 mr-2" }), " Submit for Approval"]
							})]
						})
					]
				})
			]
		})
	});
}
//#endregion
export { TutorOnboardingPage as component };
