import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book._tutorId-DPI0BbQu.js
var $$splitComponentImporter = () => import("./book._tutorId-BjerM_if.mjs");
var Route = createFileRoute("/_authenticated/book/$tutorId")({
	validateSearch: (search) => {
		const next = {};
		if (typeof search["child"] === "string") next.child = search["child"];
		return next;
	},
	head: () => ({ meta: [
		{ title: "Book a class — DiaLearn parent portal" },
		{
			name: "description",
			content: "Pick a child, lesson length and an available time slot in your own timezone, then confirm the price before booking."
		},
		{
			property: "og:title",
			content: "Book a class — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "Timezone-aware booking with transparent, platform-managed pricing."
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
