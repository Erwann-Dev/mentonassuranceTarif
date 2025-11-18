<!-- daa9cc7e-3b42-434d-9f0f-6bc8368167d4 e449365a-45d5-451a-b73f-32e5a37a71c1 -->
# Implementation Plan — Email-only Moto Quote MVP (Resend + AdonisJS backend)

## Scope

- Collect all fields per screenshots and brief.
- Validate (client + backend) with FR rules.
- Derive fields (permit seniority, vehicle age, claim recency) client-side.
- Submit payload to an AdonisJS v6 backend that sends an email through Resend. No pricing/CRM/DB for MVP (DB can be added later).

## Tech stack

- Frontend: React 18 + TypeScript, Vite, TailwindCSS, React Hook Form + Zod, i18next.
- Backend: AdonisJS v6 (TypeScript) REST API. Resend SDK for email delivery. Health, CORS, rate-limit middleware.
- Catalog: Single source `moto_full.json` bundled or fetched at runtime; client-side indexes for Make → Models → Variants (cc/years). Intelligent dependent selects with search.
- Reference: Resend service and SDK [Resend — Email for developers](https://resend.com/home).

## Repository structure

- `apps/frontend/` React app
- `apps/backend/` Adonis v6 API
- Shared types: `packages/types/`

## Data contracts

- Frontend → backend `POST /email`:
```json
{
  "quoteId":"uuid",
  "locale":"fr-FR",
  "vehicle":{"make":"PIAGGIO","model":"CALESSINO","cc":125,"firstRegistrationDate":"2024-12-12"},
  "location":{"garagePostalCode":"06190"},
  "identity":{"lastName":"Lanteri","phone":"+33783848484","email":"er@efe.fr","age":32},
  "driver":{"permitType":"A2","permitDate":"2024-12-12","insuredMonthsLast48":1,"bonusMalus":1.0},
  "declarations":{"convictions3y":false,"insurerCancellation3y":false,"licenseSuspension5y":false},
  "claims":[{"type":"BODILY_NON_RESPONSIBLE","lossDate":"2024-12-12"}],
  "derived":{"permitSeniorityMonths":0,"vehicleAgeYears":0,"claimsRecencyMonths":[0]},
  "consents":{"privacy":true,"marketing":false},
  "analytics":{"sessionId":"uuid","utm":{"source":"web"}}
}
```

- Response:
```json
{ "quoteId":"uuid", "status":"EMAIL_SENT", "providerId":"resend-id" }
```


## Frontend work

- Stepper with 4 steps: `Véhicule`, `Conducteur`, `Tarif (placeholder)`, `Email` mirroring screenshots.
- Zod schemas + React Hook Form; auto-save to `localStorage`.
- Intelligent dependent selects: Make → Model → CC; permit warnings.
- Claims repeater only if N>0; i18n `fr` default; A11y.
- On submit of Email step: call `/email`; show quote reference and success state.

## Backend (AdonisJS v6)

- Routes: `POST /email`, `GET /health`.
- Controller: `EmailQuoteController.store` validates body, applies hard-stop rules, and calls Resend.
- Validation: VineJS schema mirroring Zod.
- Service: `EmailService` composes HTML (Edge template) and sends via Resend SDK using `RESEND_API_KEY`.
- Config: CORS for frontend origin; rate limit (e.g., 30 req/IP/10min); request logging without PII; error handling.
- Environment: `RESEND_API_KEY`, `FROM_EMAIL`, `QUOTE_TO`, `RATE_LIMIT_RPM`, optional `CAPTCHA_SECRET` (future), `NODE_ENV`.

## Files to create (essentials)

- `packages/types/form.ts` — `FormState`, `ClaimItem`, `Declarations`.
- `packages/types/contracts.ts` — `EmailQuoteRequest`, `EmailQuoteResponse`.
- `apps/frontend/src/i18n/fr/common.json`
- `apps/frontend/src/lib/catalog/moto_full.json` (or fetched), `catalogIndex.ts` (indexes + helpers)
- `apps/frontend/src/lib/derived.ts`
- `apps/frontend/src/lib/validation.ts`
- `apps/frontend/src/components/StepVehicle.tsx`
- `apps/frontend/src/components/StepIdentity.tsx`
- `apps/frontend/src/components/StepDeclarations.tsx`
- `apps/frontend/src/components/StepDriver.tsx`
- `apps/frontend/src/components/StepEmail.tsx`
- `apps/frontend/src/components/Stepper.tsx`
- `apps/frontend/src/pages/Quote.tsx`
- `apps/backend/start/routes.ts`
- `apps/backend/app/controllers/EmailQuoteController.ts`
- `apps/backend/app/validators/EmailQuoteValidator.ts`
- `apps/backend/app/services/EmailService.ts`
- `apps/backend/resources/views/email/quote.edge`

## Validations

- Postal code 5 digits + mapping.
- Email RFC 5322 (backend optional MX soft-check).
- Phone E.164, FR 06/07.
- Age 14–99; permit/date rules; claims recency within 36 months; exact N claims.
- Hard-stops for forbidden declarations: backend returns 422 with decline reason; UI shows message and stops.

## Email content

- Subject: `Devis Moto – {make} {model} {cc} – {quoteId}`.
- Body: Vehicle, Identity, Declarations, Driver, Claims table, Derived values, Consents, QuoteId, timestamp, request IP/UA.
- Attachment: JSON payload.

## Configuration & deploy

- CORS allowlist; env secrets; health endpoint.
- Dev: Resend Test Mode; Stage/Prod: verified sender (SPF/DKIM) on Resend.

## Analytics & logs

- Frontend events: step_view, field_error, submit_click, email_sent with `quoteId`.
- Backend logs: structured, exclude PII; count requests, success/fail, providerId.

## Testing & QA

- Unit: `derived.ts`, validation.
- Integration: controller/service with mocked Resend.
- E2E: 0-claim, 1-claim, decline path; axe audit.

## Milestones

1. Foundations (repo, front, backend skeleton, Tailwind, i18n) — 0.5d
2. Catalog & shared types — 0.5d
3. Step 1 Vehicle + Identity + Declarations — 1d
4. Step 2 Driver + Claims repeater — 1d
5. Backend email via Resend — 0.5d
6. Wiring, validations, autosave — 0.5d
7. QA (axe/E2E) + content — 0.5d

### To-dos

- [x] Create monorepo, front app, Adonis backend, Tailwind, i18n, shared types
- [x] Import `moto_full.json` as the single source of truth
- [x] Build Make→Models→Variants indexes and lookup helpers
- [x] Implement fuzzy search for make/model with typeahead
- [x] Build Vehicle step with dependent Make/Model/CC selects
- [x] Build Location & Identity section with validations
- [x] Build Declarations toggles and decline UI copy
- [x] Build Driver step with claims repeater and warnings
- [x] Implement seniority/age/recency derivations
- [x] Wire frontend submit to backend and show success/ref
- [x] Implement localStorage autosave and resume flow
- [x] Add error summaries, aria, keyboard toggles
- [ ] CORS, healthcheck, env secrets, sender verification (SPF/DKIM)