# Build Prompt — Gujarat Rooftop Solar Website (Spring Boot + React)

> Paste everything below this line into Claude Code (VS Code extension). It is written as a single, self-contained brief. **Build the entire website end to end — all phases — without stopping to ask for review.** The phase list is your internal build order, not a series of stop points. The only time you pause is if you are about to run out of context/session (see Section 10 — Session continuity). Commit after each phase so the history is reviewable.

---

## 0. Role & goal

You are a senior full-stack engineer. Build a production-quality marketing + lead-generation website for a **rooftop solar installer based in Gujarat, India**. The business installs residential rooftop solar under the **PM Surya Ghar: Muft Bijli Yojana** (central scheme) and Gujarat's **SURYA Gujarat** framework. The site must educate visitors, calculate their cost and subsidy, recommend a system size from their electricity bill, and capture survey bookings.

Primary audience: Gujarat homeowners (Central Gujarat / MGVCL and South Gujarat / DGVCL especially). Build for **mobile first**. Default language English, with a Gujarati (ગુજરાતી) and Hindi toggle.

**Tone of copy:** plain, trustworthy, specific. Talk in rupees and units, not jargon. Never overstate savings or subsidy. Where a number is an estimate, say so in the UI.

---

## 1. Tech stack (use exactly this)

**Backend**
- Java 17, Spring Boot 3.2.x, Maven
- Spring Web, Spring Data JPA, Spring Validation (Bean Validation)
- PostgreSQL for prod, H2 (in-memory) for local dev via profiles
- Lombok
- **Tess4J** (Tesseract OCR wrapper) for electricity-bill reading
- `springdoc-openapi-starter-webmvc-ui` for Swagger UI at `/swagger-ui.html`
- CORS enabled for the React dev origin

**Frontend**
- React 18 + **Vite**
- React Router v6
- **Tailwind CSS** (for the glassmorphism utilities)
- **Framer Motion** (scroll/entrance animations — used with restraint)
- **Recharts** (savings & payback chart)
- **react-dropzone** (bill upload)
- **Axios** (API client)
- **i18next + react-i18next** (EN / GU / HI)

**Repo layout**
```
/solar-gujarat
  /backend        (Spring Boot)
  /frontend       (Vite React)
  README.md       (run instructions for both)
```

---

## 2. Design system — "clean panels & blue sky" with glass UI

The whole site sits on a **bright, clean blue-sky aesthetic** with crisp solar panels. The UI is **glassmorphism**: frosted, semi-transparent cards floating over the sky. Keep it airy and uncluttered — lots of light, lots of breathing room. This is the look the client specifically asked for; do not drift into dark mode or busy gradients.

**Color tokens (define in Tailwind config + CSS variables):**
```
--sky-light:   #E9F6FF   /* page base, top of sky      */
--sky:         #4DA8FF   /* primary sky blue           */
--sky-deep:    #1B6FD6   /* buttons, links, deep accent */
--navy:        #0B3D91   /* strong headings on light    */
--ink:         #0F2540   /* body text on light surfaces */
--muted:       #5B708B   /* secondary text             */
--sun:         #FFB81C   /* solar/energy accent, CTAs   */
--leaf:        #1FBF75   /* savings / eco / success     */
--glass-bg:    rgba(255,255,255,0.16)
--glass-brd:   rgba(255,255,255,0.35)
--surface:     #FFFFFF   /* solid cards where needed    */
```

**Glass card recipe (make a reusable `.glass` utility / `<GlassCard>` component):**
```css
background: rgba(255,255,255,0.16);
backdrop-filter: blur(18px) saturate(140%);
-webkit-backdrop-filter: blur(18px) saturate(140%);
border: 1px solid rgba(255,255,255,0.35);
border-radius: 22px;
box-shadow: 0 12px 40px -12px rgba(15,37,64,0.25);
```
On bright photographic backgrounds use white text; on the light page base use `--ink`. Always check contrast — provide a slightly more opaque glass variant (`rgba(255,255,255,0.55)`) for text-heavy cards so copy stays readable.

