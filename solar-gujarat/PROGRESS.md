# Build Progress — Gujarat Rooftop Solar

Living checklist for the end-to-end build (brief: `solar-website-build-prompt-2.md`).
Updated as phases complete; committed alongside code.

## Phase checklist
- [x] **Phase 1 — Scaffold**: backend (Spring Boot, H2 dev, Swagger, CORS, health), frontend (Vite+Tailwind+Router, hello page), README, ports aligned to 8090.
- [ ] **Phase 2 — Design system**: tokens, fonts, GlassCard, sky+panels hero (clouds + panel row), Navbar, Footer, responsive shell. Remove health card from hero.
- [ ] **Phase 3 — Calculator**: SolarConfig, `/api/calculator/estimate` + subsidy unit test, Calculator UI, ResultCards (count-up), SavingsChart.
- [ ] **Phase 4 — Bill upload**: Tess4J OCR `/api/bill/analyze`, dropzone UI, editable detected fields → sizing.
- [ ] **Phase 5 — Survey**: Lead entity, `/api/survey`, validated SurveyForm, confirmation, `/admin/leads` table + CSV export.
- [ ] **Phase 6 — Content**: Benefits, Scheme explainer, Process timeline (scroll reveal), About page, FAQ, Testimonials, WhatsApp button.
- [ ] **Phase 7 — Polish**: i18next EN/GU/HI, reduced-motion, a11y pass, Swagger tidy, README finalised, seed sample leads.

## Current state
- **Backend** runs on **:8090** — `cd solar-gujarat/backend && mvn spring-boot:run`. Health: `/api/health`, Swagger: `/swagger-ui.html`, H2 console: `/h2-console`.
- **Frontend** runs on **:5173** — `cd solar-gujarat/frontend && npm install && npm run dev`. `VITE_API_BASE=http://localhost:8090/api`.
- Backend compiles & `contextLoads` test passes. Frontend Home shows backend health JSON.

## Last completed step
Phase 1 scaffold: `pom.xml` (Spring Boot 3.2.5 + Tess4J + springdoc), `SolarApplication`, `HealthController`, `CorsConfig`, `OpenApiConfig`, `application.yml` (dev/prod profiles, port 8090), frontend Vite/Tailwind scaffold with `lib/{api,format,siteConfig,useReducedMotion}.js`, Home placeholder, README.

## Next step to do
Phase 2 — Design system: build `components/GlassCard.jsx`, `Navbar.jsx`, `Footer.jsx`, `Hero.jsx` (sky gradient + drifting clouds + angled panel row along the bottom), and a responsive Home shell. Remove the debug/health card from the public hero.

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
