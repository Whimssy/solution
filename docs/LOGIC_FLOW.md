# Madeasy — Logic Flow & Implementation Plan (SRS format)

## 1. Introduction

### 1.1 Purpose
This document translates the SRS into implementation-focused logic flows, expected outcomes, API endpoints, data models, and acceptance criteria for Madeasy v1.0. It's intended for developers and testers to convert requirements into code.

### 1.2 Scope
Covers core flows: User registration/auth (OTP + email), Cleaner onboarding & verification, Search & booking, Payment processing, SMS referral, and Admin dashboard workflows.

## 2. Overall Architecture (High level)
- Frontend: React (web), mobile-first components.
- Backend: Node.js + Express (or chosen backend). REST API.
- Database: PostgreSQL.
- External services: Twilio (SMS), Pesapal (payments), optional Identity provider for OTP/email.

## 3. Functional Flows (detailed)
Each flow below lists steps, backend responsibilities, key API endpoints, and expected outcomes.

### 3.1 User Registration & Authentication
Goal: Allow users to register and log in (OTP for phone, normal email+password flow).

Flow (OTP):
1. User enters phone number in frontend form.
2. Frontend POST /api/auth/send-otp { phone }
   - Backend: validate phone format, create short-lived OTP (6 digits), store OTP hash + expiry in `auth_otps` table, send via Twilio.
3. Frontend enters OTP -> POST /api/auth/verify-otp { phone, otp }
   - Backend: verify OTP hash & expiry, create/find `users` record, generate JWT session token, return user profile + token.

Flow (Email + Password):
1. Frontend POST /api/auth/register { name, email, password }
2. Backend: validate, hash password, create `users` row, send verification email (optional).
3. Login via POST /api/auth/login { email, password } -> return JWT.

Expected outcomes:
- Successful registration returns 200 + token and user object.
- Failed OTP verification returns 400 with clear error codes.

Acceptance tests:
- Valid phone -> OTP sent -> verify -> token returned.
- Expired OTP -> 400 with `otp_expired`.

### 3.2 Cleaner Onboarding & Verification
Goal: Collect cleaner profile, admin verification.

Flow:
1. Cleaner fills onboarding form -> POST /api/cleaners/apply { profile, documents }
   - Backend: store `cleaners` row with status `pending`, store attachments (S3 or DB link).
2. Admin views pending cleaners GET /api/admin/cleaners?status=pending
3. Admin approves/rejects via PUT /api/admin/cleaners/:id/verify { approved, notes }
   - On approve -> `cleaners.status = approved` -> send SMS/email to cleaner.

Expected outcomes:
- Cleaner status moves: pending -> approved/rejected.
- Approved cleaners become searchable.

Acceptance tests:
- Submit valid profile -> appears to admin.
- Admin approves -> cleaner searchable.

### 3.3 Search & Booking Flow
Goal: Users can search, view profiles, book, and receive notifications.

Flow (Search):
1. Frontend GET /api/cleaners?location=...&rating=...&available=...
   - Backend: query `cleaners` where status=approved + filters.
2. Frontend GET /api/cleaners/:id -> cleaner profile + reviews.

Flow (Booking):
1. User selects slot -> POST /api/bookings { userId, cleanerId, datetime, duration, address, paymentMethod }
   - Backend: create `bookings` row with status `pending_payment` (or `confirmed` if offline payment), reserve slot (optimistic locking or availability calendar), notify cleaner via SMS.
2. If payment required -> frontend initiates payment process (see payment flow).
3. On success -> update booking.status = `confirmed` or `paid`, send confirmation to user & cleaner.

Booking state machine (simplified):
- pending_payment -> paid -> completed
- pending_payment -> cancelled
- confirmed -> in_progress -> completed -> reviewed

Expected outcomes:
- Booking created and stored reliably.
- Conflicting bookings prevented for same cleaner/time.

Acceptance tests:
- Create booking, confirm cannot double-book same slot.
- Booking notifications delivered (mock Twilio in tests).

### 3.4 Payment Processing
Goal: Integrate Pesapal (or chosen gateway) to support M-Pesa and card payments.

Flow (MPesa):
1. Frontend requests payment token from backend -> POST /api/payments/initiate { bookingId, method: 'mpesa' }
2. Backend calls Pesapal API to initiate STK Push; store payment record pending.
3. Pesapal returns callback to backend POST /api/payments/callback -> backend verifies & updates `payments` and `bookings` rows.

Flow (Card):
- Similar flow: initiate payment, redirect/handle token, receive webhook/callback, update booking.

Expected outcomes:
- Payment record linked to booking; status transitions to `paid` on success.
- Secure handling (no raw card data in our DB unless PCI compliant).

Acceptance tests:
- Simulate Pesapal responses; booking status updates to `paid`.

### 3.5 Referral (SMS-based)
Goal: Generate referral link + SMS to selected contacts.

Flow:
1. Frontend asks permission to access contacts (mobile); user selects contacts.
2. Frontend POST /api/referrals/send { cleanerId, contacts: [phone], messageOptional }
3. Backend: generate referral token/link (referral_code), store in `referrals` table, call Twilio to send message with referral link.
4. Track clicks: frontend receives referral link visits -> GET /referrals/:code -> record `clicks` and eventual conversion.

Expected outcomes:
- SMS delivered with link; `referrals` row created.
- Referral conversions tracked.

