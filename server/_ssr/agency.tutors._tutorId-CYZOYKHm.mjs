import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.tutors._tutorId-CYZOYKHm.js
var $$splitComponentImporter = () => import("./agency.tutors._tutorId-CHSt1bgj.mjs");
var Route = createFileRoute("/_authenticated/agency/tutors/$tutorId")({
	head: () => ({ meta: [{ title: "Manage tutor — DiaLearn agency" }, {
		name: "description",
		content: "Complete a tutor's profile, subjects, availability and verification."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
