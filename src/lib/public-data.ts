import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { apiGet, useApiData } from "@/lib/api/data-client";
import type { Database } from "@/integrations/supabase/types";

/**
 * The API returns the same row shapes as the SQL functions and tables it wraps,
 * so the generated types stay the source of truth for both providers. This
 * keeps `PublicTutor` and friends unchanged for every consuming component.
 */
type FnReturns<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T]["Returns"];

/**
 * Read-only data layer for the public marketing site.
 *
 * Everything here comes from admin-managed tables or the public
 * `platform_settings` content group — never from hardcoded arrays.
 */

export type SettingsMap = Record<string, unknown>;

export function usePublicSettings() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: async (): Promise<SettingsMap> => {
      if (viaApi) return apiGet<SettingsMap>("/catalogue/settings");
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .eq("is_public", true);
      if (error) throw error;
      const map: SettingsMap = {};
      for (const row of data ?? []) map[row.key] = row.value;
      return map;
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-subject-facets"],
    queryFn: async () => {
      if (viaApi) return apiGet<FnReturns<"public_subject_facets">>("/catalogue/subjects");
      const { data, error } = await supabase.rpc("public_subject_facets");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurriculumFacets() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-curriculum-facets"],
    queryFn: async () => {
      if (viaApi) return apiGet<FnReturns<"public_curriculum_facets">>("/catalogue/curricula");
      const { data, error } = await supabase.rpc("public_curriculum_facets");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCountryFacets() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-country-facets"],
    queryFn: async () => {
      if (viaApi) return apiGet<FnReturns<"public_country_facets">>("/catalogue/countries");
      const { data, error } = await supabase.rpc("public_country_facets");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEducationLevels(curriculumId?: string) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-education-levels", curriculumId ?? "all"],
    queryFn: async () => {
      if (viaApi) {
        type Level = Pick<
          Database["public"]["Tables"]["education_levels"]["Row"],
          "id" | "name" | "code" | "curriculum_id" | "sort_order"
        >;
        const rows = await apiGet<Level[]>("/catalogue/education-levels");
        // The endpoint returns every level; the optional curriculum filter is
        // applied here, matching the old query's behaviour.
        return curriculumId ? rows.filter((r) => r.curriculum_id === curriculumId) : rows;
      }
      let query = supabase
        .from("education_levels")
        .select("id, name, code, curriculum_id, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (curriculumId) query = query.eq("curriculum_id", curriculumId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchSuggestions(term: string) {
  const viaApi = useApiData();
  const q = term.trim();
  return useQuery({
    queryKey: ["public-suggestions", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      if (viaApi) {
        return apiGet<FnReturns<"public_search_suggestions">>(
          `/catalogue/suggestions?q=${encodeURIComponent(q)}&limit=8`,
        );
      }
      const { data, error } = await supabase.rpc("public_search_suggestions", {
        p_q: q,
        p_limit: 8,
      });
      if (error) throw error;
      return data ?? [];
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-tutor-search", params],
    queryFn: async () => {
      const args: Record<string, unknown> = {
        p_sort: params.sort || "top_rated",
        p_limit: params.limit ?? 24,
        p_offset: params.offset ?? 0,
      };
      if (params.q?.trim()) args["p_q"] = params.q.trim();
      if (params.subject) args["p_subject"] = params.subject;
      if (params.curriculum) args["p_curriculum"] = params.curriculum;
      if (params.country) args["p_country"] = params.country;
      if (params.level) args["p_level"] = params.level;
      if (params.language) args["p_language"] = params.language;
      if (params.minRating != null) args["p_min_rating"] = params.minRating;
      if (params.maxPrice != null) args["p_max_price"] = params.maxPrice;

      if (viaApi) {
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
        const result = await apiGet<{ data: FnReturns<"public_tutor_search"> }>(
          `/catalogue/tutors?${qs.toString()}`,
        );
        return result.data;
      }
      const { data, error } = await supabase.rpc(
        "public_tutor_search",
        args as unknown as Parameters<typeof supabase.rpc<"public_tutor_search">>[1],
      );

      if (error) throw error;
      return data ?? [];
    },
  });
}

export type PublicTutor = NonNullable<Awaited<ReturnType<typeof useTutorSearch>>["data"]>[number];

export function useTutorDetail(tutorId: string) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-tutor-detail", tutorId],
    queryFn: async () => {
      if (viaApi) {
        return apiGet<FnReturns<"public_tutor_detail">[number]>(
          `/catalogue/tutors/${tutorId}`,
        ).catch(() => null);
      }
      const { data, error } = await supabase.rpc("public_tutor_detail", {
        p_tutor_id: tutorId,
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useTutorReviews(tutorId: string) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-tutor-reviews", tutorId],
    queryFn: async () => {
      if (viaApi)
        return apiGet<FnReturns<"public_tutor_reviews">>(
          `/catalogue/tutors/${tutorId}/reviews?limit=10`,
        );
      const { data, error } = await supabase.rpc("public_tutor_reviews", {
        p_tutor_id: tutorId,
        p_limit: 10,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ---------------- Money / commission (config-driven) ---------------- */

export function useCommissionExample() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-commission-example"],
    queryFn: async () => {
      if (viaApi) {
        type Commission = Pick<
          Database["public"]["Tables"]["commission_rules"]["Row"],
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
        const ex = await apiGet<Commission | null>("/catalogue/commission-example").catch(
          () => null,
        );
        return ex ? [ex] : [];
      }
      const { data, error } = await supabase
        .from("commission_rules")
        .select(
          "name, model, percentage, fixed_amount, platform_fee_percentage, platform_fee_fixed, currency, applies_to, priority",
        )
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCancellationPolicies() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-cancellation-policies"],
    queryFn: async () => {
      if (viaApi)
        return apiGet<
          Pick<
            Database["public"]["Tables"]["cancellation_policies"]["Row"],
            "name" | "hours_before" | "refund_percentage" | "description" | "is_default"
          >[]
        >("/catalogue/cancellation-policies");
      const { data, error } = await supabase
        .from("cancellation_policies")
        .select("name, hours_before, refund_percentage, description, is_default")
        .eq("is_active", true)
        .order("hours_before", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVerificationSteps() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["public-verification-steps"],
    queryFn: async () => {
      if (viaApi)
        return apiGet<
          Pick<
            Database["public"]["Tables"]["verification_steps"]["Row"],
            "id" | "name" | "description" | "applies_to" | "is_required" | "sort_order"
          >[]
        >("/catalogue/verification-steps");
      const { data, error } = await supabase
        .from("verification_steps")
        .select("id, name, description, applies_to, is_required, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ---------------- Formatting ---------------- */

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined,
) {
  if (amount === null || amount === undefined) return "Rate on request";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency ?? ""} ${amount}`.trim();
  }
}

export function countryLabel(code: string | null | undefined, labels: Record<string, string>) {
  if (!code) return "Location on request";
  return labels[code] ?? code;
}