Acceptance tests:
- Attempt send with invalid numbers -> proper error.
- Click tracking increments metrics.

### 3.6 Admin Dashboard Workflows
Goal: Admin can manage cleaners, bookings, payments and view reports.

APIs (examples):
- GET /api/admin/cleaners
- PUT /api/admin/cleaners/:id/verify
- GET /api/admin/bookings?from=&to=&status=
- GET /api/admin/reports/transactions

Expected outcomes:
- Admin pages show up-to-date data; actions (approve/reject) update state and notify users.

## 4. Data Model (simplified)

Tables (Postgres):

users
- id (uuid)
- name
- phone
- email
- password_hash
- role (user|cleaner|admin)
- created_at

cleaners
- id
- user_id (FK users)
- bio
- services (json)
- location (geo / text)
- rating
- status (pending|approved|rejected|suspended)
- documents (json or urls)
- created_at

bookings
- id
- user_id
- cleaner_id
- datetime_start (timestamp)
- duration_hours
- address
- status (pending_payment|confirmed|in_progress|completed|cancelled)
- total_amount
- payment_id (FK payments)
- created_at

payments
- id
- booking_id
- provider (pesapal)
- provider_ref
- amount
- status (pending|paid|failed)
- metadata (json)
- created_at

referrals
- id
- referrer_user_id
- cleaner_id
- code (short unique)
- recipients (json array of phone)
- sent_at
- clicks_count
- conversions_count

reviews
- id
- booking_id
- user_id
- cleaner_id
- rating
- comment
- created_at

auth_otps (ephemeral)
- id
- phone
- otp_hash
- expires_at

## 5. API Endpoints (summary)

Authentication:
- POST /api/auth/send-otp { phone }
- POST /api/auth/verify-otp { phone, otp }
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password }

Cleaner:
- POST /api/cleaners/apply { profile }
- GET /api/cleaners?filters
- GET /api/cleaners/:id

Booking:
- POST /api/bookings { booking payload }
- GET /api/bookings/:id
- GET /api/bookings?userId=
- PUT /api/bookings/:id/cancel

Payments:
- POST /api/payments/initiate { bookingId, method }
- POST /api/payments/callback (webhook)
- GET /api/payments/:id

Referrals:
- POST /api/referrals/send { cleanerId, contacts }
- GET /referrals/:code (landing)

Admin:
- GET /api/admin/cleaners
- PUT /api/admin/cleaners/:id/verify
- GET /api/admin/bookings

## 6. Frontend Component Mapping & UI Flow
Map major screens -> components and responsibilities.

Screens / Components:
- `Auth/*` : OTP form, Email login, Register
- `CleanerSearch` : filter panel, `CleanerCard` list -> `CleanerProfile`
- `BookingForm` : calendar/slot picker, address form, summary
- `PaymentForm` : initiates payment and shows status
- `Dashboard` : user summary (bookings, stats)
- `ReferralSystem` : contact picker, send UI, send status
- `Admin/*` : admin list, verify cleaner modal, reports

Interaction notes:
- All buttons use accessible patterns: keyboard focus, aria-labels, and full-width on small screens.
- Quick actions should use `role="button"` with keyboard handlers (Enter/Space) for div cards.

## 7. Error Handling & Edge Cases
- Race conditions on booking: use DB transactions and availability locks; reject conflicting bookings with 409 status.
- Payment webhook not received: implement polling/compensation or idempotency checks.
- SMS failures: store attempt logs and surface retry options.
- Local storage read failures (Dashboard uses localStorage fallback): catch JSON parse errors.

## 8. Security & Compliance
- Secure JWT tokens, short refresh strategy.
- Hash passwords with bcrypt (or Argon2).
- Do not store raw card data; use payment provider tokens.
- Sanitize inputs; use parameterized DB queries.
- Make sure logging does not include PII.

## 9. Acceptance Criteria & Tests
For each feature include automated and manual tests.

Examples:
- Registration: unit+integration test that OTP sent -> verify -> token.
- Booking: integration test creating booking and ensuring no double-booking.
- Payments: mock payment provider -> booking status becomes `paid`.
- Referrals: mock Twilio -> `referrals` row created and SMS call verified.

## 10. Implementation Roadmap (milestones)
1. Core backend skeleton + auth (OTP) + DB schema (weeks 1–2).
2. Cleaner onboarding + admin verification (week 2).
3. Search & booking engine + basic frontend (week 3).
4. Payment integration (Pesapal) and referral (Twilio) (week 4).
5. Admin reports, QA, and polish (week 5).

## 11. Developer Notes & Suggested File Layout
```
/server
  /controllers
  /models
  /routes
  /services (payments, sms)
  index.js
/client (existing React app)
  /src/components
  /src/pages
  /src/services (api client)
/docs
  LOGIC_FLOW.md
```

## 12. Next concrete options (pick one)
- I can scaffold the Express backend (routes, controllers, models) and add a minimal in-memory store and example endpoints.
- I can generate an OpenAPI (YAML/JSON) spec for the endpoints above.
- I can convert functional requirements into a prioritized issue backlog (`docs/TODO.md`).

---

If you want, I can now scaffold the backend skeleton and create an OpenAPI spec. Which next step do you want me to take? (reply with `scaffold backend`, `generate openapi`, `create backlog`, or `other` and describe.)