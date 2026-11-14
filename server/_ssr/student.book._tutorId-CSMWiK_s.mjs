import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Ht as CircleCheck, It as Clock, Qt as CalendarDays, S as Sparkles, T as ShieldCheck, it as LoaderCircle, kt as Earth, rt as Lock } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { D as useTutorSubjects, O as useViewerTimezone, T as useTutorCard, a as formatDayInZone, l as formatTimeInZone, m as useBookingQuote, p as useAvailableSlots, s as formatMoney, y as useDurationOptions } from "./parent-data-Dj0LJH5W.mjs";
import { t as Route } from "./student.book._tutorId-wW_zd9hY.mjs";
import { d as useStudentRecord, r as useCreateStudentBooking, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.book._tutorId-CSMWiK_s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudentBookPage() {
	const { tutorId } = Route.useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const timezone = useViewerTimezone();
	const { data: student, isLoading: studentLoading } = useStudentRecord();
	const { tutor: tutorInfo } = useTutorCard(tutorId);
	const durations = useDurationOptions();
	const tutorSubjects = useTutorSubjects(tutorId);
	const [duration, setDuration] = (0, import_react.useState)(void 0);
	const [subjectId, setSubjectId] = (0, import_react.useState)(void 0);
	const [slotStart, setSlotStart] = (0, import_react.useState)(void 0);
	const [notes, setNotes] = (0, import_react.useState)("");
	const durationOptions = durations.data ?? [];
	const effectiveDuration = duration ?? durationOptions[0];
	const slots = useAvailableSlots({
		tutorId,
		durationMinutes: effectiveDuration
	});
	const quote = useBookingQuote(tutorId, effectiveDuration);
	const uniqueSubjects = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of tutorSubjects.data ?? []) if (row.subject_id) map.set(row.subject_id, {
			id: row.subject_id,
			name: row.subjects?.name ?? "Subject"
		});
		return [...map.values()];
	}, [tutorSubjects.data]);
	const onlySubjectId = uniqueSubjects.length === 1 ? uniqueSubjects[0]?.id : void 0;
	const effectiveSubjectId = subjectId ?? onlySubjectId;
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const slot of slots.data ?? []) {
			const day = formatDayInZone(slot.starts_at, timezone);
			const list = map.get(day) ?? [];
			list.push(slot);
			map.set(day, list);
		}
		return [...map.entries()];
	}, [slots.data, timezone]);
	const selectedSlot = (slots.data ?? []).find((slot) => slot.starts_at === slotStart);
	const requestBooking = useCreateStudentBooking();
	const createBooking = useMutation({
		mutationFn: async () => {
			if (!user || !student) throw new Error("You need to be signed in.");
			if (!selectedSlot) throw new Error("Choose an available time slot.");
			const priced = quote.data;
			if (!priced) throw new Error("We couldn't price this lesson. Please try again.");
			await requestBooking.mutateAsync({
				tutorId,
				subjectId: effectiveSubjectId ?? null,
				startsAt: selectedSlot.starts_at,
				endsAt: selectedSlot.ends_at,
				timezone,
				notes: notes.trim() || null,
				quote: priced
			});
		},
		onSuccess: () => {
			toast.success("Class requested! 🎉 Pay now to confirm it — find it under Awaiting Payment.");
			navigate({ to: "/student/history" });
		},
		onError: (error) => toast.error(error.message)
	});
	const canSubmit = Boolean(student?.id && selectedSlot && quote.data) && !createBooking.isPending;
	if (!studentLoading && student && !student.can_book_lessons) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "🔒 Booking not available",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-12 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-extrabold text-foreground",
					children: "Ask your parent to book this class"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Your account isn't set up to book lessons directly yet. A parent can turn this on for you, or book ",
						tutorInfo?.full_name ?? "this tutor",
						" for you."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "min-h-11 rounded-xl font-bold",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/student/find-tutor",
						children: "Back to Find a Tutor"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: tutorInfo ? `🎓 Book ${tutorInfo.full_name}` : "🎓 Book a class",
		description: "Times are shown in your timezone. Pick a time that works for you!",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-10 rounded-xl font-bold",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tutors/$tutorId",
				params: { tutorId },
				children: "View full profile"
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					uniqueSubjects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookSection, {
						icon: "📖",
						title: "What subject?",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: uniqueSubjects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSubjectId(item.id),
								className: cn("focus-ring min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-all", effectiveSubjectId === item.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:border-primary/40"),
								children: item.name
							}, item.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookSection, {
						icon: "⏱️",
						title: "How long?",
						children: durations.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-40 animate-pulse rounded-xl bg-muted" }) : durationOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No lesson lengths configured yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: durationOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setDuration(option);
									setSlotStart(void 0);
								},
								className: cn("focus-ring min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-all", effectiveDuration === option ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:border-primary/40"),
								children: [option, " min"]
							}, option))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookSection, {
						icon: "📅",
						title: "Pick a time",
						subtitle: `Your timezone · ${timezone}`,
						children: slots.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: Array.from({ length: 2 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 animate-pulse rounded-xl bg-muted" }, i))
						}) : slots.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-2 py-6 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-muted-foreground",
								children: "Couldn't load availability."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "min-h-9 rounded-xl",
								onClick: () => void slots.refetch(),
								children: "Try again"
							})]
						}) : grouped.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-2 py-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-muted-foreground",
								children: "No open times for this lesson length. Try a different duration."
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: grouped.map(([day, daySlots]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-sm font-bold text-foreground",
								children: day
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: (daySlots ?? []).map((slot) => {
									const active = slot.starts_at === slotStart;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSlotStart(slot.starts_at),
										"aria-pressed": active,
										className: cn("focus-ring min-h-11 rounded-xl border-2 px-3 text-sm font-bold transition-all", active ? "border-accent bg-accent text-white shadow-sm" : "border-border bg-card hover:border-accent/40"),
										children: formatTimeInZone(slot.starts_at, timezone)
									}, slot.starts_at);
								})
							})] }, day))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookSection, {
						icon: "✏️",
						title: "Anything to share?",
						subtitle: "Optional",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							value: notes,
							onChange: (event) => setNotes(event.target.value),
							placeholder: "e.g. I want extra help with fractions.",
							className: "rounded-xl resize-none"
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "lg:sticky lg:top-24 lg:self-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [tutorInfo?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: tutorInfo.avatar_url,
								alt: tutorInfo.full_name ?? "Tutor",
								className: "size-12 rounded-2xl object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary",
								children: (tutorInfo?.full_name ?? "T").charAt(0)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-extrabold text-foreground",
									children: tutorInfo?.full_name ?? "Tutor"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-secondary" }), " Verified tutor"]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "space-y-2 border-t border-border pt-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Lesson length",
									value: effectiveDuration ? `${effectiveDuration} min` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Start",
									value: selectedSlot ? `${formatDayInZone(selectedSlot.starts_at, timezone)}, ${formatTimeInZone(selectedSlot.starts_at, timezone)}` : "Not selected"
								}),
								quote.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Lesson price",
									value: formatMoney(quote.data.lesson_amount, quote.data.currency)
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold",
								children: "Total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xl font-extrabold text-primary-deep",
								children: quote.data ? formatMoney(quote.data.total_amount, quote.data.currency) : quote.isLoading ? "…" : "—"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "min-h-12 w-full rounded-xl bg-accent font-bold text-white hover:bg-accent/90",
							disabled: !canSubmit,
							onClick: () => createBooking.mutate(),
							children: [createBooking.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Request this class"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-3.5 shrink-0" }), " Pricing is set by DiaLearn and applied automatically."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mt-0.5 size-3.5 shrink-0" }), " You'll pay on the next screen — the class is confirmed once payment clears and your tutor accepts."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "mt-0.5 size-3.5 shrink-0" }),
								" Booked in ",
								timezone,
								"."
							]
						}),
						selectedSlot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "w-full justify-center rounded-full text-xs font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5" }), " Slot held while you review"]
						}) : null
					]
				})
			})]
		})
	});
}
function BookSection({ icon, title, subtitle, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 text-base font-extrabold text-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: icon
					}),
					" ",
					title
				]
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: subtitle
			})]
		}), children]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right font-bold text-foreground",
			children: value
		})]
	});
}
//#endregion
export { StudentBookPage as component };
