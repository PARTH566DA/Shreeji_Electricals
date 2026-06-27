import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle.js'
import { Plug } from '../components/icons.jsx'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <section className="px-3 py-20">
      <div className="glass glass-solid mx-auto max-w-xl p-10 text-center">
        <Plug className="h-14 w-14 mx-auto text-sky-deep" />
        <h1 className="text-3xl text-navy mt-3">404 — page not found</h1>
        <p className="text-muted mt-2">That page isn’t wired up. Let’s get you back on the grid.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-sun">Back to home</Link>
          <Link to="/calculator" className="btn-ghost">Open the calculator</Link>
        </div>
      </div>
    </section>
  )
}
