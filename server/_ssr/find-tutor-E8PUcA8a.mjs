import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/find-tutor-E8PUcA8a.js
var $$splitComponentImporter = () => import("./find-tutor-Dp-KEpTd.mjs");
var Route = createFileRoute("/_authenticated/find-tutor")({
	validateSearch: (search) => {
		const next = {};
		if (typeof search["child"] === "string") next.child = search["child"];
		if (typeof search["subject"] === "string") next.subject = search["subject"];
		return next;
	},
	head: () => ({ meta: [
		{ title: "Find a tutor — DiaLearn parent portal" },
		{
			name: "description",
			content: "Search verified African tutors by subject, curriculum, level, country, language, rating and hourly rate for each of your children."
		},
		{
			property: "og:title",
			content: "Find a tutor — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "Filter verified tutors and book the right match for your child."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
