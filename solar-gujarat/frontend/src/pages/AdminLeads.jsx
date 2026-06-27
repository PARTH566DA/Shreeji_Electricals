import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import { getLeads } from '../lib/api.js'
import { formatCurrencyINR } from '../lib/format.js'

const STATUSES = ['ALL', 'NEW', 'CONTACTED', 'SURVEYED', 'WON', 'LOST']

function toCsv(rows) {
  const cols = ['id', 'createdAt', 'name', 'phone', 'email', 'city', 'address', 'discom', 'monthlyBill', 'roofType', 'preferredDate', 'status', 'message']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const head = cols.join(',')
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n')
  return head + '\n' + body
}

export default function AdminLeads() {
  const [token, setToken] = useState('')
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  async function load(e) {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await getLeads(token)
      setLeads(data)
    } catch (err) {
      setError(err.response?.status === 401 ? 'Invalid admin token.' : (err.message || 'Failed to load'))
      setLeads(null)
    } finally {
      setLoading(false)
    }
  }

  function download() {
    const rows = filtered
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = (leads || []).filter((l) => statusFilter === 'ALL' || l.status === statusFilter)

  return (
    <Layout>
      <section className="px-3 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl text-navy">Survey leads</h1>
          <p className="text-muted mt-1 text-sm">MVP admin — enter the admin token to view captured leads. Harden auth before production.</p>

          <form onSubmit={load} className="glass glass-solid p-4 mt-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-ink mb-1" htmlFor="token">Admin token</label>
              <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 outline-none" placeholder="X-Admin-Token" />
            </div>
            <button type="submit" className="btn-sky" disabled={loading || !token}>{loading ? 'Loading…' : 'Load leads'}</button>
            {leads && <button type="button" className="btn-ghost" onClick={download}>Export CSV</button>}
          </form>
          {error && <p className="text-red-600 mt-3">{error}</p>}

          {leads && (
            <>
              <div className="flex flex-wrap gap-2 mt-5">
                {STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === s ? 'bg-sky-deep text-white' : 'bg-white/60 text-ink'}`}>
                    {s} {s === 'ALL' ? `(${leads.length})` : `(${leads.filter((l) => l.status === s).length})`}
                  </button>
                ))}
              </div>

              <div className="glass glass-solid mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-muted border-b border-white/50">
                    <tr>
                      {['#', 'Created', 'Name', 'Phone', 'City', 'DISCOM', 'Bill', 'Roof', 'Date', 'Status'].map((h) => (
                        <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id} className="border-b border-white/30">
                        <td className="px-3 py-2">{l.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2">{l.name}</td>
                        <td className="px-3 py-2"><a className="text-sky-deep" href={`tel:${l.phone}`}>{l.phone}</a></td>
                        <td className="px-3 py-2">{l.city}</td>
                        <td className="px-3 py-2">{l.discom}</td>
                        <td className="px-3 py-2">{l.monthlyBill ? formatCurrencyINR(l.monthlyBill) : '—'}</td>
                        <td className="px-3 py-2">{l.roofType}</td>
                        <td className="px-3 py-2">{l.preferredDate || '—'}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-sun/30 text-ink text-xs">{l.status}</span></td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={10} className="px-3 py-6 text-center text-muted">No leads for this filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
