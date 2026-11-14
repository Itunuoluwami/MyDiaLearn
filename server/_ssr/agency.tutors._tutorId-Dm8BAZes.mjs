import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Lt as Clock3, O as Send, R as Plus, T as ShieldCheck, _ as Trash2, fn as ArrowLeft, in as BookOpen, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { n as VERIFICATION_TONE, r as WEEKDAYS, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { b as useLevelOptions, s as formatMoney, w as useSubjectOptions } from "./parent-data-Dj0LJH5W.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
import { C as useSubmitManagedTutorVerification, E as useUploadManagedTutorDocument, T as useUpdateManagedTutorProfile, _ as useManagedTutorVerification, d as useDeleteManagedTutorDocument, f as useDeleteManagedTutorWindow, g as useManagedTutorSubjects, h as useManagedTutorProfile, i as useAddManagedTutorWindow, m as useManagedTutorDocuments, p as useManagedTutorAvailability, r as useAddManagedTutorSubject, t as AgencyShell, u as useAgencyTutors, x as useSetManagedTutorWindow, y as useRemoveManagedTutorSubject } from "./AgencyShell-DfnQMswl.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as Route } from "./agency.tutors._tutorId-BIg1fFLd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.tutors._tutorId-Dm8BAZes.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var list = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
function ProfileTab({ tutorId }) {
	const profile = useManagedTutorProfile(tutorId);
	const update = useUpdateManagedTutorProfile(tutorId);
	const [form, setForm] = (0, import_react.useState)({
		headline: "",
		biography: "",
		yearsExperience: "",
		methodology: "",
		teachingContext: "",
		introVideoUrl: "",
		languages: "",
		qualifications: "",
		education: "",
		timezone: ""
	});
	(0, import_react.useEffect)(() => {
		const p = profile.data;
		if (!p) return;
		setForm({
			headline: p.headline ?? "",
			biography: p.biography ?? "",
			yearsExperience: p.yearsExperience === null ? "" : String(p.yearsExperience),
			methodology: p.methodology ?? "",
			teachingContext: p.teachingContext ?? "",
			introVideoUrl: p.introVideoUrl ?? "",
			languages: (p.languages ?? []).join(", "),
			qualifications: (p.qualifications ?? []).join(", "),
			education: (p.education ?? []).join(", "),
			timezone: p.timezone ?? ""
		});
	}, [profile.data]);
	const set = (key, value) => setForm((prev) => ({
		...prev,
		[key]: value
	}));
	async function handleSave(event) {
		event.preventDefault();
		const years = form.yearsExperience === "" ? null : Number(form.yearsExperience);
		if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
			toast.error("Years of experience must be a whole number between 0 and 70.");
			return;
		}
		try {
			await update.mutateAsync({
				headline: form.headline.trim() || null,
				biography: form.biography.trim() || null,
				yearsExperience: years,
				methodology: form.methodology.trim() || null,
				teachingContext: form.teachingContext.trim() || null,
				introVideoUrl: form.introVideoUrl.trim() || null,
				languages: list(form.languages),
				qualifications: list(form.qualifications),
				education: list(form.education),
				...form.timezone.trim() ? { timezone: form.timezone.trim() } : {}
			});
			toast.success("Profile saved");
		} catch (error) {
			toast.error(error.message || "We couldn't save that profile.");
		}
	}
	if (profile.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
		rows: 2,
		height: "h-40"
	});
	if (profile.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
		message: "We couldn't load this tutor's profile.",
		onRetry: () => void profile.refetch()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
		title: "Teaching profile",
		description: "What families read on the tutor's public profile.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-4",
			onSubmit: (event) => void handleSave(event),
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "headline",
						children: "Headline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "headline",
						className: "min-h-11",
						maxLength: 160,
						value: form.headline,
						onChange: (event) => set("headline", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "biography",
						children: "About the tutor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "biography",
						rows: 5,
						value: form.biography,
						onChange: (event) => set("biography", event.target.value)
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
							inputMode: "numeric",
							className: "min-h-11",
							value: form.yearsExperience,
							onChange: (event) => set("yearsExperience", event.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "timezone",
							children: "Timezone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "timezone",
							placeholder: "e.g. Africa/Lagos",
							className: "min-h-11",
							value: form.timezone,
							onChange: (event) => set("timezone", event.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "languages",
						children: "Languages (comma separated)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "languages",
						className: "min-h-11",
						value: form.languages,
						onChange: (event) => set("languages", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "qualifications",
						children: "Qualifications (comma separated)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "qualifications",
						className: "min-h-11",
						value: form.qualifications,
						onChange: (event) => set("qualifications", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "education",
						children: "Education (comma separated)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "education",
						className: "min-h-11",
						value: form.education,
						onChange: (event) => set("education", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "methodology",
						children: "Teaching approach"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "methodology",
						rows: 3,
						value: form.methodology,
						onChange: (event) => set("methodology", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "context",
						children: "Who they teach best"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "context",
						rows: 3,
						value: form.teachingContext,
						onChange: (event) => set("teachingContext", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "video",
						children: "Intro video link"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "video",
						type: "url",
						placeholder: "https://",
						className: "min-h-11",
						value: form.introVideoUrl,
						onChange: (event) => set("introVideoUrl", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Hourly rate:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: profile.data?.hourlyRate ? formatMoney(profile.data.hourlyRate, profile.data.currency) : "not set"
						}),
						" ",
						"— set by DiaLearn during verification."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					variant: "cta",
					className: "min-h-11",
					disabled: update.isPending,
					children: [update.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save profile"]
				})
			]
		})
	});
}
function SubjectsTab({ tutorId }) {
	const subjects = useManagedTutorSubjects(tutorId);
	const add = useAddManagedTutorSubject(tutorId);
	const remove = useRemoveManagedTutorSubject(tutorId);
	const options = useSubjectOptions();
	const levels = useLevelOptions();
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [levelId, setLevelId] = (0, import_react.useState)("any");
	async function handleAdd() {
		if (!subjectId) {
			toast.error("Choose a subject.");
			return;
		}
		try {
			await add.mutateAsync({
				subjectId,
				educationLevelId: levelId === "any" ? null : levelId
			});
			toast.success("Subject added");
			setSubjectId("");
			setLevelId("any");
		} catch (error) {
			toast.error(error.message || "We couldn't add that subject.");
		}
	}
	const rows = subjects.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Add a subject",
			description: "Subjects and levels come from DiaLearn's catalogue.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
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
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (options.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: item.id,
								children: item.name
							}, item.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "level",
							children: "Level"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: levelId,
							onValueChange: setLevelId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "level",
								className: "min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "any",
								children: "Any level"
							}), (levels.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: item.id,
								children: item.name
							}, item.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "cta",
						className: "min-h-11",
						disabled: add.isPending,
						onClick: () => void handleAdd(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add"]
					})
				]
			})
		}), subjects.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 2,
			height: "h-14"
		}) : subjects.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "We couldn't load subjects.",
			onRetry: () => void subjects.refetch()
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
			icon: BookOpen,
			title: "No subjects yet",
			body: "Add at least one subject so families can find this tutor."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Subjects taught",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: row.subjectName
						}), row.levelName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [" · ", row.levelName]
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-11 sm:size-9",
						"aria-label": `Remove ${row.subjectName ?? "subject"}`,
						onClick: () => void remove.mutateAsync(row.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, row.id))
			})
		})]
	});
}
var toMinutes = (value) => {
	const [h, m] = value.split(":").map(Number);
	return (h ?? 0) * 60 + (m ?? 0);
};
function AvailabilityTab({ tutorId }) {
	const windows = useManagedTutorAvailability(tutorId);
	const add = useAddManagedTutorWindow(tutorId);
	const toggle = useSetManagedTutorWindow(tutorId);
	const remove = useDeleteManagedTutorWindow(tutorId);
	const [day, setDay] = (0, import_react.useState)("1");
	const [start, setStart] = (0, import_react.useState)("16:00");
	const [end, setEnd] = (0, import_react.useState)("19:00");
	const rows = windows.data ?? [];
	const byDay = (0, import_react.useMemo)(() => WEEKDAYS.map((label, index) => ({
		label,
		items: rows.filter((row) => row.dayOfWeek === index)
	})), [rows]);
	async function handleAdd() {
		if (toMinutes(end) <= toMinutes(start)) {
			toast.error("The end time must be after the start time.");
			return;
		}
		if (rows.some((row) => row.dayOfWeek === Number(day) && toMinutes(row.startTime) < toMinutes(end) && toMinutes(row.endTime) > toMinutes(start))) {
			toast.error("That window overlaps one already set on this day.");
			return;
		}
		try {
			await add.mutateAsync({
				dayOfWeek: Number(day),
				startTime: start,
				endTime: end
			});
			toast.success("Availability added");
		} catch (error) {
			toast.error(error.message || "We couldn't save that window.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Add a weekly window",
			description: `Repeats every week, in the tutor's timezone${rows[0] ? ` · ${rows[0].timezone}` : ""}.`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "day",
							children: "Day"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: day,
							onValueChange: setDay,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "day",
								className: "min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: WEEKDAYS.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: String(index),
								children: label
							}, label)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "start",
							children: "From"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "start",
							type: "time",
							className: "min-h-11",
							value: start,
							onChange: (event) => setStart(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "end",
							children: "To"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "end",
							type: "time",
							className: "min-h-11",
							value: end,
							onChange: (event) => setEnd(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "cta",
						className: "min-h-11",
						disabled: add.isPending,
						onClick: () => void handleAdd(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add"]
					})
				]
			})
		}), windows.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 3,
			height: "h-20"
		}) : windows.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "We couldn't load availability.",
			onRetry: () => void windows.refetch()
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
			icon: Clock3,
			title: "No availability yet",
			body: "Add the hours this tutor can teach each week. Bookings can only land inside an active window."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Weekly schedule",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: byDay.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: group.label
					}), group.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Not teaching"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: group.items.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2 rounded-lg bg-surface/70 px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm tabular-nums",
								children: [
									row.startTime.slice(0, 5),
									" – ",
									row.endTime.slice(0, 5)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: row.isActive,
									"aria-label": row.isActive ? "Pause this window" : "Activate this window",
									onCheckedChange: (checked) => void toggle.mutateAsync({
										id: row.id,
										isActive: checked
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Delete window",
									className: "size-11 sm:size-9",
									onClick: () => void remove.mutateAsync(row.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							})]
						}, row.id))
					})]
				}, group.label))
			})
		})]
	});
}
function VerificationTab({ tutorId, status }) {
	const steps = useManagedTutorVerification(tutorId);
	const submit = useSubmitManagedTutorVerification(tutorId);
	const documents = useManagedTutorDocuments(tutorId);
	const upload = useUploadManagedTutorDocument(tutorId);
	const removeDoc = useDeleteManagedTutorDocument(tutorId);
	const canSubmit = status === "unverified" || status === "rejected";
	const [docStepId, setDocStepId] = (0, import_react.useState)("");
	const [docLabel, setDocLabel] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	async function handleUpload() {
		const file = fileRef.current?.files?.[0];
		if (!file) {
			toast.error("Choose a file to upload.");
			return;
		}
		if (docLabel.trim().length < 3) {
			toast.error("Give the document a name.");
			return;
		}
		try {
			await upload.mutateAsync({
				file,
				label: docLabel.trim(),
				stepId: docStepId || null
			});
			setDocLabel("");
			setDocStepId("");
			if (fileRef.current) fileRef.current.value = "";
			toast.success("Document uploaded");
		} catch (error) {
			toast.error(error.message || "We couldn't upload that document.");
		}
	}
	async function handleSubmit() {
		try {
			await submit.mutateAsync();
			toast.success("Submitted — DiaLearn will review this tutor.");
		} catch (error) {
			toast.error(error.message || "We couldn't submit this tutor.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
		title: "Verification",
		description: "DiaLearn verifies every tutor, including those under an agency.",
		action: canSubmit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "cta",
			className: "min-h-11",
			disabled: submit.isPending,
			onClick: () => void handleSubmit(),
			children: [submit.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Submit for verification"]
		}) : null,
		children: [
			steps.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 3,
				height: "h-16"
			}) : steps.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load verification.",
				onRetry: () => void steps.refetch()
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: (steps.data ?? []).map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-surface/60 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-semibold",
								children: [step.name, step.isRequired ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-xs font-normal text-muted-foreground",
									children: "(optional)"
								})]
							}), step.status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold", VERIFICATION_TONE[step.status]),
								children: VERIFICATION_LABEL[step.status]
							}) : null]
						}),
						step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: step.description
						}) : null,
						step.reviewerNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Reviewer: "
							}), step.reviewerNotes]
						}) : null
					]
				}, step.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl border border-border bg-surface/60 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Supporting documents"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Stored privately. Only your agency and the DiaLearn review team can open them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "agency-doc-step",
							children: "Verification step"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: docStepId,
							onValueChange: setDocStepId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "agency-doc-step",
								className: "mt-1.5 min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a step" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (steps.data ?? []).map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: step.id,
								children: step.name
							}, step.id)) })]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "agency-doc-label",
							children: "Document name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "agency-doc-label",
							className: "mt-1.5 min-h-11",
							value: docLabel,
							onChange: (event) => setDocLabel(event.target.value),
							placeholder: "Degree certificate"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "agency-doc-file",
							children: "File (PDF or image, max 10MB)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "agency-doc-file",
							ref: fileRef,
							type: "file",
							accept: "application/pdf,image/*",
							className: "mt-1.5 min-h-11"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-3 min-h-11",
						disabled: upload.isPending,
						onClick: () => void handleUpload(),
						children: [upload.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Upload document"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Uploaded"
						}), documents.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 1,
							height: "h-12"
						}) : (documents.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Nothing uploaded yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: (documents.data ?? []).map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium",
										children: doc.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: VERIFICATION_LABEL[doc.status] ?? doc.status
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									className: "shrink-0",
									disabled: removeDoc.isPending,
									onClick: () => void removeDoc.mutateAsync(doc.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "sr-only",
										children: ["Remove ", doc.label]
									})]
								})]
							}, doc.id))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 flex items-start gap-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0" }), "DiaLearn reviews every tutor, including those managed by an agency."]
			})
		]
	});
}
function ManageTutorPage() {
	const { tutorId } = Route.useParams();
	const roster = useAgencyTutors();
	const tutor = (roster.data ?? []).find((row) => row.tutorId === tutorId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgencyShell, {
		title: tutor?.fullName ?? "Manage tutor",
		description: tutor?.email ?? "Profile, subjects, availability and verification.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/agency/tutors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " All tutors"]
			})
		}),
		children: roster.isSuccess && !tutor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
			icon: ShieldCheck,
			title: "Tutor not found",
			body: "This tutor isn't part of your agency, or has been removed."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl",
			children: [tutor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full px-2.5 py-1 text-xs font-semibold", VERIFICATION_TONE[tutor.verificationStatus]),
					children: VERIFICATION_LABEL[tutor.verificationStatus]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: tutor.isListed ? "Visible to families" : "Not visible to families yet"
				})]
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "profile",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "mb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "profile",
								children: "Profile"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "subjects",
								children: "Subjects"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "availability",
								children: "Availability"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "verification",
								children: "Verification"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "profile",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileTab, { tutorId })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "subjects",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectsTab, { tutorId })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "availability",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvailabilityTab, { tutorId })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "verification",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerificationTab, {
							tutorId,
							status: tutor?.verificationStatus
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { ManageTutorPage as component };
