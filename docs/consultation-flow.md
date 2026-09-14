# Consultation requests

The public flow is `/book?service=tattoo|removal|cover-up|touch-up`. Existing tattoo detail buttons enter the same flow with `design=<tattoo-id>` for context.

Requests are date/time preferences in `America/Los_Angeles`, not reserved availability. No account or payment is required. Success appears only after database persistence. No confirmation email is sent automatically.

`POST /api/consultations` validates service, contact consent, lengths, email, date, and time preference. It saves a `Booking` with `sessionType: "Consultation Request"`, `status: "pending"`, and zero deposit. The unique request reference makes retries idempotent. Phone, message, service, city, and consent version are stored in the existing `notes` field as JSON. No database schema change is required.

Review the latest 100 requests at `/admin/consultations` (also linked from the existing booking manager). This separate inbox uses a real Firebase Google sign-in. Its GET endpoint verifies the Firebase ID token through Google's account lookup endpoint and requires a verified, enabled account matching the configured admin email. It does not trust the legacy localStorage admin flag.

Required deployment configuration:

- `DATABASE_URL`: working MongoDB database compatible with the existing Prisma schema and unique `Booking.ref` index.
- Existing `NEXT_PUBLIC_FIREBASE_*` values for Google sign-in.
- `ADMIN_EMAIL` (preferred), or existing `NEXT_PUBLIC_ADMIN_EMAIL`, identifies the owner. No fallback owner email is used for this inbox.
- Optional `FIREBASE_WEB_API_KEY` overrides the public Firebase API key for server-side account verification.

Confirm the actual provider, Los Angeles location, prices, contact channel, and operational privacy/retention policy before a public launch. The website does not invent these details. This implementation does not replace the legacy booking manager, its in-memory API, or the Firestore/localStorage flows; those still need separate access-control remediation before production use. Automated email, confirmed-slot scheduling, and request status management are not implemented in the new inbox.

Run `node scripts/check-consultations.mjs` for isolated validation and failure-path regression checks. This uses mocked database/auth/payment services and does not create live bookings. Also run the production build and ESLint on changed files.
