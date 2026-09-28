// Indian numbering system currency formatting (₹78,000 / ₹1,18,000 lakh-crore grouping).
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatCurrencyINR(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return inr.format(Math.round(value))
}

const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function formatNumberIN(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return num.format(value)
}
