import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from './icons.jsx'
import SolarScene from './sunCycle/SolarScene.jsx'
import EnergyReadout from './sunCycle/EnergyReadout.jsx'
import { clamp, deriveScene, smoothstep } from './sunCycle/sceneMath.js'
import { useReducedMotion } from '../lib/useReducedMotion.js'

/**
 * Scroll-driven "day of solar" hero. The section is tall (cycleLength vh); an inner
 * sticky stage pins to the viewport while a full day plays out over an illustrated
 * Gujarat home: sunrise → solar noon → sunset → night, with lighting, shadows, panel
 * glint, live generation numbers and window lights all derived from one value `t`.
 *
 * `t` comes from THIS section's getBoundingClientRect() and is eased toward the scroll
 * position each frame, so wheel/trackpad steps glide instead of jumping. All scene
 * maths lives in sunCycle/sceneMath.js; geometry in sunCycle/SolarScene.jsx.
 */
export default function SunCycleHero({ cycleLength = 320 }) {
  const { t: tr } = useTranslation()
  const reduced = useReducedMotion()
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const copyRef = useRef(null)
  const [t, setT] = useState(0)
  const [box, setBox] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
    copyBottom: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400,
  }))

  // Measure the stage and where the copy ends, so the sun's arc never crosses the text.
  useLayoutEffect(() => {
    const stage = stageRef.current
    const copy = copyRef.current
    if (!stage || !copy) return
    const measure = () => {
      const s = stage.getBoundingClientRect()
      const c = copy.getBoundingClientRect()
      setBox({ w: s.width, h: s.height, copyBottom: c.bottom - s.top })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    ro.observe(copy)
    return () => ro.disconnect()
  }, [])

  // Scroll → target t; a rAF loop eases the displayed t toward it and stops when settled.
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let current = null
    const target = () => {
      const el = sectionRef.current
      const stage = stageRef.current
      if (!el || !stage) return 0
      const rect = el.getBoundingClientRect()
      const span = rect.height - stage.offsetHeight
      return span > 0 ? clamp(-rect.top / span, 0, 1) : 0
    }
    const tick = () => {
      raf = 0
      const goal = target()
      if (current === null) current = goal
      const diff = goal - current
      current = Math.abs(diff) < 0.0006 ? goal : current + diff * 0.14
      setT(current)
      if (current !== goal) raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    kick()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const wide = box.w >= 1024
  const tEff = reduced ? 0.36 : t // reduced motion → a still, bright late morning
  const scene = useMemo(() => deriveScene(tEff, box, wide), [tEff, box, wide])
  const dark = scene.copy.white > 0.5

  const headline = tr('hero.headline')
  const comma = headline.indexOf(', ')

  return (
    <section
      ref={sectionRef}
      aria-label={tr('hero.aria')}
      style={{ height: reduced ? '100svh' : `${cycleLength}vh` }}
      // Negative top margin tucks the sky up behind the floating navbar.
      className="relative -mt-24"
    >
      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden" style={{ height: '100svh' }}>
        {/* ---- Sky ---- */}
        <div aria-hidden className="absolute inset-0" style={{ background: scene.sky }} />
        <div aria-hidden className="absolute inset-0" style={{ background: scene.glow }} />
        <Stars opacity={scene.starsA} wide={wide} />
        {wide && (
          <div
            aria-hidden
            className="absolute right-[12%] top-[20%] h-9 w-9 rounded-full"
            style={{
              opacity: scene.moonA,
              boxShadow: 'inset -9px 4px 0 0 #f4efd8',
              filter: 'drop-shadow(0 0 10px rgba(244,239,216,0.45))',
            }}
          />
        )}

        {/* ---- Sun: rotating rays, bloom, disc ---- */}
        {scene.sun.visible && (
          <div
            aria-hidden
            className="absolute"
            style={{ left: scene.sun.x, top: scene.sun.y, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="sch-rays absolute rounded-full"
              style={{
                // Centred on the disc: 50%/50% of the disc-sized wrapper, pulled back by half the rays' size.
                width: scene.sun.size * 6,
                height: scene.sun.size * 6,
                left: '50%',
                top: '50%',
                marginLeft: -scene.sun.size * 3,
                marginTop: -scene.sun.size * 3,
                opacity: scene.sun.raysA,
              }}
            />
            <div
              className="relative rounded-full"
              style={{
                width: scene.sun.size,
                height: scene.sun.size,
                background: scene.sun.fill,
                boxShadow: scene.sun.bloom,
              }}
            />
          </div>
        )}

        <Clouds color={scene.cloud} opacity={scene.cloudA} wide={wide} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse ${wide ? '46% 52% at 26% 36%' : '80% 36% at 50% 26%'}, ${scene.scrim} 0%, transparent 100%)`,
          }}
        />

        {/* ---- Landscape + house ---- */}
        <SolarScene scene={scene} />
        {/* Exit: over the last stretch of scroll the ground dissolves into the page colour,
            so the night scene doesn't end in a hard edge against the light sections below. */}
        {!reduced && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[26vh]"
            style={{
              opacity: smoothstep(0.93, 1, t),
              background: 'linear-gradient(to bottom, rgba(236,246,255,0) 0%, rgba(236,246,255,0.85) 70%, rgb(236,246,255) 100%)',
            }}
          />
        )}

        {/* ---- Copy (real, focusable content) ---- */}
        <div className={`absolute inset-x-0 top-0 z-10 ${wide ? '' : 'text-center'}`}>
          <div
            ref={copyRef}
            className={
              wide
                ? 'mx-auto max-w-6xl px-8 pt-[max(16vh,124px)]'
                : 'mx-auto max-w-xl px-5 pt-[max(13vh,108px)]'
            }
          >
            <div className={wide ? 'max-w-[42rem]' : ''}>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold backdrop-blur-md transition-colors duration-500 ${
                  dark ? 'border-white/20 bg-white/10 text-white' : 'border-white/70 bg-white/60 text-navy'
                }`}
              >
                <SunGlyph />
                {tr('hero.eyebrow')}
              </span>

              <h1
                className={`mt-4 font-heading font-extrabold tracking-[-0.035em] ${
                  wide
                    ? 'text-[clamp(3.4rem,min(6.2vw,10.5vh),6rem)] leading-[0.98]'
                    : 'text-[clamp(2.5rem,11vw,3.6rem)] leading-[1.02]'
                }`}
                style={{ color: scene.copy.color, textShadow: scene.copy.shadow, transition: 'color .4s ease, text-shadow .4s ease' }}
              >
                {comma > 0 ? (
                  <>
                    {headline.slice(0, comma + 1)}
                    <br />
                    {headline.slice(comma + 2)}
                  </>
                ) : (
                  headline
                )}
              </h1>

              <p
                className={`mt-4 font-medium leading-relaxed ${
                  wide ? 'max-w-[34rem] text-lg' : 'mx-auto max-w-md text-[15px] [@media(max-height:700px)]:hidden'
                }`}
                style={{ color: scene.copy.sub, transition: 'color .4s ease' }}
              >
                {tr('hero.sub')}
              </p>

              <div className={`mt-7 flex gap-3 ${wide ? '' : 'justify-center'}`}>
                <Link to="/calculator" className={`btn-sun shadow-xl ${wide ? 'text-base' : '!px-4 !py-2.5 text-sm'}`}>
                  {tr('hero.calcCta')}
                  {wide && <ArrowRight className="h-5 w-5" />}
                </Link>
                <Link to="/book-survey" className={`btn-sky shadow-xl ${wide ? 'text-base' : '!px-4 !py-2.5 text-sm'}`}>
                  {tr('hero.surveyCta')}
                </Link>
              </div>
            </div>
            {wide && (
              <div className="mt-8 [@media(max-height:740px)]:hidden">
                <EnergyReadout energy={scene.energy} dark={scene.night > 0.5} />
              </div>
            )}
          </div>
        </div>

        {!wide && (
          <div className="absolute bottom-4 left-4 right-[5.5rem] z-10 sm:right-auto sm:w-80">
            <EnergyReadout energy={scene.energy} dark={scene.night > 0.5} compact />
          </div>
        )}

        {/* ---- Scroll hint ---- */}
        {wide && !reduced && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-7 left-[41%] z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold tracking-wide"
            style={{ opacity: 1 - clamp(t / 0.05, 0, 1), color: scene.copy.color }}
          >
            <span className="flex h-9 w-6 justify-center rounded-full border-2 border-current pt-1.5">
              <span className="sch-wheel h-2 w-1 rounded-full bg-current" />
            </span>
            {tr('hero.scroll')}
          </div>
        )}
      </div>
    </section>
  )
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="10" r="4" fill="#FFB81C" />
      <g stroke="#FFB81C" strokeWidth="1.6" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
          <line key={d} x1="10" y1="2" x2="10" y2="3.8" transform={`rotate(${d} 10 10)`} />
        ))}
      </g>
    </svg>
  )
}

