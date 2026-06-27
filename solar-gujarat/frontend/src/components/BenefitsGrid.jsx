import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import { Rupee, Landmark, Refresh, Clock, Shield, Leaf } from './icons.jsx'

const BENEFITS = [
  { Icon: Rupee, title: 'Lower bills', text: 'Generate your own power, cut your monthly bill.' },
  { Icon: Landmark, title: '₹78,000 subsidy', text: 'PM Surya Ghar subsidy, paid to your bank.' },
  { Icon: Refresh, title: 'Net metering', text: 'Export surplus, spin your meter back.' },
  { Icon: Clock, title: '3–5 yr payback', text: 'Strong Gujarat sun pays the system back fast.' },
  { Icon: Shield, title: '25-year panels', text: 'ALMM-listed, long-warranty modules.' },
  { Icon: Leaf, title: 'Clean energy', text: 'Cut tonnes of CO₂ every year.' },
]

export default function BenefitsGrid() {
  const { t } = useTranslation()
  return (
    <section id="benefits" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">{t('sections.benefits')}</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.05}>
              <div className="glass glass-solid p-6 h-full hover:-translate-y-1 transition">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-deep/10 text-sky-deep">
                  <b.Icon className="h-6 w-6" />
                </span>
                <h3 className="text-navy font-heading font-bold mt-3 text-lg">{b.title}</h3>
                <p className="text-sm text-ink/75 mt-1">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
