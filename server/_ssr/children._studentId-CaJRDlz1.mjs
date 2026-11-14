import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/children._studentId-CaJRDlz1.js
var $$splitComponentImporter = () => import("./children._studentId-ChKBIUXk.mjs");
var Route = createFileRoute("/_authenticated/children/$studentId")({
	head: () => ({ meta: [
		{ title: "Child profile — DiaLearn parent portal" },
		{
			name: "description",
			content: "Review one child's tutors, upcoming classes, learning progress, attendance, class history and tutor notes."
		},
		{
			property: "og:title",
			content: "Child profile — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "A focused view of one learner's education on DiaLearn."
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
