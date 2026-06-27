import { siteConfig } from '../lib/siteConfig.js'
import { Sun } from './icons.jsx'

export default function Footer() {
  return (
    <footer className="mt-16 px-3 pb-24 md:pb-8">
      <div className="glass glass-solid mx-auto max-w-6xl px-6 py-8 text-sm text-ink">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-heading font-extrabold text-navy text-lg">
              <Sun className="h-6 w-6 text-sun" /> {siteConfig.companyName}
            </div>
            <p className="mt-2 text-muted">{siteConfig.tagline}. PM Surya Ghar rooftop solar across Gujarat DISCOMs.</p>
          </div>
          <div>
            <h3 className="font-semibold text-navy">Contact</h3>
            <ul className="mt-2 space-y-1 text-muted">
              <li><a className="hover:text-sky-deep" href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}>{siteConfig.phone}</a></li>
              <li><a className="hover:text-sky-deep" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
              <li>{siteConfig.address}</li>
              <li>PM Surya Ghar helpline: {siteConfig.helplineToll}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-navy">Official</h3>
            <ul className="mt-2 space-y-1 text-muted">
              <li><a className="hover:text-sky-deep" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">pmsuryaghar.gov.in</a></li>
              <li><a className="hover:text-sky-deep" href={siteConfig.suryaGujaratUrl} target="_blank" rel="noreferrer">SURYA Gujarat</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 pt-4 border-t border-white/40 text-xs text-muted">
          Estimates are indicative only and not financial advice. Subsidy, tariff and cost figures depend on live
          PM Surya Ghar / GERC / GEDA rules and your DISCOM. © {new Date().getFullYear()} {siteConfig.companyName}.
        </p>
      </div>
    </footer>
  )
}
