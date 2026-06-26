import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SkyBackdrop from './SkyBackdrop.jsx'

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative isolate px-3 pt-10 pb-24 min-h-[88vh] flex items-center">
      <SkyBackdrop />
      <div className="mx-auto max-w-5xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass glass-solid mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-12"
        >
          <h1 className="text-3xl md:text-5xl text-navy leading-tight">{t('hero.headline')}</h1>
          <p className="mt-4 text-base md:text-lg text-ink/80 max-w-2xl mx-auto">{t('hero.sub')}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#calculator" className="btn-sun text-base">{t('hero.calcCta')}</a>
            <a href="#book-survey" className="btn-sky text-base">{t('hero.surveyCta')}</a>
          </div>
        </motion.div>

        {/* Glass stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="glass mx-auto mt-5 max-w-3xl px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-navy font-semibold"
        >
          <span>{t('hero.stat1')}</span>
          <span className="sm:border-x sm:border-white/40">{t('hero.stat2')}</span>
          <span>{t('hero.stat3')}</span>
        </motion.div>
      </div>
    </section>
  )
}
