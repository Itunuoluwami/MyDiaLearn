# DiaLearn database → module map

Which module owns which table and which database function, and how far each has
been migrated. This is the working index for the domain phase; the reasoning
behind the approach is in [`backend-architecture.md`](./backend-architecture.md)
and [`ARCHITECTURE_MIGRATION.md`](./ARCHITECTURE_MIGRATION.md).

**Status key:** ✅ implemented · 🟡 partial · ⬜ boundary declared, not built

---

## The approach, in one paragraph

DiaLearn's business rules live in PostgreSQL: 64 `SECURITY DEFINER` functions
and 123 RLS policies. Repositories **call** those functions rather than
reimplementing them, inside `PrismaService.withUser()`, which sets
`request.jwt.claims` for the transaction so `auth.uid()` resolves and every
policy applies. This is DECISION-3(c) from the audit — port incrementally,
keep the SQL working — and it is why the API gained validation, pagination,
auditing and rate limiting without any rule being restated in TypeScript.

Porting a function to TypeScript later is a change inside one repository
method. Its callers do not move, which is what keeps each domain independently
revertible.

---

## Modules

| #   | Module               | Status | Endpoints                               |
| --- | -------------------- | ------ | --------------------------------------- |
| 1   | Users                | ✅     | 7                                       |
| 2   | Parents              | ✅     | 4                                       |
| 3   | Students             | ✅     | 6                                       |
| 4   | Tutors               | ✅     | 21                                      |
| 5   | Tutor Agencies       | ⬜     | —                                       |
| 6   | Subjects / catalogue | ✅     | 10                                      |
| 7   | Tutor Qualifications | ✅     | via tutors `me/subjects`                |
| 8   | Tutor Verification   | 🟡     | tutor side built; admin review pending  |
| 9   | Tutor Availability   | ✅     | via tutors `me/availability`            |
| 10  | Bookings             | ✅     | 9                                       |
| 11  | Payments             | ✅     | 9                                       |
| 12  | Reviews / Ratings    | 🟡     | tutor-side + public reads               |
| 13  | Notifications        | ✅     | 4                                       |
| 14  | Messaging            | ⬜     | —                                       |
| 15  | Learning Progress    | 🟡     | `students/:id/progress`                 |
| 16  | Lesson Notes         | ⬜     | —                                       |
| 17  | Assignments          | ⬜     | —                                       |
| 18  | Learning Materials   | ⬜     | —                                       |
| 19  | Admin operations     | 🟡     | role/permission changes, booking cancel |
| 20  | Audit Logs           | 🟡     | written everywhere; no read API yet     |

Cross-cutting, all ✅: `PlatformSettingsService` (admin-managed operating
rules), `AuditService`, `NotificationDispatchService` (template-driven),
`PricingService` / `CommissionService` / `SettlementService`.

---

## Tables

### Identity and access

| Table                                                 | Module | Status        |
| ----------------------------------------------------- | ------ | ------------- |
| `auth.users`                                          | Auth   | ✅            |
| `auth.refresh_tokens`, `auth.verification_tokens`     | Auth   | ✅            |
| `profiles`                                            | Users  | ✅            |
| `user_roles`                                          | Users  | ✅            |
| `permissions`, `role_permissions`, `user_permissions` | Users  | ✅            |
| `admin_invitations`, `admin_action_requests`          | Admin  | ⬜            |
| `audit_logs`                                          | Audit  | 🟡 write-only |

### Catalogue

| Table                                       | Module           | Status                   |
| ------------------------------------------- | ---------------- | ------------------------ |
| `subjects`, `curricula`, `education_levels` | Catalogue        | ✅                       |
| `currencies`, `exchange_rates`              | Catalogue        | 🟡 currencies only       |
| `cancellation_policies`                     | Bookings         | 🟡 read via booking rows |
| `platform_settings`                         | PlatformSettings | ✅                       |

### Marketplace

| Table                                               | Module             | Status |
| --------------------------------------------------- | ------------------ | ------ |
| `tutors`                                            | Tutors             | ✅     |
| `tutor_subjects`                                    | Tutors             | ✅     |
| `tutor_documents`                                   | Tutor Verification | ✅     |
| `tutor_verification_progress`, `verification_steps` | Tutor Verification | ✅     |
| `availability_windows`                              | Tutor Availability | ✅     |
| `tutor_agencies`                                    | Agencies           | ⬜     |
| `students`                                          | Students           | ✅     |

### Delivery

| Table                | Module             | Status            |
| -------------------- | ------------------ | ----------------- |
| `bookings`           | Bookings           | ✅                |
| `class_sessions`     | Bookings           | ✅ open/start/end |
| `lesson_notes`       | Lesson Notes       | ⬜                |
| `assignments`        | Assignments        | ⬜                |
| `learning_resources` | Learning Materials | ⬜                |

### Money

| Table              | Module   | Status  |
| ------------------ | -------- | ------- |
| `payments`         | Payments | ✅      |
| `payouts`          | Payments | ✅      |
| `commission_rules` | Payments | ✅ read |

### Engagement

