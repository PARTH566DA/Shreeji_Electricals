import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Boxless hero: the slogan floats directly on the Grainient background; the CTAs
// and social-proof stat float gently (fluid) below, the stat in liquid glass.
export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative px-4 pt-12 pb-24 min-h-[90vh] flex items-center justify-center text-center">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="animate-in font-heading font-extrabold text-navy leading-[1.02] tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] [text-shadow:0_2px_28px_rgba(255,255,255,0.6)]">
          {t('hero.headline')}
        </h1>

        {/* Floating CTAs */}
        <div className="animate-in mt-12" style={{ animationDelay: '0.12s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-floaty">
            <Link to="/calculator" className="btn-sun text-base shadow-xl">{t('hero.calcCta')}</Link>
            <Link to="/book-survey" className="btn-sky text-base shadow-xl">{t('hero.surveyCta')}</Link>
          </div>
        </div>

        {/* Floating glass stat */}
        <div className="animate-in mt-10 flex justify-center" style={{ animationDelay: '0.24s' }}>
          <span
            className="glass px-8 py-3.5 text-base md:text-lg font-semibold text-navy animate-floaty"
            style={{ animationDelay: '1.6s' }}
          >
            {t('hero.installed')}
          </span>
        </div>
      </div>
    </section>
  )
}
