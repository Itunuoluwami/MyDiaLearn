import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { $ as MapPin, C as SlidersHorizontal, Zt as CalendarPlus, _t as GraduationCap, a as Users, k as Search, t as X, y as Star, yt as Funnel } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { _ as useChildren, b as useLevelOptions } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, s as MetaItem } from "./ui-bAhnOVkK.mjs";
import { c as useCountryFacets, g as useTutorSearch, l as useCurriculumFacets, n as formatMoney, p as useSubjectFacets } from "./public-data-D6Ffdjlb.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { t as ChildSwitcher } from "./ChildSwitcher-D_zmULnc.mjs";
import { t as LazyImage } from "./lazy-image-ELIP8TVW.mjs";
import { t as Route } from "./find-tutor-E8PUcA8a.mjs";
import { t as Slider } from "./slider-COYzormL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/find-tutor-Dp-KEpTd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Tutor result card used inside the parent portal. Rates, ratings, subjects and
* currency all come from the search function — nothing is hardcoded.
*/
function ParentTutorCard({ tutor, childId }) {
	const rating = tutor.rating_avg ? Number(tutor.rating_avg) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-14 shrink-0 overflow-hidden rounded-xl bg-primary-soft ring-2 ring-primary/10",
					children: tutor.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
						src: tutor.avatar_url,
						alt: tutor.full_name ?? "Tutor",
						className: "size-14 object-cover transition-transform duration-300 group-hover:scale-105"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-14 items-center justify-center text-base font-semibold text-primary-deep",
						children: (tutor.full_name ?? "T").charAt(0)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate text-base font-semibold",
							children: tutor.full_name
						}),
						tutor.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 line-clamp-2 text-sm text-muted-foreground",
							children: tutor.headline
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1",
							children: [
								rating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
									icon: Star,
									children: `${rating.toFixed(1)} (${Number(tutor.rating_count)})`
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "New on DiaLearn"
								}),
								tutor.country_code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
									icon: MapPin,
									children: tutor.country_code
								}) : null,
								tutor.years_experience ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
									icon: GraduationCap,
									children: `${tutor.years_experience} yrs`
								}) : null
							]
						})
					]
				})]
			}),
			(tutor.subjects ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: (tutor.subjects ?? []).slice(0, 4).map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "rounded-full text-[0.7rem]",
					children: subject
				}, subject))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-semibold",
						children: formatMoney(tutor.hourly_rate, tutor.currency)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: " / hour"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutors/$tutorId",
							params: { tutorId: tutor.id },
							children: "View profile"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/book/$tutorId",
							params: { tutorId: tutor.id },
							search: childId ? { child: childId } : {},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "size-4" }), " Book"]
						})
					})]
				})]
			})
		]
	});
}
var SORTS = [
	{
		value: "top_rated",
		label: "Top rated"
	},
	{
		value: "price_low",
		label: "Lowest price"
	},
	{
		value: "price_high",
		label: "Highest price"
	},
	{
		value: "experience",
		label: "Most experienced"
	},
	{
		value: "newest",
		label: "Newest"
	}
];
function FindTutorPage() {
	const search = Route.useSearch();
	const children = useChildren();
	const kids = children.data ?? [];
	const [childId, setChildId] = (0, import_react.useState)(search.child ?? null);
	const [term, setTerm] = (0, import_react.useState)("");
	const [subject, setSubject] = (0, import_react.useState)(search.subject);
	const [curriculum, setCurriculum] = (0, import_react.useState)(void 0);
	const [level, setLevel] = (0, import_react.useState)(void 0);
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
	const selectedChild = kids.find((child) => child.id === childId) ?? null;
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
			label: `${minRating}+ rating`,
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
					htmlFor: "f-subject",
					children: "Subject"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: subject ?? "",
					onValueChange: (value) => setSubject(value || void 0),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "f-subject",
						className: "min-h-11",
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
					htmlFor: "f-curriculum",
					children: "Curriculum"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: curriculum ?? "",
					onValueChange: (value) => {
						setCurriculum(value || void 0);
						setLevel(void 0);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "f-curriculum",
						className: "min-h-11",
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
					htmlFor: "f-level",
					children: "Level / grade"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: level ?? "",
					onValueChange: (value) => setLevel(value || void 0),
					disabled: (levels.data ?? []).length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "f-level",
						className: "min-h-11",
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
					htmlFor: "f-country",
					children: "Tutor country"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: country ?? "",
					onValueChange: (value) => setCountry(value || void 0),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "f-country",
						className: "min-h-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any country" })
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
					htmlFor: "f-language",
					children: "Teaching language"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "f-language",
					className: "min-h-11",
					placeholder: "e.g. English",
					value: language,
					onChange: (event) => setLanguage(event.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					htmlFor: "f-rating",
					children: ["Minimum rating: ", minRating > 0 ? `${minRating}★` : "any"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					id: "f-rating",
					min: 0,
					max: 5,
					step: .5,
					value: [minRating],
					onValueChange: (value) => setMinRating(value[0] ?? 0)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "f-price",
						children: "Maximum hourly rate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "f-price",
						className: "min-h-11",
						type: "number",
						min: 0,
						placeholder: "Any rate",
						value: maxPrice ?? "",
						onChange: (event) => setMaxPrice(event.target.value ? Number(event.target.value) : void 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Rates are shown in each tutor's own currency, as configured on the platform."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "min-h-11 w-full",
				onClick: clearAll,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Clear filters"]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Find a tutor",
		description: "Search verified tutors, then book for a specific child.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
					title: "Who is this lesson for?",
					description: "Pick a child before you book.",
					children: [children.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 1,
						height: "h-14"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChildSwitcher, {
						children: kids,
						selectedId: childId,
						onSelect: setChildId,
						allowAll: false
					}), kids.length > 0 && !selectedChild ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-center gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
							className: "size-3.5",
							"aria-hidden": "true"
						}), "Select a child so bookings are linked to the right learner."]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "min-h-12 pl-9",
								placeholder: "Search tutors, subjects or keywords",
								"aria-label": "Search tutors",
								value: term,
								onChange: (event) => setTerm(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: sort,
							onValueChange: setSort,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "min-h-12 sm:w-48",
								"aria-label": "Sort results",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
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
									className: "min-h-12",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }),
										" Filters",
										activeFilters.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											children: activeFilters.length
										}) : null
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
								side: "bottom",
								className: "max-h-[85vh] overflow-y-auto rounded-t-2xl p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Filter tutors" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: filterPanel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "cta",
										className: "mt-5 min-h-12 w-full",
										onClick: () => setDrawerOpen(false),
										children: [
											"Show ",
											total,
											" tutors"
										]
									})
								]
							})]
						})
					]
				}),
				activeFilters.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [activeFilters.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: chip.clear,
						className: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-surface",
						children: [chip.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-3.5",
							"aria-hidden": "true"
						})]
					}, chip.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: clearAll,
						className: "focus-ring min-h-9 rounded-full px-3 text-xs font-semibold text-primary",
						children: "Clear all"
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-elevated sticky top-24 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-semibold",
								children: "Filters"
							}), filterPanel]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						"aria-live": "polite",
						children: results.isLoading ? "Searching tutors…" : `${total} tutor${total === 1 ? "" : "s"} found`
					}), results.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 4,
						height: "h-40"
					}) : results.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load tutors right now.",
						onRetry: () => void results.refetch()
					}) : (results.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
						icon: Star,
						title: "No tutors found",
						body: "Try adjusting your filters or search criteria.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "min-h-11",
							onClick: clearAll,
							children: "Clear filters"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 xl:grid-cols-2",
						children: (results.data ?? []).map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentTutorCard, {
							tutor,
							childId: childId ?? void 0
						}, tutor.id))
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Looking for the public profiles instead?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutors",
							className: "font-semibold text-primary underline-offset-4 hover:underline",
							children: "Browse the marketplace"
						}),
						"."
					]
				})
			]
		})
	});
}
//#endregion
export { FindTutorPage as component };
