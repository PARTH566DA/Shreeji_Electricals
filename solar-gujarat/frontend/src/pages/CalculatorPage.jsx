import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import BillUpload from '../components/BillUpload.jsx'
import Calculator from '../components/Calculator.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Calculator + bill-upload sizing live together on one page. Bill upload feeds
// detected values into the calculator via shared `preset` state (unchanged logic).
export default function CalculatorPage() {
  usePageTitle('Solar Savings Calculator')
  const [preset, setPreset] = useState(null)

  function handleUseValues({ units, amount, discom }) {
    setPreset({ units, bill: amount, discom, _ts: Date.now() })
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <PageHeader
        eyebrow="PM Surya Ghar"
        title="Solar Savings Calculator"
        subtitle="Estimate your system size, subsidy, savings and payback — or upload your electricity bill and we'll size it for you."
      />
      <BillUpload onUseValues={handleUseValues} />
      <Calculator preset={preset} showHeading={false} />
    </>
  )
}
