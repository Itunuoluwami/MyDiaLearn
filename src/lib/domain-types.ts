/**
 * DiaLearn's domain vocabulary.
 *
 * These mirror the PostgreSQL enums the database defines. They were previously
 * read out of the generated Supabase types; the app owns them now, because
 * they describe DiaLearn's own domain and should not depend on a client that
 * is no longer part of the stack.
 *
 * They must stay in step with the database. The enums live in
 * supabase/migrations and are listed in docs/database-migration-map.md; the
 * API rejects an unknown value either way, so a drift shows up as a 400 rather
 * than silent corruption.
 */

export type AppRole = "student" | "parent" | "tutor" | "agency" | "admin" | "super_admin";

export type AssignmentStatus = "draft" | "assigned" | "submitted" | "reviewed";

export type BookingStatus =
  "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "rejected" | "no_show";

export type CommissionModel = "percentage" | "fixed" | "tiered";

export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export type PaymentStatus =
  "pending" | "processing" | "paid" | "failed" | "refunded" | "partially_refunded";

export type PayoutStatus = "requested" | "processing" | "paid" | "rejected" | "cancelled";

export type ResourceType = "pdf" | "video" | "link" | "document" | "image" | "other";

export type VerificationStatus =
  "unverified" | "pending" | "in_review" | "verified" | "rejected" | "suspended";

export type DisputeStatus = "open" | "investigating" | "resolved" | "dismissed";

export type DisputeCategory = "payment" | "conduct" | "quality" | "scheduling" | "other";

export type AdminInvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export type AdminRequestStatus = "pending" | "approved" | "rejected" | "executed" | "failed";
