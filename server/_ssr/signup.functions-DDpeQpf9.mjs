import { d as serverSignupSchema } from "./auth-validation-BByE_cjn.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signup.functions-DDpeQpf9.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Server-side revalidation of the sign-up payload. The client form validates for
* UX; this is the authoritative check before we call the auth provider.
* The password is validated but never returned, logged or persisted here.
*/
var validateSignup_createServerFn_handler = createServerRpc({
	id: "8b6f9bebffbfd87bbc54fc0f1e5dd8ce1e7c8a02c08d7ce43e1abe4e378b95e7",
	name: "validateSignup",
	filename: "src/lib/signup.functions.ts"
}, (opts) => validateSignup.__executeServer(opts));
var validateSignup = createServerFn({ method: "POST" }).inputValidator((input) => input).handler(validateSignup_createServerFn_handler, async ({ data }) => {
	const parsed = serverSignupSchema.safeParse(data);
	if (!parsed.success) {
		const fieldErrors = {};
		for (const issue of parsed.error.issues) {
			const key = String(issue.path[0] ?? "form");
			if (!fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			ok: false,
			fieldErrors
		};
	}
	const value = parsed.data;
	return {
		ok: true,
		normalized: {
			email: value.email,
			fullName: `${value.firstName} ${value.lastName}`.replace(/\s+/g, " ").trim(),
			firstName: value.firstName,
			lastName: value.lastName,
			phone: `${value.dialCode}${value.phone}`,
			countryCode: value.countryCode,
			role: value.role,
			timezone: value.timezone && value.timezone.length ? value.timezone : "UTC"
		}
	};
});
//#endregion
export { validateSignup_createServerFn_handler };
