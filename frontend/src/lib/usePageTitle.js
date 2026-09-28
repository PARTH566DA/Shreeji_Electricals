import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { siteConfig } from './siteConfig.js'

// Sets document.title per page (already translated by the caller), suffixed with the
// company name and the localised site name. Re-runs when the language changes.
export function usePageTitle(title) {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    const base = `${siteConfig.companyName} — ${t('meta.title')}`
    document.title = title ? `${title} · ${base}` : base
  }, [title, t, i18n.language])
}
