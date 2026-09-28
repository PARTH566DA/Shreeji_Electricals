import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { estimate, getDiscoms } from '../lib/api.js'
import ResultCards from './ResultCards.jsx'
import { Calculator as CalculatorIcon } from './icons.jsx'

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
      // Server messages are English-only; show a localised one instead.
      setError(t('calc.error'))
    } finally {
      setLoading(false)
    }
  }

  const labelCls = 'block text-sm font-medium text-ink mb-1'
  const inputCls = 'field'

  return (
    <section id="calculator" className="px-3 py-12 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        {showHeading && (
          <>
            <h2 className="text-3xl text-navy text-center">{t('sections.calculator')}</h2>
            <p className="text-muted text-center mt-2">{t('calc.subheading')}</p>
          </>
        )}

        <div className="grid lg:grid-cols-5 gap-6 mt-6 items-start">
          <form onSubmit={onSubmit} className="glass glass-solid p-6 lg:col-span-2 space-y-4 lg:sticky lg:top-28">
            {/* Residential / Commercial toggle */}
            <div>
              <span className={labelCls}>{t('calc.iam')}</span>
              <div className="grid grid-cols-2 gap-2">
                {['residential', 'commercial'].map((key) => ({ key, label: t(`calc.${key}`) })).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => { setConsumerType(c.key); setResult(null) }}
                    aria-pressed={consumerType === c.key}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium border transition ${
                      consumerType === c.key
                        ? 'bg-sky-deep text-white border-sky-deep'
                        : 'bg-white text-ink border-ink/15 hover:border-sky-deep/40'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {consumerType === 'commercial' && (
                <p className="text-xs text-muted mt-1.5">{t('calc.commercialNote')}</p>
              )}
            </div>

            {/* Bill / units toggle */}
            <div className="inline-flex rounded-full border border-ink/10 bg-white p-0.5 text-sm">
              {['bill', 'units'].map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setInputType(kind)}
                  aria-pressed={inputType === kind}
                  className={`px-4 py-1.5 rounded-full transition ${
                    inputType === kind ? 'bg-sky-deep text-white' : 'text-ink hover:text-sky-deep'
                  }`}
                >
                  {kind === 'bill' ? t('calc.byBill') : t('calc.byUnits')}
                </button>
              ))}
            </div>

            {inputType === 'bill' ? (
              <div>
                <label className={labelCls} htmlFor="monthlyBill">{t('calc.billLabel')}</label>
                <input id="monthlyBill" type="number" min="1" required value={form.monthlyBill}
                  onChange={set('monthlyBill')} className={inputCls} placeholder={t('calc.billPlaceholder')} />
              </div>
            ) : (
              <div>
                <label className={labelCls} htmlFor="monthlyUnits">{t('calc.unitsLabel')}</label>
                <input id="monthlyUnits" type="number" min="1" required value={form.monthlyUnits}
                  onChange={set('monthlyUnits')} className={inputCls} placeholder={t('calc.unitsPlaceholder')} />
              </div>
            )}

            <div>
              <label className={labelCls} htmlFor="discom">{t('calc.discom')}</label>
              <select id="discom" value={form.discom} onChange={set('discom')} className={inputCls}>
                {discoms.map((d) => (
                  <option key={d.code} value={d.code}>{d.code} — {t(`discoms.${d.code}`, { defaultValue: d.area.split(' (')[0] })}</option>
                ))}
              </select>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-sky-deep font-medium">{t('calc.optional')}</summary>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelCls} htmlFor="roof">{t('calc.roof')}</label>
                  <input id="roof" type="number" min="1" value={form.roofAreaSqft} onChange={set('roofAreaSqft')} className={inputCls} placeholder={t('calc.roofPlaceholder')} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="load">{t('calc.load')}</label>
                  <input id="load" type="number" min="1" step="0.5" value={form.sanctionedLoadKw} onChange={set('sanctionedLoadKw')} className={inputCls} placeholder={t('calc.loadPlaceholder')} />
                </div>
              </div>
            </details>

            <button type="submit" disabled={loading} className="btn-sun w-full">
              {loading ? t('calc.submitting') : t('calc.submit')}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          <div className="lg:col-span-3">
            {result ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <ResultCards result={result} />
              </motion.div>
            ) : (
              <div className="glass glass-solid p-8 min-h-[18rem] lg:min-h-[26rem] grid place-items-center text-center">
                <div className="max-w-sm">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-deep/10 text-sky-deep">
                    <CalculatorIcon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-bold text-navy">{t('calc.emptyTitle')}</h3>
                  <p className="mt-2 text-muted">{t('calc.emptyText')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
