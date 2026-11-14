import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { $ as MapPin, $t as CalendarClock, _t as GraduationCap, in as BookOpen, k as Search, ln as BadgeCheck, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { d as usePublicSettings, f as useSearchSuggestions, n as formatMoney, r as settingList, t as countryLabel } from "./public-data-D6Ffdjlb.mjs";
import { t as LazyImage } from "./lazy-image-ELIP8TVW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TutorCard-B-Y7gjpy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Main marketplace search: live suggestions (subjects + curricula from the
* admin-managed lookup tables) and an admin-editable trending searches row.
*/
function SiteSearch({ initialTerm = "", showTrending = true }) {
	const navigate = useNavigate();
	const [term, setTerm] = (0, import_react.useState)(initialTerm);
	const [debounced, setDebounced] = (0, import_react.useState)(initialTerm);
	const [open, setOpen] = (0, import_react.useState)(false);
	const wrapperRef = (0, import_react.useRef)(null);
	const { data: settings } = usePublicSettings();
	const trending = settingList(settings, "content.trending_searches");
	const { data: suggestions = [], isFetching } = useSearchSuggestions(debounced);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setDebounced(term), 200);
		return () => clearTimeout(timer);
	}, [term]);
	(0, import_react.useEffect)(() => {
		function onClickOutside(event) {
			if (!wrapperRef.current?.contains(event.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);
	function goToSearch(query) {
		setOpen(false);
		navigate({
			to: "/tutors",
			search: { q: query.trim() }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: wrapperRef,
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					goToSearch(term);
				},
				className: "flex gap-2",
				role: "search",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: term,
						onChange: (event) => {
							setTerm(event.target.value);
							setOpen(true);
						},
						onFocus: () => setOpen(true),
						placeholder: "Search a subject or curriculum, e.g. IGCSE Maths",
						"aria-label": "Search subjects and curricula",
						className: "h-12 rounded-md bg-card pl-9 text-base"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "cta",
					className: "h-12 shrink-0 px-5",
					children: "Search"
				})]
			}), open && debounced.trim().length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-warm absolute inset-x-0 top-full z-30 mt-2 overflow-hidden p-1",
				children: suggestions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-muted-foreground",
					children: isFetching ? "Searching…" : "No matching subjects or curricula."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: suggestions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tutors",
					search: item.kind === "subject" ? { subject: item.id } : { curriculum: item.id },
					onClick: () => setOpen(false),
					className: "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-muted",
					children: [
						item.kind === "subject" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4 shrink-0 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-4 shrink-0 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate font-medium",
							children: item.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-muted-foreground capitalize",
							children: item.kind
						})
					]
				}) }, `${item.kind}-${item.id}`)) })
			}) : null]
		}), showTrending && trending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
				children: "Trending"
			}), trending.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tutors",
				search: { q: item },
				className: `rounded-full px-4 py-2 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${index % 2 === 0 ? "bg-primary-soft text-primary-deep" : "bg-secondary-soft text-secondary-foreground"}`,
				children: item
			}, item))]
		}) : null]
	});
}
var DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
function initials(name) {
	if (!name) return "DL";
	return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
/** Availability copy is derived from the tutor's admin/tutor-managed windows. */
function availabilityLabel(days) {
	const list = (days ?? []).filter((day) => Number.isInteger(day));
	if (list.length === 0) return null;
	const today = (/* @__PURE__ */ new Date()).getDay();
	if (list.includes(today)) return "Available today";
	for (let step = 1; step <= 7; step += 1) {
		const day = (today + step) % 7;
		if (list.includes(day)) return step === 1 ? "Available tomorrow" : `Available ${DAY_NAMES[day]}`;
	}
	return null;
}
function TutorCard({ tutor, countryLabels, className = "" }) {
	const rating = Number(tutor.rating_avg ?? 0);
	const lessons = Number(tutor.lessons_completed ?? 0);
	const availability = availabilityLabel(tutor.available_days);
	const primarySubject = tutor.subjects?.[0];
	const tags = [...tutor.curricula ?? [], ...tutor.levels ?? []].slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/tutors/$tutorId",
		params: { tutorId: tutor.id },
		"aria-label": `View profile for ${tutor.full_name ?? "DiaLearn tutor"}`,
		className: `card-interactive focus-ring group relative flex flex-col overflow-hidden ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary-soft to-secondary-soft",
			children: [
				tutor.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
					src: tutor.avatar_url,
					alt: tutor.full_name ?? "DiaLearn tutor",
					wrapperClassName: "absolute inset-0 h-full w-full bg-transparent",
					className: "transition-transform duration-300 ease-out group-hover:scale-[1.04]",
					sizes: "(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 92vw"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-primary-deep/70",
					children: initials(tutor.full_name)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: "absolute inset-x-0 bottom-0 h-16 media-overlay"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "chip-float absolute left-3 top-3 gap-1.5 text-primary-deep",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
						className: "size-4 text-primary",
						strokeWidth: 2
					}), "Verified"]
				}),
				availability ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "chip-float absolute right-3 top-3 gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, {
						className: "size-3.5 text-success",
						strokeWidth: 1.75
					}), availability]
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col p-4 md:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "truncate text-base font-semibold",
					children: tutor.full_name ?? "DiaLearn tutor"
				}),
				primarySubject ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 flex items-center gap-1.5 truncate text-sm text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
						className: "size-3.5 shrink-0",
						strokeWidth: 1.75
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [primarySubject, " tutor"]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
					children: [
						rating > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 font-medium text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 fill-secondary text-secondary" }),
								rating.toFixed(1),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: [
										"(",
										tutor.rating_count,
										")"
									]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "New to DiaLearn" }),
						lessons > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, {
									className: "size-3.5",
									strokeWidth: 1.75
								}),
								lessons,
								" ",
								lessons === 1 ? "lesson" : "lessons"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex min-w-0 items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								className: "size-3.5 shrink-0",
								strokeWidth: 1.75
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: countryLabel(tutor.country_code, countryLabels)
							})]
						})
					]
				}),
				tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-1.5",
					children: [tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "bg-primary-soft text-primary-deep",
						children: tag
					}, tag)), primarySubject ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "bg-secondary-soft text-secondary-foreground",
						children: primarySubject
					}) : null]
				}) : null,
				tutor.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 line-clamp-2 text-sm text-muted-foreground",
					children: tutor.headline
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm font-semibold",
						children: [formatMoney(tutor.hourly_rate, tutor.currency), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-normal text-muted-foreground",
							children: " / hour"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors duration-200 group-hover:bg-primary-deep",
						children: "View profile"
					})]
				}),
				tutor.years_experience ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [tutor.years_experience, " yrs teaching experience"]
				}) : null
			]
		})]
	});
}
/** Skeleton that mirrors the tutor card shape while results load. */
function TutorCardSkeleton({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `card-warm overflow-hidden ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[16/10] w-full rounded-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2 p-4 md:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/2" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-14 rounded-full" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-4/5" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-28 rounded-md" })]
				})
			]
		})]
	});
}
//#endregion
export { TutorCard as n, TutorCardSkeleton as r, SiteSearch as t };