**Background:** a clean blue sky with a subtle row of solar panels along the lower edge of the hero. Use a high-quality royalty-free sky/panel photo OR a CSS/SVG illustration of panels under a gradient sky (`--sky-light` → `--sky`). Provide a graceful fallback gradient if no image is set. Add a few slow-drifting soft clouds (CSS) for life — disable under `prefers-reduced-motion`.

**Typography:**
- Headings: **Plus Jakarta Sans** (700/800) — modern, friendly, trustworthy
- Body: **Inter** (400/500/600)
- Gujarati/Hindi: **Noto Sans Gujarati** / **Noto Sans Devanagari**
- Load via Google Fonts. Set a clear type scale; headings tight tracking.

**Motion:** entrance fade-up on scroll for sections (Framer Motion `whileInView`), gentle hover lift on glass cards, animated number count-up for the calculator results. Keep it subtle. Respect `prefers-reduced-motion` everywhere (no count-up, no float, no drift).

**Accessibility / quality floor:** mobile-first responsive, visible keyboard focus rings, semantic HTML, alt text, labelled form fields, ≥4.5:1 text contrast.

---

## 3. Site structure (routes)

Single-page marketing site with anchored sections + a couple of routes:
- `/` — Home: Hero → Benefits → How PM Surya Ghar works → **Cost & Subsidy Calculator** → **Bill Upload sizing** → Savings/payback chart → Process timeline → Testimonials → FAQ → **Book a Survey** → Footer
- `/about` — About Us
- `/admin/leads` — simple protected table of survey leads (basic auth or a hardcoded admin token for now; clearly mark as MVP auth to harden later)

Sticky top nav (glass): logo, links (Benefits, Calculator, Process, About), language toggle (EN/ગુ/हि), and a sun-colored **"Book Survey"** button. Floating **WhatsApp** button bottom-right (`https://wa.me/<PLACEHOLDER_NUMBER>`).

---

## 4. Content & feature specs

### 4.1 Hero
- Headline (EN): "Turn your Gujarat rooftop into a power plant." Sub: "Govt. subsidy up to ₹78,000 under PM Surya Ghar. We handle MGVCL/DGVCL paperwork, install in a day, and switch you on."
- Two buttons: **"Calculate my savings"** (scrolls to calculator) and **"Book free survey"**.
- A glass stat strip: "₹78,000 max central subsidy · ~5.5 sun-hours/day in Gujarat · 60–75 day timeline".

### 4.2 Benefits of solar (glass cards grid)
Cover: slash your electricity bill (up to ~300 free units/month context), government subsidy via PM Surya Ghar, net metering with your DISCOM (export surplus, spin the meter back), low payback (~3–5 yrs in Gujarat), 25-year panels, clean energy / CO₂ cut, protection from tariff hikes, adds property value. One short, concrete sentence each.

### 4.3 How PM Surya Ghar works (for Gujarat)
Short explainer with the official flow: apply on the national portal (pmsuryaghar.gov.in) / SURYA Gujarat → DISCOM feasibility approval → install by MNRE-empanelled vendor (you) → DISCOM inspection + bidirectional net meter → subsidy paid to bank by DBT (typically 30–45 days after commissioning). Mention ALMM-listed panels required and 10 kW / sanctioned-load cap for residential net metering. Add the toll-free helpline 15555 and link to the portal.

### 4.4 Cost & Subsidy Calculator  ⭐ core feature
A glass calculator card. Inputs:
- **Monthly electricity bill (₹)** OR **monthly units (kWh)** — toggle between the two
- **DISCOM** dropdown: MGVCL, DGVCL, UGVCL, PGVCL (default MGVCL)
- (optional) Roof area available (sq ft) and sanctioned load (kW)

