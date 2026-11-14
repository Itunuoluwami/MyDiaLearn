import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Ht as CircleCheck, It as Clock, Qt as CalendarDays, T as ShieldCheck, it as LoaderCircle, kt as Earth } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { D as useTutorSubjects, O as useViewerTimezone, T as useTutorCard, _ as useChildren, a as formatDayInZone, i as childName, l as formatTimeInZone, m as useBookingQuote, p as useAvailableSlots, s as formatMoney, y as useDurationOptions } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, u as VerifiedChip } from "./ui-bAhnOVkK.mjs";
import { t as Route } from "./book._tutorId-DPI0BbQu.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book._tutorId-BjerM_if.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BookClassPage() {
	const { tutorId } = Route.useParams();
	const search = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const timezone = useViewerTimezone();
	const children = useChildren();
	const { tutor: tutorInfo } = useTutorCard(tutorId);
	const durations = useDurationOptions();
	const tutorSubjects = useTutorSubjects(tutorId);
	const [childId, setChildId] = (0, import_react.useState)(search.child);
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
	const selectedChild = (children.data ?? []).find((child) => child.id === childId);
	const createBooking = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("You need to be signed in.");
			if (!childId) throw new Error("Choose which child this class is for.");
			if (!selectedSlot) throw new Error("Choose an available time slot.");
			const priced = quote.data;
			if (!priced) throw new Error("We couldn't price this lesson. Please try again.");
			await apiPost("/bookings", {
				studentId: childId,
				tutorId,
				...subjectId ? { subjectId } : {},
				...selectedChild?.education_level_id ? { educationLevelId: selectedChild.education_level_id } : {},
				startsAt: selectedSlot.starts_at,
				durationMinutes: priced.duration_minutes,
				timezone,
				...notes.trim() ? { studentNotes: notes.trim() } : {}
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
			await queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
			await queryClient.invalidateQueries({ queryKey: ["tutor-slots"] });
			toast.success("Class requested — pay now on the Bookings page to confirm it.");
			navigate({ to: "/bookings" });
		},
		onError: (error) => toast.error(error.message)
	});
	const canSubmit = Boolean(childId && selectedSlot && quote.data) && !createBooking.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: tutorInfo ? `Book ${tutorInfo.full_name}` : "Book a class",
		description: "Times are shown in your local timezone, with the tutor's local time alongside.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tutors/$tutorId",
				params: { tutorId },
				children: "View full profile"
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
						title: "Who is this class for?",
						children: children.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 1,
							height: "h-12"
						}) : (children.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							icon: CalendarDays,
							title: "No learners yet",
							body: "Add a child profile before booking a class.",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								className: "min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/children",
									children: "Add a child"
								})
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "b-child",
									children: "Child"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: childId ?? "",
									onValueChange: setChildId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "b-child",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a child" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (children.data ?? []).map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: child.id,
										children: childName(child)
									}, child.id)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "b-subject",
									children: "Subject"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: subjectId ?? "",
									onValueChange: setSubjectId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "b-subject",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a subject" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: uniqueSubjects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: item.id,
										children: item.name
									}, item.id)) })]
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
						title: "Lesson length",
						description: "Durations are configured by the platform.",
						children: durations.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 1,
							height: "h-12"
						}) : durationOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No lesson durations are configured yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: durationOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setDuration(option);
									setSlotStart(void 0);
								},
								className: cn("focus-ring min-h-11 rounded-full border px-4 text-sm font-medium transition-all", effectiveDuration === option ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-muted-foreground hover:text-foreground"),
								children: [option, " min"]
							}, option))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
						title: "Choose a time",
						description: `Your timezone · ${timezone}${tutorInfo?.timezone ? ` · Tutor · ${tutorInfo.timezone}` : ""}`,
						children: slots.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 3,
							height: "h-14"
						}) : slots.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
							message: "We couldn't load availability right now.",
							onRetry: () => void slots.refetch()
						}) : grouped.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							icon: Clock,
							title: "No open slots",
							body: "This tutor has no free times for the selected lesson length. Try another duration or check back soon."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-5",
							children: grouped.map(([day, daySlots]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-sm font-semibold",
								children: day
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: (daySlots ?? []).map((slot) => {
									const active = slot.starts_at === slotStart;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setSlotStart(slot.starts_at),
										"aria-pressed": active,
										className: cn("focus-ring min-h-11 rounded-xl border px-3 text-sm font-medium transition-all", active ? "border-accent bg-accent text-accent-foreground shadow-soft" : "border-border bg-card hover:bg-surface"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block",
											children: formatTimeInZone(slot.starts_at, timezone)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-[0.7rem] font-normal opacity-80",
											children: [formatTimeInZone(slot.starts_at, slot.tutor_timezone), " tutor time"]
										})]
									}, slot.starts_at);
								})
							})] }, day))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
						title: "Notes for the tutor",
						description: "Optional — share goals or focus areas.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 4,
							value: notes,
							onChange: (event) => setNotes(event.target.value),
							placeholder: "e.g. She is preparing for end-of-term exams in algebra."
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "lg:sticky lg:top-24 lg:self-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-elevated space-y-4 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-11 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-primary-deep",
								children: (tutorInfo?.full_name ?? "T").charAt(0)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: tutorInfo?.full_name ?? "Tutor"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedChip, { status: tutorInfo?.verification_status ?? null })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "space-y-2 border-t border-border pt-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Child",
									value: selectedChild ? childName(selectedChild) : "Not selected"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Lesson length",
									value: effectiveDuration ? `${effectiveDuration} min` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Start",
									value: selectedSlot ? `${formatDayInZone(selectedSlot.starts_at, timezone)}, ${formatTimeInZone(selectedSlot.starts_at, timezone)}` : "Not selected"
								}),
								quote.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Lesson",
										value: formatMoney(quote.data.lesson_amount, quote.data.currency)
									}),
									Number(quote.data.platform_fee) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Platform fee",
										value: formatMoney(quote.data.platform_fee, quote.data.currency)
									}) : null,
									Number(quote.data.processing_fee) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Processing fee",
										value: formatMoney(quote.data.processing_fee, quote.data.currency)
									}) : null
								] }) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: "Total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xl font-semibold",
								children: quote.data ? formatMoney(quote.data.total_amount, quote.data.currency) : quote.isLoading ? "…" : "—"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "cta",
							className: "min-h-12 w-full",
							disabled: !canSubmit,
							onClick: () => createBooking.mutate(),
							children: [createBooking.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Request this class"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "mt-0.5 size-3.5 shrink-0",
								"aria-hidden": "true"
							}), "Pricing, fees and cancellation terms are set by DiaLearn and applied automatically."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "mt-0.5 size-3.5 shrink-0",
								"aria-hidden": "true"
							}), "Payment happens on the next screen — the class is confirmed once payment clears and the tutor accepts."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, {
									className: "mt-0.5 size-3.5 shrink-0",
									"aria-hidden": "true"
								}),
								"Booked in ",
								timezone,
								". The tutor sees the class in their own local time."
							]
						}),
						selectedSlot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "w-full justify-center rounded-full",
							children: "Slot held while you review"
						}) : null
					]
				})
			})]
		})
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right font-medium",
			children: value
		})]
	});
}
//#endregion
export { BookClassPage as component };
