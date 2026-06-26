import { useEffect, useState } from 'react'
import { getHealth } from '../lib/api.js'

// Phase 1 placeholder Home. Real sections (Hero, Calculator, etc.) land in later phases.
export default function Home() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getHealth().then(setHealth).catch((e) => setError(e.message))
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass glass-solid max-w-md w-full p-8 text-center">
        <span className="text-4xl" role="img" aria-label="sun">☀️</span>
        <h1 className="text-2xl md:text-3xl text-navy mt-3">Gujarat Rooftop Solar</h1>
        <p className="text-muted mt-2">PM Surya Ghar — scaffold up and running. (Phase 1)</p>
        <div className="mt-6 text-sm">
          <p className="font-semibold text-ink">Backend health</p>
          {health && (
            <pre className="mt-2 text-left bg-white/60 rounded-lg p-3 text-xs text-ink overflow-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
          {error && <p className="mt-2 text-red-600">Could not reach backend: {error}</p>}
          {!health && !error && <p className="mt-2 text-muted">Checking…</p>}
        </div>
      </div>
    </main>
  )
}
