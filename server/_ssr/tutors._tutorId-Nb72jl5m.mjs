import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutors._tutorId-Nb72jl5m.js
var $$splitComponentImporter = () => import("./tutors._tutorId-CSy0gl-p.mjs");
var Route = createFileRoute("/tutors/$tutorId")({
	head: () => ({ meta: [
		{ title: "Tutor profile — DiaLearn" },
		{
			name: "description",
			content: "Read a DiaLearn tutor's biography, qualifications, subjects, reviews and hourly rate, then book a one-to-one lesson."
		},
		{
			property: "og:title",
			content: "Tutor profile — DiaLearn"
		},
		{
			property: "og:description",
			content: "Biography, qualifications, subjects, reviews and hourly rate for a DiaLearn tutor."
		},
		{
			property: "og:type",
			content: "profile"
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
