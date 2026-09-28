# Shreeji Electricals — Gujarat Rooftop Solar Website

Marketing + lead-generation website for **Shreeji Electricals**, a rooftop solar installer in
Gujarat, India. It educates visitors, calculates system size / cost / subsidy under the
**PM Surya Ghar** scheme, reads a customer's electricity bill photo with AI to auto-size a
system, and sends survey enquiries straight to the owner's WhatsApp.

> **This README is written to be self-contained.** It documents the business rules, domain
> constants, architecture and conventions in enough detail that any developer — or any AI
> model — can continue or regenerate this project without prior context.

---

## Table of contents
1. [Business context](#1-business-context)
2. [Tech stack](#2-tech-stack)
3. [Repo layout](#3-repo-layout)
4. [Quick start](#4-quick-start)
5. [Configuration & secrets](#5-configuration--secrets)
6. [Features](#6-features)
7. [API reference](#7-api-reference)
8. [Domain logic — the business rules that matter](#8-domain-logic--the-business-rules-that-matter)
9. [Bill reading pipeline (Gemini + OCR)](#9-bill-reading-pipeline-gemini--ocr)
10. [Rate limiting](#10-rate-limiting)
11. [Survey → WhatsApp (no database)](#11-survey--whatsapp-no-database)
12. [Design system](#12-design-system)
13. [SunCycleHero component](#13-suncyclehero-component)
14. [Internationalisation](#14-internationalisation)
15. [Known dead code & cleanup](#15-known-dead-code--cleanup)
16. [Gotchas](#16-gotchas)
17. [Deployment](#17-deployment)
18. [Roadmap](#18-roadmap)

---

## 1. Business context

- **Client:** Shreeji Electricals — residential + commercial rooftop solar, Gujarat, India.
- **Scheme:** [PM Surya Ghar Muft Bijli Yojana](https://pmsuryaghar.gov.in) — central subsidy for
  **residential** rooftop solar, hard-capped at **₹78,000**.
- **DISCOMs (Gujarat electricity distribution companies):** the site targets all four —
  | Code | Name | Gujarati |
  |---|---|---|
  | MGVCL | Madhya Gujarat Vij Company Ltd | મધ્ય ગુજરાત |
  | DGVCL | Dakshin Gujarat Vij Company Ltd | દક્ષિણ ગુજરાત |
  | UGVCL | Uttar Gujarat Vij Company Ltd | ઉત્તર ગુજરાત |
  | PGVCL | Paschim Gujarat Vij Company Ltd | પશ્ચિમ ગુજરાત |
- **Goal:** generate qualified survey enquiries. Traffic is small (~5–20 visitors/day).
- **Commercial/industrial (C&I) is a separate path** — *not* eligible for PM Surya Ghar; its
  benefit is accelerated depreciation + higher commercial tariffs.

⚠️ **All subsidy, tariff and cost figures are estimates and must be verified** against
pmsuryaghar.gov.in, GERC tariff orders and GEDA before go-live. This is marketing/estimation
software, **not financial advice**.

---

## 2. Tech stack

**Backend** — `web/backend`
- Java 17 (compiles/runs on 21), Maven
- Spring Boot **3.5.16**: `web`, `validation`, `security` — **stateless, no database**
- springdoc-openapi **2.8.17** (Swagger UI)
- Lombok
- **Tess4J 5.20.0** (Tesseract OCR binding) + **PDFBox 3.0.8** (rasterise PDF bills)
- Google **Gemini** vision API via `RestClient` (no SDK)

**Frontend** — `web/frontend`
- React **18.3**, Vite **7**, React Router **7**
- Tailwind CSS **3.4** (glassmorphism design system)
- framer-motion 11, recharts 2.12, react-dropzone 14, axios 1.7
- i18next 23 / react-i18next 14 — **EN / ગુજરાતી / हिन्दी**
- `ogl` 1.0.11 — WebGL animated gradient backdrop (“Grainient”)

---

## 3. Repo layout

```
Shreeji_Electricals/
├── solar-website-build-prompt-2.md   Original build brief (source of truth for scope)
└── web/                              ← was `solar-gujarat/`, renamed
    ├── README.md                     This file
    ├── PROGRESS.md                   Build log / phase history
    ├── backend/                      Spring Boot API — port 8090
    │   ├── pom.xml
    │   └── src/main/java/com/shreeji/solar/
    │       ├── SolarApplication.java
    │       ├── bill/                 Bill upload → Gemini/OCR → units & amount
    │       │   ├── BillController.java        POST /api/bill/analyze
    │       │   ├── BillAnalysisService.java   Gemini-first, Tesseract fallback
    │       │   ├── GeminiBillExtractor.java   Gemini vision call
    │       │   ├── BillRateLimiter.java       1 upload / IP / minute + global daily cap
    │       │   └── BillAnalysisResponse.java
    │       ├── calculator/           Sizing, subsidy, savings, payback
    │       ├── config/               SolarConfig (all constants), SecurityConfig, OpenApiConfig
    │       ├── model/Discom.java
    │       └── web/                  Health, DISCOMs, exception handling, client-IP + rate-limit helpers
    └── frontend/                     Vite React app — port 5173
        ├── .env                      VITE_API_BASE
        ├── tailwind.config.js        Brand tokens
        └── src/
            ├── main.jsx              Routes
            ├── index.css             Design system (.glass, .btn-*, animate-in)
            ├── components/           SunCycleHero, BillUpload, Calculator, SurveyForm, …
            ├── pages/                Home, CalculatorPage, Commercial, About, BookSurvey, NotFound
            ├── i18n/                 en.json, gu.json, hi.json
            └── lib/                  api.js (axios), siteConfig.js, format.js
```

---

## 4. Quick start

**Prerequisites:** JDK 17+, Maven 3.9+, Node 18+ (tested on 22), npm.
Optional: Tesseract (`brew install tesseract`) — only for the OCR *fallback*.

**Backend (port 8090):**
```bash
cd web/backend
mvn spring-boot:run
```
- Health: http://localhost:8090/api/health
- Swagger: http://localhost:8090/swagger-ui.html

**Frontend (port 5173):**
```bash
cd web/frontend
npm install
npm run dev
```
App: http://localhost:5173

**Tests:**
```bash
cd web/backend && mvn test
```

> **Ports are not arbitrary.** The backend uses **8090** (8080/8081 were taken on the dev
> machine). The frontend is pinned to **5173** with `strictPort: true` because the backend's
> CORS allow-list only permits `http://localhost:5173` — if Vite silently drifted to 5174,
> every API call would fail CORS. If 5173 is busy, kill the stale process rather than
> changing the port.

---

## 5. Configuration & secrets

All backend config lives in `web/backend/src/main/resources/application.yml`.

| Key | Default | Purpose |
|---|---|---|
| `server.port` | `8090` | API port |
| `app.cors.allowed-origins` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allow-list |
| `app.gemini.model` | `gemini-2.5-flash` | Vision model |
| `app.bill.rate-limit.window-seconds` | `60` | Seconds between accepted uploads per IP (`0` disables) |
| `app.bill.daily-cap` | `200` | Accepted uploads per UTC day across **all** clients (`0` disables) — keep ≤ Gemini daily quota |
| `app.bill.max-concurrent` | `2` | Bill analyses running at once (OCR/PDF rendering is memory-heavy) |
| `app.trust-forwarded-headers` | `false` | Read client IP from `X-Forwarded-For` (only behind your own proxy) |
| `app.trusted-proxy-count` | `1` | Proxies that append to `X-Forwarded-For`; the IP is taken this many entries from the **right** |
| `spring.servlet.multipart.max-file-size` | `10MB` | Bill upload cap |
| `solar.*` | see §8 | All tariff/subsidy/cost constants |

### Gemini API key (the one real secret)

Get a free key at <https://aistudio.google.com/apikey>.

- **Local dev:** put it in `web/backend/src/main/resources/application-local.yml` —
  **git-ignored** via `web/backend/.gitignore`, auto-loaded by
  `spring.config.import: optional:application-local.yml`.
  ```yaml
  app:
    gemini:
      api-key: YOUR_KEY_HERE
  ```
- **Production:** set the `GEMINI_API_KEY` environment variable.

> ⚠️ `app.gemini.api-key` is **deliberately not set** in `application.yml`. A default there
> (even an empty `${GEMINI_API_KEY:}`) would **shadow** the value imported from
> `application-local.yml`, because `spring.config.import` files rank lower than the importing
> file. The extractor resolves it as `${app.gemini.api-key:${GEMINI_API_KEY:}}`.
>
> With no key, bill analysis silently falls back to local Tesseract OCR.

### Frontend
`web/frontend/.env`:
```
VITE_API_BASE=http://localhost:8090/api
```
For production, set `VITE_API_BASE` to the public backend URL ending in `/api` in the frontend host.

### Business details
`web/frontend/src/lib/siteConfig.js` — company name, phone, **`whatsappNumber`** (digits only,
country code first, used for `wa.me` links), email, address.

---

## 6. Features

| Page / Route | What it does |
|---|---|
| `/` Home | SunCycleHero (§13), benefits, PM Surya Ghar explainer, calculator teaser, testimonials, FAQ, survey CTA |
| `/calculator` | Bill upload + savings calculator + results + 25-yr chart |
| `/commercial` | Commercial/industrial path (no subsidy; accelerated depreciation) |
| `/about` | Company info |
| `/book-survey` | Survey form → **sends to owner's WhatsApp** |

Plus: floating WhatsApp + click-to-call buttons, language toggle (EN/GU/HI), error boundary,
scroll-to-top.

---

## 7. API reference

Base path `/api`. Full schemas in Swagger.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Liveness |
| GET | `/api/discoms` | — | The four Gujarat DISCOMs + areas |
| POST | `/api/calculator/estimate` | — | Size, subsidy, savings, payback, 25-yr series |
| POST | `/api/bill/analyze` | — | Multipart `file` → units/amount/DISCOM. **Rate limited** |
**Security:** every endpoint is public and stateless — no accounts, sessions, cookies or database.
Spring Security stays for its hardened headers (`X-Frame-Options: DENY`, `nosniff`, HSTS over HTTPS)
and CORS enforcement: GET/POST only, no credentials, wildcard origins rejected at startup.
CSRF is disabled because there are no cookies to ride on. Unknown paths, bad JSON, wrong methods
and oversized uploads return 4xx, never a 500 with a stack trace.

### `POST /api/calculator/estimate`
Request — **required:** `inputType` (`bill`|`units`), `discom` (`MGVCL`|`DGVCL`|`UGVCL`|`PGVCL`),
and `monthlyBill` *or* `monthlyUnits` (whichever matches `inputType`; all amounts must be positive).
**Optional:** `consumerType` (`RESIDENTIAL` default | `COMMERCIAL`), `roofAreaSqft`, `sanctionedLoadKw`.

Response: `recommendedKw`, `systemCost`, `centralSubsidy`, `stateTopUp`,
`acceleratedDepreciationBenefit`, `netCost`, `annualUnits`, `annualSavings`, `paybackYears`,
`co2TonnesPerYear`, `assumptions`, `disclaimer`, `savingsSeries[]`.

### `POST /api/bill/analyze`
Multipart `file` (JPG/PNG/PDF). Response: `detectedUnits`, `detectedAmount`, `detectedDiscom`,
`confidence` (`high`|`medium`|`low`), `recommendedKw`, `rawTextPreview`, `message`.
**Never blocks** — on any failure it returns low confidence + a friendly message so the user
can type values manually.

`429` when rate-limited:
```json
{ "error": "rate_limited", "retryAfterSeconds": 60, "message": "Please wait 60 more seconds before uploading another bill." }
```
with a `Retry-After` header.

---

## 8. Domain logic — the business rules that matter

**All constants live in one class: `config/SolarConfig.java`** (`@ConfigurationProperties(prefix = "solar")`).
Never scatter magic numbers; override via `solar.*` in `application.yml`.

### Residential defaults
| Constant | Value | Meaning |
|---|---|---|
| `avgTariffPerUnit` | `5.5` | ₹/kWh, LT-Domestic average (range 4.5–6.0) |
| `unitsPerKwPerYear` | `1500` | Gujarat generation (~125 units/month per kW) |
| `sizingDivisor` | `150` | `recommendedKw = round(monthlyUnits / 150)` |
| `maxResidentialKw` | `10` | Residential net-metering cap |
| `co2TonnesPerKwYear` | `1.2` | Tonnes CO₂ avoided per kW per year |
| `roofSqftPerKw` | `100` | Roof area needed per kW |
| `projectionYears` | `25` | Savings chart horizon |
| `stateTopupPerKw` | `0` | GEDA state top-up — **disabled** until confirmed |
| `stateTopupMaxKw` | `3` | Top-up applies to first 3 kW |

**Residential cost per kW (₹), nearest band wins:**
`1→65000, 2→60000, 3→58000, 5→55000, 10→53000`

### PM Surya Ghar central subsidy (exact slab — get this right)
```java
int k = Math.min(recommendedKw, 3);
long central = (k <= 2) ? k * 30000 : 60000 + (k - 2) * 18000;
return Math.min(central, 78000);   // HARD CAP
```
→ **1 kW = ₹30,000 · 2 kW = ₹60,000 · 3 kW+ = ₹78,000 (capped).**

### Sizing
```java
kw = round(monthlyUnits / sizingDivisor)
kw = clamp(kw, 1, maxKw)
if (sanctionedLoadKw != null) kw = min(kw, floor(sanctionedLoadKw))
if (roofAreaSqft   != null) kw = min(kw, floor(roofAreaSqft / roofSqftPerKw))
kw = max(1, kw)
```
`unitsFromBill(bill) = bill / avgTariffPerUnit`

### Money
```
systemCost    = round100(recommendedKw × costPerKw(recommendedKw))
netCost       = round100(systemCost − centralSubsidy − stateTopUp − adBenefit)
annualUnits   = recommendedKw × unitsPerKwPerYear
annualSavings = round100(annualUnits × tariff)
paybackYears  = round1(netCost / annualSavings)
savingsSeries = [{year: 0..25, cumulativeSavings: annualSavings × year}]
```

### Commercial / Industrial (C&I)
**No PM Surya Ghar subsidy.** Benefit = accelerated depreciation + higher tariff.

| Constant | Value |
|---|---|
| `commercialTariffPerUnit` | `8.0` ₹/kWh (blended LT/HT, range ~7–9) |
| `maxCommercialKw` | `1000` |
| `adDepreciationYear1` | `0.60` (40% + 20% additional if >180 days) |
| `corporateTaxRate` | `0.25` |

**Commercial cost per kW (₹):** `10→55000, 25→50000, 50→45000, 100→42000, 500→40000, 1000→38000`

```java
adBenefit = round(systemCost × 0.60 × 0.25)   // first-year tax saving
```

---

## 9. Bill reading pipeline (Gemini + OCR)

`BillAnalysisService.analyze(file)` — **Gemini first, Tesseract fallback, never blocks.**

**1 · Gemini vision (preferred)** — handles **handwritten Gujarati** and unclear phone photos.
- PDFs are rasterised (first page, 200 DPI, PDFBox) → JPEG. Images are sent untouched.
- `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
  with header `x-goog-api-key`, `temperature: 0`, `responseMimeType: application/json`, and a
  **`responseSchema`** enforcing:
  ```
  unitsConsumed: NUMBER|null,  billAmount: NUMBER|null,
  discom: enum(MGVCL,DGVCL,UGVCL,PGVCL)|null,  legible: BOOLEAN (required)
  ```
- The prompt names the Gujarati labels explicitly: **વપરાશ / યુનિટ** (units),
  **ચૂકવવાની રકમ / ભરવાની રકમ / કુલ રકમ** (amount), and the four DISCOM names in Gujarati.
  It instructs: *use null for anything unreadable — never guess digits*.
- `legible: false` → friendly "retake the photo in good light" message.
- Returns `null` on **any** failure (bad key, quota, network) → falls through to OCR.

**2 · Tesseract fallback** (printed bills only; requires the native binary)
- Preprocess: upscale to ~2000px wide (max 3×), convert to grayscale.
- `eng+guj` if `guj.traineddata` exists, else `eng`; PSM 3, OEM 1, `user_defined_dpi=300`.
- Regex extraction with English **and** Gujarati label patterns; for amount, the **largest**
  match wins (net payable is usually the biggest number).
- `jna.library.path` is auto-populated from `/opt/homebrew/lib`, `/usr/local/lib`, etc. so
  Tess4J can find `libtesseract`. Missing Tesseract degrades gracefully.

**3 · Confidence** — `high` (units **and** amount), `medium` (one of them), `low` (neither).

**The uploaded image is never persisted** — read once in memory, then discarded.

**Upload safety:** the file type is taken from its magic bytes (JPG/PNG/PDF), never the client's
`Content-Type`. Decoded images and rendered PDF pages are capped at 16M pixels
(`BillAnalysisService.MAX_PIXELS`): oversized images are refused before decoding, and large PDF pages
are rendered at a lower DPI — this stops decompression bombs from exhausting the JVM heap.

---

## 10. Rate limiting

Every bill upload costs one Gemini call, and the free tier has a daily quota — so
`BillRateLimiter` allows **one accepted upload per client IP per 60 seconds**.

- In-memory `ConcurrentHashMap<ip, lastAcceptedMillis>`, atomic check-and-set via `compute()`.
- Client IP = `getRemoteAddr()`, or — only when `APP_TRUST_FORWARDED_HEADERS=true` — the
  `X-Forwarded-For` entry `APP_TRUSTED_PROXY_COUNT` places from the **right** (entries further left
  are client-supplied and forgeable). IPv6 clients are keyed by their `/64`. See `web/ClientIpResolver`.
- **Never** set `server.forward-headers-strategy: framework`/`native` — it would let clients set their
  own `remoteAddr` via headers and bypass every per-IP limit.
- **Global daily cap** (`app.bill.daily-cap`, default 200/UTC day) bounds quota use even from rotating IPs,
  and at most `app.bill.max-concurrent` analyses run at once (extra requests get a 429).
- Evicts stale entries once the map exceeds 1000 keys.
- Empty uploads don't consume the window (they never reach the API).
- Exceeded → `TooManyRequestsException` → **429** + `Retry-After` header.
- The frontend mirrors it: after an upload the dropzone disables and shows a live **60s
  countdown**, syncing to the server's `retryAfterSeconds` on a 429.
- Configure with `app.bill.rate-limit.window-seconds` / `BILL_RATE_LIMIT_WINDOW_SECONDS`; `0` disables.

> Per-IP means users behind one NAT share a window — the standard trade-off for a public form
> with no login; the global daily cap is the backstop.

---

## 11. Survey → WhatsApp (no database)

**The survey form does not touch the backend or any database.** On submit, `SurveyForm.jsx`:

1. Validates client-side (name, 10-digit Indian mobile `^[6-9]\d{9}$`, address, city, roof type).
2. Builds a formatted message (name, phone, email, city, address, DISCOM, roof type, monthly
   bill, preferred date, message).
3. Opens `https://wa.me/<siteConfig.whatsappNumber>?text=<encoded>` — the **customer's**
   WhatsApp opens pre-filled, addressed to the owner. They tap **Send**.
4. Shows a confirmation with a manual "Open WhatsApp" fallback (popup-blocker safety).

**Why click-to-chat:** a server cannot auto-send WhatsApp messages for free — that requires
Meta's approved/paid Business API. This approach is free, needs no API key or database, and
the owner receives the enquiry **from the customer's own number**, so they can reply directly.

Owner number lives in `siteConfig.whatsappNumber` (digits only, country code first).

---

## 12. Design system

**Tailwind tokens** (`tailwind.config.js`) — reuse these, never hard-code hexes:

| Token | Hex | Use |
|---|---|---|
| `sun` | `#FFB81C` | Primary CTA (amber) |
| `sky-deep` | `#1B6FD6` | Secondary CTA (blue), focus rings |
| `sky` | `#4DA8FF` | Sky blue |
| `sky-light` | `#E9F6FF` | Pale background |
| `navy` | `#0B3D91` | Headings |
| `ink` | `#0F2540` | Body text |
| `muted` | `#5B708B` | Secondary text |
| `leaf` | `#1FBF75` | Success / WhatsApp |

**Fonts:** headings **Plus Jakarta Sans**, body **Inter**, plus Noto Sans Gujarati / Devanagari.

**Component recipes** (`index.css`, `@layer components`):
- `.glass` — liquid-glass card: translucent gradient, `backdrop-filter: blur(10px) saturate(165%)`,
  specular top rim via `::before`, depth shadow, blue inner glow.
- `.glass-solid` — more opaque variant for text-heavy cards.
- `.btn-sun` (amber), `.btn-sky` (blue), `.btn-ghost` — all pill-shaped (`rounded-full`).
- `.animate-in` — `fadeInUp 0.6s ease-out both`; `Reveal.jsx` wraps content with it.
- Global `:focus-visible` ring: `3px solid var(--sky-deep)`.
- `prefers-reduced-motion` collapses all animation durations to `0.001ms`.

---

## 13. SunCycleHero component

`components/SunCycleHero.jsx` — the scroll-driven homepage hero (**home route only**).

A tall section (`cycleLength` vh) with an inner `sticky top-0 h-screen` stage. As you scroll, a
full day plays out: sun rises left → noon peak → sets right, the sky shifts through five
gradients, and a 3D rooftop PV array casts a physically-derived shadow.

**Everything derives from a single scroll value `t` (0→1)**, computed from *this section's*
`getBoundingClientRect()` — never `window.scrollY` — so the effect is self-contained:
```js
t = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1)
```

**Physics:**
```
sunAngle  = t · π
elevation = sin(sunAngle)                    // 0 at horizons → 1 at noon
sunX      = lerp(-5%, 105%, t)
sunY      = lerp(72%, 10%, elevation · arcHeight)
shadowDir = t < 0.5 ? right : left           // transform-origin pins the sun-side edge
shadowLen = lerp(2.4, 0.12, elevation)       // scaleX
shadowSkew= ±lerp(20°, 0°, elevation)
shadowBlur= lerp(16px, 3px, elevation)       // low sun = soft; noon = crisp
shadowOpac= lerp(0.08, 0.32, elevation)
sheenPos  = lerp(12%, 88%, t)                // glass reflection tracks the sun
```
Sky = piecewise RGB lerp across 5 keyframes (soft dawn peach → gold → sky blue → amber →
dusk indigo) with a lighter horizon haze. Copy whitens + a scrim strengthens via
`smoothstep(0.72, 0.95, t)` so the headline stays readable into dusk.

**Props:** `cycleLength=350` (vh), `panelTilt=50` (deg), `arcHeight=0.82`, `panelScale=1`,
`sunSize=104` (px).

**Implementation notes:**
- Panel is **CSS 3D** (`perspective() + rotateX()`) over an HTML 6×10 cell grid — gives true
  perspective foreshortening free, stays on GPU-friendly `transform`/`opacity`.
- Scroll handler is rAF-throttled with a `ticking` flag, passive listener, cleaned up on unmount.
- 60 PV cells are `useMemo`'d so they're never rebuilt per frame.
- `prefers-reduced-motion` → section collapses to `100vh` and holds a static solar noon.
- A negative top margin (`-mt-24`) tucks the sky **behind the floating navbar**, so the hero
  gradient (not the global blue backdrop) fills the area around it.
- Static panel/roof CSS is a single injected `<style>` block (project has no CSS modules).

---

## 14. Internationalisation

i18next with **EN / ગુજરાતી / हिन्दी** (`src/i18n/{en,gu,hi}.json`), toggled in the navbar.
Default `en`, `fallbackLng: 'en'` — missing keys fall back to English. Nav, hero, CTAs, section
headings and the survey form are translated; long body copy defaults to English.

---

## 15. Removed: database, leads & admin (2026-09-28)

Once the survey moved to WhatsApp (§11), the database layer was dead code — and public attack
surface (an unauthenticated `POST /api/survey` that wrote to the DB, a Basic-auth admin endpoint,
and the H2 console). It has been **deleted**: the `survey/` package (`Lead*`, `SurveyController`,
`SurveyRequest`, `DataSeeder`), `AdminLeads.jsx` + `/admin/leads`, `bookSurvey()`/`getLeads()`,
the JPA/H2/PostgreSQL dependencies and all `spring.datasource`/`spring.jpa`/`app.admin` config.

The backend is now **fully stateless** — no database to host, provision or back up, and no
credentials besides the Gemini key. Do not reintroduce a public write endpoint without rate
limiting (see `web/CooldownRateLimiter` + `web/DailyCap`).

---

## 16. Gotchas

- **The project folder was renamed `solar-gujarat/` → `web/`.** Old paths in git history and
  `PROGRESS.md` refer to the previous name.
- **Frontend must run on port 5173** — `strictPort: true` + backend CORS allow-list. Kill stale
  processes rather than changing the port; a silent drift to 5174 breaks every API call.
- **Never commit `application-local.yml`** — it holds the Gemini key and is git-ignored.
- **`app.gemini.api-key` must not be set in `application.yml`** — it would shadow the imported
  local value (see §5).
- **Vite's dev server hangs under sandboxed shells** — run `npm run dev` in a normal terminal.
- **Tesseract is optional.** Without it, only the Gemini path works; the fallback degrades
  gracefully to manual entry.
- Keep the `npm run dev` terminal open — closing it stops the server ("connection refused").

---

## 17. Deployment

The supported deployment is **Vercel** for the Vite frontend and **Render** for the Dockerized
Spring Boot API. The current application is intentionally stateless: survey details are sent to
WhatsApp and calculator/bill analysis requests are not stored. Therefore Supabase is not required
for the current feature set. Create a Supabase project now only if you want a database ready for a
future leads/appointments feature; do not add a database URL to Render until the backend has a
persistence feature and migration/schema for it.

### 17.1 Prepare the repository

1. Push the repository to GitHub. Keep `backend/src/main/resources/application-local.yml` and all
  API keys out of Git.
2. Confirm the backend image can build locally:
  ```bash
  cd backend
  mvn clean package
  docker build -t shreeji-solar-api .
  ```

### 17.2 Deploy the backend to Render

1. In Render, choose **New > Blueprint** and select this repository. Render will read the root
  `render.yaml`, use `backend/Dockerfile`, and configure `/api/health` as the health check.
2. In the service environment variables, set:
  - `APP_CORS_ALLOWED_ORIGINS`: the exact Vercel origin, for example
    `https://shreeji-electricals.vercel.app` (no trailing slash). Add a comma-separated preview
    origin only when needed.
  - `GEMINI_API_KEY`: the Gemini key used by bill analysis. Leave it unset if local Tesseract-only
    fallback is acceptable.
  - `BILL_DAILY_CAP`: a value at or below the Gemini daily quota, such as `50`.
3. Do not set `PORT`; Render supplies it and the application reads `${PORT:8090}`.
4. After deployment, verify `https://<render-service>.onrender.com/api/health` returns a healthy
  response. The free Render service may sleep and take time to answer its first request.

### 17.3 Deploy the frontend to Vercel

1. In Vercel, choose **Add New > Project**, select the repository, and set **Root Directory** to
  `frontend`.
2. Use these build settings:
  - Framework preset: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Install command: `npm install`
3. Add the production environment variable before deploying:
  ```text
  VITE_API_BASE=https://<render-service>.onrender.com/api
  ```
  Vite embeds this value into the browser bundle, so redeploy after changing it.
4. `frontend/vercel.json` already rewrites client-side routes to `index.html` and sets security
  headers. Test `/`, `/calculator`, `/commercial`, and `/book-survey` directly after deployment.
5. Copy the final Vercel production URL into Render's `APP_CORS_ALLOWED_ORIGINS`, then redeploy or
  restart the Render service.

### 17.4 Optional Supabase setup

Supabase is not connected by the current code because no endpoint writes data. If you create a
project for future use:

1. Create a Supabase project and keep the database password in a password manager.
2. Use the **Transaction pooler** connection string for a serverless/container deployment when a
  persistence feature is added. Store it in Render as a secret, never in Git or Vite variables.
3. Add a schema migration and backend repository/service first, then add the matching Spring
  datasource dependency and environment variables. Do not expose `SUPABASE_DB_URL`, service-role
  keys, or database credentials to Vercel.

---

## 18. Roadmap

Ideas evaluated for a small Gujarat solar installer, roughly by ROI:

1. **Instant lead alerts + PDF quote** — a shareable quote from the calculator that captures
   the customer's phone; speed-to-lead is the biggest conversion lever.
2. **Financing / EMI view** — "EMI ₹X/mo vs your bill ₹Y/mo" removes the upfront-cost objection
   (PM Surya Ghar collateral-free solar loans ~7%).
3. **Trust pack** — real project gallery, **GEDA/MNRE empanelment badge** (buyers check this for
   subsidy eligibility), warranty clarity, live Google reviews.
4. **Calculator accuracy** — district-level irradiance, roof-area feasibility, CO₂/trees saved,
   25-yr generation with panel degradation.
5. **Local SEO** — city landing pages (Ahmedabad / Surat / Rajkot / Vadodara) + guides on
   PM Surya Ghar and DISCOM net metering.
6. **Subsidy/installation tracker** — customer-facing status through the bureaucratic
   PM Surya Ghar process.
7. ~~Global daily cap on bill uploads~~ — done (§10).
