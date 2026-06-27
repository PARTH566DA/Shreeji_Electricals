import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import BenefitsGrid from '../components/BenefitsGrid.jsx'
import SchemeExplainer from '../components/SchemeExplainer.jsx'
import ProcessTimeline from '../components/ProcessTimeline.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import Reveal from '../components/Reveal.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Teaser → Calculator page
function CalculatorTeaser() {
  return (
    <section className="px-3 py-14">
      <Reveal>
        <div className="glass glass-solid mx-auto max-w-5xl px-6 py-10 text-center">
          <h2 className="text-3xl text-navy">See your savings in seconds</h2>
          <p className="text-muted mt-2 max-w-2xl mx-auto">
            Enter your bill — or upload it — and get your recommended system size, PM Surya Ghar
            subsidy, payback period and a 25-year savings chart.
          </p>
          <Link to="/calculator" className="btn-sun mt-5">Calculate your savings</Link>
        </div>
      </Reveal>
    </section>
  )
}

// CTA band → Book a Survey page
function SurveyCTA() {
  return (
    <section className="px-3 py-14">
      <Reveal>
        <div className="glass mx-auto max-w-5xl px-6 py-10 text-center bg-sun/15">
          <h2 className="text-3xl text-navy">Ready to go solar?</h2>
          <p className="text-ink/80 mt-2 max-w-2xl mx-auto">
            Book a free survey. We assess your roof and handle the MGVCL/DGVCL paperwork end to end.
          </p>
          <Link to="/book-survey" className="btn-sky mt-5">Book a free survey</Link>
        </div>
      </Reveal>
    </section>
  )
}

export default function Home() {
  usePageTitle(null) // home uses the base title
  return (
    <>
      <Hero />
      <BenefitsGrid />
      <SchemeExplainer />
      <CalculatorTeaser />
      <ProcessTimeline />
      <Testimonials />
      <FAQ />
      <SurveyCTA />
    </>
  )
}
