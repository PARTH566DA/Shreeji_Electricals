import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import { Phone, ExternalLink } from './icons.jsx'
import { siteConfig } from '../lib/siteConfig.js'

export default function SchemeExplainer() {
  const { t } = useTranslation()
  const steps = t('scheme.steps', { returnObjects: true })
  return (
    <section id="scheme" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">{t('sections.scheme')}</h2>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="glass glass-solid p-4 h-full">
                <div className="h-9 w-9 rounded-full bg-sky-deep text-white grid place-items-center font-bold">{i + 1}</div>
                <h3 className="text-navy font-semibold mt-2">{s.title}</h3>
                <p className="text-xs text-ink/75 mt-1">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="glass mt-6 p-4 text-sm text-ink flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a className="inline-flex items-center gap-2 hover:text-sky-deep" href={`tel:${siteConfig.helplineToll}`}>
              <Phone className="h-4 w-4 text-sky-deep" /> {t('scheme.helpline', { number: siteConfig.helplineToll })}
            </a>
            <a className="inline-flex items-center gap-2 hover:text-sky-deep" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 text-sky-deep" /> pmsuryaghar.gov.in
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
