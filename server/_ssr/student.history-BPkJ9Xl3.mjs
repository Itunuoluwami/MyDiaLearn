import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Ht as CircleCheck, It as Clock, Mt as CreditCard, Vt as CirclePlay, h as TrendingUp, tn as CalendarCheck2, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { d as isJoinable } from "./parent-data-Dj0LJH5W.mjs";
import { t as PayNowButton } from "./PayNowButton-6m7HSur6.mjs";
import { t as ReportIssueDialog } from "./ReportIssueDialog-DKUG413I.mjs";
import { c as useStudentBookings, d as useStudentRecord, n as formatTimeInZone, p as useSubmitReview, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.history-BPkJ9Xl3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isPaid(booking) {
	return (booking.payments ?? []).some((payment) => payment.status === "paid");
}
function StudentHistoryPage() {
	const { data: student } = useStudentRecord();
	const bookings = useStudentBookings();
	const submitReview = useSubmitReview();
	const [ratingBookingId, setRatingBookingId] = (0, import_react.useState)(null);
	const [score, setScore] = (0, import_react.useState)(5);
	const [comment, setComment] = (0, import_react.useState)("");
	const tz = student?.timezone || "UTC";
	const upcoming = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((b) => new Date(b.ends_at) > /* @__PURE__ */ new Date() && ["confirmed", "in_progress"].includes(b.status)), [bookings.data]);
	const awaitingPayment = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((b) => new Date(b.ends_at) > /* @__PURE__ */ new Date() && b.status === "pending" && !isPaid(b)), [bookings.data]);
	const past = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((b) => b.status === "completed" || new Date(b.ends_at) < /* @__PURE__ */ new Date()), [bookings.data]);
	const totalMinutes = past.reduce((acc, b) => acc + (b.duration_minutes ?? 0), 0);
	const completedCount = past.filter((b) => b.status === "completed").length;
	async function handleSubmitRating() {
		const booking = (bookings.data ?? []).find((b) => b.id === ratingBookingId);
		if (!booking) return;
		try {
			await submitReview.mutateAsync({
				bookingId: booking.id,
				tutorId: booking.tutor_id,
				score,
				comment: comment.trim() || void 0
			});
			toast.success("Thanks for your review! ⭐");
			setRatingBookingId(null);
			setComment("");
			setScore(5);
		} catch {
			toast.error("Couldn't submit review. Try again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StudentShell, {
		title: "📊 My Classes & Progress",
		description: "See your upcoming and past lessons, tutor notes and how far you've come.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatPill, {
							icon: "🎓",
							value: completedCount,
							label: "Classes Done"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatPill, {
							icon: "⏱️",
							value: `${Math.round(totalMinutes / 60)}h`,
							label: "Hours Learned"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatPill, {
							icon: "🔥",
							value: upcoming.length,
							label: "Upcoming"
						})
					]
				}),
				awaitingPayment.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 text-lg font-extrabold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5 text-accent" }), " Awaiting Payment"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: awaitingPayment.map((booking) => {
						const tutorName = booking.tutors?.profiles?.full_name ?? "Your Tutor";
						const subject = booking.subjects?.name ?? "Lesson";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white text-xl",
									children: "💳"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold text-foreground",
											children: subject
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground",
											children: ["with ", tutorName]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 flex items-center gap-1 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
												formatTimeInZone(booking.starts_at, tz),
												" · ",
												booking.duration_minutes,
												" min"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayNowButton, {
									bookingId: booking.id,
									amount: booking.total_amount,
									currency: booking.currency
								})
							]
						}, booking.id);
					})
				})] }),
				upcoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 text-lg font-extrabold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck2, { className: "size-5 text-primary" }), " Upcoming Classes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: upcoming.map((booking) => {
						const tutorName = booking.tutors?.profiles?.full_name ?? "Your Tutor";
						const subject = booking.subjects?.name ?? "Lesson";
						const joinable = isJoinable(booking);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white text-xl",
									children: "📘"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold text-foreground",
											children: subject
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground",
											children: ["with ", tutorName]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 flex items-center gap-1 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
												formatTimeInZone(booking.starts_at, tz),
												" · ",
												booking.duration_minutes,
												" min"
											]
										})
									]
								}),
								joinable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									className: "min-h-10 rounded-xl bg-accent font-bold text-white",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/student/classroom/$bookingId",
										params: { bookingId: booking.id },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "size-4 mr-1" }), " Join"]
									})
								})
							]
						}, booking.id);
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 text-lg font-extrabold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5 text-secondary-foreground" }), " Class History"]
				}), bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-2xl bg-muted" }, i))
				}) : past.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-5xl",
							children: "📅"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold text-foreground",
							children: "No classes yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Your completed classes will appear here."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: past.map((booking) => {
						const tutorName = booking.tutors?.profiles?.full_name ?? "Your Tutor";
						const subject = booking.subjects?.name ?? "Lesson";
						const session = booking.class_sessions?.[0];
						const completed = booking.status === "completed";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("rounded-2xl border p-5 transition-shadow hover:shadow-sm", completed ? "border-border bg-card" : "border-muted bg-muted/30"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl", completed ? "bg-success/10" : "bg-muted"),
											children: completed ? "✅" : "📅"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-extrabold text-foreground",
												children: subject
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-muted-foreground",
												children: ["with ", tutorName]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-0.5 text-xs text-muted-foreground",
												children: [
													new Date(booking.starts_at).toLocaleDateString(void 0, {
														weekday: "short",
														day: "numeric",
														month: "short",
														year: "numeric"
													}),
													" · ",
													booking.duration_minutes,
													" min"
												]
											})
										] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: cn("shrink-0 rounded-full text-xs font-bold", completed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"),
										children: completed ? "Completed" : booking.status
									})]
								}),
								session?.tutor_notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1 text-xs font-extrabold uppercase tracking-wide text-primary",
										children: "Tutor's Notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-foreground leading-relaxed",
										children: session.tutor_notes
									})]
								}),
								session?.homework && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 rounded-xl border border-secondary/20 bg-secondary/8 p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-extrabold text-secondary-foreground",
										children: ["📌 Homework: ", session.homework]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [completed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "min-h-9 rounded-xl border-secondary/40 font-bold text-secondary-foreground hover:bg-secondary/10",
										onClick: () => setRatingBookingId(booking.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 mr-1 fill-secondary text-secondary" }), " Rate this class"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportIssueDialog, {
										bookingId: booking.id,
										trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "min-h-9 rounded-xl text-muted-foreground",
											children: "Report an issue"
										})
									})]
								})
							]
						}, booking.id);
					})
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: Boolean(ratingBookingId),
			onOpenChange: (open) => !open && setRatingBookingId(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "rounded-3xl p-6 sm:max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-xl font-extrabold",
					children: "Rate your class ⭐"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-sm font-bold text-foreground",
							children: "How many stars?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 justify-center",
							children: [
								1,
								2,
								3,
								4,
								5
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setScore(s),
								className: "focus-ring rounded-full p-1 transition-transform hover:scale-110",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-9 transition-colors", s <= score ? "fill-secondary text-secondary" : "text-muted fill-muted") })
							}, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm font-bold text-foreground",
							children: "Leave a comment (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "Tell us what you liked or what could be better…",
							className: "min-h-24 resize-none rounded-xl",
							value: comment,
							onChange: (e) => setComment(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1 min-h-12 rounded-xl bg-accent font-bold text-white hover:bg-accent/90",
								onClick: () => void handleSubmitRating(),
								disabled: submitReview.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 mr-1" }), submitReview.isPending ? "Submitting…" : "Submit Review"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "min-h-12 rounded-xl font-bold",
								onClick: () => setRatingBookingId(null),
								children: "Cancel"
							})]
						})
					]
				})]
			})
		})]
	});
}
function StatPill({ icon, value, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-4 text-center shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-2xl",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-extrabold tabular-nums text-foreground",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold text-muted-foreground",
				children: label
			})
		]
	});
}
//#endregion
export { StudentHistoryPage as component };
