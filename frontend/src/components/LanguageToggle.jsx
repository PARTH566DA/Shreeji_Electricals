import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n/index.js'

const SHORT = { en: 'EN', gu: 'ગુ', hi: 'हि' }

// Language switcher. The choice is saved and restored by i18n/index.js.
export default function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const active = i18n.resolvedLanguage || 'en'
  return (
    <div className="inline-flex rounded-full bg-white/50 p-0.5 text-sm" role="group" aria-label={t('lang.label')}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={active === code}
          aria-label={t(`lang.${code}`)}
          title={t(`lang.${code}`)}
          className={`min-w-[2.25rem] px-2.5 py-1 rounded-full transition ${
            active === code ? 'bg-sky-deep text-white' : 'text-ink hover:bg-white/60'
          }`}
        >
          {SHORT[code]}
        </button>
      ))}
    </div>
  )
}
