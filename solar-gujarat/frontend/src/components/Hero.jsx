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
          <h1 className="text-5xl md:text-7xl font-extrabold text-navy leading-[1.05]">{t('hero.headline')}</h1>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/calculator" className="btn-sun text-base">{t('hero.calcCta')}</Link>
            <Link to="/book-survey" className="btn-sky text-base">{t('hero.surveyCta')}</Link>
          </div>
        </motion.div>

        {/* Glass stat strip — single social-proof stat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="glass mx-auto mt-5 inline-block px-7 py-3 text-base md:text-lg text-navy font-semibold"
        >
          {t('hero.installed')}
        </motion.div>
      </div>
    </section>
  )
}
