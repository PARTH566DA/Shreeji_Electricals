import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../lib/usePageTitle.js'
import { Plug } from '../components/icons.jsx'

export default function NotFound() {
  const { t } = useTranslation()
  usePageTitle(t('pages.notFound.docTitle'))
  return (
    <section className="px-3 py-20">
      <div className="glass glass-solid mx-auto max-w-xl p-10 text-center">
        <Plug className="h-14 w-14 mx-auto text-sky-deep" />
        <h1 className="text-3xl text-navy mt-3">{t('pages.notFound.title')}</h1>
        <p className="text-muted mt-2">{t('pages.notFound.text')}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-sun">{t('pages.notFound.home')}</Link>
          <Link to="/calculator" className="btn-ghost">{t('pages.notFound.calculator')}</Link>
        </div>
      </div>
    </section>
  )
}
