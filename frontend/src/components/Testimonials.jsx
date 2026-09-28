import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import { ChevronLeft, ChevronRight, Quote } from './icons.jsx'

// Placeholder Gujarat customers (i18n `testimonials.items`) — replace with real
// testimonials before go-live.
export default function Testimonials() {
  const { t } = useTranslation()
  const [i, setI] = useState(0)
  const items = t('testimonials.items', { returnObjects: true })
  const item = items[i]
  const go = (d) => setI((p) => (p + d + items.length) % items.length)

  return (
    <section id="testimonials" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">{t('sections.testimonials')}</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="glass glass-solid px-6 py-8 sm:px-10 mt-6 text-center">
            <Quote className="mx-auto h-8 w-8 text-sun" />
            {/* Fixed min-height so the card doesn't jump between shorter and longer quotes */}
            <div className="min-h-[7.5rem] sm:min-h-[6.5rem]" aria-live="polite">
              <p className="mt-3 text-lg sm:text-xl leading-relaxed text-ink/90">“{item.quote}”</p>
              <p className="mt-4 font-heading font-bold text-navy">{item.name}</p>
              <p className="text-sm text-muted">{item.city}</p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <button type="button" onClick={() => go(-1)} aria-label={t('testimonials.prev')}
                className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-navy shadow-sm transition hover:border-sky-deep/40 hover:text-sky-deep">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {items.map((_, idx) => (
                  <button key={idx} type="button" aria-label={t('testimonials.goto', { n: idx + 1 })} aria-current={idx === i} onClick={() => setI(idx)}
                    className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-sky-deep' : 'w-2 bg-ink/20 hover:bg-ink/35'}`} />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label={t('testimonials.next')}
                className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-navy shadow-sm transition hover:border-sky-deep/40 hover:text-sky-deep">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
