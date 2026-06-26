import Layout from '../components/Layout.jsx'
import Hero from '../components/Hero.jsx'
import Calculator from '../components/Calculator.jsx'

// Section placeholders are filled in by later phases (Benefits, Bill upload,
// Process, Testimonials, FAQ, Survey).
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
  return (
    <Layout>
      <Hero />
      <SectionStub id="benefits" title="Benefits of solar" />
      <SectionStub id="scheme" title="How PM Surya Ghar works" />
      <Calculator />
      <SectionStub id="process" title="Our process" />
      <SectionStub id="book-survey" title="Book a free survey" />
    </Layout>
  )
}
