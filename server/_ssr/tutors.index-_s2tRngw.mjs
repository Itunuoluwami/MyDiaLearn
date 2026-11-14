import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { A as SearchX, C as SlidersHorizontal, t as X } from "../_libs/lucide-react.mjs";
import { n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { c as useCountryFacets, d as usePublicSettings, g as useTutorSearch, i as settingMap, l as useCurriculumFacets, p as useSubjectFacets, t as countryLabel, u as useEducationLevels } from "./public-data-D6Ffdjlb.mjs";
import { n as TutorCard, r as TutorCardSkeleton, t as SiteSearch } from "./TutorCard-B-Y7gjpy.mjs";
import { t as EmptyState } from "./empty-state-DoZtLjGq.mjs";
import { t as Slider } from "./slider-COYzormL.mjs";
import { t as Route } from "./tutors.index-Bf0eMr7X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutors.index-_s2tRngw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SORT_OPTIONS = [
	{
		value: "top_rated",
		label: "Top rated"
	},
	{
		value: "experience",
		label: "Most experienced"
	},
	{
		value: "newest",
		label: "Newest"
	},
	{
		value: "price_low",
		label: "Price: low to high"
	},
	{
		value: "price_high",
		label: "Price: high to low"
	}
];
var RATING_OPTIONS = [
	{
		value: "4.5",
		label: "4.5 and above"
	},
	{
		value: "4",
		label: "4.0 and above"
	},
	{
		value: "3",
		label: "3.0 and above"
	}
];
var ANY = "any";
var PAGE_SIZE = 12;
function FilterPanel({ search, update, clear, languages }) {
	const { data: subjects = [] } = useSubjectFacets();
	const { data: curricula = [] } = useCurriculumFacets();
	const { data: countries = [] } = useCountryFacets();
	const { data: levels = [] } = useEducationLevels(search.curriculum);
	const { data: settings } = usePublicSettings();
	const labels = settingMap(settings, "content.country_labels");
	const [price, setPrice] = (0, import_react.useState)(search.maxPrice ?? 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "Filters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: clear,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Clear"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: search.subject ?? ANY,
					onValueChange: (value) => update({ subject: value === ANY ? void 0 : value }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "min-h-11 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any subject" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: ANY,
						children: "Any subject"
					}), subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: subject.id,
						children: subject.name
					}, subject.id))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Curriculum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: search.curriculum ?? ANY,
					onValueChange: (value) => update({
						curriculum: value === ANY ? void 0 : value,
						level: void 0
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "min-h-11 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any curriculum" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: ANY,
						children: "Any curriculum"
					}), curricula.map((curriculum) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: curriculum.id,
						children: curriculum.name
					}, curriculum.id))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Grade / level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: search.level ?? ANY,
					onValueChange: (value) => update({ level: value === ANY ? void 0 : value }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "min-h-11 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any level" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: ANY,
						children: "Any level"
					}), levels.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: level.id,
						children: level.name
					}, level.id))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tutor country" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: search.country ?? ANY,
					onValueChange: (value) => update({ country: value === ANY ? void 0 : value }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "min-h-11 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any country" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: ANY,
						children: "Any country"
					}), countries.map((country) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: country.country_code,
						children: countryLabel(country.country_code, labels)
					}, country.country_code))] })]
				})]
			}),
			languages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Language" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: search.language ?? ANY,
					onValueChange: (value) => update({ language: value === ANY ? void 0 : value }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "min-h-11 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any language" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: ANY,
						children: "Any language"
					}), languages.map((language) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: language,
						children: language
					}, language))] })]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rating" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: search.minRating ? String(search.minRating) : ANY,
					onValueChange: (value) => update({ minRating: value === ANY ? void 0 : Number(value) }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "min-h-11 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any rating" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: ANY,
						children: "Any rating"
					}), RATING_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Maximum hourly rate" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						value: [price],
						min: 5,
						max: 200,
						step: 5,
						onValueChange: (value) => setPrice(value[0] ?? 100),
						onValueCommit: (value) => update({ maxPrice: value[0] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Up to ",
							price,
							" per hour",
							search.maxPrice ? "" : " (not applied yet)"
						]
					})
				]
			})
		]
	});
}
/** Removable chips for every applied filter, labelled from the DB lookups. */
function ActiveFilterChips({ search, update, clear }) {
	const { data: subjects = [] } = useSubjectFacets();
	const { data: curricula = [] } = useCurriculumFacets();
	const { data: countries = [] } = useCountryFacets();
	const { data: levels = [] } = useEducationLevels(search.curriculum);
	const { data: settings } = usePublicSettings();
	const labels = settingMap(settings, "content.country_labels");
	const chips = [];
	if (search.q) chips.push({
		key: "q",
		label: `“${search.q}”`,
		onRemove: () => update({ q: void 0 })
	});
	const subject = subjects.find((item) => item.id === search.subject);
	if (subject) chips.push({
		key: "subject",
		label: subject.name,
		onRemove: () => update({ subject: void 0 })
	});
	const curriculum = curricula.find((item) => item.id === search.curriculum);
	if (curriculum) chips.push({
		key: "curriculum",
		label: curriculum.name,
		onRemove: () => update({
			curriculum: void 0,
			level: void 0
		})
	});
	const level = levels.find((item) => item.id === search.level);
	if (level) chips.push({
		key: "level",
		label: level.name,
		onRemove: () => update({ level: void 0 })
	});
	const country = countries.find((item) => item.country_code === search.country);
	if (country) chips.push({
		key: "country",
		label: countryLabel(country.country_code, labels),
		onRemove: () => update({ country: void 0 })
	});
	if (search.language) chips.push({
		key: "language",
		label: search.language,
		onRemove: () => update({ language: void 0 })
	});
	if (search.minRating) chips.push({
		key: "minRating",
		label: `${search.minRating}+ rating`,
		onRemove: () => update({ minRating: void 0 })
	});
	if (search.maxPrice) chips.push({
		key: "maxPrice",
		label: `Up to ${search.maxPrice} / hour`,
		onRemove: () => update({ maxPrice: void 0 })
	});
	if (chips.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 flex flex-wrap items-center gap-2",
		children: [chips.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: chip.onRemove,
			className: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-primary-soft px-3 text-xs font-medium text-primary-deep transition-colors duration-200 hover:bg-primary hover:text-primary-foreground",
			children: [chip.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })]
		}, chip.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: clear,
			className: "focus-ring inline-flex min-h-9 items-center rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground",
			children: "Clear all"
		})]
	});
}
function TutorSearchPage() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const page = Math.max(1, search.page ?? 1);
	const sort = search.sort ?? "top_rated";
	const { data: tutors = [], isLoading } = useTutorSearch({
		q: search.q,
		subject: search.subject,
		curriculum: search.curriculum,
		country: search.country,
		level: search.level,
		language: search.language,
		minRating: search.minRating,
		maxPrice: search.maxPrice,
		sort,
		limit: PAGE_SIZE,
		offset: (page - 1) * PAGE_SIZE
	});
	const { data: languagePool = [] } = useTutorSearch({
		limit: 60,
		sort: "top_rated"
	});
	const languages = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const tutor of languagePool) {
			const list = Array.isArray(tutor.languages) ? tutor.languages : [];
			for (const item of list) if (typeof item === "string") set.add(item);
		}
		return [...set].sort();
	}, [languagePool]);
	const { data: settings } = usePublicSettings();
	const labels = settingMap(settings, "content.country_labels");
	const total = Number(tutors[0]?.total_count ?? 0);
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	function update(patch) {
		navigate({
			to: "/tutors",
			search: (prev) => ({
				...prev,
				...patch,
				page: void 0
			})
		});
	}
	function clear() {
		navigate({
			to: "/tutors",
			search: {}
		});
	}
	const filterPanel = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPanel, {
		search,
		update,
		clear,
		languages
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "band-hero border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-site py-6 md:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display-section",
				children: "Find a verified tutor"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 max-w-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteSearch, { initialTerm: search.q ?? "" })
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-site py-6 md:py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "panel-portal hidden h-fit p-5 lg:block",
				children: filterPanel
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 text-sm text-muted-foreground",
							children: isLoading ? "Searching tutors…" : `${total} ${total === 1 ? "tutor" : "tutors"} found`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
								open: filtersOpen,
								onOpenChange: setFiltersOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										className: "min-h-11 lg:hidden",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {}), " Filters"]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
									side: "left",
									className: "w-[19rem] overflow-y-auto p-5",
									children: filterPanel
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: sort,
								onValueChange: (value) => update({ sort: value }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "min-h-11 w-[11rem]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SORT_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: option.value,
									children: option.label
								}, option.value)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveFilterChips, {
						search,
						update,
						clear
					}),
					isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
						children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorCardSkeleton, {}, index))
					}) : tutors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid animate-fade-in gap-4 sm:grid-cols-2 xl:grid-cols-3",
						children: tutors.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorCard, {
							tutor,
							countryLabels: labels
						}, tutor.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						className: "mt-5",
						icon: SearchX,
						title: "No tutors match these filters yet",
						description: "Try widening your filters, or clear them to see every verified tutor on DiaLearn.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: clear,
							children: "Clear filters"
						})
					}),
					pageCount > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: page <= 1,
								onClick: () => void navigate({
									to: "/tutors",
									search: (prev) => ({
										...prev,
										page: page - 1
									})
								}),
								children: "Previous"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted-foreground",
								children: [
									"Page ",
									page,
									" of ",
									pageCount
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: page >= pageCount,
								onClick: () => void navigate({
									to: "/tutors",
									search: (prev) => ({
										...prev,
										page: page + 1
									})
								}),
								children: "Next"
							})
						]
					}) : null
				]
			})]
		})
	})] });
}
//#endregion
export { TutorSearchPage as component };
