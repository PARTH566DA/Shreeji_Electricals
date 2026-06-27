import { useState } from 'react'
import Reveal from './Reveal.jsx'

// Placeholder Gujarat customers — replace with real testimonials before go-live.
const ITEMS = [
  { name: 'Rajesh Patel', city: 'Vadodara (MGVCL)', quote: 'My ₹3,000 bill is almost zero now. The team handled all the MGVCL paperwork.' },
  { name: 'Nilamben Shah', city: 'Surat (DGVCL)', quote: 'Installed in a day, switched on within two months. Subsidy came to my bank as promised.' },
  { name: 'Imtiyaz Vora', city: 'Anand (MGVCL)', quote: 'Clear quote, no hidden costs. The savings calculator was exactly right.' },
  { name: 'Hardik Mehta', city: 'Rajkot (PGVCL)', quote: 'Net meter export means I earn back in summer. Best decision for our home.' },
]

export default function Testimonials() {
  const [i, setI] = useState(0)
  const item = ITEMS[i]
  const go = (d) => setI((p) => (p + d + ITEMS.length) % ITEMS.length)

  return (
    <section id="testimonials" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">Gujarat homes, switched on</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="glass glass-solid p-8 mt-6 text-center">
            <p className="text-lg text-ink/90">“{item.quote}”</p>
            <p className="mt-4 font-heading font-bold text-navy">{item.name}</p>
            <p className="text-sm text-muted">{item.city}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="h-9 w-9 rounded-full bg-white/70 hover:bg-white">‹</button>
              <div className="flex gap-1.5">
                {ITEMS.map((_, idx) => (
                  <button key={idx} type="button" aria-label={`Testimonial ${idx + 1}`} onClick={() => setI(idx)}
                    className={`h-2 w-2 rounded-full ${idx === i ? 'bg-sky-deep' : 'bg-white/70'}`} />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="h-9 w-9 rounded-full bg-white/70 hover:bg-white">›</button>
            </div>
          </div>
        </Reveal>
        <p className="text-center text-xs text-muted mt-3">Illustrative examples; replace with verified customer stories.</p>
      </div>
    </section>
  )
}
