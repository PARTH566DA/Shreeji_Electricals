import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle.jsx'
import { Sun } from './icons.jsx'
import { siteConfig } from '../lib/siteConfig.js'

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/calculator', key: 'nav.calculator' },
  { to: '/commercial', key: 'nav.commercial' },
  { to: '/about', key: 'nav.about' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `transition ${isActive ? 'text-sky-deep font-semibold' : 'text-ink hover:text-sky-deep'}`

  return (
    <header className="sticky top-0 z-40 px-3 pt-4">
      <nav className="glass glass-solid mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading font-extrabold text-navy text-xl md:text-2xl" onClick={() => setOpen(false)}>
          <Sun className="h-7 w-7 text-sun" />
          <span>{siteConfig.companyName}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-base font-medium">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {t(l.key)}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link to="/book-survey" className="btn-sun hidden sm:inline-flex !px-5 !py-2.5 text-base">
            {t('nav.bookSurvey')}
          </Link>
          <button
            type="button"
            className="md:hidden p-2 text-navy"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open
                ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                : <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="glass glass-solid mx-auto max-w-6xl mt-2 px-4 py-3 md:hidden flex flex-col gap-1 text-base">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 transition ${isActive ? 'bg-sky-deep text-white' : 'text-ink hover:bg-white/60'}`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
          <Link to="/book-survey" onClick={() => setOpen(false)} className="btn-sun mt-2 !py-2.5">
            {t('nav.bookSurvey')}
          </Link>
        </div>
      )}
    </header>
  )
}
