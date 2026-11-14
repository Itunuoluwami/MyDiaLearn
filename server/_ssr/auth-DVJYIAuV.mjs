//#region node_modules/.nitro/vite/services/ssr/assets/auth-DVJYIAuV.js
var ApiError = class extends Error {
	status;
	code;
	details;
	requestId;
	constructor(status, code, message, details, requestId) {
		super(message);
		this.status = status;
		this.code = code;
		this.details = details;
		this.requestId = requestId;
		this.name = "ApiError";
	}
};
/** Trailing slashes produce `//api/...`, which some proxies treat as a new path. */
var API_BASE_URL = "".replace(/\/+$/, "");
function isApiConfigured() {
	return API_BASE_URL.length > 0;
}
async function apiRequest(path, options = {}) {
	const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
	const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
	let response;
	try {
		response = await fetch(url, {
			method: options.method ?? "GET",
			credentials: "include",
			headers: {
				...options.body !== void 0 && !isForm ? { "Content-Type": "application/json" } : {},
				...options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}
			},
			...options.body !== void 0 ? { body: isForm ? options.body : JSON.stringify(options.body) } : {},
			...options.signal ? { signal: options.signal } : {}
		});
	} catch (cause) {
		throw new ApiError(0, "NETWORK_ERROR", "network request failed", cause);
	}
	if (response.status === 204) return void 0;
	const text = await response.text();
	const payload = text ? safeJson(text) : void 0;
	if (!response.ok) {
		const body = payload;
		throw new ApiError(response.status, body?.code ?? "HTTP_ERROR", body?.message ?? `Request failed with status ${response.status}`, body?.details, body?.requestId);
	}
	return payload;
}
function safeJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return;
	}
}
/**
* NestJS-backed authentication.
*
* Session handling differs from Supabase in one deliberate way. Supabase keeps
* the whole session in localStorage, where any XSS can read it. Here the access
* token lives only in this module's memory and the refresh token is an httpOnly
* cookie the page cannot touch.
*
* The user-visible behaviour is identical: a reload still lands you signed in,
* because `restore()` asks the server to refresh using the cookie. What changes
* is that stealing a long-lived session now requires more than reading
* localStorage.
*/
var currentSession = null;
var refreshTimer;
var restorePromise = null;
var listeners = /* @__PURE__ */ new Set();
function emit(event) {
	for (const listener of [...listeners]) try {
		listener(event, currentSession);
	} catch {}
}
/**
* Adapts the API's session to the shape the existing UI reads.
*
* Only the fields actually consumed are populated — `access_token` for the
* bearer middleware, and `user.id` / `user.email` for the auth context and
* route guards. The cast covers the rest of Supabase's Session type, which
* describes provider details that have no meaning here.
*/
function toSession(api) {
	const user = {
		id: api.user.id,
		email: api.user.email,
		aud: "authenticated",
		role: api.user.primaryRole ?? "authenticated",
		email_confirmed_at: api.user.emailVerified ? (/* @__PURE__ */ new Date()).toISOString() : null,
		app_metadata: {
			provider: "nestjs",
			roles: api.user.roles
		},
		user_metadata: {
			full_name: api.user.fullName,
			roles: api.user.roles,
			permissions: api.user.permissions,
			must_change_password: api.user.mustChangePassword
		},
		created_at: ""
	};
	return {
		access_token: api.accessToken,
		token_type: "bearer",
		expires_in: api.expiresIn,
		expires_at: api.expiresAt,
		refresh_token: "",
		user
	};
}
function scheduleRefresh(session) {
	if (refreshTimer) clearTimeout(refreshTimer);
	const expiresInMs = (session.expires_in ?? 900) * 1e3;
	const delay = Math.max(5e3, expiresInMs - 6e4);
	refreshTimer = setTimeout(() => {
		refreshSession("TOKEN_REFRESHED");
	}, delay);
}
function clearSession() {
	currentSession = null;
	if (refreshTimer) clearTimeout(refreshTimer);
	refreshTimer = void 0;
}
/**
* Only the server saying "no" ends a session.
*
* A refresh can fail for two very different reasons, and treating them alike
* is what signed people out mid-task. A 401 or 403 is an answer: the cookie is
* expired, absent or revoked, and the session is genuinely over — the normal
* case for a signed-out visitor, not worth surfacing. Anything else is the
* request not arriving: the API down or restarting, the network dropping, or a
* 500 because the database pool could not start a transaction in time, which
* this deployment produces under load because every request takes an
* interactive transaction against a remote database.
*
* In that second case the session is probably still perfectly valid, so the
* tokens are kept, the scheduled refresh is left to try again, and nobody is
* thrown back to the sign-in screen over a blip.
*/
function endsTheSession(error) {
	if (error instanceof ApiError) return error.status === 401 || error.status === 403;
	return false;
}
async function refreshSession(event) {
	try {
		currentSession = toSession(await apiRequest("/auth/refresh", {
			method: "POST",
			body: {}
		}));
		scheduleRefresh(currentSession);
		emit(event);
		return true;
	} catch (error) {
		if (!endsTheSession(error)) {
			if (currentSession) scheduleRetry();
			return false;
		}
		const had = currentSession !== null;
		clearSession();
		if (had) emit("SIGNED_OUT");
		return false;
	}
}
/** Comes back sooner than a full token lifetime after a failure that was not a verdict. */
function scheduleRetry() {
	if (refreshTimer) clearTimeout(refreshTimer);
	refreshTimer = setTimeout(() => {
		refreshSession("TOKEN_REFRESHED");
	}, 3e4);
}
/**
* Restores a session on first use, once per page load.
*
* Every entry point — getSession, getUser, the auth context — funnels through
* the same promise so a page with several of them makes one refresh call
* rather than a burst.
*/
function restore() {
	if (!restorePromise) restorePromise = refreshSession("INITIAL_SESSION").then(() => void 0);
	return restorePromise;
}
/**
* Translates API errors into the messages the existing screens already parse.
*
* The forms branch on substrings — "invalid login", "confirm", "already
* registered", "network" — because that is how they read Supabase errors.
* Matching that vocabulary is what keeps the UI byte-for-byte unchanged while
* the provider underneath swaps out.
*/
function toAuthError(error) {
	if (!(error instanceof ApiError)) return { message: "network request failed" };
	if (error.code === "NETWORK_ERROR") return {
		message: "network request failed",
		status: 0,
		code: error.code
	};
	const details = error.details;
	if (error.status === 403 && details?.reason === "email_not_verified") return {
		message: "Please confirm your email address before signing in.",
		status: 403,
		code: error.code
	};
	if (error.status === 401 && error.code === "UNAUTHENTICATED") return {
		message: `Invalid login credentials. ${error.message}`,
		status: 401,
		code: error.code
	};
	if (error.status === 409) return {
		message: "A user with this email is already registered.",
		status: 409,
		code: error.code
	};
	if (error.status === 429) return {
		message: "Too many requests. Please try again later.",
		status: 429,
		code: error.code
	};
	if (error.status === 400 && /expired|link/i.test(error.message)) return {
		message: `This token has expired. ${error.message}`,
		status: 400,
		code: error.code
	};
	return {
		message: error.message,
		status: error.status,
		code: error.code
	};
}
var nestAuthClient = {
	provider: "nestjs",
	async getSession() {
		await restore();
		return {
			data: { session: currentSession },
			error: null
		};
	},
	async getUser() {
		await restore();
		return {
			data: { user: currentSession?.user ?? null },
			error: null
		};
	},
	async signInWithPassword(credentials) {
		try {
			currentSession = toSession(await apiRequest("/auth/login", {
				method: "POST",
				body: credentials
			}));
			restorePromise = Promise.resolve();
			scheduleRefresh(currentSession);
			emit("SIGNED_IN");
			return {
				data: {
					session: currentSession,
					user: currentSession.user
				},
				error: null
			};
		} catch (error) {
			return {
				data: {
					session: null,
					user: null
				},
				error: toAuthError(error)
			};
		}
	},
	async signUp(input) {
		try {
			const meta = input.options?.data ?? {};
			await apiRequest("/auth/register", {
				method: "POST",
				body: {
					email: input.email,
					password: input.password,
					fullName: meta.full_name ?? "",
					firstName: meta.first_name ?? void 0,
					lastName: meta.last_name ?? void 0,
					phone: meta.phone ?? void 0,
					countryCode: meta.country_code ?? void 0,
					timezone: meta.timezone ?? "UTC",
					role: meta.role ?? "student"
				}
			});
			return {
				data: {
					user: null,
					session: null
				},
				error: null
			};
		} catch (error) {
			return {
				data: {
					user: null,
					session: null
				},
				error: toAuthError(error)
			};
		}
	},
	async signOut() {
		try {
			await apiRequest("/auth/logout", {
				method: "POST",
				body: {}
			});
		} catch {}
		clearSession();
		restorePromise = Promise.resolve();
		emit("SIGNED_OUT");
		return {
			data: void 0,
			error: null
		};
	},
	async resetPasswordForEmail(email) {
		try {
			await apiRequest("/auth/password/forgot", {
				method: "POST",
				body: { email }
			});
			return {
				data: void 0,
				error: null
			};
		} catch (error) {
			return {
				data: void 0,
				error: toAuthError(error)
			};
		}
	},
	async updateUser(attributes) {
		if (!attributes.password) return {
			data: void 0,
			error: { message: "Only password updates are supported." }
		};
		const token = new URLSearchParams(window.location.search).get("token");
		try {
			if (token) await apiRequest("/auth/password/reset", {
				method: "POST",
				body: {
					token,
					password: attributes.password
				}
			});
			else return {
				data: void 0,
				error: { message: "This reset link has expired or is missing its token. Please request a new one." }
			};
			emit("USER_UPDATED");
			return {
				data: void 0,
				error: null
			};
		} catch (error) {
			return {
				data: void 0,
				error: toAuthError(error)
			};
		}
	},
	async verifyEmail(token) {
		try {
			await apiRequest("/auth/email/verify", {
				method: "POST",
				body: { token }
			});
			return {
				data: void 0,
				error: null
			};
		} catch (error) {
			return {
				data: void 0,
				error: toAuthError(error)
			};
		}
	},
	async resend(input) {
		try {
			await apiRequest("/auth/email/resend", {
				method: "POST",
				body: { email: input.email }
			});
			return {
				data: void 0,
				error: null
			};
		} catch (error) {
			return {
				data: void 0,
				error: toAuthError(error)
			};
		}
	},
	onAuthStateChange(callback) {
		listeners.add(callback);
		restore().then(() => callback("INITIAL_SESSION", currentSession));
		return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
	}
};
/**
* The application's authentication client.
*
* There is one provider. The Supabase adapter and the VITE_AUTH_PROVIDER
* switch that chose between them are gone — the migration is finished, and a
* switch with one position is just a way to fail later.
*
* Every screen imports this rather than calling an HTTP client directly, so
* the shape the UI depends on stays in one place.
*/
if (!isApiConfigured()) throw new Error("VITE_API_BASE_URL must be set to the DiaLearn API origin, for example http://localhost:3000/api.");
var authClient = nestAuthClient;
authClient.provider;
//#endregion
export { isApiConfigured as a, authClient as i, ApiError as n, apiRequest as r, API_BASE_URL as t };
