import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Hero from '../components/Hero.jsx'
import BenefitsGrid from '../components/BenefitsGrid.jsx'
import SchemeExplainer from '../components/SchemeExplainer.jsx'
import Calculator from '../components/Calculator.jsx'
import BillUpload from '../components/BillUpload.jsx'
import ProcessTimeline from '../components/ProcessTimeline.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import SurveyForm from '../components/SurveyForm.jsx'

export default function Home() {
  const [preset, setPreset] = useState(null)

  function handleUseValues({ units, amount, discom }) {
    setPreset({ units, bill: amount, discom, _ts: Date.now() })
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Layout>
      <Hero />
      <BenefitsGrid />
      <SchemeExplainer />
      <BillUpload onUseValues={handleUseValues} />
      <Calculator preset={preset} />
      <ProcessTimeline />
      <Testimonials />
      <FAQ />
      <SurveyForm />
    </Layout>
  )
}
