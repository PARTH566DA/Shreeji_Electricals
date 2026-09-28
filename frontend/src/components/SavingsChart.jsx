import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot,
} from 'recharts'
import { formatCurrencyINR } from '../lib/format.js'

// Compact axis label in lakh / crore. Keeps one decimal where needed: ₹2.5L, not a rounded "₹3L".
function compactINR(v) {
  const trim = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''))
  if (Math.abs(v) >= 1e7) return `₹${trim(v / 1e7)}Cr`
  if (Math.abs(v) >= 1e5) return `₹${trim(v / 1e5)}L`
  if (v === 0) return '₹0'
  return `₹${trim(v / 1e3)}k`
}

// Cumulative savings vs. net cost over the projection horizon, payback marked.
export default function SavingsChart({ result }) {
  const { t } = useTranslation()
  const data = result.savingsSeries
  const netCost = result.netCost
  const payback = result.paybackYears
  const years = data.length ? data[data.length - 1].year : 25

  // Point on the savings curve at the payback year (break-even with net cost).
  const paybackPoint = { year: Math.round(payback), value: netCost }

  return (
    <div className="mt-6">
      <h4 className="text-navy font-semibold mb-2">{t('chart.title', { years })}</h4>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1FBF75" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#1FBF75" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#5B708B33" />
            <XAxis dataKey="year" tick={{ fill: '#5B708B', fontSize: 12 }} label={{ value: t('chart.year'), position: 'insideBottom', offset: -2, fill: '#5B708B', fontSize: 12 }} />
            <YAxis tickFormatter={compactINR} tick={{ fill: '#5B708B', fontSize: 12 }} width={56} />
            <Tooltip formatter={(v) => [formatCurrencyINR(v), t('chart.cumulative')]} labelFormatter={(l) => t('chart.yearN', { n: l })} />
            <Area type="monotone" dataKey="cumulativeSavings" stroke="#1FBF75" strokeWidth={2} fill="url(#savingsFill)" />
            {/* Net cost line — where savings cross it is break-even */}
            <ReferenceLine y={netCost} stroke="#1B6FD6" strokeDasharray="5 4" label={{ value: t('chart.netCost', { value: formatCurrencyINR(netCost) }), position: 'insideTopRight', fill: '#1B6FD6', fontSize: 11 }} />
            <ReferenceDot x={paybackPoint.year} y={paybackPoint.value} r={6} fill="#FFB81C" stroke="#0B3D91" label={{ value: t('chart.payback', { years: payback }), position: 'top', fill: '#0B3D91', fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
