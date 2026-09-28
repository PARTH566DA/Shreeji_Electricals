import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { siteConfig } from '../lib/siteConfig.js'
import { MapPin, Bolt, FileText, Wrench } from '../components/icons.jsx'

// Icons by position; text comes from i18n `pages.about.why` (same order).
const ICONS = [MapPin, Bolt, FileText, Wrench]

export default function About() {
  const { t } = useTranslation()
  const title = t('pages.about.title', { company: siteConfig.companyName })
  usePageTitle(title)
  const why = t('pages.about.why', { returnObjects: true })
  return (
    <>
      <PageHeader eyebrow={t('pages.about.eyebrow')} title={title} subtitle={t('pages.about.subtitle')} />

      <section className="px-3 py-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass glass-solid p-8">
              <p className="text-lg leading-relaxed text-ink/80">{t('pages.about.body')}</p>
            </div>
          </Reveal>

          <h2 className="text-2xl text-navy mt-10 text-center">{t('pages.about.whyTitle')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {why.map((w, i) => {
              const Icon = ICONS[i]
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="glass glass-solid p-5 h-full">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-deep/10 text-sky-deep">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-navy font-heading font-bold mt-3">{w.title}</h3>
                    <p className="text-sm text-ink/75 mt-1">{w.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