On submit, call `POST /api/calculator/estimate` and show animated result cards:
- Recommended system size (kW)
- Estimated system cost (₹, before subsidy)
- Central subsidy (PM Surya Ghar) (₹)
- Potential Gujarat state top-up (₹) — **shown only if enabled in config; labelled "potential, subject to GEDA budget — verify"**
- **Net cost after subsidy (₹)** — the hero number
- Estimated annual generation (units)
- Estimated annual savings (₹)
- Payback period (years)
- CO₂ avoided per year (tonnes)

Below results, a Recharts area/line chart of **cumulative savings vs. net cost over 25 years**, with the break-even (payback) point marked.

**Calculation rules — implement on the backend, keep all constants in one config class so they're easy to update.**

```
CONSTANTS (Gujarat defaults, all configurable):
  AVG_TARIFF_PER_UNIT        = 5.5     // ₹/kWh (LT-Domestic, range 4.5–6.0)
  UNITS_PER_KW_PER_YEAR      = 1500    // Gujarat generation estimate (~125/mo)
  SIZING_DIVISOR             = 150     // recommendedKw = monthlyUnits / 150
  MAX_RESIDENTIAL_KW         = 10
  CO2_TONNES_PER_KW_YEAR     = 1.2
  STATE_TOPUP_PER_KW         = 0       // set to 10000 ONLY if you confirm GEDA top-up is live; cap at 3 kW
  STATE_TOPUP_MAX_KW         = 3
  COST_PER_KW (tiered, ₹):
     1 kW -> 65000, 2 kW -> 60000, 3 kW -> 58000, 5 kW -> 55000, 10 kW -> 53000
     (interpolate / pick nearest band; these are approximate residential rates)

DERIVE monthly units:
  if user gave units: monthlyUnits = input
  else:               monthlyUnits = monthlyBill / AVG_TARIFF_PER_UNIT

RECOMMENDED SIZE:
  recommendedKw = round(monthlyUnits / SIZING_DIVISOR)
  clamp to [1, MAX_RESIDENTIAL_KW] and to sanctionedLoad if provided
  if roofAreaSqft provided: cap by floor(roofAreaSqft / 100)  // ~100 sq ft per kW

CENTRAL SUBSIDY (PM Surya Ghar — exact slab):
  k = min(recommendedKw, 3)
  if k <= 2:  central = k * 30000
  else:       central = 2*30000 + (k - 2)*18000        // 60000 + (k-2)*18000
  central = min(central, 78000)
  // => 1kW:30,000  2kW:60,000  3kW+:78,000 (hard cap)

STATE TOP-UP (only if enabled):
  state = min(recommendedKw, STATE_TOPUP_MAX_KW) * STATE_TOPUP_PER_KW

COST & SAVINGS:
  systemCost   = recommendedKw * costPerKw(recommendedKw)
  netCost      = systemCost - central - state
  annualUnits  = recommendedKw * UNITS_PER_KW_PER_YEAR
  annualSaving = annualUnits * AVG_TARIFF_PER_UNIT
  paybackYears = netCost / annualSaving
  co2PerYear   = recommendedKw * CO2_TONNES_PER_KW_YEAR
```
Round money to nearest ₹100 for display. Show a one-line disclaimer under results: "Estimates only, based on average Gujarat generation and tariffs. Final figures depend on your roof, DISCOM tariff slab, and live subsidy rules."

### 4.5 Electricity-bill upload → auto-size  ⭐ core feature
A glass upload zone (react-dropzone) accepting JPG/PNG/PDF of a Gujarat DISCOM bill. On drop, `POST /api/bill/analyze` (multipart). Backend uses **Tess4J/Tesseract** to OCR the bill, then regex-extracts:
- **Units consumed** (look for labels like "Units Consumed", "Total Units", "Consumption", numeric near "kWh")
- **Bill amount / net payable** (labels: "Net Payable", "Bill Amount", "Amount Payable", "Total")
- **DISCOM** (detect "MGVCL", "DGVCL", "UGVCL", "PGVCL", or "Madhya Gujarat", "Dakshin Gujarat", etc.)

