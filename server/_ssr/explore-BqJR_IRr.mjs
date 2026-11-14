import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { t as SiteSearch } from "./TutorCard-B-Y7gjpy.mjs";
import { i as TutorStrip, n as LocationGrid, r as SubjectGrid, t as CurriculumGrid } from "./BrowseSections-D9_jgfDq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-BqJR_IRr.js
var import_jsx_runtime = require_jsx_runtime();
var SORTS = [
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
	}
];
function ExplorePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "band-hero border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-site py-8 md:py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Explore DiaLearn"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "display-section mt-2",
					children: "Four ways in, one tutor search"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lead mt-3 max-w-2xl",
					children: "Browse by subject, curriculum, tutor location or straight through tutor profiles. Every path opens the same verified tutor results."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 max-w-2xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteSearch, {})
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-site py-8 md:py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "subjects",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "flex h-auto w-full flex-wrap justify-start gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "subjects",
							className: "min-h-11",
							children: "By subject"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "curricula",
							className: "min-h-11",
							children: "By curriculum"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "locations",
							className: "min-h-11",
							children: "By location"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "tutors",
							className: "min-h-11",
							children: "Tutors"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "subjects",
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-2xl",
							children: "Explore by subject"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-muted-foreground",
							children: "Subjects are managed by the DiaLearn team. Tutor counts update as tutors are verified."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectGrid, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "curricula",
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-2xl",
							children: "Explore by curriculum"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-muted-foreground",
							children: "Match the exam board your child sits — British, American, IB, Canadian or national."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurriculumGrid, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "locations",
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-2xl",
							children: "Explore by location"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-muted-foreground",
							children: "Browse the countries our tutors teach from."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationGrid, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "tutors",
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section text-2xl",
							children: "Explore tutors"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-muted-foreground",
							children: "The same tutor list as search results, presented as a browsable catalogue."
						}),
						SORTS.map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg",
								children: sort.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorStrip, {
									sort: sort.value,
									limit: 8
								})
							})]
						}, sort.value))
					]
				})
			]
		})
	})] });
}
//#endregion
export { ExplorePage as component };
