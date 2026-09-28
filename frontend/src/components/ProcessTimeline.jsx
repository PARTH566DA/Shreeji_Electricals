import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import { Play } from './icons.jsx'

const STAGES = [
  { day: 'Day 0', title: 'Survey', text: 'We measure your roof and load.' },
  { day: 'Day 1–3', title: 'Design & quote', text: 'Clear design and fixed price.' },
  { day: 'Day 4–40', title: 'DISCOM approval', text: 'We handle the paperwork.' },
  { day: 'Day ~45', title: 'Installation', text: 'Usually done in one day.' },
  { day: 'Day ~60', title: 'Switch-on', text: 'Net meter, and you go live.' },
]

export default function ProcessTimeline() {
  const { t } = useTranslation()
  return (
    <section id="process" className="px-3 py-14 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-3xl text-navy text-center">{t('sections.process')}</h2>
          <p className="text-muted text-center mt-2">Five clean stages, typically 60–75 days end to end.</p>
        </Reveal>

        <ol className="relative mt-8 ml-4 border-l-2 border-white/50">
          {STAGES.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.05} className="mb-5 ml-6">
              <span className="absolute -left-[11px] mt-1 h-5 w-5 rounded-full bg-sun border-2 border-white shadow" aria-hidden="true" />
              <div className="glass glass-solid p-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-deep">
                  <Play className="h-3 w-3" /> {s.day}
                </div>
                <h3 className="text-navy font-heading font-bold mt-0.5">{s.title}</h3>
                <p className="text-sm text-ink/75 mt-1">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
