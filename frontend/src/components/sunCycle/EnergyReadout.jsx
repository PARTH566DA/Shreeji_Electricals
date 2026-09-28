import { useTranslation } from 'react-i18next'
import { SYSTEM_KW, generationCurve } from './sceneMath.js'

const CW = 240
const CH = 44
// Static sparkline of a clear day's generation curve.
const CURVE = Array.from({ length: 61 }, (_, i) => {
  const x = i / 60
  return [x * CW, CH - 4 - generationCurve(x) * (CH - 8)]
})
const LINE = CURVE.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
const AREA = `${LINE} L${CW} ${CH} L0 ${CH} Z`

/**
 * Live generation card that tracks the scroll-driven day. Decorative (aria-hidden):
 * its numbers change every frame, which would be noise for screen readers.
 */
export default function EnergyReadout({ energy, dark, compact = false }) {
  const { t } = useTranslation()
  const px = energy.progress * CW
  const py = CH - 4 - generationCurve(energy.progress) * (CH - 8)
  const producing = energy.kw > 0.02

  const tone = dark
    ? 'bg-[rgba(12,20,48,0.55)] border-white/15 text-white'
    : 'bg-white/70 border-white/70 text-ink'
  const sub = dark ? 'text-white/60' : 'text-muted'

  if (compact) {
    return (
      <div aria-hidden className={`sch-readout rounded-2xl border px-3.5 py-2.5 backdrop-blur-md shadow-lg ${tone}`}>
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Dot on={producing} />
            {t(`hero.phase.${energy.phase}`)}
          </span>
          <span className={`tabular-nums ${sub}`}>{energy.clock}</span>
        </div>
        <div className="mt-1 flex items-baseline gap-3 tabular-nums">
          <span className="font-heading text-xl font-extrabold">
            {energy.kw.toFixed(1)}<span className="ml-0.5 text-xs font-semibold">kW</span>
          </span>
          <span className={`text-xs ${sub}`}>
            {t('hero.today')} <b className={dark ? 'text-white' : 'text-ink'}>{energy.kwh.toFixed(1)} kWh</b>
            {' · '}
            <b className="text-leaf">₹{Math.round(energy.saved)}</b>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden className={`sch-readout w-[304px] rounded-3xl border px-5 py-4 backdrop-blur-md shadow-glass ${tone}`}>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em]">
        <span className="flex items-center gap-2">
          <Dot on={producing} />
          {t(`hero.phase.${energy.phase}`)}
        </span>
        <span className={`tabular-nums ${sub}`}>{energy.clock}</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2 tabular-nums">
        <span className="font-heading text-4xl font-extrabold leading-none">{energy.kw.toFixed(1)}</span>
        <span className="text-sm font-semibold">kW</span>
        <span className={`ml-auto text-xs ${sub}`}>{t('hero.system', { kw: SYSTEM_KW })}</span>
      </div>

      <svg viewBox={`0 0 ${CW} ${CH}`} className="mt-2 h-10 w-full overflow-visible">
        <defs>
          <linearGradient id="sch-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB81C" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB81C" stopOpacity="0" />
          </linearGradient>
          <clipPath id="sch-spark-clip">
            <rect x="0" y="0" width={px} height={CH} />
          </clipPath>
        </defs>
        <path d={LINE} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="3 4" />
        <g clipPath="url(#sch-spark-clip)">
          <path d={AREA} fill="url(#sch-spark)" />
          <path d={LINE} fill="none" stroke="#FFB81C" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        {energy.progress < 1 && (
          <circle cx={px} cy={py} r="4.5" fill="#FFB81C" stroke={dark ? '#0c1430' : '#fff'} strokeWidth="2" />
        )}
      </svg>

      <div className={`mt-2.5 grid grid-cols-2 gap-3 border-t pt-2.5 tabular-nums ${dark ? 'border-white/10' : 'border-ink/10'}`}>
        <div>
          <div className={`text-[11px] font-medium ${sub}`}>{t('hero.today')}</div>
          <div className="text-base font-bold">{energy.kwh.toFixed(1)} kWh</div>
        </div>
        <div>
          <div className={`text-[11px] font-medium ${sub}`}>{t('hero.saved')}</div>
          <div className="text-base font-bold text-leaf">₹{Math.round(energy.saved)}</div>
        </div>
      </div>
    </div>
  )
}

function Dot({ on }) {
  return (
    <span className="relative flex h-2 w-2">
      {on && <span className="sch-ping absolute inline-flex h-full w-full rounded-full bg-leaf opacity-70" />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${on ? 'bg-leaf' : 'bg-muted'}`} />
    </span>
  )
}
