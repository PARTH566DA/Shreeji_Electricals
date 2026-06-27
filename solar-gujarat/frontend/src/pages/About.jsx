import Layout from '../components/Layout.jsx'
import Reveal from '../components/Reveal.jsx'
import { siteConfig } from '../lib/siteConfig.js'

const WHY = [
  { icon: '📍', title: 'Local Gujarat expertise', text: 'We know MGVCL, DGVCL, UGVCL and PGVCL processes inside out.' },
  { icon: '⚡', title: 'Fast DISCOM processing', text: 'We file and chase your feasibility and net-metering paperwork end to end.' },
  { icon: '🧾', title: 'End-to-end paperwork', text: 'From portal registration to subsidy DBT — we handle the forms.' },
  { icon: '🔧', title: 'Post-install support', text: 'Monitoring and service after switch-on, not just at the sale.' },
]

export default function About() {
  return (
    <Layout>
      <section className="px-3 py-12">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass glass-solid p-8">
              <h1 className="text-3xl text-navy">About {siteConfig.companyName}</h1>
              <p className="mt-3 text-ink/80">
                We’re a Gujarat-based rooftop solar installer helping homeowners switch to clean power under
                PM Surya Ghar and SURYA Gujarat. We design the right-sized system for your roof and bill,
                handle the DISCOM paperwork, install quickly, and stay on for support.
              </p>
              <p className="mt-3 text-sm text-muted">
                MNRE-empanelled installer across Gujarat DISCOMs (placeholder — confirm and edit before go-live).
                Team and credentials to be added.
              </p>
            </div>
          </Reveal>

          <h2 className="text-2xl text-navy mt-10 text-center">Why choose us</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.05}>
                <div className="glass glass-solid p-5 h-full">
                  <div className="text-3xl" aria-hidden="true">{w.icon}</div>
                  <h3 className="text-navy font-heading font-bold mt-2">{w.title}</h3>
                  <p className="text-sm text-ink/80 mt-1">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
