import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { analyzeBill } from '../lib/api.js'
import { UploadCloud } from './icons.jsx'

const CONF_CLS = { high: 'text-leaf', medium: 'text-sun', low: 'text-muted' }
// Matches the backend limit (app.bill.rate-limit.window-seconds). Keep in sync.
const COOLDOWN_SECONDS = 60

// The server may also refuse for hours once its global daily cap is reached.
const formatWait = (t, s) =>
  s < 120 ? t('time.seconds', { n: s }) : s < 7200 ? t('time.minutes', { n: Math.ceil(s / 60) }) : t('time.hours', { n: Math.ceil(s / 3600) })

// Bill upload → OCR → editable detected fields that feed the calculator (brief §4.5).
export default function BillUpload({ onUseValues }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState({ units: '', amount: '', discom: '' })
  // Seconds until the next upload is allowed — mirrors the server's per-minute limit
  // so a single visitor can't spam photos and drain the Gemini quota.
  const [cooldown, setCooldown] = useState(0)

  // Tick the cooldown down once a second while it's active.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function onDrop(accepted) {
    const file = accepted[0]
    if (!file) return
    if (cooldown > 0 || loading) return // still cooling down or a read is in flight
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const data = await analyzeBill(file)
      setResult(data)
      setFields({
        units: data.detectedUnits ?? '',
        amount: data.detectedAmount ?? '',
        discom: data.detectedDiscom ?? '',
      })
      setCooldown(COOLDOWN_SECONDS) // one accepted upload per minute
    } catch (err) {
      if (err.response?.status === 429) {
        // Server rejected as too soon — sync our countdown to its Retry-After.
        const wait = Number(err.response.data?.retryAfterSeconds) || COOLDOWN_SECONDS
        setCooldown(wait)
        setError(t('bill.wait', { time: formatWait(t, wait) }))
      } else {
        // Server messages are English-only; map the failure to a localised one.
        const status = err.response?.status
        setError(t(status === 413 ? 'bill.errorSize' : status === 400 ? 'bill.errorType' : 'bill.errorGeneric'))
      }
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    maxFiles: 1,
    disabled: cooldown > 0 || loading,
  })

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))
  const inputCls = 'field'

  function useValues() {
    const units = fields.units ? Number(fields.units) : null
    const amount = fields.amount ? Number(fields.amount) : null
    onUseValues?.({ units, amount, discom: fields.discom || null })
  }

  return (
    <section id="bill-upload" className="px-3 py-12 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl text-navy text-center">{t('sections.bill')}</h2>
        <p className="text-muted text-center mt-2">{t('bill.intro')}</p>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div
            {...getRootProps()}
            className={`glass glass-solid p-8 grid place-items-center text-center border-2 border-dashed transition ${
              cooldown > 0 || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            } ${isDragActive ? 'border-sky-deep bg-white/70' : 'border-white/60'}`}
          >
            <input {...getInputProps()} aria-label={t('bill.uploadAria')} />
            <div>
              <UploadCloud className="h-10 w-10 mx-auto text-sky-deep" />
              <p className="mt-3 text-ink font-medium">
                {loading
                  ? t('bill.reading')
                  : cooldown > 0
                    ? t('bill.wait', { time: formatWait(t, cooldown) })
                    : isDragActive
                      ? t('bill.drop')
                      : t('bill.choose')}
              </p>
              {cooldown > 0 ? (
                <p className="text-xs text-muted mt-1">{t('bill.cooldownNote')}</p>
              ) : (
                <p className="text-xs text-muted mt-1">{t('bill.privacy')}</p>
              )}
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
          </div>

          <div className="glass glass-solid p-6">
            {result ? (
              <>
                <p className={`text-sm font-semibold ${CONF_CLS[result.confidence] || 'text-muted'}`}>
                  {CONF_CLS[result.confidence] ? t(`bill.confidence.${result.confidence}`) : t('bill.readDone')}
                </p>
                {/* Localised by confidence level (the API's message is English-only). */}
                <p className="text-sm text-muted mt-1">{t(`bill.message.${CONF_CLS[result.confidence] ? result.confidence : 'low'}`)}</p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1" htmlFor="b-units">{t('bill.units')}</label>
                    <input id="b-units" type="number" value={fields.units} onChange={set('units')} className={inputCls} placeholder={t('calc.unitsPlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1" htmlFor="b-amount">{t('bill.amount')}</label>
                    <input id="b-amount" type="number" value={fields.amount} onChange={set('amount')} className={inputCls} placeholder={t('calc.billPlaceholder')} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-ink mb-1" htmlFor="b-discom">{t('bill.discom')}</label>
                    <select id="b-discom" value={fields.discom} onChange={set('discom')} className={inputCls}>
                      <option value="">{t('bill.select')}</option>
                      {['MGVCL', 'DGVCL', 'UGVCL', 'PGVCL'].map((d) => <option key={d} value={d}>{d} — {t(`discoms.${d}`)}</option>)}
                    </select>
                  </div>
                </div>

                {result.recommendedKw != null && (
                  <p className="mt-3 text-sm text-navy">
                    {t('bill.suggested')} <span className="font-bold">{result.recommendedKw} kW</span>
                  </p>
                )}

                <button type="button" onClick={useValues} className="btn-sky w-full mt-4" disabled={!fields.units && !fields.amount}>
                  {t('bill.use')}
                </button>

                {result.rawTextPreview && (
                  <details className="mt-3 text-xs text-muted">
                    <summary className="cursor-pointer">{t('bill.raw')}</summary>
                    <pre className="mt-2 whitespace-pre-wrap bg-white/60 rounded-lg p-2 max-h-40 overflow-auto">{result.rawTextPreview}</pre>
                  </details>
                )}
              </>
            ) : (
              <div className="h-full grid place-items-center text-center text-muted">
                <p>{t('bill.empty')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
