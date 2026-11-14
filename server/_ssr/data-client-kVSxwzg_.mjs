import { a as isApiConfigured, i as authClient, r as apiRequest, t as API_BASE_URL } from "./auth-DVJYIAuV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/data-client-kVSxwzg_.js
/**
* Whether the frontend's data reads should go to the NestJS API.
*
* True when the app is running on the nestjs auth provider AND the API base URL
* is configured. When false, the data hooks fall back to Supabase — so a
* deployment can still be flipped back by env alone, and nothing hard-depends
* on the API being reachable at build time.
*/
function useApiData() {
	return authClient.provider === "nestjs" && isApiConfigured();
}
/**
* GET a public or authenticated endpoint, attaching the access token when the
* caller has a session. Public catalogue routes work without one.
*/
async function apiGet(path) {
	let accessToken = null;
	try {
		const { data } = await authClient.getSession();
		accessToken = data.session?.access_token ?? null;
	} catch {}
	return apiRequest(path, accessToken ? { accessToken } : {});
}
async function apiPost(path, body) {
	let accessToken = null;
	try {
		const { data } = await authClient.getSession();
		accessToken = data.session?.access_token ?? null;
	} catch {}
	return apiRequest(path, {
		method: "POST",
		body,
		...accessToken ? { accessToken } : {}
	});
}
async function apiPatch(path, body) {
	let accessToken = null;
	try {
		const { data } = await authClient.getSession();
		accessToken = data.session?.access_token ?? null;
	} catch {}
	return apiRequest(path, {
		method: "PATCH",
		body,
		...accessToken ? { accessToken } : {}
	});
}
async function apiDelete(path) {
	let accessToken = null;
	try {
		const { data } = await authClient.getSession();
		accessToken = data.session?.access_token ?? null;
	} catch {}
	return apiRequest(path, {
		method: "DELETE",
		...accessToken ? { accessToken } : {}
	});
}
/**
* Uploads one file to the API's storage. The server picks the key; the caller
* then creates the record that points at it, as with Supabase storage.
*/
async function apiUpload(kind, file) {
	const form = new FormData();
	form.append("file", file);
	return apiPost(`/files/${kind}`, form);
}
/**
* Opens a stored file in a new tab through a short-lived signed link.
*
* The tab is opened before the request so popup blockers still see a direct
* response to the click; it is pointed at the link once the API has checked
* access.
*/
async function openApiFile(urlEndpoint) {
	const tab = typeof window !== "undefined" ? window.open("", "_blank") : null;
	try {
		const { url } = await apiGet(urlEndpoint);
		const absolute = new URL(url, API_BASE_URL || window.location.origin).toString();
		if (tab) {
			tab.opener = null;
			tab.location.href = absolute;
		} else window.open(absolute, "_blank", "noopener,noreferrer");
	} catch (error) {
		tab?.close();
		throw error;
	}
}
/**
* Marker for a file held by the API. Rows from the API carry no storage key,
* so screens that test `storage_path` for "has a file" get this in its place,
* and the open/delete helpers recognise it. Never sent to the server.
*/
var API_FILE_PREFIX = "api-file:";
//#endregion
export { apiPost as a, useApiData as c, apiPatch as i, apiDelete as n, apiUpload as o, apiGet as r, openApiFile as s, API_FILE_PREFIX as t };
