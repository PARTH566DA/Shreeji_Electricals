import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'
import { Landmark, Rupee, TrendingUp, Refresh, Clock, Leaf, ArrowRight } from '../components/icons.jsx'

const BENEFITS = [
  { Icon: Landmark, title: 'Accelerated depreciation', text: 'Claim up to 60% depreciation in year 1 — a real tax saving for your business.' },
  { Icon: TrendingUp, title: 'Bigger savings', text: 'Commercial tariffs are high (~₹8/unit), so every solar unit saves more.' },
  { Icon: Clock, title: '~3-year payback', text: 'Higher savings + lower cost mean faster return than residential.' },
  { Icon: Rupee, title: 'Lower ₹/kW at scale', text: 'Larger systems cost less per kW than small home setups.' },
  { Icon: Refresh, title: 'Net metering to 1 MW', text: 'Export surplus and offset your bill; open access above 1 MW.' },
  { Icon: Leaf, title: 'Greener brand', text: 'Cut lakhs of units of grid power and your carbon footprint.' },
]

export default function Commercial() {
  usePageTitle('Commercial & Industrial Solar')
  return (
    <>
      <PageHeader
        eyebrow="For businesses"
        title="Commercial & Industrial Solar"
        subtitle="Factories, offices, shops, hotels and warehouses. No PM Surya Ghar subsidy — but accelerated-depreciation tax benefits and high commercial-tariff savings make payback fast."
      />

      <section className="px-3 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={(i % 3) * 0.05}>
                <div className="glass glass-solid p-6 h-full">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-deep/10 text-sky-deep">
                    <b.Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-navy font-heading font-bold mt-3 text-lg">{b.title}</h3>
                  <p className="text-sm text-ink/75 mt-1">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="glass glass-solid p-6 mt-6 text-sm text-ink/80">
              <h3 className="text-navy font-heading font-bold text-lg">How it's different from home solar</h3>
              <ul className="mt-3 space-y-1.5 list-disc pl-5">
                <li>No central PM Surya Ghar subsidy — that scheme is residential-only.</li>
                <li>Instead, businesses claim accelerated depreciation (a tax saving) and GST input credit.</li>
                <li>Net metering up to 1 MW; larger plants use gross metering or open access (GERC rules).</li>
                <li>Systems are sized to your load and roof — from ~10 kW to multi-MW.</li>
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="glass mt-6 p-8 text-center bg-sun/15">
              <h2 className="text-2xl md:text-3xl text-navy">Estimate your business savings</h2>
              <p className="text-ink/80 mt-2">See system size, tax benefit and payback for your site.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/calculator?type=commercial" className="btn-sun inline-flex items-center gap-2">
                  Commercial calculator <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/book-survey" className="btn-sky">Book a site survey</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
