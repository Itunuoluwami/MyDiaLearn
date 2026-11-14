import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { C as SlidersHorizontal, k as Search, t as X, y as Star, yt as Funnel } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { b as useLevelOptions } from "./parent-data-Dj0LJH5W.mjs";
import { c as useCountryFacets, g as useTutorSearch, l as useCurriculumFacets, p as useSubjectFacets } from "./public-data-D6Ffdjlb.mjs";
import { t as Slider } from "./slider-COYzormL.mjs";
import { d as useStudentRecord, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.find-tutor-mo7jZAbB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SORTS = [
	{
		value: "top_rated",
		label: "Top Rated"
	},
	{
		value: "price_low",
		label: "Lowest Price"
	},
	{
		value: "price_high",
		label: "Highest Price"
	},
	{
		value: "experience",
		label: "Most Experienced"
	},
	{
		value: "newest",
		label: "Newest"
	}
];
function StudentFindTutorPage() {
	const { data: student } = useStudentRecord();
	const [term, setTerm] = (0, import_react.useState)("");
	const [subject, setSubject] = (0, import_react.useState)(void 0);
	const [curriculum, setCurriculum] = (0, import_react.useState)(student?.curriculum_id ?? void 0);
	const [level, setLevel] = (0, import_react.useState)(student?.education_level_id ?? void 0);
	const [country, setCountry] = (0, import_react.useState)(void 0);
	const [language, setLanguage] = (0, import_react.useState)("");
	const [minRating, setMinRating] = (0, import_react.useState)(0);
	const [maxPrice, setMaxPrice] = (0, import_react.useState)(void 0);
	const [sort, setSort] = (0, import_react.useState)("top_rated");
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const subjects = useSubjectFacets();
	const curricula = useCurriculumFacets();
	const countries = useCountryFacets();
	const levels = useLevelOptions(curriculum);
	const results = useTutorSearch({
		q: term || void 0,
		subject,
		curriculum,
		level,
		country,
		language: language || void 0,
		minRating: minRating > 0 ? minRating : void 0,
		maxPrice,
		sort,
		limit: 24
	});
	const total = results.data?.[0]?.total_count ? Number(results.data[0].total_count) : results.data?.length ?? 0;
	const activeFilters = (0, import_react.useMemo)(() => {
		const chips = [];
		if (subject) {
			const found = (subjects.data ?? []).find((item) => item.id === subject);
			chips.push({
				key: "subject",
				label: found?.name ?? "Subject",
				clear: () => setSubject(void 0)
			});
		}
		if (curriculum) {
			const found = (curricula.data ?? []).find((item) => item.id === curriculum);
			chips.push({
				key: "curriculum",
				label: found?.name ?? "Curriculum",
				clear: () => {
					setCurriculum(void 0);
					setLevel(void 0);
				}
			});
		}
		if (level) {
			const found = (levels.data ?? []).find((item) => item.id === level);
			chips.push({
				key: "level",
				label: found?.name ?? "Level",
				clear: () => setLevel(void 0)
			});
		}
		if (country) chips.push({
			key: "country",
			label: country,
			clear: () => setCountry(void 0)
		});
		if (language) chips.push({
			key: "language",
			label: language,
			clear: () => setLanguage("")
		});
		if (minRating > 0) chips.push({
			key: "rating",
			label: `${minRating}+ stars`,
			clear: () => setMinRating(0)
		});
		if (maxPrice) chips.push({
			key: "price",
			label: `Up to ${maxPrice}/hr`,
			clear: () => setMaxPrice(void 0)
		});
		return chips;
	}, [
		subject,
		curriculum,
		level,
		country,
		language,
		minRating,
		maxPrice,
		subjects.data,
		curricula.data,
		levels.data
	]);
	function clearAll() {
		setSubject(void 0);
		setCurriculum(void 0);
		setLevel(void 0);
		setCountry(void 0);
		setLanguage("");
		setMinRating(0);
		setMaxPrice(void 0);
	}
	const filterPanel = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sf-subject",
					children: "Subject"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: subject ?? "",
					onValueChange: (v) => setSubject(v || void 0),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "sf-subject",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any subject" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (subjects.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: item.id,
						children: item.name
					}, item.id)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sf-curriculum",
					children: "Curriculum"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: curriculum ?? "",
					onValueChange: (v) => {
						setCurriculum(v || void 0);
						setLevel(void 0);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "sf-curriculum",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any curriculum" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (curricula.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: item.id,
						children: item.name
					}, item.id)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sf-level",
					children: "Level / Grade"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: level ?? "",
					onValueChange: (v) => setLevel(v || void 0),
					disabled: (levels.data ?? []).length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "sf-level",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any level" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (levels.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: item.id,
						children: item.name
					}, item.id)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sf-country",
					children: "Tutor's Country"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: country ?? "",
					onValueChange: (v) => setCountry(v || void 0),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "sf-country",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Anywhere" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (countries.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: item.country_code,
						children: [
							item.country_code,
							" (",
							Number(item.tutor_count),
							")"
						]
					}, item.country_code)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sf-language",
					children: "Teaching Language"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "sf-language",
					className: "min-h-11 rounded-xl",
					placeholder: "e.g. English",
					value: language,
					onChange: (e) => setLanguage(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					htmlFor: "sf-rating",
					children: ["Minimum Rating: ", minRating > 0 ? `${minRating} ⭐` : "Any"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					id: "sf-rating",
					min: 0,
					max: 5,
					step: .5,
					value: [minRating],
					onValueChange: (v) => setMinRating(v[0] ?? 0)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "min-h-11 w-full rounded-xl",
				onClick: clearAll,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Clear filters"]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "🔍 Find a Tutor",
		description: "Browse verified tutors and ask your parent to book the one you like!",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				!student?.can_book_lessons && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-secondary/40 bg-secondary/10 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold text-secondary-foreground",
						children: "💡 Found a tutor you like? Ask your parent to book them for you. A booking request will be sent for their approval."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "min-h-12 rounded-2xl pl-10 text-base",
								placeholder: "Search by name or subject…",
								"aria-label": "Search tutors",
								value: term,
								onChange: (e) => setTerm(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: sort,
							onValueChange: setSort,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "min-h-12 rounded-2xl sm:w-48",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SORTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: item.value,
								children: item.label
							}, item.value)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
							open: drawerOpen,
							onOpenChange: setDrawerOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
								asChild: true,
								className: "lg:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "min-h-12 rounded-2xl gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }),
										" Filters",
										activeFilters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "rounded-full",
											children: activeFilters.length
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
								side: "bottom",
								className: "max-h-[85vh] overflow-y-auto rounded-t-3xl p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
										className: "text-lg font-extrabold",
										children: "Filter Tutors"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-5",
										children: filterPanel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "cta",
										className: "mt-5 min-h-12 w-full rounded-2xl font-bold",
										onClick: () => setDrawerOpen(false),
										children: [
											"Show ",
											total,
											" tutor",
											total === 1 ? "" : "s"
										]
									})
								]
							})]
						})
					]
				}),
				activeFilters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [activeFilters.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: chip.clear,
						className: "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold transition-colors hover:bg-primary/5",
						children: [chip.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })]
					}, chip.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: clearAll,
						className: "min-h-9 rounded-full px-3 text-xs font-bold text-primary hover:underline",
						children: "Clear all"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sticky top-24 rounded-2xl border border-border bg-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-extrabold text-foreground",
								children: "Filter Tutors"
							}), filterPanel]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm font-semibold text-muted-foreground",
						"aria-live": "polite",
						children: results.isLoading ? "Searching…" : `${total} tutor${total === 1 ? "" : "s"} found`
					}), results.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-2xl bg-muted" }, i))
					}) : results.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => void results.refetch() }) : (results.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-5xl",
								children: "🔎"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-bold text-foreground",
								children: "No tutors found"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Try changing your filters"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "min-h-11 rounded-xl",
								onClick: clearAll,
								children: "Clear filters"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: (results.data ?? []).map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorCard, {
							tutor,
							canBook: student?.can_book_lessons ?? false
						}, tutor.id))
					})] })]
				})
			]
		})
	});
}
function TutorCard({ tutor, canBook }) {
	const stars = Math.round(Number(tutor.rating_avg ?? 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [tutor.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: tutor.avatar_url,
					alt: tutor.full_name ?? "Tutor",
					className: "size-14 rounded-2xl object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-extrabold text-primary",
					children: (tutor.full_name ?? "T").charAt(0).toUpperCase()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-extrabold text-foreground truncate",
							children: tutor.full_name ?? "Tutor"
						}),
						tutor.headline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground truncate",
							children: tutor.headline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center gap-1",
							children: [Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", i < stars ? "fill-secondary text-secondary" : "text-muted") }, i)), Number(tutor.rating_count ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-1 text-xs text-muted-foreground",
								children: [
									"(",
									tutor.rating_count,
									")"
								]
							})]
						})
					]
				})]
			}),
			(tutor.subjects ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: (tutor.subjects ?? []).slice(0, 4).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary",
					children: s
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg font-extrabold text-primary-deep",
					children: [tutor.hourly_rate ? new Intl.NumberFormat(void 0, {
						style: "currency",
						currency: tutor.currency ?? "USD",
						maximumFractionDigits: 0
					}).format(Number(tutor.hourly_rate)) : "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-muted-foreground",
						children: " / hr"
					})]
				}), tutor.country_code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["📍 ", tutor.country_code]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					className: cn("min-h-10 rounded-xl font-bold", canBook ? "bg-accent hover:bg-accent/90 text-white" : ""),
					children: canBook ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/student/book/$tutorId",
						params: { tutorId: tutor.id },
						children: "Book Now"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tutors/$tutorId",
						params: { tutorId: tutor.id },
						children: "View Profile"
					})
				})]
			})
		]
	});
}
function ErrorState({ onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-5xl",
				children: "😕"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-bold text-foreground",
				children: "Couldn't load tutors"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "min-h-11 rounded-xl",
				onClick: onRetry,
				children: "Try again"
			})
		]
	});
}
//#endregion
export { StudentFindTutorPage as component };