// Deterministic star field (seeded) so it never reshuffles between renders.
const STARS = (() => {
  let s = 7
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: 90 }, () => ({
    x: rnd() * 100,
    y: rnd() * 62,
    r: 0.8 + rnd() * 1.6,
    d: (2.5 + rnd() * 3.5).toFixed(2),
    delay: (rnd() * 4).toFixed(2),
  }))
})()

function Stars({ opacity, wide }) {
  if (opacity <= 0.001) return null
  return (
    <div aria-hidden className="absolute inset-0" style={{ opacity }}>
      {STARS.slice(0, wide ? 90 : 50).map((st, i) => (
        <span
          key={i}
          className="sch-star absolute rounded-full bg-white"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.r,
            height: st.r,
            animationDuration: `${st.d}s`,
            animationDelay: `${st.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Kept clear of the headline column on desktop.
const CLOUDS_WIDE = [
  { x: 52, y: 14, w: 190, d: 55 },
  { x: 80, y: 34, w: 300, d: 85 },
]
const CLOUDS_NARROW = [
  { x: -12, y: 16, w: 190, d: 60 },
  { x: 64, y: 9, w: 150, d: 50 },
]

function Clouds({ color, opacity, wide }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity }}>
      {(wide ? CLOUDS_WIDE : CLOUDS_NARROW).map((cl) => (
        <svg
          key={cl.x}
          viewBox="0 0 200 70"
          className="sch-cloud absolute"
          style={{ left: `${cl.x}%`, top: `${cl.y}%`, width: cl.w, animationDuration: `${cl.d}s` }}
        >
          <g fill={color}>
            <ellipse cx="100" cy="52" rx="92" ry="16" />
            <circle cx="70" cy="40" r="24" />
            <circle cx="104" cy="30" r="30" />
            <circle cx="138" cy="42" r="20" />
          </g>
        </svg>
      ))}
    </div>
  )
}
