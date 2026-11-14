import { r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-data-D6Ffdjlb.js
function usePublicSettings() {
	return useQuery({
		queryKey: ["public-settings"],
		queryFn: async () => {
			return apiGet("/catalogue/settings");
		},
		staleTime: 3e5
	});
}
function settingText(settings, key, fallback = "") {
	const value = settings?.[key];
	return typeof value === "string" && value.trim() ? value : fallback;
}
function settingList(settings, key) {
	const value = settings?.[key];
	return Array.isArray(value) ? value : [];
}
function settingMap(settings, key) {
	const value = settings?.[key];
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	return value;
}
function useSubjectFacets() {
	return useQuery({
		queryKey: ["public-subject-facets"],
		queryFn: async () => {
			return apiGet("/catalogue/subjects");
		},
		staleTime: 3e5
	});
}
function useCurriculumFacets() {
	return useQuery({
		queryKey: ["public-curriculum-facets"],
		queryFn: async () => {
			return apiGet("/catalogue/curricula");
		},
		staleTime: 3e5
	});
}
function useCountryFacets() {
	return useQuery({
		queryKey: ["public-country-facets"],
		queryFn: async () => {
			return apiGet("/catalogue/countries");
		},
		staleTime: 3e5
	});
}
function useEducationLevels(curriculumId) {
	return useQuery({
		queryKey: ["public-education-levels", curriculumId ?? "all"],
		queryFn: async () => {
			const rows = await apiGet("/catalogue/education-levels");
			return curriculumId ? rows.filter((r) => r.curriculum_id === curriculumId) : rows;
		},
		staleTime: 3e5
	});
}
function useSearchSuggestions(term) {
	const q = term.trim();
	return useQuery({
		queryKey: ["public-suggestions", q],
		enabled: q.length >= 2,
		queryFn: async () => {
			return apiGet(`/catalogue/suggestions?q=${encodeURIComponent(q)}&limit=8`);
		},
		staleTime: 6e4
	});
}
function useTutorSearch(params) {
	return useQuery({
		queryKey: ["public-tutor-search", params],
		queryFn: async () => {
			const limit = params.limit ?? 24;
			const page = Math.floor((params.offset ?? 0) / limit) + 1;
			const qs = new URLSearchParams();
			qs.set("sort", params.sort || "top_rated");
			qs.set("limit", String(limit));
			qs.set("page", String(page));
			if (params.q?.trim()) qs.set("q", params.q.trim());
			if (params.subject) qs.set("subjectId", params.subject);
			if (params.curriculum) qs.set("curriculumId", params.curriculum);
			if (params.country) qs.set("country", params.country);
			if (params.level) qs.set("educationLevelId", params.level);
			if (params.language) qs.set("language", params.language);
			if (params.minRating != null) qs.set("minRating", String(params.minRating));
			if (params.maxPrice != null) qs.set("maxPrice", String(params.maxPrice));
			return (await apiGet(`/catalogue/tutors?${qs.toString()}`)).data;
		}
	});
}
function useTutorDetail(tutorId) {
	return useQuery({
		queryKey: ["public-tutor-detail", tutorId],
		queryFn: async () => {
			return apiGet(`/catalogue/tutors/${tutorId}`).catch(() => null);
		}
	});
}
function useTutorReviews(tutorId) {
	return useQuery({
		queryKey: ["public-tutor-reviews", tutorId],
		queryFn: async () => {
			return apiGet(`/catalogue/tutors/${tutorId}/reviews?limit=10`);
		}
	});
}
function useCommissionExample() {
	return useQuery({
		queryKey: ["public-commission-example"],
		queryFn: async () => {
			const ex = await apiGet("/catalogue/commission-example").catch(() => null);
			return ex ? [ex] : [];
		},
		staleTime: 3e5
	});
}
function useCancellationPolicies() {
	return useQuery({
		queryKey: ["public-cancellation-policies"],
		queryFn: async () => {
			return apiGet("/catalogue/cancellation-policies");
		},
		staleTime: 3e5
	});
}
function useVerificationSteps() {
	return useQuery({
		queryKey: ["public-verification-steps"],
		queryFn: async () => {
			return apiGet("/catalogue/verification-steps");
		},
		staleTime: 3e5
	});
}
/**
* PostgreSQL `numeric` arrives over JSON as a decimal string, so every money
* field from the API is a string. This accepts either, the way the parent-side
* `formatMoney` already did.
*/
function formatMoney(amount, currency) {
	if (amount === null || amount === void 0 || amount === "") return "Rate on request";
	const value = typeof amount === "string" ? Number(amount) : amount;
	if (!Number.isFinite(value)) return "Rate on request";
	try {
		return new Intl.NumberFormat(void 0, {
			style: "currency",
			currency: currency || "USD",
			maximumFractionDigits: 0
		}).format(value);
	} catch {
		return `${currency ?? ""} ${value}`.trim();
	}
}
function countryLabel(code, labels) {
	if (!code) return "Location on request";
	return labels[code] ?? code;
}
//#endregion
export { useVerificationSteps as _, settingText as a, useCountryFacets as c, usePublicSettings as d, useSearchSuggestions as f, useTutorSearch as g, useTutorReviews as h, settingMap as i, useCurriculumFacets as l, useTutorDetail as m, formatMoney as n, useCancellationPolicies as o, useSubjectFacets as p, settingList as r, useCommissionExample as s, countryLabel as t, useEducationLevels as u };
