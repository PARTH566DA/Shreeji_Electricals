import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import gu from './gu.json'
import hi from './hi.json'

// EN / ગુજરાતી / हिन्दी. Every visible string lives in these files (checked for key parity
// by `npm run i18n:check`); missing keys would fall back to English.
export const LANGUAGES = ['en', 'gu', 'hi']
const STORAGE_KEY = 'shreeji.lang'

// Saved choice → browser preference → English. Storage can throw (private mode,
// blocked site data), so every access is guarded.
function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.includes(saved)) return saved
  } catch {
    /* storage unavailable */
  }
  const preferred = (typeof navigator !== 'undefined' && navigator.languages) || []
  for (const tag of preferred) {
    const base = String(tag).toLowerCase().split('-')[0]
    if (LANGUAGES.includes(base)) return base
  }
  return 'en'
}

// Keep <html lang> in sync: drives screen-reader pronunciation, hyphenation and the
// :lang() typography rules for Gujarati / Devanagari in index.css.
function applyLanguage(lng) {
  if (typeof document !== 'undefined') document.documentElement.lang = lng
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    /* storage unavailable */
  }
}

i18n.on('languageChanged', applyLanguage)

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    gu: { translation: gu },
    hi: { translation: hi },
  },
  lng: initialLanguage(),
  supportedLngs: LANGUAGES,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

applyLanguage(i18n.language)

export default i18n
