# Gujarat Rooftop Solar — PM Surya Ghar

Marketing + lead-generation website for a rooftop solar installer in Gujarat, India.
Educates visitors, calculates cost & subsidy under **PM Surya Ghar**, sizes a system
from an electricity bill (OCR), and captures survey bookings.

- **Backend:** Java 17 · Spring Boot 3.2 · Spring Web/JPA/Validation · H2 (dev) / PostgreSQL (prod) · Tess4J OCR · Swagger
- **Frontend:** React 18 · Vite · Tailwind (glassmorphism) · Framer Motion · Recharts · react-dropzone · Axios · i18next (EN/GU/HI)

```
solar-gujarat/
  backend/    Spring Boot API  (port 8090)
  frontend/   Vite React app   (port 5173)
```

## Prerequisites
- JDK 17+ (tested on 21), Maven 3.9+
- Node 18+ (tested on 22), npm
- (Phase 4 OCR only) Tesseract installed locally: `brew install tesseract` — the bill
  endpoint degrades gracefully and lets users type values if OCR is unavailable.

## Run the backend (port 8090)
```bash
cd solar-gujarat/backend
mvn spring-boot:run
```
- Health:  http://localhost:8090/api/health
- Swagger: http://localhost:8090/swagger-ui.html
- H2 console (dev): http://localhost:8090/h2-console  (JDBC `jdbc:h2:mem:solardb`, user `sa`, no password)

Run the prod profile against PostgreSQL:
```bash
SPRING_PROFILES_ACTIVE=prod DB_URL=jdbc:postgresql://localhost:5432/solardb \
  DB_USERNAME=solar DB_PASSWORD=solar mvn spring-boot:run
```

## Run the frontend (port 5173)
```bash
cd solar-gujarat/frontend
npm install
npm run dev
```
App: http://localhost:5173 — talks to the backend via `VITE_API_BASE` (see `.env`, default `http://localhost:8090/api`).

## Tests
```bash
cd solar-gujarat/backend && mvn test
```

## API endpoints (see Swagger for full schemas)
| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/health` | Liveness |
| GET  | `/api/discoms` | Gujarat DISCOMs + areas |
| POST | `/api/calculator/estimate` | Size, subsidy, savings, payback, 25-yr series |
| POST | `/api/bill/analyze` | OCR a bill (multipart `file`) → units/amount/DISCOM |
| POST | `/api/survey` | Book a survey (creates a Lead) |
| GET  | `/api/leads` | List leads (admin; `X-Admin-Token` header) |

On the dev profile, 3 sample leads are seeded automatically so the admin table isn't empty.

## Languages
EN / ગુજરાતી / हिन्दी via i18next — toggle in the navbar. Nav, hero, CTAs, section
headings and the survey form are translated; body copy defaults to English.

## Admin leads
`/admin/leads` in the app lists captured survey leads. MVP auth: a hardcoded admin
token (`app.admin.token` in `application.yml`, default `shreeji-admin-2026`) sent as
the `X-Admin-Token` header. **Harden before production.**

## Notes / disclaimers
Subsidy, tariff and cost numbers are estimates and live in one config
(`SolarConfig`). Verify against pmsuryaghar.gov.in, GERC tariff orders and GEDA
before go-live. This is marketing/estimation software, not financial advice.
