import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Scroll-driven "sun cycle" hero. The section is tall (cycleLength vh); an inner
 * sticky stage pins to the viewport while a full day plays out — sunrise on the
 * left, a noon peak, sunset on the right — with a rooftop PV array whose cast
 * shadow tracks the sun's real position.
 *
 * Everything is a pure function of a single scroll value `t` (0→1) computed from
 * THIS section's getBoundingClientRect(), so nothing can drift out of sync and
 * the effect is fully contained (independent of total page length).
 *
 * Props (all optional):
 *   cycleLength  {number} 350  — section height in vh; longer = slower day.
 *   panelTilt    {number} 50   — panel/roof incline in deg (CSS 3D rotateX).
 *   arcHeight    {number} 0.82 — 0..1 fraction of the stage the noon sun rises to.
 *   panelScale   {number} 1    — multiplier on the panel+roof size.
 *   sunSize      {number} 104  — sun diameter in px (auto-reduced on mobile).
 */
export default function SunCycleHero({
  cycleLength = 350,
  panelTilt = 50,
  arcHeight = 0.82,
  panelScale = 1,
  sunSize = 104,
}) {
  const sectionRef = useRef(null)
  const [t, setT] = useState(0)
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  const [reduced, setReduced] = useState(false)

  // Respect prefers-reduced-motion: hold a pleasant static noon instead of animating.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Single rAF-throttled scroll/resize loop → one value `t`. No heavy work in the
  // scroll event itself; everything downstream derives from `t`.
  useEffect(() => {
    if (reduced) return // static state; no scroll wiring
    let ticking = false
    const measure = () => {
      ticking = false
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      const next = span > 0 ? clamp(-rect.top / span, 0, 1) : 0
      setT(next)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(measure)
      }
    }
    const onResize = () => {
      setWidth(window.innerWidth)
      onScroll()
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  const isMobile = width < 640
  const tEff = reduced ? 0.5 : t // reduced motion → fixed solar noon
  const scene = useMemo(
    () => deriveScene(tEff, { arcHeight, isMobile, sunSize }),
    [tEff, arcHeight, isMobile, sunSize],
  )

  // Static PV cell grid (6×10) — memoized so the 60 cells are never rebuilt per frame.
  const cells = useMemo(
    () => Array.from({ length: 60 }, (_, i) => <span key={i} className="sch-cell" />),
    [],
  )

  const scale = panelScale * (isMobile ? 0.64 : 1)

  return (
    <section
      ref={sectionRef}
      aria-label="Rooftop solar through a full day"
      style={{ height: reduced ? '100vh' : `${cycleLength}vh` }}
      // Negative top margin tucks the sky up behind the floating navbar so its dawn
      // gradient — not the site's global blue backdrop — fills the area around the
      // navbar. The sticky stage still pins at top:0, so it covers the full viewport.
      className="relative -mt-24"
    >
      <style>{PANEL_CSS}</style>

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ---- Sky (decorative) ---- */}
        <div aria-hidden className="absolute inset-0" style={scene.sky} />

        {/* ---- Sun + glow (decorative) ---- */}
        <div
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: scene.sun.size,
            height: scene.sun.size,
            left: `${scene.sun.x}%`,
            top: `${scene.sun.y}%`,
            transform: 'translate(-50%, -50%)',
            background: scene.sun.fill,
            boxShadow: scene.sun.glow,
            willChange: 'transform, opacity, box-shadow',
            zIndex: 1,
          }}
        />

        {/* ---- Roof plane + panel + cast shadow (decorative) ---- */}
        <div
          aria-hidden
          className="absolute left-1/2 bottom-[7%]"
          style={{ transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'bottom center', zIndex: 2 }}
        >
          <div className="sch-tilt" style={{ transform: `perspective(1200px) rotateX(${panelTilt}deg)` }}>
            <div className="sch-roof" />
            {/* Cast shadow — lies on the roof plane, driven by sun physics */}
            <div
              className="sch-shadow"
              style={{
                transformOrigin: scene.shadow.origin,
                transform: `scaleX(${scene.shadow.len}) skewX(${scene.shadow.skew}deg)`,
                filter: `blur(${scene.shadow.blur}px)`,
                opacity: scene.shadow.opacity,
                willChange: 'transform, opacity',
              }}
            />
            <div className="sch-rail sch-rail-l" />
            <div className="sch-rail sch-rail-r" />
            <div className="sch-panelwrap">
              <div className="sch-glass">{cells}</div>
              {/* Glossy sheen that tracks the sun */}
              <div className="sch-sheen" style={{ background: scene.sheen }} />
            </div>
          </div>
        </div>

        {/* ---- Hero copy (real, focusable content) ---- */}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5 pt-[14vh] sm:pt-[16vh] text-center">
          <div
            className="pointer-events-none absolute inset-x-0 top-[8vh] mx-auto h-[42vh] max-w-3xl rounded-[40px]"
            style={{ background: scene.scrim }}
          />
          <h1
            className="relative font-heading font-extrabold tracking-tight leading-[1.03] text-5xl sm:text-6xl md:text-7xl"
            style={{ color: scene.textColor, textShadow: scene.textShadow }}
          >
            Solar, made simple.
          </h1>
          <p
            className="relative mt-4 text-base sm:text-lg font-medium"
            style={{ color: scene.captionColor }}
          >
            {scene.caption}
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/calculator" className="btn-sun text-base shadow-xl">Calculate savings</Link>
            <Link to="/book-survey" className="btn-sky text-base shadow-xl">Book free survey</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Physics + scene derivation — all pure functions of `t`.            */
/* ------------------------------------------------------------------ */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const lerp = (a, b, k) => a + (b - a) * k
const smoothstep = (edge0, edge1, x) => {
  const k = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return k * k * (3 - 2 * k)
}
const mix = (c1, c2, k) => [
  Math.round(lerp(c1[0], c2[0], k)),
  Math.round(lerp(c1[1], c2[1], k)),
  Math.round(lerp(c1[2], c2[2], k)),
]
const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`

// Sky keyframes: sunrise coral → morning gold → midday blue → afternoon amber → dusk indigo.
// Each stop has a top color and a lighter horizon-haze bottom color. Brand blue #4DA8FF at noon.
const SKY_KEYS = [
  { at: 0.0, top: [255, 201, 173], bottom: [255, 236, 222] },
  { at: 0.25, top: [255, 220, 168], bottom: [246, 248, 252] },
  { at: 0.5, top: [77, 168, 255], bottom: [233, 246, 255] },
  { at: 0.75, top: [246, 160, 74], bottom: [255, 224, 178] },
  { at: 1.0, top: [22, 30, 74], bottom: [70, 60, 110] },
]

function skyGradient(t) {
  let a = SKY_KEYS[0]
  let b = SKY_KEYS[SKY_KEYS.length - 1]
  for (let i = 0; i < SKY_KEYS.length - 1; i++) {
    if (t >= SKY_KEYS[i].at && t <= SKY_KEYS[i + 1].at) {
      a = SKY_KEYS[i]
      b = SKY_KEYS[i + 1]
      break
    }
  }
  const k = a.at === b.at ? 0 : (t - a.at) / (b.at - a.at)
  const top = mix(a.top, b.top, k)
  const bottom = mix(a.bottom, b.bottom, k)
  return `linear-gradient(180deg, ${rgb(top)} 0%, ${rgb(mix(top, bottom, 0.55))} 58%, ${rgb(bottom)} 100%)`
}

const SUN_HORIZON = [255, 179, 112] // soft amber at sunrise/sunset (not harsh orange)
const SUN_NOON = [255, 246, 214] // near-white gold at zenith
const GLOW_HORIZON = [255, 165, 104]
const GLOW_NOON = [255, 236, 186]
const NAVY = [11, 61, 145]
const WHITE = [255, 255, 255]

const CAPTIONS = [
  [0.06, 'Sunrise — panels waking up'],
  [0.22, 'Morning — output climbing'],
  [0.42, 'Approaching solar noon'],
  [0.58, 'Solar noon — peak generation'],
  [0.74, 'Late afternoon — still producing'],
  [0.9, 'Sunset — output tapering off'],
  [1.01, 'Dusk — the grid takes over'],
]

function captionFor(t) {
  for (const [thr, label] of CAPTIONS) if (t <= thr) return label
  return CAPTIONS[CAPTIONS.length - 1][1]
}

function deriveScene(t, { arcHeight, isMobile, sunSize }) {
  const sunAngle = t * Math.PI
  const elevation = Math.sin(sunAngle) // 0 at horizons → 1 at noon

  // Sun position: off-screen left → off-screen right; height by elevation.
  const HORIZON_PCT = 72
  const NOON_TOP_PCT = 10
  const sunX = lerp(-5, 105, t)
  const sunY = lerp(HORIZON_PCT, NOON_TOP_PCT, elevation * arcHeight)

  const sunFill = rgb(mix(SUN_HORIZON, SUN_NOON, smoothstep(0, 1, elevation)))
  const glowCol = mix(GLOW_HORIZON, GLOW_NOON, elevation)
  const glow =
    `0 0 ${lerp(26, 66, elevation)}px ${lerp(6, 26, elevation)}px ${rgba(glowCol, lerp(0.35, 0.72, elevation))}`

  // Shadow: falls AWAY from the sun; long & soft when low, short & crisp at noon.
  const dir = t < 0.5 ? 1 : -1 // +1 → shadow to the right, -1 → to the left
  const len = lerp(2.4, 0.12, elevation) // scaleX factor (physical 1/tan clamped into this range)
  const skew = (dir > 0 ? -1 : 1) * lerp(20, 0, elevation) // rakes sideways when sun is low
  const shadow = {
    origin: dir > 0 ? 'left center' : 'right center', // edge nearest the sun stays pinned
    len,
    skew,
    blur: lerp(16, 3, elevation),
    opacity: lerp(0.08, 0.32, elevation),
  }

  // Glass sheen: highlight sweeps across with the sun; warm at horizons, bright at noon.
  const p = lerp(12, 88, t)
  const sheenCol = mix(WHITE, [255, 210, 150], (1 - elevation) * 0.85)
  const sheenA = lerp(0.1, 0.5, elevation)
  const sheen =
    `linear-gradient(105deg, transparent ${p - 16}%, ${rgba(sheenCol, sheenA)} ${p}%, transparent ${p + 16}%)`

  // Keep copy readable at every stage: whiten text + strengthen scrim as dusk falls.
  const w = smoothstep(0.72, 0.95, t)
  const textColor = rgb(mix(NAVY, WHITE, w))
  const captionColor = rgb(mix([27, 58, 92], WHITE, w))
  const textShadow = w > 0.2 ? '0 2px 18px rgba(6,12,32,0.55)' : '0 2px 22px rgba(255,255,255,0.5)'
  const scrim = `radial-gradient(60% 70% at 50% 40%, rgba(6,12,32,${lerp(0.04, 0.34, w)}) 0%, rgba(6,12,32,0) 100%)`

  return {
    sky: { background: skyGradient(t) },
    sun: { x: sunX, y: sunY, size: sunSize * (isMobile ? 0.72 : 1), fill: sunFill, glow },
    shadow,
    sheen,
    caption: captionFor(t),
    textColor,
    captionColor,
    textShadow,
    scrim,
  }
}

/* Static structural CSS for the 3D panel + roof. Kept self-contained (project is
   Tailwind-only, no CSS modules); dynamic values are inline styles above. */
const PANEL_CSS = `
.sch-tilt { position: relative; transform-style: preserve-3d; }
.sch-shadow {
  position: absolute; left: 50%; margin-left: -206px; bottom: 4px;
  width: 412px; height: 62px;
  background: radial-gradient(ellipse at center, rgba(6,14,30,0.9) 0%, rgba(6,14,30,0.4) 55%, rgba(6,14,30,0) 78%);
  border-radius: 50%;
}
.sch-roof {
  position: absolute; left: 50%; bottom: -22px; width: 772px; height: 258px;
  transform: translateX(-50%);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.10)),
    repeating-linear-gradient(90deg, #33425c 0 26px, #2c394f 26px 27px),
    linear-gradient(180deg, #3a4a66 0%, #26324a 100%);
  border-radius: 10px;
  box-shadow: 0 30px 60px -20px rgba(6,12,32,0.55), inset 0 2px 0 rgba(255,255,255,0.12);
}
.sch-rail { position: absolute; left: 50%; bottom: 24px; width: 436px; height: 8px;
  background: linear-gradient(180deg,#8593a6,#5b6678 60%,#454f61); border-radius: 4px; }
.sch-rail-l { transform: translateX(-50%) translateY(30px); opacity: 0.5; }
.sch-rail-r { transform: translateX(-50%) translateY(52px); opacity: 0.35; }
.sch-panelwrap {
  position: relative; width: 452px; height: 288px; margin: 0 auto;
  padding: 9px; border-radius: 10px;
  background: linear-gradient(150deg, #e8eef6 0%, #b9c6d6 42%, #8b9bb0 100%);
  box-shadow: 0 22px 40px -16px rgba(6,12,32,0.6), inset 0 1px 2px rgba(255,255,255,0.9),
    inset 0 -3px 8px rgba(9,25,55,0.35);
}
.sch-glass {
  position: relative; width: 100%; height: 100%;
  display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(10, 1fr);
  gap: 3px; padding: 6px; border-radius: 5px;
  background: linear-gradient(160deg, #0d2a52 0%, #0a2144 60%, #081a36 100%);
}
.sch-cell {
  border-radius: 2px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 42%),
    repeating-linear-gradient(90deg, transparent 0 41%, rgba(200,220,246,0.14) 41% 42.5%, transparent 42.5% 100%),
    linear-gradient(160deg, #1c4d8e 0%, #123f75 52%, #0c2c58 100%);
  box-shadow: inset 0 0 5px rgba(0,0,0,0.35);
}
.sch-sheen {
  position: absolute; inset: 9px; border-radius: 5px; pointer-events: none;
  mix-blend-mode: screen;
}
@media (max-width: 640px) {
  .sch-roof { width: 640px; }
}
`
