import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'gu', label: 'ગુ' },
  { code: 'hi', label: 'हि' },
]

// Language switcher. Wired to i18next; full string coverage lands in Phase 7.
export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const active = i18n.resolvedLanguage || 'en'
  return (
    <div className="inline-flex rounded-full bg-white/50 p-0.5 text-sm" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => i18n.changeLanguage(l.code)}
          aria-pressed={active === l.code}
          className={`px-2.5 py-1 rounded-full transition ${
            active === l.code ? 'bg-sky-deep text-white' : 'text-ink hover:bg-white/60'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
