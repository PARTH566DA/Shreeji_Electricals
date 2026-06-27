import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Hero from '../components/Hero.jsx'
import Calculator from '../components/Calculator.jsx'
import BillUpload from '../components/BillUpload.jsx'
import SurveyForm from '../components/SurveyForm.jsx'

// Section placeholders are filled in by later phases (Benefits, Process,
// Testimonials, FAQ, Survey).
function SectionStub({ id, title }) {
  return (
    <section id={id} className="px-3 py-12 scroll-mt-24">
      <div className="glass glass-solid mx-auto max-w-6xl px-6 py-10 text-center text-muted">
        <h2 className="text-2xl text-navy">{title}</h2>
        <p className="mt-2">Coming together in a later build phase.</p>
      </div>
    </section>
  )
}

export default function Home() {
  const [preset, setPreset] = useState(null)

  function handleUseValues({ units, amount, discom }) {
    setPreset({ units, bill: amount, discom, _ts: Date.now() })
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Layout>
      <Hero />
      <SectionStub id="benefits" title="Benefits of solar" />
      <SectionStub id="scheme" title="How PM Surya Ghar works" />
      <BillUpload onUseValues={handleUseValues} />
      <Calculator preset={preset} />
      <SectionStub id="process" title="Our process" />
      <SurveyForm />
    </Layout>
  )
}
