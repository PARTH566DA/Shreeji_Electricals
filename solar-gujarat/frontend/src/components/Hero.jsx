import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Home hero band. The sky+panels backdrop is rendered globally by Layout.
export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative px-3 pt-10 pb-16 min-h-[82vh] flex items-center">
      <div className="mx-auto max-w-5xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass glass-solid mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16"
        >
          <p className="text-sky-deep font-semibold tracking-wide uppercase text-sm">{t('hero.eyebrow')}</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-navy leading-[1.05] mt-3">{t('hero.headline')}</h1>
          <p className="mt-5 text-base md:text-lg text-ink/80 max-w-xl mx-auto">{t('hero.sub')}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/calculator" className="btn-sun text-base">{t('hero.calcCta')}</Link>
            <Link to="/book-survey" className="btn-sky text-base">{t('hero.surveyCta')}</Link>
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
