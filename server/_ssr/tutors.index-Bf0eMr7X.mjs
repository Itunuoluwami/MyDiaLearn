import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutors.index-Bf0eMr7X.js
var $$splitComponentImporter = () => import("./tutors.index-_s2tRngw.mjs");
function text(value) {
	return typeof value === "string" && value.trim() ? value : void 0;
}
function numeric(value) {
	const parsed = typeof value === "number" ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : void 0;
}
var Route = createFileRoute("/tutors/")({
	validateSearch: (search) => ({
		q: text(search["q"]),
		subject: text(search["subject"]),
		curriculum: text(search["curriculum"]),
		country: text(search["country"]),
		level: text(search["level"]),
		language: text(search["language"]),
		minRating: numeric(search["minRating"]),
		maxPrice: numeric(search["maxPrice"]),
		sort: text(search["sort"]),
		page: numeric(search["page"])
	}),
	head: () => ({ meta: [
		{ title: "Find a verified tutor — DiaLearn" },
		{
			name: "description",
			content: "Search verified African tutors by subject, curriculum, country, language, rating and hourly rate, then book a one-to-one lesson."
		},
		{
			property: "og:title",
			content: "Find a verified tutor — DiaLearn"
		},
		{
			property: "og:description",
			content: "Filter verified African tutors by subject, curriculum, country, rating and price."
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
