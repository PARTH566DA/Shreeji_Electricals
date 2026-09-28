import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { siteConfig } from '../lib/siteConfig.js'
import logo from '../assets/shreeji-logo-transparent.png'

const EXPLORE = [
  { to: '/calculator', key: 'nav.calculator' },
  { to: '/commercial', key: 'nav.commercial' },
  { to: '/about', key: 'nav.about' },
  { to: '/book-survey', key: 'nav.bookSurvey' },
]

const linkCls = 'transition hover:text-sky-deep'

export default function Footer() {
  const { t } = useTranslation()
  return (
    // Extra bottom padding on mobile keeps the last lines clear of the floating call/WhatsApp buttons.
    <footer className="mt-16 px-3 pb-36 md:pb-8">
      <div className="glass glass-solid mx-auto max-w-6xl px-6 py-8 text-sm text-ink">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
          <div>
            <img src={logo} alt={siteConfig.companyName} className="h-14 w-auto object-contain" />
            <p className="mt-3 max-w-xs text-muted">{t('footer.about')}</p>
          </div>
          <nav aria-label={t('nav.footer')}>
            <h3 className="font-semibold text-navy">{t('footer.explore')}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {EXPLORE.map((l) => (
                <li key={l.to}>
                  <Link className={linkCls} to={l.to}>{t(l.key)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="font-semibold text-navy">{t('footer.contact')}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              <li><a className={linkCls} href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}>{siteConfig.phone}</a></li>
              <li><a className={`${linkCls} break-all`} href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
              <li>{t('footer.address')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-navy">{t('footer.official')}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              <li><a className={linkCls} href={siteConfig.portalUrl} target="_blank" rel="noreferrer">pmsuryaghar.gov.in</a></li>
              <li><a className={linkCls} href={`tel:${siteConfig.helplineToll}`}>{t('footer.helpline', { number: siteConfig.helplineToll })}</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 pt-4 border-t border-ink/10 text-xs leading-relaxed text-muted">
          {t('footer.disclaimer', { year: new Date().getFullYear(), company: siteConfig.companyName })}
        </p>
      </div>
    </footer>
  )
}
