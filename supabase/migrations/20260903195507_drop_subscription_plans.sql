-- Remove the subscription/package plan catalog shipped in Phase 4C.
--
-- Per direct correction: "There is no billing or subscription plan for this
-- project" — parents/students pay per lesson only. The Phase 4C migration
-- (20260903185941_subscription_plans.sql) already flagged this table as
-- having no consumer yet; it's now confirmed to not belong to the business
-- model at all, so it's dropped rather than left dormant. The matching
-- SubscriptionPlansPanel admin UI is removed from admin.settings.tsx in the
-- same pass. Nothing else in the schema references subscription_plans or
-- billing_interval (grep-confirmed before writing this migration), so this
-- is a clean drop.

drop table if exists public.subscription_plans;
drop type if exists public.billing_interval;