Return `{ detectedUnits, detectedAmount, detectedDiscom, confidence, recommendedKw, rawTextPreview }`. Feed detected values into the same sizing/subsidy logic as 4.4 and show the recommendation.

**Important:** OCR is best-effort. Always render the detected values in **editable fields** so the user can correct them, then recalculate. If OCR confidence is low or nothing is found, show a friendly message and let them type units/amount manually. Never block the user on OCR. Do not store the uploaded file beyond the request unless the user opts in; if you must persist, store only extracted numbers, not the image.

### 4.6 Process timeline (reuse the "watch your roof get installed" idea)
A vertical, scroll-revealed timeline of 5 stages on glass: **Survey → Design & quote → DISCOM approval (MGVCL/DGVCL) → Installation (usually 1 day) → Switch-on & net meter**. Each stage animates in on scroll (Framer Motion `whileInView`), with a day/▶ marker. Keep it clean and on-brand (sky background, glass nodes). Reduced-motion: reveal statically.

### 4.7 Book a Survey  ⭐ core feature
Glass form → `POST /api/survey`. Fields: name*, phone* (Indian 10-digit validation), email, full address, city, **DISCOM** (dropdown), approx monthly bill, roof type (RCC / metal sheet / tiled / other), preferred date, message. On success show a confirmation card ("We'll call you within 48 hours") and (optional) a WhatsApp deep link prefilled with their name. Validate on both client and server. Persist as a `Lead`.

### 4.8 About Us
Company story, "MNRE-empanelled installer across Gujarat DISCOMs" (placeholder — make claims easy to edit), team/credentials placeholders, why-choose-us (local Gujarat expertise, fast MGVCL/DGVCL processing, end-to-end paperwork, post-install support & monitoring). Glass cards over sky.

### 4.9 Suggested extra features (build if time allows — mark as phase 4)
- **FAQ accordion** — subsidy timing, net metering, what if I move house, panel warranty, loan options (mention collateral-free loans via nationalised banks), ALMM.
- **Testimonials** carousel (placeholder Gujarat customers).
- **Savings chart** (already in calculator).
- **DISCOM detector helper** — "Not sure? Your bill shows the DISCOM at the top." with a small visual.
- **Application-status link-outs** to pmsuryaghar.gov.in and SURYA Gujarat.
- **Multilingual** EN/GU/HI via i18next (at minimum the nav, hero, CTAs, form labels).
- **Admin leads dashboard** at `/admin/leads` (basic-auth protected) listing captured surveys with date, status filter, CSV export.
- **WhatsApp + click-to-call** floating buttons.

---

## 5. Backend API contract

Base path `/api`. Return JSON. Use DTOs + Bean Validation. Document with Swagger.

```
POST /api/calculator/estimate
  body: {
    "inputType": "bill" | "units",
    "monthlyBill": number?,        // required if inputType=bill
    "monthlyUnits": number?,       // required if inputType=units
    "discom": "MGVCL"|"DGVCL"|"UGVCL"|"PGVCL",
    "roofAreaSqft": number?,       // optional
    "sanctionedLoadKw": number?    // optional
  }
  200: {
    "recommendedKw": number,
    "systemCost": number,
    "centralSubsidy": number,
    "stateTopUp": number,
    "stateTopUpEnabled": boolean,
    "netCost": number,
    "annualUnits": number,
    "annualSavings": number,
    "paybackYears": number,
    "co2TonnesPerYear": number,
    "assumptions": { "tariffPerUnit": number, "unitsPerKwYear": number },
    "disclaimer": string,
    "savingsSeries": [ { "year": number, "cumulativeSavings": number } ]  // 0..25 for the chart
  }

POST /api/bill/analyze   (multipart/form-data, field "file")
  200: {
    "detectedUnits": number?,
    "detectedAmount": number?,
    "detectedDiscom": string?,
    "confidence": "high"|"medium"|"low",
    "recommendedKw": number?,
    "rawTextPreview": string,
    "message": string
  }

POST /api/survey
  body: { name, phone, email?, address, city, discom, monthlyBill?, roofType, preferredDate?, message? }
  201: { "id": number, "message": "Survey booked. We'll call within 48 hours." }

GET  /api/discoms
  200: [ { "code":"MGVCL", "name":"Madhya Gujarat Vij Company Ltd", "area":"Central Gujarat (Vadodara, Anand, Nadiad, ...)" }, ... ]

GET  /api/leads          (admin only) -> list of survey leads
```

