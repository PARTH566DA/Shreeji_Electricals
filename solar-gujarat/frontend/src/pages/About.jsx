import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { siteConfig } from '../lib/siteConfig.js'
import { MapPin, Bolt, FileText, Wrench } from '../components/icons.jsx'

const WHY = [
  { Icon: MapPin, title: 'Local expertise', text: 'We know every Gujarat DISCOM.' },
  { Icon: Bolt, title: 'Fast approvals', text: 'We chase the paperwork for you.' },
  { Icon: FileText, title: 'End-to-end', text: 'Portal to subsidy — all handled.' },
  { Icon: Wrench, title: 'After-sales', text: 'Support and monitoring post install.' },
]

export default function About() {
  usePageTitle('About Us')
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title={`About ${siteConfig.companyName}`}
        subtitle="Rooftop solar for Gujarat homes under PM Surya Ghar and SURYA Gujarat."
      />

      <section className="px-3 py-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass glass-solid p-8">
              <p className="text-ink/80">
                A Gujarat rooftop-solar installer. We size the right system for your roof, handle the
                DISCOM paperwork, install fast, and support you after switch-on.
              </p>
              <p className="mt-3 text-sm text-muted">
                MNRE-empanelled across Gujarat DISCOMs (placeholder — confirm before go-live).
              </p>
            </div>
          </Reveal>

          <h2 className="text-2xl text-navy mt-10 text-center">Why choose us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.05}>
                <div className="glass glass-solid p-5 h-full">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-deep/10 text-sky-deep">
                    <w.Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-navy font-heading font-bold mt-3">{w.title}</h3>
                  <p className="text-sm text-ink/75 mt-1">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
