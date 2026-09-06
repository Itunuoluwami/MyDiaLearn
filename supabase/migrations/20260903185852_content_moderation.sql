-- Admin Portal Phase 4B: content moderation (flagged messages & reviews).
--
-- Reviews already have `ratings.is_published` and an admin-bypass RLS
-- policy (ratings_update_own, from 20260826121449...sql) — moderating a
-- review is just flipping that column, no schema change needed there.
--
-- Messages have no moderation column or admin write access at all today
-- (only "Participants read/send messages" policies exist, no UPDATE grant).
-- This adds is_hidden + an admin-only UPDATE policy, and — so hiding a
-- message actually does something, not just marks a row — useMessages() in
-- src/lib/tutor-workspace.ts is patched in the same commit to filter it out.
--
-- Profile moderation ("flagged profiles") reuses the existing suspend
-- action on profiles.is_active from admin.users.tsx (Phase 1) rather than
-- duplicating it here.

insert into public.permissions (key, label, description, category) values
  ('admin.moderation', 'Moderate content', 'Hide messages and unpublish reviews', 'admin');

insert into public.role_permissions (role, permission_key) values
  ('admin', 'admin.moderation');

alter table public.messages add column is_hidden boolean not null default false;
alter table public.messages add column hidden_reason text;

grant update on public.messages to authenticated;

create policy "messages_admin_moderate" on public.messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
