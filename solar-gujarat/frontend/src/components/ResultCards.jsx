import CountUp from './CountUp.jsx'
import SavingsChart from './SavingsChart.jsx'
import { formatCurrencyINR, formatNumberIN } from '../lib/format.js'

function Stat({ label, children, accent = 'text-navy', hint }) {
  return (
    <div className="glass glass-solid p-4 text-center">
      <div className={`text-2xl font-heading font-extrabold ${accent}`}>{children}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      {hint && <div className="text-[11px] text-muted/80 mt-0.5">{hint}</div>}
    </div>
  )
}

export default function ResultCards({ result }) {
  const commercial = result.consumerType === 'COMMERCIAL'
  return (
    <div className="mt-6">
      {/* Hero number: net / effective cost */}
      <div className="glass p-5 text-center bg-leaf/15">
        <div className="text-sm text-ink/70">
          {commercial ? 'Your effective cost after tax benefit' : 'Your net cost after subsidy'}
        </div>
        <CountUp
          value={result.netCost}
          className="block text-4xl md:text-5xl font-heading font-extrabold text-navy mt-1"
          format={(v) => formatCurrencyINR(v)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Stat label="Recommended size" accent="text-sky-deep">
          <CountUp value={result.recommendedKw} format={(v) => `${Math.round(v)} kW`} />
        </Stat>
        <Stat label="System cost">
          <CountUp value={result.systemCost} format={(v) => formatCurrencyINR(v)} />
        </Stat>

        {commercial ? (
          <Stat label="Accelerated depreciation" accent="text-leaf" hint="1st-yr tax saving — verify with your CA">
            <CountUp value={result.acceleratedDepreciationBenefit} format={(v) => formatCurrencyINR(v)} />
          </Stat>
        ) : (
          <Stat label="Central subsidy (PM Surya Ghar)" accent="text-leaf">
            <CountUp value={result.centralSubsidy} format={(v) => formatCurrencyINR(v)} />
          </Stat>
        )}

        {!commercial && result.stateTopUpEnabled ? (
          <Stat label="Gujarat state top-up" accent="text-leaf" hint="potential, subject to GEDA budget — verify">
            <CountUp value={result.stateTopUp} format={(v) => formatCurrencyINR(v)} />
          </Stat>
        ) : (
          <Stat label="Annual savings" accent="text-leaf">
            <CountUp value={result.annualSavings} format={(v) => formatCurrencyINR(v)} />
          </Stat>
        )}

        <Stat label="Annual generation">
          <CountUp value={result.annualUnits} format={(v) => `${formatNumberIN(Math.round(v))} units`} />
        </Stat>
        {!commercial && result.stateTopUpEnabled && (
          <Stat label="Annual savings" accent="text-leaf">
            <CountUp value={result.annualSavings} format={(v) => formatCurrencyINR(v)} />
          </Stat>
        )}
        <Stat label="Payback period" accent="text-sky-deep">
          <CountUp value={result.paybackYears} format={(v) => `${v.toFixed(1)} yrs`} />
        </Stat>
        <Stat label="CO₂ avoided / year" accent="text-leaf">
          <CountUp value={result.co2TonnesPerYear} format={(v) => `${v.toFixed(1)} t`} />
        </Stat>
      </div>

      <SavingsChart result={result} />

      <p className="text-xs text-muted mt-4">{result.disclaimer}</p>
    </div>
  )
}
