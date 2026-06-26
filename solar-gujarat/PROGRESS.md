# Build Progress — Gujarat Rooftop Solar

Living checklist for the end-to-end build (brief: `solar-website-build-prompt-2.md`).
Updated as phases complete; committed alongside code.

## Phase checklist
- [x] **Phase 1 — Scaffold**: backend (Spring Boot, H2 dev, Swagger, CORS, health), frontend (Vite+Tailwind+Router, hello page), README, ports aligned to 8090.
- [x] **Phase 2 — Design system**: tokens, fonts, GlassCard, sky+panels hero (clouds + panel row via SkyBackdrop), Navbar (glass, mobile menu, lang toggle), Footer, Layout shell, WhatsApp/call buttons. i18next (EN/GU/HI) wired early. Health card removed from public hero.
- [x] **Phase 3 — Calculator**: `SolarConfig` (all constants), Discom enum, `/api/calculator/estimate` + `/api/discoms`, exact math, validation + error handler. Subsidy unit test passes (7 tests green). Calculator UI + ResultCards (count-up) + SavingsChart (Recharts, payback marked). Verified live.
- [x] **Phase 4 — Bill upload**: `bill/{BillAnalysisService,BillController,BillAnalysisResponse}` — Tess4J OCR (+ PDFBox for PDFs), regex extract units/amount/discom, reuse calculator sizing. Degrades gracefully if Tesseract absent (verified live: low-confidence + manual-entry message). Regex tests green (10 total). Frontend `BillUpload.jsx` (react-dropzone, editable fields, "use these values" → calculator preset).
- [ ] **Phase 5 — Survey**: Lead entity, `/api/survey`, validated SurveyForm, confirmation, `/admin/leads` table + CSV export.
- [ ] **Phase 6 — Content**: Benefits, Scheme explainer, Process timeline (scroll reveal), About page, FAQ, Testimonials, WhatsApp button.
- [ ] **Phase 7 — Polish**: i18next EN/GU/HI, reduced-motion, a11y pass, Swagger tidy, README finalised, seed sample leads.

## Current state
- **Backend** runs on **:8090** — `cd solar-gujarat/backend && mvn spring-boot:run`. Health: `/api/health`, Swagger: `/swagger-ui.html`, H2 console: `/h2-console`.
- **Frontend** runs on **:5173** — `cd solar-gujarat/frontend && npm install && npm run dev`. `VITE_API_BASE=http://localhost:8090/api`.
- Backend compiles & `contextLoads` test passes. Frontend Home shows backend health JSON.

## Last completed step
Phase 4 bill upload: backend `bill/{BillAnalysisService,BillController,BillAnalysisResponse}` + `BillAnalysisServiceTest`; CalculatorService gained public `recommendKw(units)` / `unitsFromBill(bill)`. Frontend `components/BillUpload.jsx`; Home now holds `preset` state shared between BillUpload and Calculator (`preset={units,bill,discom}`). 10 backend tests green; live graceful-degradation verified.

## Next step to do
Phase 5 — Survey: backend `survey/{Lead (entity, status enum NEW/CONTACTED/SURVEYED/WON/LOST), LeadRepository, SurveyRequest, SurveyController}` — POST /api/survey (validation: 10-digit phone), GET /api/leads (X-Admin-Token guard). Frontend `components/SurveyForm.jsx` (replace #book-survey stub) with confirmation card + WhatsApp deep link; `pages/AdminLeads.jsx` real table + CSV export + token prompt.

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
