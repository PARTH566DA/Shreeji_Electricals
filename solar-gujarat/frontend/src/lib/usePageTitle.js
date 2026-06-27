import { useEffect } from 'react'
import { siteConfig } from './siteConfig.js'

// Sets document.title per page, suffixed with the company name.
export function usePageTitle(title) {
  useEffect(() => {
    const base = `${siteConfig.companyName} — Gujarat Rooftop Solar`
    document.title = title ? `${title} · ${base}` : base
  }, [title])
}
