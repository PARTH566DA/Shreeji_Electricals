// Pure scene maths for the SunCycleHero. Everything here is a function of one scroll
// value `t` (0 = sunrise, 1 = night) plus the measured stage box — no DOM, no React.

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const lerp = (a, b, k) => a + (b - a) * k
export const smoothstep = (e0, e1, x) => {
  const k = clamp((x - e0) / (e1 - e0), 0, 1)
  return k * k * (3 - 2 * k)
}
export const mix = (c1, c2, k) => [lerp(c1[0], c2[0], k), lerp(c1[1], c2[1], k), lerp(c1[2], c2[2], k)]
export const rgb = (c) => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`
export const rgba = (c, a) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a.toFixed(3)})`

/** WCAG relative luminance of an sRGB triple (0–255). */
export function luminance(c) {
  const ch = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

// ---- Day timeline ---------------------------------------------------------
export const T_SUNSET = 0.86 // scroll point where the sun touches the horizon
const A0 = 0.09 * Math.PI // the first frame already shows a risen sun, clear of the hills
const SUNRISE_H = 6.25 // 6:15 AM
const DAY_HOURS = 12.5 // → sunset 6:45 PM

// Illustrative 3 kW home system on a clear Gujarat day. Tariff matches the
// calculator's residential average (SolarConfig.avgTariffPerUnit).
export const SYSTEM_KW = 3
export const PEAK_KW = 2.5
export const TARIFF = 5.5

// ---- Scene geometry (SVG viewBox units) -------------------------------------
export const VB_W = 1600
export const VB_H = 900
export const HORIZON = 660

// ---- Palettes: [day, golden-morning, golden-evening, night] -----------------
const P = {
  zenith: [[74, 152, 245], [112, 140, 214], [92, 98, 176], [8, 12, 36]],
  mid: [[150, 202, 252], [238, 196, 196], [236, 150, 150], [20, 26, 64]],
  horizon: [[222, 240, 255], [255, 214, 166], [255, 160, 104], [44, 40, 88]],
  farHill: [[168, 198, 228], [206, 180, 198], [198, 142, 152], [28, 34, 72]],
  midHill: [[118, 162, 146], [168, 150, 152], [146, 106, 118], [20, 26, 56]],
  groundTop: [[182, 198, 150], [200, 194, 150], [206, 176, 134], [22, 28, 52]],
  groundBot: [[132, 162, 108], [150, 150, 112], [150, 124, 98], [12, 16, 34]],
  path: [[222, 214, 190], [238, 208, 176], [236, 186, 150], [36, 40, 66]],
  foliage: [[74, 142, 98], [100, 134, 94], [104, 118, 82], [14, 22, 40]],
  foliageDark: [[48, 110, 78], [74, 104, 76], [76, 84, 64], [9, 15, 30]],
  trunk: [[112, 86, 66], [118, 82, 64], [112, 70, 56], [18, 20, 34]],
  wall: [[250, 246, 238], [255, 230, 206], [255, 212, 176], [56, 62, 98]],
  wallSide: [[212, 208, 202], [226, 190, 166], [214, 164, 138], [38, 42, 72]],
  slab: [[232, 228, 222], [240, 214, 192], [236, 196, 166], [46, 52, 86]],
  plinth: [[176, 170, 162], [190, 160, 140], [180, 140, 118], [30, 34, 58]],
  accent: [[34, 86, 168], [72, 86, 150], [70, 70, 136], [18, 26, 60]],
  door: [[146, 96, 62], [150, 90, 60], [146, 80, 52], [34, 28, 40]],
  frame: [[218, 224, 234], [236, 214, 196], [232, 194, 170], [64, 70, 102]],
  tank: [[46, 50, 60], [58, 52, 58], [60, 48, 52], [14, 16, 28]],
  cloud: [[255, 255, 255], [255, 228, 214], [255, 196, 170], [42, 50, 94]],
}

// Glass reflects the sky with a dark body; windows glow warm once the lights are on.
const PANEL_BODY = [14, 40, 92]
const WARM_LIGHT = [255, 204, 128]

/** Sun angle (radians) for scroll t: 0 → sunrise, π → sunset, continues below after. */
export const sunAngle = (t) => A0 + (Math.PI - A0) * (t / T_SUNSET)

/** Cumulative kWh generated since sunrise (analytic ∫ PEAK·sin² over the day). */
function energySoFar(a) {
  const x = clamp(a, 0, Math.PI)
  return PEAK_KW * (DAY_HOURS / Math.PI) * (x / 2 - Math.sin(2 * x) / 4)
}

function clock(a) {
  const h = SUNRISE_H + (a / Math.PI) * DAY_HOURS
  const hh = Math.floor(h)
  const mm = Math.floor((h - hh) * 60)
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`
}

function phase(a, e) {
  if (e < -0.1) return 'night'
  if (e < 0) return 'sunset'
  const h = SUNRISE_H + (a / Math.PI) * DAY_HOURS
  if (h < 7.6) return 'sunrise'
  if (h < 11) return 'morning'
  if (h < 14) return 'noon'
  if (h < 17.4) return 'afternoon'
  return 'sunset'
}

/**
 * Derive every dynamic value of the scene.
 * @param t      scroll progress 0..1
 * @param box    { w, h, copyBottom } stage size in px + bottom of the copy block
 * @param wide   two-column desktop layout (copy left, sun arc on the right)
 */
export function deriveScene(t, box, wide) {
  const { w, h } = box
  const a = sunAngle(t)
  const e = Math.sin(a) // elevation: 0 at the horizon, 1 overhead, <0 below
  const eUp = Math.max(0, e)

  const day = smoothstep(-0.05, 0.4, e)
  const night = 1 - smoothstep(-0.3, 0, e)
  const golden = (1 - smoothstep(0.08, 0.6, e)) * (1 - night)
  const evening = smoothstep(0.35, 0.65, t)
  const lightsOn = smoothstep(0.83, 0.93, t)

  const tone = (key) => {
    const [d, am, pm, n] = P[key]
    return mix(mix(d, mix(am, pm, evening), golden), n, night)
  }

  // ---- Stage mapping (SVG uses preserveAspectRatio xMidYMax slice) ----
  const scale = Math.max(w / VB_W, h / VB_H)
  const offX = (w - VB_W * scale) / 2
  const offY = h - VB_H * scale
  const horizonPx = offY + HORIZON * scale
  const toUnitsX = (px) => (px - offX) / scale

  // ---- Sun ----
  const sunSize = wide ? 96 : 66
  const u = a / Math.PI // 0..1 across the day (continues past 1 after sunset)
  const sunX = (wide ? lerp(0.44, 1.0, u) : lerp(0.04, 1.0, u)) * w
  // Peak stays clear of the copy: above it on desktop's right column, below it on mobile.
  const peakPx = wide
    ? Math.max(0.17 * h, 128 + sunSize / 2)
    : Math.min(box.copyBottom + sunSize * 0.62 + 14, horizonPx - 110)
  const sunY = horizonPx - e * (horizonPx - peakPx)

  const sunCore = mix([255, 252, 240], [255, 232, 186], golden)
  const sunEdge = mix([255, 226, 150], [255, 150, 84], golden)
  const glowCol = mix([255, 240, 200], [255, 164, 96], golden)
  const glowA = (0.5 * golden + 0.28 * day) * smoothstep(-0.12, 0.02, e)

  // ---- Sky ----
  const zenith = tone('zenith')
  const skyMid = tone('mid')
  const skyHorizon = tone('horizon')
  const midStop = clamp((horizonPx / h) * 0.58, 0.2, 0.7) * 100
  const hzStop = clamp(horizonPx / h, 0.4, 1) * 100

  // ---- Copy contrast: pick navy or white from the sky luminance behind the copy ----
  const behindCopy = mix(zenith, skyMid, wide ? 0.72 : 0.6)
  // Binary navy/white (a CSS transition smooths the swap): any blend passes through an
  // unreadable mid-tone. Near the switch point a soft scrim restores contrast either way.
  const skyL = luminance(behindCopy)
  const whiteText = skyL < 0.265 ? 1 : 0
  const scrim = whiteText
    ? `rgba(8, 12, 36, ${(0.45 * clamp((skyL - 0.06) / 0.2, 0, 1)).toFixed(3)})`
    : `rgba(255, 250, 244, ${(0.4 * clamp((0.42 - skyL) / 0.16, 0, 1)).toFixed(3)})`

  // ---- House & shadows ----
  const houseX = toUnitsX((wide ? 0.7 : 0.5) * w)
  const houseScale = wide ? 1.15 : 0.64
  const baseY = wide ? 800 : 796
  const dir = a < Math.PI / 2 ? 1 : -1 // shadows fall away from the sun
  const shadowLen = 40 + 460 * (1 - eUp) ** 2
  const shadowA = 0.42 * smoothstep(0.02, 0.25, e)
  const sideLit = smoothstep(-0.25, 0.25, u - 0.5) * day // right-hand faces catch afternoon sun

  // ---- Panels ----
  const panelGlass = mix(mix(PANEL_BODY, zenith, 0.3), [8, 14, 34], night * 0.7)
  const glintPos = clamp(lerp(-0.1, 1.1, u), -0.2, 1.2)
  const glintA = (0.18 + 0.5 * eUp) * (1 - night)

  // ---- Energy ----
  const kw = PEAK_KW * eUp * eUp
  const kwh = energySoFar(a)

  const wall = tone('wall')
  return {
    t,
    a,
    u,
    e,
    day,
    night,
    golden,
    lightsOn,
    horizonPx,
    sky: `linear-gradient(180deg, ${rgb(zenith)} 0%, ${rgb(skyMid)} ${midStop}%, ${rgb(skyHorizon)} ${hzStop}%, ${rgb(skyHorizon)} 100%)`,
    glow: `radial-gradient(circle at ${sunX}px ${sunY}px, ${rgba(glowCol, glowA)} 0%, ${rgba(glowCol, glowA * 0.4)} ${Math.max(w, h) * 0.14}px, ${rgba(glowCol, 0)} ${Math.max(w, h) * 0.5}px)`,
    sun: {
      x: sunX,
      y: sunY,
      size: sunSize,
      fill: `radial-gradient(circle at 50% 50%, ${rgb(sunCore)} 0%, ${rgb(sunCore)} 38%, ${rgb(sunEdge)} 100%)`,
      bloom: `0 0 ${lerp(30, 44, golden)}px ${lerp(8, 16, golden)}px ${rgba(glowCol, 0.75)}, 0 0 ${lerp(90, 140, golden)}px ${lerp(26, 50, golden)}px ${rgba(glowCol, 0.4)}`,
      raysA: 0.22 * day * (1 - golden * 0.5),
      visible: e > -0.2,
    },
    starsA: night ** 1.4,
    moonA: smoothstep(0.9, 0.99, t),
    cloud: rgb(tone('cloud')),
    cloudA: lerp(0.92, 0.5, night),
    scrim,
    copy: {
      white: whiteText,
      color: rgb(mix([11, 61, 145], [255, 255, 255], whiteText)),
      sub: rgb(mix([30, 52, 84], [226, 232, 248], whiteText)),
      shadow: whiteText > 0.5 ? '0 2px 24px rgba(4,10,30,0.45)' : '0 1px 18px rgba(255,255,255,0.45)',
    },
    colors: {
      farHill: rgb(tone('farHill')),
      midHill: rgb(tone('midHill')),
      haze: rgb(skyHorizon),
      groundTop: rgb(tone('groundTop')),
      groundBot: rgb(tone('groundBot')),
      path: rgb(tone('path')),
      foliage: rgb(tone('foliage')),
      foliageDark: rgb(tone('foliageDark')),
      foliageLit: rgb(mix(tone('foliage'), [255, 226, 150], 0.28 * day)),
      trunk: rgb(tone('trunk')),
      wall: rgb(wall),
      wallSide: rgb(mix(tone('wallSide'), wall, sideLit * 0.8)),
      slab: rgb(tone('slab')),
      plinth: rgb(tone('plinth')),
      accent: rgb(tone('accent')),
      door: rgb(tone('door')),
      frame: rgb(tone('frame')),
      tank: rgb(tone('tank')),
      panel: rgb(panelGlass),
      panelEdge: rgb(mix(panelGlass, [255, 255, 255], 0.14)),
      window: rgb(mix(mix([58, 88, 128], skyMid, 0.35), WARM_LIGHT, lightsOn)),
      warm: rgb(WARM_LIGHT),
      flow: rgb(mix([255, 196, 60], [255, 170, 60], golden)),
    },
    house: { x: houseX, y: baseY, scale: houseScale },
    shadow: {
      dx: dir * shadowLen,
      dy: 18 + 26 * (1 - eUp),
      a: shadowA,
      contact: lerp(0.28, 0.12, night),
    },
    glint: { pos: glintPos, a: glintA },
    energy: {
      kw,
      kwh,
      saved: kwh * TARIFF,
      flowA: clamp(kw / PEAK_KW, 0, 1),
      clock: clock(a),
      phase: phase(a, e),
      progress: clamp(u, 0, 1),
    },
  }
}

/** Normalised generation curve for the readout sparkline (0..1 across the day). */
export const generationCurve = (x) => Math.sin(Math.PI * x) ** 2
