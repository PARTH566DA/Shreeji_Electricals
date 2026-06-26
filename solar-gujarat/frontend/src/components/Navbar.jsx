import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle.jsx'
import { siteConfig } from '../lib/siteConfig.js'

const links = [
  { href: '/#benefits', key: 'nav.benefits' },
  { href: '/#calculator', key: 'nav.calculator' },
  { href: '/#process', key: 'nav.process' },
  { href: '/about', key: 'nav.about' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <nav className="glass glass-solid mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading font-extrabold text-navy">
          <span className="text-xl" aria-hidden="true">☀️</span>
          <span>{siteConfig.companyName}</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-sky-deep transition">
              {t(l.key)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a href="/#book-survey" className="btn-sun hidden sm:inline-flex !px-4 !py-2 text-sm">
            {t('nav.bookSurvey')}
          </a>
          <button
            type="button"
            className="md:hidden p-2 text-navy"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass glass-solid mx-auto max-w-6xl mt-2 px-4 py-3 md:hidden flex flex-col gap-3 text-ink">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="hover:text-sky-deep">
              {t(l.key)}
            </a>
          ))}
          <a href="/#book-survey" onClick={() => setOpen(false)} className="btn-sun !py-2 text-sm">
            {t('nav.bookSurvey')}
          </a>
        </div>
      )}
    </header>
  )
}
