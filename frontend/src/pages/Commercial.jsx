import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { Landmark, Rupee, TrendingUp, Refresh, Clock, Leaf, ArrowRight } from '../components/icons.jsx'

// Icons by position; text comes from i18n `pages.commercial.benefits` (same order).
const ICONS = [Landmark, TrendingUp, Clock, Rupee, Refresh, Leaf]

export default function Commercial() {
  const { t } = useTranslation()
  usePageTitle(t('pages.commercial.title'))
  const benefits = t('pages.commercial.benefits', { returnObjects: true })
  const diff = t('pages.commercial.diff', { returnObjects: true })
  return (
    <>
      <PageHeader
        eyebrow={t('pages.commercial.eyebrow')}
        title={t('pages.commercial.title')}
        subtitle={t('pages.commercial.subtitle')}
      />

      <section className="px-3 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => {
              const Icon = ICONS[i]
              return (
                <Reveal key={i} delay={(i % 3) * 0.05}>
                  <div className="glass glass-solid p-6 h-full">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-deep/10 text-sky-deep">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-navy font-heading font-bold mt-3 text-lg">{b.title}</h3>
                    <p className="text-sm text-ink/75 mt-1">{b.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <Reveal>
            <div className="glass glass-solid p-6 mt-6 text-sm text-ink/80">
              <h3 className="text-navy font-heading font-bold text-lg">{t('pages.commercial.diffTitle')}</h3>
              <ul className="mt-3 space-y-1.5 list-disc pl-5">
                {diff.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="glass mt-6 p-8 text-center bg-sun/15">
              <h2 className="text-2xl md:text-3xl text-navy">{t('pages.commercial.ctaTitle')}</h2>
              <p className="text-ink/80 mt-2">{t('pages.commercial.ctaText')}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/calculator?type=commercial" className="btn-sun inline-flex items-center gap-2">
                  {t('pages.commercial.ctaCalc')} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/book-survey" className="btn-sky">{t('pages.commercial.ctaSurvey')}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
