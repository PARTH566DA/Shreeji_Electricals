import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SunCycleHero from '../components/SunCycleHero.jsx'
import BenefitsGrid from '../components/BenefitsGrid.jsx'
import SchemeExplainer from '../components/SchemeExplainer.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import Reveal from '../components/Reveal.jsx'
import { ArrowRight } from '../components/icons.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Teaser → Calculator page
function CalculatorTeaser() {
  const { t } = useTranslation()
  return (
    <section className="px-3 py-14">
      <Reveal>
        <div className="glass glass-solid mx-auto max-w-5xl px-6 py-12 text-center">
          <h2 className="text-3xl md:text-4xl text-navy">{t('home.teaserTitle')}</h2>
          <p className="text-muted mt-2">{t('home.teaserText')}</p>
          <Link to="/calculator" className="btn-sun mt-6 inline-flex items-center gap-2">
            {t('hero.calcCta')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

// CTA band → Book a Survey page
function SurveyCTA() {
  const { t } = useTranslation()
  return (
    <section className="px-3 py-14">
      <Reveal>
        <div className="glass mx-auto max-w-5xl px-6 py-12 text-center bg-sun/15">
          <h2 className="text-3xl md:text-4xl text-navy">{t('home.ctaTitle')}</h2>
          <p className="text-ink/80 mt-2">{t('home.ctaText')}</p>
          <Link to="/book-survey" className="btn-sky mt-6 inline-flex items-center gap-2">
            {t('home.ctaButton')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

export default function Home() {
  usePageTitle(null) // home uses the (localised) base title
  return (
    <>
      <SunCycleHero />
      <BenefitsGrid />
      <SchemeExplainer />
      <CalculatorTeaser />
      <Testimonials />
      <FAQ />
      <SurveyCTA />
    </>
  )
}
