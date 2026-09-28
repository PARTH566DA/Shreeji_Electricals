import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'

const FAQS = [
  { q: 'When do I get the subsidy?', a: 'The central PM Surya Ghar subsidy is paid by direct benefit transfer (DBT) to your bank, usually 30–45 days after the system is commissioned and the net meter is installed.' },
  { q: 'How does net metering work?', a: 'A bidirectional meter records what you export to the grid versus what you import. Surplus units offset your consumption, so your bill reflects only the net.' },
  { q: 'What if I move house?', a: 'The system stays with the property and adds resale value. Inform your DISCOM so the connection and any net-metering arrangement transfer to the new owner.' },
  { q: 'What warranty do the panels carry?', a: 'ALMM-listed, tier-1 panels typically carry up to a 25-year performance warranty, with separate product and inverter warranties.' },
  { q: 'Are loans available?', a: 'Yes — nationalised banks offer collateral-free loans for residential rooftop solar under the scheme. We can point you to current options.' },
  { q: 'What is ALMM?', a: 'The Approved List of Models and Manufacturers — panels must be ALMM-listed to qualify for subsidy and net metering. We only install ALMM-listed modules.' },
]

function Item({ q, a, open, onToggle, id }) {
  return (
    <div className="glass glass-solid overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-${id}`}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
      >
        <span className="font-semibold text-navy">{q}</span>
        <span className={`text-sky-deep transition-transform ${open ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
      </button>
      {open && <div id={`faq-${id}`} className="px-5 pb-4 text-sm text-ink/80">{a}</div>}
    </div>
  )
}

export default function FAQ() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">{t('sections.faq')}</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <Item id={i} {...f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
