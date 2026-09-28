import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { estimate, getDiscoms } from '../lib/api.js'
import ResultCards from './ResultCards.jsx'

const FALLBACK_DISCOMS = [
  { code: 'MGVCL', name: 'Madhya Gujarat Vij Company Ltd', area: 'Central Gujarat' },
  { code: 'DGVCL', name: 'Dakshin Gujarat Vij Company Ltd', area: 'South Gujarat' },
  { code: 'UGVCL', name: 'Uttar Gujarat Vij Company Ltd', area: 'North Gujarat' },
  { code: 'PGVCL', name: 'Paschim Gujarat Vij Company Ltd', area: 'Saurashtra-Kutch' },
]

export default function Calculator({ preset, showHeading = true, defaultType = 'residential' }) {
  const { t } = useTranslation()
  const [discoms, setDiscoms] = useState(FALLBACK_DISCOMS)
  const [consumerType, setConsumerType] = useState(defaultType)
  const [inputType, setInputType] = useState('bill')
  const [form, setForm] = useState({
    monthlyBill: '',
    monthlyUnits: '',
    discom: 'MGVCL',
    roofAreaSqft: '',
    sanctionedLoadKw: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Anything but a list (e.g. an HTML page from a misrouted /api) falls back too.
    getDiscoms()
      .then((d) => setDiscoms(Array.isArray(d) && d.length ? d : FALLBACK_DISCOMS))
      .catch(() => setDiscoms(FALLBACK_DISCOMS))
  }, [])

  // Allow the Bill-upload section to push detected values in.
  useEffect(() => {
    if (!preset) return
    const patch = preset.discom ? { discom: preset.discom } : {}
    if (preset.units != null) {
      setInputType('units')
      setForm((f) => ({ ...f, monthlyUnits: String(preset.units), ...patch }))
    } else if (preset.bill != null) {
      setInputType('bill')
      setForm((f) => ({ ...f, monthlyBill: String(preset.bill), ...patch }))
    }
  }, [preset])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        inputType,
        consumerType: consumerType.toUpperCase(),
        discom: form.discom,
        ...(inputType === 'bill'
          ? { monthlyBill: Number(form.monthlyBill) }
          : { monthlyUnits: Number(form.monthlyUnits) }),
        ...(form.roofAreaSqft ? { roofAreaSqft: Number(form.roofAreaSqft) } : {}),
        ...(form.sanctionedLoadKw ? { sanctionedLoadKw: Number(form.sanctionedLoadKw) } : {}),
      }
      const data = await estimate(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelCls = 'block text-sm font-medium text-ink mb-1'
  const inputCls = 'w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-ink focus:bg-white outline-none'

  return (
    <section id="calculator" className="px-3 py-12 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        {showHeading && (
          <>
            <h2 className="text-3xl text-navy text-center">{t('sections.calculator')}</h2>
            <p className="text-muted text-center mt-2">Estimate your system size, subsidy and payback in seconds.</p>
          </>
        )}

        <div className="grid lg:grid-cols-5 gap-6 mt-6">
          <form onSubmit={onSubmit} className="glass glass-solid p-6 lg:col-span-2 space-y-4">
            {/* Residential / Commercial toggle */}
            <div>
              <span className={labelCls}>I'm a</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'residential', label: 'Home / residential' },
                  { key: 'commercial', label: 'Business / commercial' },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => { setConsumerType(c.key); setResult(null) }}
                    aria-pressed={consumerType === c.key}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium border transition ${
                      consumerType === c.key
                        ? 'bg-sky-deep text-white border-sky-deep'
                        : 'bg-white/60 text-ink border-white/60 hover:bg-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {consumerType === 'commercial' && (
                <p className="text-xs text-muted mt-1.5">No PM Surya Ghar subsidy for businesses — but accelerated-depreciation tax benefit applies.</p>
              )}
            </div>

            {/* Bill / units toggle */}
            <div className="inline-flex rounded-full bg-white/60 p-0.5 text-sm">
              {['bill', 'units'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInputType(t)}
                  aria-pressed={inputType === t}
                  className={`px-4 py-1.5 rounded-full capitalize transition ${
                    inputType === t ? 'bg-sky-deep text-white' : 'text-ink'
                  }`}
                >
                  {t === 'bill' ? 'Monthly bill (₹)' : 'Monthly units (kWh)'}
                </button>
              ))}
            </div>

            {inputType === 'bill' ? (
              <div>
                <label className={labelCls} htmlFor="monthlyBill">Average monthly electricity bill (₹)</label>
                <input id="monthlyBill" type="number" min="1" required value={form.monthlyBill}
                  onChange={set('monthlyBill')} className={inputCls} placeholder="e.g. 2500" />
              </div>
            ) : (
              <div>
                <label className={labelCls} htmlFor="monthlyUnits">Average monthly units (kWh)</label>
                <input id="monthlyUnits" type="number" min="1" required value={form.monthlyUnits}
                  onChange={set('monthlyUnits')} className={inputCls} placeholder="e.g. 450" />
              </div>
            )}

            <div>
              <label className={labelCls} htmlFor="discom">Your DISCOM</label>
              <select id="discom" value={form.discom} onChange={set('discom')} className={inputCls}>
                {discoms.map((d) => (
                  <option key={d.code} value={d.code}>{d.code} — {d.area}</option>
                ))}
              </select>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-sky-deep font-medium">Optional: roof area &amp; sanctioned load</summary>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelCls} htmlFor="roof">Roof area (sq ft)</label>
                  <input id="roof" type="number" min="1" value={form.roofAreaSqft} onChange={set('roofAreaSqft')} className={inputCls} placeholder="e.g. 400" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="load">Sanctioned load (kW)</label>
                  <input id="load" type="number" min="1" step="0.5" value={form.sanctionedLoadKw} onChange={set('sanctionedLoadKw')} className={inputCls} placeholder="e.g. 4" />
                </div>
              </div>
            </details>

            <button type="submit" disabled={loading} className="btn-sun w-full">
              {loading ? 'Calculating…' : 'Calculate my savings'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          <div className="lg:col-span-3">
            {result ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <ResultCards result={result} />
              </motion.div>
            ) : (
              <div className="glass glass-solid p-8 h-full grid place-items-center text-center text-muted">
                <p>Enter your bill or units and hit <span className="font-semibold text-ink">Calculate</span> to see your subsidy, savings and payback.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
