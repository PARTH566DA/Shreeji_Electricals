import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Boxless hero: the slogan floats directly on the Grainient background; the CTAs
// and social-proof stat float gently (fluid) below, the stat in liquid glass.
export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative px-4 pt-12 pb-24 min-h-[90vh] flex items-center justify-center text-center">
      <div className="mx-auto max-w-6xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-heading font-extrabold text-navy leading-[1.02] tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] [text-shadow:0_2px_28px_rgba(255,255,255,0.6)]"
        >
          {t('hero.headline')}
        </motion.h1>

        {/* Floating CTAs (entrance via motion wrapper, float via inner CSS) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
          className="mt-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-floaty">
            <Link to="/calculator" className="btn-sun text-base shadow-xl">{t('hero.calcCta')}</Link>
            <Link to="/book-survey" className="btn-sky text-base shadow-xl">{t('hero.surveyCta')}</Link>
          </div>
        </motion.div>

        {/* Floating glass stat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: 'easeOut' }}
          className="mt-10 flex justify-center"
        >
          <span
            className="glass px-8 py-3.5 text-base md:text-lg font-semibold text-navy animate-floaty"
            style={{ animationDelay: '1.6s' }}
          >
            {t('hero.installed')}
          </span>
        </motion.div>
      </div>
    </section>
  )
}