**Entities**
- `Lead` (id, name, phone, email, address, city, discom, monthlyBill, roofType, preferredDate, message, status[NEW/CONTACTED/SURVEYED/WON/LOST] default NEW, createdAt)
- (optional) `BillAnalysis` (id, detectedUnits, detectedAmount, detectedDiscom, confidence, createdAt) — numbers only, no image.

Keep all subsidy/tariff/cost numbers in a single `SolarConfig` class (or `application.yml` block) with clear comments and the `STATE_TOPUP_PER_KW = 0` default. Add a unit test for the central-subsidy slab: assert 1kW→30000, 2kW→60000, 3kW→78000, 5kW→78000.

---

## 6. Frontend structure

```
/frontend/src
  /components   (Navbar, GlassCard, Hero, BenefitsGrid, SchemeExplainer,
                 Calculator, BillUpload, ResultCards, SavingsChart,
                 ProcessTimeline, Testimonials, FAQ, SurveyForm, Footer,
                 WhatsAppButton, LanguageToggle)
  /pages        (Home, About, AdminLeads)
  /lib          (api.js axios client, formatCurrencyINR, useReducedMotion)
  /i18n         (en.json, gu.json, hi.json)
  /styles       (tailwind + glass utilities, sky background)
```
- `formatCurrencyINR` must use the Indian numbering system (₹78,000, ₹1,18,000 — lakh/crore grouping). Use `Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 })`.
- Animated count-up on result numbers (disabled under reduced motion).
- All API calls go through `/lib/api.js`; base URL from a Vite env var (`VITE_API_BASE`).

---

## 7. Constraints & correctness notes (read carefully)

- **Do not overstate subsidy or savings.** Central subsidy is hard-capped at **₹78,000** (3 kW+). The Gujarat state top-up is uncertain/budget-dependent — keep `STATE_TOPUP_PER_KW = 0` by default and, when shown, label it "potential, verify with GEDA". All calculator output carries the estimate disclaimer.
- These figures change with policy and budget years. Centralise every number so the client can update them. Add a code comment: "Verify subsidy slabs, tariffs and state top-up against pmsuryaghar.gov.in, GERC tariff orders and GEDA before going live."
- Net metering / residential cap is **10 kW or sanctioned load**, whichever is lower.
- Use placeholders for business specifics (company name, phone, WhatsApp number, license/empanelment claims, address) and collect them in one `siteConfig` file so they're trivial to fill in.
- This is marketing/estimation software, not financial advice — include a short footer disclaimer to that effect.

---

## 8. Build order (build ALL of these in one continuous run — do not stop for review)

Work through these in sequence. After finishing each, **commit** (e.g. `feat(phase-N): ...`) and immediately continue to the next. Verify each phase compiles/runs before moving on, but do not wait for human approval between phases. Only pause if you hit the session-continuity condition in Section 10.

