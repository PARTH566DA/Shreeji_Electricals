import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import { ChevronDown } from './icons.jsx'

// Questions/answers live in i18n `faq.items`.

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
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${open ? 'bg-sky-deep text-white rotate-180' : 'bg-sky-deep/10 text-sky-deep'}`}
          aria-hidden="true"
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      {open && <div id={`faq-${id}`} className="px-5 pb-5 -mt-1 text-[15px] leading-relaxed text-ink/80">{a}</div>}
    </div>
  )
}

export default function FAQ() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(0)
  const faqs = t('faq.items', { returnObjects: true })
  return (
    <section id="faq" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">{t('sections.faq')}</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <Item id={i} {...f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
