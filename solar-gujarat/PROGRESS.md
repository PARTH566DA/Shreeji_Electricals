# Build Progress — Gujarat Rooftop Solar

Living checklist for the end-to-end build (brief: `solar-website-build-prompt-2.md`).
Updated as phases complete; committed alongside code.

## Phase checklist
- [x] **Phase 1 — Scaffold**: backend (Spring Boot, H2 dev, Swagger, CORS, health), frontend (Vite+Tailwind+Router, hello page), README, ports aligned to 8090.
- [x] **Phase 2 — Design system**: tokens, fonts, GlassCard, sky+panels hero (clouds + panel row via SkyBackdrop), Navbar (glass, mobile menu, lang toggle), Footer, Layout shell, WhatsApp/call buttons. i18next (EN/GU/HI) wired early. Health card removed from public hero.
- [x] **Phase 3 — Calculator**: `SolarConfig` (all constants), Discom enum, `/api/calculator/estimate` + `/api/discoms`, exact math, validation + error handler. Subsidy unit test passes (7 tests green). Calculator UI + ResultCards (count-up) + SavingsChart (Recharts, payback marked). Verified live.
- [x] **Phase 4 — Bill upload**: `bill/{BillAnalysisService,BillController,BillAnalysisResponse}` — Tess4J OCR (+ PDFBox for PDFs), regex extract units/amount/discom, reuse calculator sizing. Degrades gracefully if Tesseract absent (verified live: low-confidence + manual-entry message). Regex tests green (10 total). Frontend `BillUpload.jsx` (react-dropzone, editable fields, "use these values" → calculator preset).
- [x] **Phase 5 — Survey**: `survey/{Lead,LeadStatus,LeadRepository,SurveyRequest,SurveyController}` — POST /api/survey (10-digit phone validation), GET /api/leads (X-Admin-Token guard, 401 without). Frontend `SurveyForm.jsx` (client+server validation, confirmation card + WhatsApp deep link) wired into Home; `AdminLeads.jsx` real table (token prompt, status filter, CSV export). Verified live: create/validation/401/list all correct.
- [x] **Phase 6 — Content**: `components/{Reveal,BenefitsGrid,SchemeExplainer,ProcessTimeline,Testimonials,FAQ}.jsx` (Framer Motion `whileInView` via Reveal, reduced-motion safe), full `pages/About.jsx`. Home now composes all real sections; all stubs gone. WhatsApp button done in Phase 2.
- [x] **Phase 7 — Polish**: i18n expanded (sections + survey labels in EN/GU/HI, applied via `t()`); reduced-motion respected (Reveal/CountUp/CSS); a11y (focus rings, aria, labelled fields); Swagger tags/descriptions on all endpoints; README finalised (endpoint table, languages); `DataSeeder` seeds 3 leads on dev. **All 7 phases complete.**

## Current state
- **Backend** runs on **:8090** — `cd solar-gujarat/backend && mvn spring-boot:run`. Health: `/api/health`, Swagger: `/swagger-ui.html`, H2 console: `/h2-console`.
- **Frontend** runs on **:5173** — `cd solar-gujarat/frontend && npm install && npm run dev`. `VITE_API_BASE=http://localhost:8090/api`.
- Backend compiles & `contextLoads` test passes. Frontend Home shows backend health JSON.

## Last completed step
Phase 7 polish — BUILD COMPLETE. i18n applied across sections + survey form; `DataSeeder` (dev) seeds 3 leads (verified live); README finalised. Backend: 10 tests green, all 8 endpoints in Swagger. Frontend builds clean.

## Post-build hardening (done after Phase 7)
- [x] **Real admin auth** — replaced `X-Admin-Token` with Spring Security HTTP Basic + BCrypt. `SecurityConfig` guards `/api/leads` (role ADMIN), all else public; CORS moved into the security chain (old WebMvc `CorsConfig` removed). Creds via `app.admin.username` / `app.admin.password-hash` (env-overridable). AdminLeads UI now has username+password. Verified live: 401 without/with wrong creds, 200 with `admin:shreeji-admin-2026`.
- [x] **Live OCR** — Tesseract 5.5.2 installed (brew). `BillAnalysisService` now adds brew/linux lib dirs to `jna.library.path` at startup so Tess4J finds `libtesseract` (was throwing UnsatisfiedLinkError). Verified live: a sample bill returns units=452, amount=2486, MGVCL, high confidence, 3 kW.

## Remaining (optional, before go-live)
Replace placeholder siteConfig/testimonials/About credentials with real business details; verify subsidy/tariff numbers vs pmsuryaghar.gov.in / GERC / GEDA; optionally code-split the JS bundle (recharts).

## ⚠️ Known issue / env note
Frontend `npm run build` (vite/esbuild service mode) HANGS at "transforming…" under the default sandbox — esbuild's long-running service IPC is blocked. Run builds with the sandbox disabled (Bash `dangerouslyDisableSandbox: true`). Standalone esbuild and `mvn` are unaffected.

## Decisions / deviations
- Local JDK is 21; `pom.xml` targets Java 17 release (brief spec) — compiles fine on 21.
- Ports: backend **8090**, frontend **5173** (8080/8081 taken on this machine).
- Tess4J + PDFBox added to `pom.xml` up front (used in Phase 4); OCR endpoint will degrade gracefully if native Tesseract is absent.
- Admin auth is MVP: hardcoded `X-Admin-Token` (`app.admin.token`).

## Resume commands
```bash
# backend
cd solar-gujarat/backend && mvn spring-boot:run
# frontend
cd solar-gujarat/frontend && npm install && npm run dev
```
