import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api/data-client";
import type {
  CancellationPoliciesRow,
  CommissionRulesRow,
  EducationLevelsRow,
  PublicCountryFacetsResult,
  PublicCurriculumFacetsResult,
  PublicSearchSuggestionsResult,
  PublicSubjectFacetsResult,
  PublicTutorDetailResult,
  PublicTutorReviewsResult,
  PublicTutorSearchResult,
  VerificationStepsRow,
} from "@/lib/database-types";

/**
 * The API returns the same row shapes as the SQL functions and tables it wraps,
 * so the generated types stay the source of truth for both providers. This
 * keeps `PublicTutor` and friends unchanged for every consuming component.
 */

/**
 * Read-only data layer for the public marketing site.
 *
 * Everything here comes from admin-managed tables or the public
 * `platform_settings` content group — never from hardcoded arrays.
 */

export type SettingsMap = Record<string, unknown>;

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: async (): Promise<SettingsMap> => {
      return apiGet<SettingsMap>("/catalogue/settings");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function settingText(settings: SettingsMap | undefined, key: string, fallback = "") {
  const value = settings?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function settingList<T>(settings: SettingsMap | undefined, key: string): T[] {
  const value = settings?.[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

export function settingMap(settings: SettingsMap | undefined, key: string): Record<string, string> {
  const value = settings?.[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, string>;
}

export interface PersonaOption {
  key: string;
  label: string;
  description: string;
  cta: string;
  href: string;
}

export interface TrustSignal {
  title: string;
  body: string;
}

/* ---------------- Browse facets ---------------- */

export function useSubjectFacets() {
  return useQuery({
    queryKey: ["public-subject-facets"],
    queryFn: async () => {
      return apiGet<PublicSubjectFacetsResult>("/catalogue/subjects");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurriculumFacets() {
  return useQuery({
    queryKey: ["public-curriculum-facets"],
    queryFn: async () => {
      return apiGet<PublicCurriculumFacetsResult>("/catalogue/curricula");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCountryFacets() {
  return useQuery({
    queryKey: ["public-country-facets"],
    queryFn: async () => {
      return apiGet<PublicCountryFacetsResult>("/catalogue/countries");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEducationLevels(curriculumId?: string) {
  return useQuery({
    queryKey: ["public-education-levels", curriculumId ?? "all"],
    queryFn: async () => {
      type Level = Pick<
        EducationLevelsRow,
        "id" | "name" | "code" | "curriculum_id" | "sort_order"
      >;
      const rows = await apiGet<Level[]>("/catalogue/education-levels");
      // The endpoint returns every level; the optional curriculum filter is
      // applied here, matching the old query's behaviour.
      return curriculumId ? rows.filter((r) => r.curriculum_id === curriculumId) : rows;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchSuggestions(term: string) {
  const q = term.trim();
  return useQuery({
    queryKey: ["public-suggestions", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      return apiGet<PublicSearchSuggestionsResult>(
        `/catalogue/suggestions?q=${encodeURIComponent(q)}&limit=8`,
      );
    },
    staleTime: 60 * 1000,
  });
}

/* ---------------- Tutor search ---------------- */

export interface TutorSearchParams {
  q?: string | undefined;
  subject?: string | undefined;
  curriculum?: string | undefined;
  country?: string | undefined;
  level?: string | undefined;
  language?: string | undefined;
  minRating?: number | undefined;
  maxPrice?: number | undefined;
  sort?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export function useTutorSearch(params: TutorSearchParams) {
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
      const result = await apiGet<{ data: PublicTutorSearchResult }>(
        `/catalogue/tutors?${qs.toString()}`,
      );
      return result.data;
    },
  });
}

export type PublicTutor = NonNullable<Awaited<ReturnType<typeof useTutorSearch>>["data"]>[number];

export function useTutorDetail(tutorId: string) {
  return useQuery({
    queryKey: ["public-tutor-detail", tutorId],
    queryFn: async () => {
      return apiGet<PublicTutorDetailResult[number]>(`/catalogue/tutors/${tutorId}`).catch(
        () => null,
      );
    },
  });
}

export function useTutorReviews(tutorId: string) {
  return useQuery({
    queryKey: ["public-tutor-reviews", tutorId],
    queryFn: async () => {
      return apiGet<PublicTutorReviewsResult>(`/catalogue/tutors/${tutorId}/reviews?limit=10`);
    },
  });
}

/* ---------------- Money / commission (config-driven) ---------------- */

export function useCommissionExample() {
  return useQuery({
    queryKey: ["public-commission-example"],
    queryFn: async () => {
      type Commission = Pick<
        CommissionRulesRow,
        | "name"
        | "model"
        | "percentage"
        | "fixed_amount"
        | "platform_fee_percentage"
        | "platform_fee_fixed"
        | "currency"
        | "applies_to"
        | "priority"
      >;
      const ex = await apiGet<Commission | null>("/catalogue/commission-example").catch(() => null);
      return ex ? [ex] : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCancellationPolicies() {
  return useQuery({
    queryKey: ["public-cancellation-policies"],
    queryFn: async () => {
      return apiGet<
        Pick<
          CancellationPoliciesRow,
          "name" | "hours_before" | "refund_percentage" | "description" | "is_default"
        >[]
      >("/catalogue/cancellation-policies");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVerificationSteps() {
  return useQuery({
    queryKey: ["public-verification-steps"],
    queryFn: async () => {
      return apiGet<
        Pick<
          VerificationStepsRow,
          "id" | "name" | "description" | "applies_to" | "is_required" | "sort_order"
        >[]
      >("/catalogue/verification-steps");
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ---------------- Formatting ---------------- */

/**
 * PostgreSQL `numeric` arrives over JSON as a decimal string, so every money
 * field from the API is a string. This accepts either, the way the parent-side
 * `formatMoney` already did.
 */
export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
) {
  if (amount === null || amount === undefined || amount === "") return "Rate on request";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "Rate on request";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency ?? ""} ${value}`.trim();
  }
}

export function countryLabel(code: string | null | undefined, labels: Record<string, string>) {
  if (!code) return "Location on request";
  return labels[code] ?? code;
}
