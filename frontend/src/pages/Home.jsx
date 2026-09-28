import { Link } from 'react-router-dom'
import SunCycleHero from '../components/SunCycleHero.jsx'
import BenefitsGrid from '../components/BenefitsGrid.jsx'
import SchemeExplainer from '../components/SchemeExplainer.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import Reveal from '../components/Reveal.jsx'
import { ArrowRight } from '../components/icons.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Teaser → Calculator page
function CalculatorTeaser() {
  return (
    <section className="px-3 py-14">
      <Reveal>
        <div className="glass glass-solid mx-auto max-w-5xl px-6 py-12 text-center">
          <h2 className="text-3xl md:text-4xl text-navy">See your savings in seconds</h2>
          <p className="text-muted mt-2">Enter your bill — get size, subsidy and payback.</p>
          <Link to="/calculator" className="btn-sun mt-6 inline-flex items-center gap-2">
            Calculate savings <ArrowRight className="h-5 w-5" />
          </Link>
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
        <div className="glass mx-auto max-w-5xl px-6 py-12 text-center bg-sun/15">
          <h2 className="text-3xl md:text-4xl text-navy">Ready to go solar?</h2>
          <p className="text-ink/80 mt-2">Free survey. We handle the paperwork.</p>
          <Link to="/book-survey" className="btn-sky mt-6 inline-flex items-center gap-2">
            Book a free survey <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

export default function Home() {
  usePageTitle(null) // home uses the base title
  return (
    <>
      <SunCycleHero />
      <BenefitsGrid />
      <SchemeExplainer />
      <CalculatorTeaser />
      <Testimonials />
      <FAQ />
      <SurveyCTA />
    </>
  )
}
