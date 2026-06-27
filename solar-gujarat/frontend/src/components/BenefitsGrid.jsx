import Reveal from './Reveal.jsx'

const BENEFITS = [
  { icon: '💡', title: 'Slash your electricity bill', text: 'Cover most of your home’s usage — many Gujarat homes see bills drop towards zero.' },
  { icon: '🏛️', title: 'Government subsidy', text: 'Up to ₹78,000 central subsidy under PM Surya Ghar, paid straight to your bank.' },
  { icon: '🔁', title: 'Net metering', text: 'Export surplus to your DISCOM and spin the meter back with a bidirectional meter.' },
  { icon: '⏱️', title: 'Fast payback', text: 'Typically 3–5 years in Gujarat thanks to strong sun and subsidy.' },
  { icon: '🛡️', title: '25-year panels', text: 'Tier-1, ALMM-listed panels carry performance warranties up to 25 years.' },
  { icon: '🌱', title: 'Clean energy', text: 'A 3 kW system avoids roughly 3–4 tonnes of CO₂ every year.' },
  { icon: '📈', title: 'Beat tariff hikes', text: 'Lock in your own generation and stop worrying about rising grid tariffs.' },
  { icon: '🏠', title: 'Adds property value', text: 'A solar roof is a visible, durable upgrade buyers and tenants notice.' },
]

export default function BenefitsGrid() {
  return (
    <section id="benefits" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">Why go solar in Gujarat</h2>
          <p className="text-muted text-center mt-2">Real, specific reasons — no jargon.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={(i % 4) * 0.05}>
              <div className="glass glass-solid p-5 h-full hover:-translate-y-1 transition">
                <div className="text-3xl" aria-hidden="true">{b.icon}</div>
                <h3 className="text-navy font-heading font-bold mt-2">{b.title}</h3>
                <p className="text-sm text-ink/80 mt-1">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
