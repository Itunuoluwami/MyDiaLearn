import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/data-client";
import type { VerificationStatus } from "@/lib/tutor-data";

/**
 * Agency portal data.
 *
 * Agencies were built on the NestJS API and have no Supabase implementation
 * to fall back to, so every hook here needs the API; under the Supabase
 * provider they report that plainly rather than failing obscurely.
 */

const API_ONLY = "Agency accounts need the DiaLearn API. Switch the app to the NestJS provider.";

/* ------------------------------------------------------------------ */
/* Types (API shapes; money stays a string, as the API sends it)       */
/* ------------------------------------------------------------------ */

export interface AgencyVerificationStep {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_required: boolean;
  sort_order: number;
  status: VerificationStatus | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
}

export interface Agency {
  id: string;
  name: string;
  registrationNumber: string | null;
  countryCode: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  about: string | null;
  logoUrl: string | null;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  revenueSharePercentage: string;
  submittedAt: string | null;
  createdAt: string;
  verificationSteps?: AgencyVerificationStep[];
}

export interface AgencyEarnings {
  currency: string;
  grossRevenue: string;
  agencyEarnings: string;
  pendingEarnings: string;
  paidOut: string;
  pendingPayouts: string;
  availableBalance: string;
  revenueSharePercentage: string;
  minimumPayout: string;
  nextPayoutDate: string | null;
  scheduleLabel: string | null;
}

export interface AgencyDashboard {
  agency: Agency;
  counts: {
    tutors_total: number;
    tutors_verified: number;
    tutors_in_review: number;
    tutors_listed: number;
    upcoming_bookings: number;
    completed_lessons: number;
  };
  earnings: AgencyEarnings | null;
}

export interface AgencyTutor {
  tutorId: string;
  fullName: string | null;
  email: string | null;
  headline: string | null;
  verificationStatus: VerificationStatus;
  isListed: boolean;
  onboardingStep: number | null;
  submittedAt: string | null;
  lessonsCompleted: number;
  grossAmount: string;
  tutorEarnings: string;
  agencyEarnings: string;
  tutorPaidOut: string;
  currency: string;
}

export interface AgencyBooking {
  id: string;
  tutor_id: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  status: string;
  currency: string;
  total_amount: string;
  created_at: string;
  tutor_name: string | null;
  student_first_name: string | null;
  subject_name: string | null;
  paid: boolean;
}

export interface AgencyPayout {
  id: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  notes: string | null;
  requested_at: string;
  settled_at: string | null;
}

/** The managed tutor's profile, as GET /tutors/me returns it. */
export interface ManagedTutorProfile {
  id: string;
  headline: string | null;
  biography: string | null;
  qualifications: string[];
  languages: string[];
  education: string[];
  hourlyRate: string | null;
  currency: string;
  yearsExperience: number | null;
  introVideoUrl: string | null;
  timezone: string;
  verificationStatus: VerificationStatus;
  isListed: boolean;
  methodology: string | null;
  teachingContext: string | null;
}

export interface ManagedTutorSubject {
  id: string;
  subjectId: string;
  subjectName: string | null;
  educationLevelId: string | null;
  levelName: string | null;
}

export interface ManagedTutorWindow {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

export interface ManagedTutorStep {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  status: VerificationStatus | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
}

/* ------------------------------------------------------------------ */
/* The agency                                                          */
/* ------------------------------------------------------------------ */

export function useAgency() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agency", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<Agency>("/agencies/me");
    },
  });
}

export function useAgencyDashboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agency-dashboard", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<AgencyDashboard>("/agencies/me/dashboard");
    },
  });
}

export function useUpdateAgency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Agency, "id" | "verificationStatus">>) => {
      return apiPatch<Agency>("/agencies/me", patch);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agency"] });
      void queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
    },
  });
}

export function useSubmitAgencyVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiPost<{ status: VerificationStatus }>("/agencies/me/verification/submit", {});
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agency"] });
      void queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Tutors                                                              */
/* ------------------------------------------------------------------ */

export function useAgencyTutors() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agency-tutors", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<AgencyTutor[]>("/agencies/me/tutors");
    },
  });
}

export function useAddAgencyTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { fullName: string; email: string; timezone?: string }) => {
      return apiPost<{ tutorId: string; emailed: boolean }>("/agencies/me/tutors", input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agency-tutors"] });
      void queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
    },
  });
}