| Table                                                    | Module        | Status         |
| -------------------------------------------------------- | ------------- | -------------- |
| `ratings`, `rating_category_scores`, `rating_categories` | Reviews       | 🟡 public read |
| `conversations`, `conversation_participants`, `messages` | Messaging     | ⬜             |
| `notifications`                                          | Notifications | ✅             |
| `notification_templates`                                 | Notifications | ✅             |
| `disputes`                                               | Disputes      | ⬜             |

---

## Functions

### Wired

| Function                                                                           | Called by                                 |
| ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `my_permissions()`                                                                 | `UsersRepository`, `AuthService`          |
| `admin_set_user_roles()`, `admin_set_user_permission()`                            | `UsersRepository`                         |
| `booking_quote()`                                                                  | `PricingService`, `BookingsRepository`    |
| `pay_for_booking()`                                                                | `PaymentsRepository`                      |
| `tutor_available_slots()`                                                          | `BookingsRepository`                      |
| `tutor_respond_booking()`                                                          | `BookingsRepository`                      |
| `tutor_bookings()`                                                                 | `BookingsRepository`                      |
| `tutor_open_class()`, `tutor_start_class()`, `tutor_end_class()`                   | `BookingsRepository`                      |
| `admin_cancel_booking()`                                                           | `BookingsRepository`                      |
| `tutor_earnings_summary()`, `tutor_earnings_records()`                             | `SettlementService`, `PaymentsRepository` |
| `tutor_request_payout()`                                                           | `PaymentsRepository`                      |
| `notify_user()`                                                                    | `NotificationsRepository`                 |
| `public_subject_facets()`, `public_curriculum_facets()`, `public_country_facets()` | `CatalogueRepository`                     |
| `public_search_suggestions()`, `public_tutor_search()`                             | `CatalogueRepository`                     |
| `public_tutor_cards()`, `public_tutor_detail()`, `public_tutor_reviews()`          | `CatalogueRepository`                     |

### Not yet wired

`tutor_start_conversation()` · `my_conversations()` · `raise_dispute()` ·
`admin_resolve_dispute()` · `admin_dashboard_summary()` ·
`admin_report_summary()` · `admin_invite_create/redeem/revoke()` ·
`admin_request_action()` · `admin_review_action()` · `admin_execute_action()` ·
`admin_reject_payout()` · `clear_must_change_password()`

### Never called directly

Triggers and predicates — `prevent_booking_overlap()`,
`confirm_booking_on_payment()`, `handle_new_user()`,
`enforce_tutor_verification_rules()`, `enforce_admin_only_hourly_rate()`,
`enforce_user_role_guards()`, `can_access_booking()`, `can_access_student()`,
`owns_tutor()`, `in_conversation()`, `is_admin()`, `has_role()`,
`has_permission()`, `auth.uid()`.

These fire on their own or are invoked from inside policies. That is the point:
they cannot be forgotten by a caller, and they cannot be raced.

---

## Rules this phase preserves without restating

| Rule                                                       | Where it lives                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| No overlapping bookings                                    | `bookings_no_tutor_overlap` / `bookings_no_student_overlap` GiST exclusion constraints |
| A lesson confirms only on tutor acceptance **and** payment | `tutor_respond_booking()` + `confirm_booking_on_payment` trigger                       |
| Price fixed at quote time                                  | `bookings.total_amount`, written in the same transaction as the quote                  |
| Commission split                                           | `booking_quote()` reading `commission_rules`                                           |
| A tutor cannot set their own rate                          | `tutors_admin_only_hourly_rate` trigger                                                |
| Unverified tutors are not publicly bookable                | `enforce_tutor_verification_rules` trigger + the `public_*` functions                  |
| Nobody self-grants an admin role                           | `handle_new_user()` + `user_roles_guard` trigger + DTO enum                            |
| Row-level tenancy                                          | 123 RLS policies, reached through `withUser()`                                         |

---

## Tutor verification

The gate is enforced in the database: the `enforce_tutor_verification_rules`
trigger and the `public_*` functions both apply it, so an unverified tutor does
not appear in search and cannot be booked whichever client is asking. Verified
end to end — a freshly created tutor returns zero rows from
`public_tutor_cards()`.

The **tutor side** is now built: steps, documents and submission under
`/api/tutors/me/verification`. `tutor_submit_verification()` decides whether a
submission is complete, so "ready for review" has one definition.

The **admin side** — approve and reject — is not. It belongs with the admin
module, and until then those decisions still run through Supabase.

One guard worth recording: `storagePath` is caller-supplied, and the
`tutor_documents` RLS policy checks `tutor_id`, not the path inside it. Without
a namespace check a tutor could register a row pointing at another tutor's
document and have a signed URL minted for it. `TutorVerificationService`
requires the key to begin with the caller's own tutor id.

## A binding trap worth knowing

Prisma's `$queryRaw` binds a JavaScript array as a **PostgreSQL array literal**
(`{a,b}`). That is right for `uuid[]` or `app_role[]`, and wrong for **jsonb**,
where it fails with `invalid input syntax for type json`.

`tutors.qualifications`, `tutors.languages` and `tutors.education` read like
arrays but are jsonb columns, and need `JSON.stringify(...)::jsonb`. Check the
column type before choosing — `src/database/sql-array.ts` documents both cases.
