import Reveal from './Reveal.jsx'
import { siteConfig } from '../lib/siteConfig.js'

const STEPS = [
  { n: 1, title: 'Apply on the national portal', text: 'Register on pmsuryaghar.gov.in / SURYA Gujarat and pick your DISCOM (MGVCL, DGVCL, UGVCL or PGVCL).' },
  { n: 2, title: 'DISCOM feasibility approval', text: 'Your DISCOM checks the connection feasibility for net metering at your address.' },
  { n: 3, title: 'Installation by an empanelled vendor', text: 'We install ALMM-listed panels — residential net metering is capped at 10 kW or your sanctioned load.' },
  { n: 4, title: 'Inspection & bidirectional meter', text: 'The DISCOM inspects and fits a bidirectional net meter, then commissions the system.' },
  { n: 5, title: 'Subsidy to your bank (DBT)', text: 'Central subsidy is paid by direct benefit transfer, usually 30–45 days after commissioning.' },
]

export default function SchemeExplainer() {
  return (
    <section id="scheme" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">How PM Surya Ghar works</h2>
          <p className="text-muted text-center mt-2">The official flow for Gujarat homeowners.</p>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-3 mt-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div className="glass glass-solid p-4 h-full">
                <div className="h-8 w-8 rounded-full bg-sky-deep text-white grid place-items-center font-bold">{s.n}</div>
                <h3 className="text-navy font-semibold mt-2 text-sm">{s.title}</h3>
                <p className="text-xs text-ink/80 mt-1">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="glass mt-6 p-4 text-sm text-ink flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
            <span>📞 PM Surya Ghar helpline: <a className="text-sky-deep font-semibold" href={`tel:${siteConfig.helplineToll}`}>{siteConfig.helplineToll}</a></span>
            <span>🔗 <a className="text-sky-deep font-semibold" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">pmsuryaghar.gov.in</a></span>
            <span>🔗 <a className="text-sky-deep font-semibold" href={siteConfig.suryaGujaratUrl} target="_blank" rel="noreferrer">SURYA Gujarat</a></span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