1. **Scaffold**: create `/backend` (Spring Boot, H2 dev profile, Swagger, CORS) and `/frontend` (Vite + Tailwind + Router). Get both running with a health check and a "hello" page. Write the root `README.md` with run commands. **Make the frontend `VITE_API_BASE` and the backend `server.port` agree (use 8090 for both).**
2. **Design system**: Tailwind tokens, fonts, `GlassCard`, the blue-sky-and-solar-panels hero background (sky gradient + soft drifting clouds + a row of angled panels along the bottom so the glass has something real to blur over), Navbar, Footer, responsive shell. Use the opaque glass variant for text-heavy cards. Remove any debug/health card from the public hero.
3. **Calculator backend + frontend**: `SolarConfig`, `/api/calculator/estimate` with the exact math + subsidy unit test, then the Calculator UI, ResultCards with count-up, and SavingsChart.
4. **Bill upload**: Tess4J OCR + `/api/bill/analyze`, dropzone UI, editable detected fields feeding the calculator.
5. **Survey**: `Lead` entity, `/api/survey`, validated SurveyForm, confirmation, and `/admin/leads` table with CSV export.
6. **Content**: Benefits, Scheme explainer, Process timeline (scroll reveal), About page, FAQ, Testimonials, WhatsApp button.
7. **Polish**: i18next EN/GU/HI for key strings, reduced-motion, accessibility pass, Swagger tidy, README finalised, seed a couple of sample leads.

## 9. Acceptance criteria
- Runs locally with documented commands; Swagger lists all endpoints.
- Calculator returns correct subsidy at 1/2/3/5 kW boundaries (unit test passes) and renders the 25-year savings chart with payback marked.
- Bill upload extracts units/amount on a typical Gujarat bill and always allows manual correction.
- Survey persists a Lead and shows confirmation; admin page lists it.
- Mobile-first, glassmorphism over a clean blue-sky-and-panels background, reduced-motion respected, INR formatted in Indian style.
- No hardcoded scattered magic numbers — all solar constants live in one config.
- **All seven phases are complete in the repo** — not just the scaffold.

---

## 10. Session continuity — handoff protocol (important)

This is a large build and you may hit your context/session limit before finishing. Handle it gracefully so a fresh session can resume without losing work.

**At the start of the build:** create a file `PROGRESS.md` in the repo root. Keep it updated as a living checklist — tick off each phase and sub-task as you complete it, and commit it alongside your code changes.

`PROGRESS.md` must always contain:
- A checklist of all 7 phases with `[x]` done / `[ ]` not done, plus sub-tasks.
- **"Current state"**: what runs right now, how to start backend and frontend, the ports in use.
- **"Last completed step"** and **"Next step to do"** (be specific — file names, function names).
- Any decisions, deviations from this brief, or known issues/TODOs.
- Any commands needed to resume (install steps, env vars, DB notes).

**When you sense you are running low on context / about to hit the session limit:**
1. Stop at a safe point (code compiles, nothing half-written).
2. Commit everything.
3. Create a NEW file named `HANDOFF-<n>.md` (HANDOFF-1.md, HANDOFF-2.md, ...) capturing a complete snapshot for the next session: everything in `PROGRESS.md` above PLUS a short "how to continue" paragraph that says, in effect: *"Read this file and `PROGRESS.md`, then continue building the remaining phases from the brief `solar-website-build-prompt.md` without stopping."*
4. Tell me (the user) in your final message that you've hit the limit, which `HANDOFF-<n>.md` to point the next session at, and exactly what to paste to resume.

**To resume in a new session, the user will paste:** *"Read `HANDOFF-<n>.md` and `PROGRESS.md`, then continue building the remaining phases from `solar-website-build-prompt.md` end to end without stopping. Keep `PROGRESS.md` updated and create a new HANDOFF file if you hit the limit again."*

So the very first thing a fresh session should do is read the latest `HANDOFF-*.md` and `PROGRESS.md` to rebuild context, then carry on.

---

*End of brief. Build all phases end to end now. Keep `PROGRESS.md` updated as you go, and only stop early if you hit the session-continuity condition in Section 10.*