export function useRemoveAgencyTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tutorId: string) => {
      await apiDelete(`/agencies/me/tutors/${tutorId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agency-tutors"] });
      void queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
    },
  });
}

const tutorBase = (tutorId: string) => `/agencies/me/tutors/${tutorId}`;

function useManagedInvalidate(tutorId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["agency-tutor", tutorId] });
    void queryClient.invalidateQueries({ queryKey: ["agency-tutors"] });
  };
}

export function useManagedTutorProfile(tutorId: string) {
  return useQuery({
    queryKey: ["agency-tutor", tutorId, "profile"],
    queryFn: async () => {
      return apiGet<ManagedTutorProfile>(`${tutorBase(tutorId)}/profile`);
    },
  });
}

export function useUpdateManagedTutorProfile(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      return apiPatch<ManagedTutorProfile>(`${tutorBase(tutorId)}/profile`, patch);
    },
    onSuccess: invalidate,
  });
}

export function useManagedTutorSubjects(tutorId: string) {
  return useQuery({
    queryKey: ["agency-tutor", tutorId, "subjects"],
    queryFn: async () => {
      return apiGet<ManagedTutorSubject[]>(`${tutorBase(tutorId)}/subjects`);
    },
  });
}

export function useAddManagedTutorSubject(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (input: { subjectId: string; educationLevelId: string | null }) => {
      await apiPost(`${tutorBase(tutorId)}/subjects`, {
        subjectId: input.subjectId,
        ...(input.educationLevelId ? { educationLevelId: input.educationLevelId } : {}),
      });
    },
    onSuccess: invalidate,
  });
}

export function useRemoveManagedTutorSubject(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(`${tutorBase(tutorId)}/subjects/${id}`);
    },
    onSuccess: invalidate,
  });
}

export function useManagedTutorAvailability(tutorId: string) {
  return useQuery({
    queryKey: ["agency-tutor", tutorId, "availability"],
    queryFn: async () => {
      return apiGet<ManagedTutorWindow[]>(`${tutorBase(tutorId)}/availability`);
    },
  });
}

export function useAddManagedTutorWindow(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (input: { dayOfWeek: number; startTime: string; endTime: string }) => {
      await apiPost(`${tutorBase(tutorId)}/availability`, input);
    },
    onSuccess: invalidate,
  });
}

export function useSetManagedTutorWindow(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (input: { id: string; isActive: boolean }) => {
      await apiPatch(`${tutorBase(tutorId)}/availability/${input.id}`, {
        isActive: input.isActive,
      });
    },
    onSuccess: invalidate,
  });
}

export function useDeleteManagedTutorWindow(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(`${tutorBase(tutorId)}/availability/${id}`);
    },
    onSuccess: invalidate,
  });
}

export function useManagedTutorVerification(tutorId: string) {
  return useQuery({
    queryKey: ["agency-tutor", tutorId, "verification"],
    queryFn: async () => {
      return apiGet<ManagedTutorStep[]>(`${tutorBase(tutorId)}/verification`);
    },
  });
}

export function useSubmitManagedTutorVerification(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async () => {
      return apiPost<{ status: VerificationStatus }>(
        `${tutorBase(tutorId)}/verification/submit`,
        {},
      );
    },
    onSuccess: invalidate,
  });
}

/* ------------------------------------------------------------------ */
/* Verification documents                                              */
/* ------------------------------------------------------------------ */
//
// An agency could submit a tutor for verification but had no way to attach
// anything, so a reviewer opened the queue to a tutor with no identity
// document and no qualifications. These mirror the tutor's own document
// hooks, against the agency-scoped endpoints.

export interface ManagedTutorDocument {
  id: string;
  stepId: string | null;
  label: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  reviewerNotes: string | null;
  createdAt: string;
}

export function useManagedTutorDocuments(tutorId: string) {
  return useQuery({
    queryKey: ["agency-tutor", tutorId, "documents"],
    queryFn: async () => {
      return apiGet<ManagedTutorDocument[]>(`${tutorBase(tutorId)}/documents`);
    },
  });
}

export function useUploadManagedTutorDocument(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (input: { file: File; label: string; stepId?: string | null }) => {
      // Two steps, as on the tutor's own page: the bytes go to the managed
      // tutor's storage folder first, then the returned path is recorded
      // against the step. A failed record can be retried without re-sending.
      const form = new FormData();
      form.append("file", input.file);
      const uploaded = await apiPost<{
        storagePath: string;
        mimeType: string | null;
        sizeBytes: number;
      }>(`${tutorBase(tutorId)}/documents/upload`, form);

      await apiPost(`${tutorBase(tutorId)}/documents`, {
        label: input.label,
        storagePath: uploaded.storagePath,
        sizeBytes: uploaded.sizeBytes,
        ...(input.stepId ? { stepId: input.stepId } : {}),
        ...(uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}),
      });
    },
    onSuccess: invalidate,
  });
}

export function useDeleteManagedTutorDocument(tutorId: string) {
  const invalidate = useManagedInvalidate(tutorId);
  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiDelete(`${tutorBase(tutorId)}/documents/${documentId}`);
    },
    onSuccess: invalidate,
  });
}

/* ------------------------------------------------------------------ */
/* Bookings and money                                                  */
/* ------------------------------------------------------------------ */

export function useAgencyBookings(params: { status: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agency-bookings", user?.id, params.status],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<AgencyBooking[]>(`/agencies/me/bookings?status=${params.status}`);
    },
  });
}

export function useAgencyEarnings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agency-earnings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<AgencyEarnings | null>("/agencies/me/earnings");
    },
  });
}

export function useAgencyPayouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agency-payouts", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<AgencyPayout[]>("/agencies/me/payouts");
    },
  });
}

export function useRequestAgencyPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      return apiPost<{ id: string }>("/agencies/me/payouts", { amount });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agency-payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["agency-earnings"] });
      void queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
    },
  });
}
