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
| 2   | Parents              | ⬜     | —                                       |
| 3   | Students             | ⬜     | —                                       |
| 4   | Tutors               | ⬜     | —                                       |
| 5   | Tutor Agencies       | ⬜     | —                                       |
| 6   | Subjects / catalogue | ✅     | 10                                      |
| 7   | Tutor Qualifications | ⬜     | —                                       |
| 8   | Tutor Verification   | ⬜     | —                                       |
| 9   | Tutor Availability   | 🟡     | via bookings `available-slots`          |
| 10  | Bookings             | ✅     | 9                                       |
| 11  | Payments             | ✅     | 9                                       |
| 12  | Reviews / Ratings    | 🟡     | public reviews via catalogue            |
| 13  | Notifications        | ✅     | 4                                       |
| 14  | Messaging            | ⬜     | —                                       |
| 15  | Learning Progress    | ⬜     | —                                       |
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

| Table                                               | Module             | Status              |
| --------------------------------------------------- | ------------------ | ------------------- |
| `tutors`                                            | Tutors             | 🟡 public read only |
| `tutor_subjects`                                    | Tutors             | ⬜                  |
| `tutor_documents`                                   | Tutor Verification | ⬜                  |
| `tutor_verification_progress`, `verification_steps` | Tutor Verification | ⬜                  |
| `availability_windows`                              | Tutor Availability | 🟡 read via slots   |
| `tutor_agencies`                                    | Agencies           | ⬜                  |
| `students`                                          | Students           | ⬜                  |

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

`parent_dashboard_summary()` · `parent_child_progress()` · `tutor_students()` ·
`tutor_reviews()` · `tutor_rating_summary()` · `tutor_rating_categories()` ·
`tutor_dashboard_summary()` · `tutor_submit_verification()` ·
`ensure_tutor_record()` · `tutor_start_conversation()` · `my_conversations()` ·
`raise_dispute()` · `admin_resolve_dispute()` · `admin_dashboard_summary()` ·
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

## The rule that is not yet enforced by this API

**Tutor verification gating.** The database enforces it — the
`enforce_tutor_verification_rules` trigger and the publicly-visible tutor
functions both apply it, so an unverified tutor does not appear in search and
cannot be booked. What does not exist yet is the _Tutor Verification module_:
the endpoints for submitting documents, and for an admin to approve or reject.
Until it is built, that workflow still runs through Supabase.

It is listed here rather than silently omitted because the brief asked
specifically that this rule not be frontend-only. It is not — it is in the
database — but this API does not yet expose the decision path.
