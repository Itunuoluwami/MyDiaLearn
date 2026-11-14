//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CAnc53sL.js
var manifest = { "8b6f9bebffbfd87bbc54fc0f1e5dd8ce1e7c8a02c08d7ce43e1abe4e378b95e7": {
	functionName: "validateSignup_createServerFn_handler",
	importer: () => import("./_ssr/signup.functions-DDpeQpf9.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
