import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { $ as MapPin, Ft as Code, T as ShieldCheck, Y as MessagesSquare, Z as MessageCircle, _t as GraduationCap, ct as Leaf, dt as Landmark, h as TrendingUp, in as BookOpen, kt as Earth, pt as Infinity$1, un as Atom, ut as Languages, w as Sigma, xt as FlaskConical } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { c as useCountryFacets, d as usePublicSettings, g as useTutorSearch, i as settingMap, l as useCurriculumFacets, p as useSubjectFacets, t as countryLabel } from "./public-data-D6Ffdjlb.mjs";
import { n as TutorCard, r as TutorCardSkeleton } from "./TutorCard-B-Y7gjpy.mjs";
import { t as EmptyState } from "./empty-state-DoZtLjGq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrowseSections-D9_jgfDq.js
var import_jsx_runtime = require_jsx_runtime();
/** Icon names are stored on the admin-managed subjects table. */
var SUBJECT_ICONS = {
	Sigma,
	BookOpen,
	Atom,
	FlaskConical,
	Leaf,
	Infinity: Infinity$1,
	Languages,
	MessageCircle,
	MessagesSquare,
	Code,
	TrendingUp,
	Landmark,
	Globe2: Earth,
	GraduationCap
};
/** Mobile: horizontally scrollable row. Larger screens: grid. */
function ScrollRow({ children, cols = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 ${cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`,
		children
	});
}
var TILE = "w-[16.5rem] shrink-0 snap-start sm:w-auto";
function TileSkeletons({ count = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Array.from({ length: count }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: `${TILE} h-32 rounded-2xl` }, index)) });
}
function tutorCountLabel(count) {
	if (!count) return "Tutors joining soon";
	return `${count} ${count === 1 ? "tutor" : "tutors"}`;
}
function SubjectGrid({ limit }) {
	const { data, isLoading } = useSubjectFacets();
	const subjects = limit ? (data ?? []).slice(0, limit) : data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollRow, { children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileSkeletons, {}) : null, subjects.map((subject) => {
		const Icon = SUBJECT_ICONS[subject.icon ?? ""] ?? BookOpen;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/tutors",
			search: { subject: subject.id },
			className: `card-interactive focus-ring flex flex-col p-4 ${TILE}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary-soft/40 text-primary-deep shadow-soft",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-3 text-base font-semibold",
					children: subject.name
				}),
				subject.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: subject.category
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-3 text-xs font-medium text-primary",
					children: tutorCountLabel(Number(subject.tutor_count ?? 0))
				})
			]
		}, subject.id);
	})] });
}
function CurriculumGrid({ limit }) {
	const { data, isLoading } = useCurriculumFacets();
	const curricula = limit ? (data ?? []).slice(0, limit) : data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollRow, {
		cols: 3,
		children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileSkeletons, { count: 3 }) : null, curricula.map((curriculum) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/tutors",
			search: { curriculum: curriculum.id },
			className: `card-interactive focus-ring flex flex-col p-4 ${TILE}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-soft to-secondary-soft/40 text-secondary-foreground shadow-soft",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-3 text-base font-semibold",
					children: curriculum.name
				}),
				curriculum.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
					children: curriculum.description
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-3 text-xs font-medium text-primary",
					children: tutorCountLabel(Number(curriculum.tutor_count ?? 0))
				})
			]
		}, curriculum.id))]
	});
}
function LocationGrid() {
	const { data, isLoading } = useCountryFacets();
	const { data: settings } = usePublicSettings();
	const labels = settingMap(settings, "content.country_labels");
	const countries = data ?? [];
	if (!isLoading && countries.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Tutor locations appear here as tutors complete verification."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollRow, { children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileSkeletons, {}) : null, countries.map((country) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/tutors",
		search: { country: country.country_code },
		className: `card-interactive focus-ring flex items-center gap-3 p-4 ${TILE}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft to-accent-soft/40 text-accent shadow-soft",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block truncate text-base font-semibold",
				children: ["Tutors in ", countryLabel(country.country_code, labels)]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs font-medium text-primary",
				children: tutorCountLabel(Number(country.tutor_count ?? 0))
			})]
		})]
	}, country.country_code))] });
}
function TutorStrip({ sort = "top_rated", limit = 8 }) {
	const { data, isLoading } = useTutorSearch({
		sort,
		limit
	});
	const { data: settings } = usePublicSettings();
	const labels = settingMap(settings, "content.country_labels");
	const tutors = data ?? [];
	if (!isLoading && tutors.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: ShieldCheck,
		title: "Our first tutors are being verified",
		description: "Every DiaLearn tutor completes identity, qualification and teaching checks before they are listed. Tutor profiles appear here as they clear verification."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollRow, { children: isLoading ? Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorCardSkeleton, { className: TILE }, index)) : tutors.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorCard, {
		tutor,
		countryLabels: labels,
		className: TILE
	}, tutor.id)) });
}
//#endregion
export { TutorStrip as i, LocationGrid as n, SubjectGrid as r, CurriculumGrid as t };
