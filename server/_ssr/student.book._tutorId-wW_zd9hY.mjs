import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.book._tutorId-wW_zd9hY.js
var $$splitComponentImporter = () => import("./student.book._tutorId-CSMWiK_s.mjs");
var Route = createFileRoute("/_authenticated/student/book/$tutorId")({
	head: () => ({ meta: [{ title: "Book a class — DiaLearn Student Portal" }, {
		name: "description",
		content: "Pick a subject, lesson length and time to book a class with your tutor."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
