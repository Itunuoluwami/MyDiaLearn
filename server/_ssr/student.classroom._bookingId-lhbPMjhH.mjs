import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.classroom._bookingId-lhbPMjhH.js
var $$splitComponentImporter = () => import("./student.classroom._bookingId-DWkE6D-0.mjs");
var Route = createFileRoute("/_authenticated/student/classroom/$bookingId")({
	head: () => ({ meta: [{ title: "Live Classroom — DiaLearn Student Portal" }, {
		name: "description",
		content: "Join your live class with your tutor."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
