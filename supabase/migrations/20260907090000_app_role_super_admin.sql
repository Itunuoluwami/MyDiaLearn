-- Super admin tier, step 1 of 2: the enum value, and nothing else.
--
-- Postgres forbids using an enum value in the same transaction that added it,
-- and the Supabase CLI wraps each migration file in one transaction. So this
-- file contains the ALTER TYPE alone. Every helper, policy, check constraint
-- and seed that mentions 'super_admin' lives in
-- 20260907090100_super_admin_helpers.sql and later.
--
-- Placement after 'admin' is cosmetic — nothing in the schema orders by
-- app_role — but it keeps \dT readable.

alter type public.app_role add value if not exists 'super_admin' after 'admin';
