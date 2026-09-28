import { useTranslation } from 'react-i18next'
import CountUp from './CountUp.jsx'
import SavingsChart from './SavingsChart.jsx'
import { formatCurrencyINR, formatNumberIN } from '../lib/format.js'

function Stat({ label, children, unit, accent = 'text-navy', hint }) {
  return (
    <div className="glass glass-solid px-3 py-4 text-center">
      <div className={`whitespace-nowrap font-heading font-extrabold tabular-nums leading-tight text-[clamp(1.15rem,4.4vw,1.5rem)] ${accent}`}>
        {children}
        {unit && <span className="ml-1 text-sm font-bold">{unit}</span>}
      </div>
      <div className="text-xs text-muted mt-1 leading-snug">{label}</div>
      {hint && <div className="text-[11px] text-muted/80 mt-0.5">{hint}</div>}
    </div>
  )
}

const inr = (v) => formatCurrencyINR(v)

export default function ResultCards({ result }) {
  const { t } = useTranslation()
  const commercial = result.consumerType === 'COMMERCIAL'
  const topUp = !commercial && result.stateTopUpEnabled
  const series = result.savingsSeries || []
  const lifetime = series.length ? series[series.length - 1].cumulativeSavings : null

  const stats = [
    { key: 'kw', label: t('results.size'), accent: 'text-sky-deep', value: result.recommendedKw, format: (v) => Math.round(v), unit: 'kW' },
    { key: 'cost', label: t('results.systemCost'), value: result.systemCost, format: inr },
    commercial
      ? { key: 'ad', label: t('results.depreciation'), accent: 'text-leaf', hint: t('results.depreciationHint'), value: result.acceleratedDepreciationBenefit, format: inr }
      : { key: 'sub', label: t('results.subsidy'), accent: 'text-leaf', value: result.centralSubsidy, format: inr },
    topUp && { key: 'topup', label: t('results.topUp'), accent: 'text-leaf', hint: t('results.topUpHint'), value: result.stateTopUp, format: inr },
    { key: 'save', label: t('results.annualSavings'), accent: 'text-leaf', value: result.annualSavings, format: inr },
    { key: 'units', label: t('results.generation'), value: result.annualUnits, format: (v) => formatNumberIN(Math.round(v)), unit: 'kWh' },
    { key: 'payback', label: t('results.payback'), accent: 'text-sky-deep', value: result.paybackYears, format: (v) => v.toFixed(1), unit: t('results.unitYears') },
    { key: 'co2', label: t('results.co2'), accent: 'text-leaf', value: result.co2TonnesPerYear, format: (v) => v.toFixed(1), unit: t('results.unitTonnes') },
  ].filter(Boolean)
  // Keep the grid even (2 / 4 columns): add the 25-year total when there's a gap.
  if (stats.length % 2 === 1 && lifetime != null) {
    stats.push({ key: 'life', label: t('results.lifetime', { years: series.length - 1 }), accent: 'text-leaf', value: lifetime, format: inr })
  }

  return (
    <div>
      {/* Hero number: net / effective cost */}
      <div className="glass p-5 text-center bg-leaf/15">
        <div className="text-sm text-ink/70">
          {commercial ? t('results.effectiveCost') : t('results.netCost')}
        </div>
        <CountUp
          value={result.netCost}
          className="block text-4xl md:text-5xl font-heading font-extrabold text-navy mt-1 tabular-nums"
          format={inr}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {stats.map((s) => (
          <Stat key={s.key} label={s.label} accent={s.accent} hint={s.hint} unit={s.unit}>
            <CountUp value={s.value} format={s.format} />
          </Stat>
        ))}
      </div>

      <SavingsChart result={result} />

      {/* Disclaimer is localised client-side (the API's text is English-only). */}
      <p className="text-xs text-muted mt-4">{commercial ? t('results.disclaimerCommercial') : t('results.disclaimerResidential')}</p>
    </div>
  )
}
