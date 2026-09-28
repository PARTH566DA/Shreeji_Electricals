import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { whatsappLink } from '../lib/siteConfig.js'
import { CheckCircle } from './icons.jsx'

const DISCOMS = ['MGVCL', 'DGVCL', 'UGVCL', 'PGVCL']
const ROOF_TYPES = ['RCC', 'Metal sheet', 'Tiled', 'Other']

const EMPTY = {
  name: '', phone: '', email: '', address: '', city: '',
  discom: 'MGVCL', monthlyBill: '', roofType: 'RCC', preferredDate: '', message: '',
}

// Build the WhatsApp message the customer sends to the owner. Nothing is stored on
// a server — the details go straight to our WhatsApp via click-to-chat (wa.me).
// Labels stay in English on purpose: this is read by the business, whatever language
// the visitor browsed in (the values themselves may be in any script).
function buildMessage(f) {
  const lines = [
    '*New rooftop solar survey request*',
    `Name: ${f.name}`,
    `Phone: ${f.phone}`,
  ]
  if (f.email) lines.push(`Email: ${f.email}`)
  lines.push(`City: ${f.city}`)
  lines.push(`Address: ${f.address}`)
  lines.push(`DISCOM: ${f.discom}`)
  lines.push(`Roof type: ${f.roofType}`)
  if (f.monthlyBill) lines.push(`Monthly bill: ₹${f.monthlyBill}`)
  if (f.preferredDate) lines.push(`Preferred date: ${f.preferredDate}`)
  if (f.message) lines.push(`Message: ${f.message}`)
  return lines.join('\n')
}

export default function SurveyForm({ showHeading = true }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'survey.errors.name'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'survey.errors.phone'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'survey.errors.email'
    if (!form.address.trim()) e.address = 'survey.errors.address'
    if (!form.city.trim()) e.city = 'survey.errors.city'
    if (!form.roofType) e.roofType = 'survey.errors.roofType'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function onSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    const link = whatsappLink(buildMessage(form))
    // User-initiated, so this open is allowed; the confirmation offers a manual
    // fallback link in case a popup blocker stops it.
    window.open(link, '_blank', 'noopener,noreferrer')
    setDone({ name: form.name, link })
    setForm(EMPTY)
  }

  const inputCls = 'field'
  const labelCls = 'block text-sm font-medium text-ink mb-1'
  const errCls = 'text-xs text-red-600 mt-1'

  if (done) {
    return (
      <section id="book-survey" className="px-3 py-12 scroll-mt-24">
        <div className="glass glass-solid mx-auto max-w-xl p-8 text-center">
          <CheckCircle className="h-14 w-14 mx-auto text-leaf" />
          <h2 className="text-2xl text-navy mt-3">{t('survey.doneTitle', { name: done.name })}</h2>
          <p className="text-ink/80 mt-2">{t('survey.doneBody')}</p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={done.link} target="_blank" rel="noreferrer" className="btn-sun">
              {t('common.whatsapp')}
            </a>
            <button type="button" onClick={() => setDone(null)} className="btn-ghost">{t('survey.another')}</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="book-survey" className="px-3 py-12 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        {showHeading && (
          <>
            <h2 className="text-3xl text-navy text-center">{t('sections.survey')}</h2>
            <p className="text-muted text-center mt-2">{t('survey.subheading')}</p>
          </>
        )}

        <form onSubmit={onSubmit} noValidate className="glass glass-solid p-6 mt-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="s-name">{t('survey.name')} *</label>
            <input id="s-name" aria-invalid={!!errors.name} value={form.name} onChange={set('name')} className={inputCls} />
            {errors.name && <p className={errCls}>{t(errors.name)}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="s-phone">{t('survey.phone')} *</label>
            <input id="s-phone" aria-invalid={!!errors.phone} inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} className={inputCls} placeholder={t('survey.phonePlaceholder')} />
            {errors.phone && <p className={errCls}>{t(errors.phone)}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="s-email">{t('survey.email')}</label>
            <input id="s-email" aria-invalid={!!errors.email} type="email" value={form.email} onChange={set('email')} className={inputCls} />
            {errors.email && <p className={errCls}>{t(errors.email)}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="s-city">{t('survey.city')} *</label>
            <input id="s-city" aria-invalid={!!errors.city} value={form.city} onChange={set('city')} className={inputCls} />
            {errors.city && <p className={errCls}>{t(errors.city)}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="s-address">{t('survey.address')} *</label>
            <input id="s-address" aria-invalid={!!errors.address} value={form.address} onChange={set('address')} className={inputCls} />
            {errors.address && <p className={errCls}>{t(errors.address)}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="s-discom">{t('survey.discom')} *</label>
            <select id="s-discom" value={form.discom} onChange={set('discom')} className={inputCls}>
              {DISCOMS.map((d) => <option key={d} value={d}>{d} — {t(`discoms.${d}`)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="s-roof">{t('survey.roofType')} *</label>
            <select id="s-roof" value={form.roofType} onChange={set('roofType')} className={inputCls}>
              {ROOF_TYPES.map((r) => <option key={r} value={r}>{t(`survey.roofTypes.${r}`)}</option>)}
            </select>
            {errors.roofType && <p className={errCls}>{t(errors.roofType)}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="s-bill">{t('survey.monthlyBill')}</label>
            <input id="s-bill" type="number" min="0" value={form.monthlyBill} onChange={set('monthlyBill')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="s-date">{t('survey.preferredDate')}</label>
            <input id="s-date" type="date" value={form.preferredDate} onChange={set('preferredDate')} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="s-msg">{t('survey.message')}</label>
            <textarea id="s-msg" rows={3} value={form.message} onChange={set('message')} className={inputCls} />
          </div>

          <button type="submit" className="btn-sun sm:col-span-2">
            {t('survey.submit')}
          </button>
        </form>
      </div>
    </section>
  )
}
