import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import BillUpload from '../components/BillUpload.jsx'
import Calculator from '../components/Calculator.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Calculator + bill-upload sizing live together on one page. Bill upload feeds
// detected values into the calculator via shared `preset` state (unchanged logic).
// `?type=commercial` opens the calculator in commercial mode.
export default function CalculatorPage() {
  usePageTitle('Solar Savings Calculator')
  const [params] = useSearchParams()
  const defaultType = params.get('type') === 'commercial' ? 'commercial' : 'residential'
  const [preset, setPreset] = useState(null)

  function handleUseValues({ units, amount, discom }) {
    setPreset({ units, bill: amount, discom, _ts: Date.now() })
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <PageHeader
        eyebrow="Residential & commercial"
        title="Solar Savings Calculator"
        subtitle="Pick home or business, enter your bill or units, and see system size, subsidy or tax benefit, savings and payback. Or upload your bill and we'll size it."
      />
      <BillUpload onUseValues={handleUseValues} />
      <Calculator preset={preset} showHeading={false} defaultType={defaultType} />
    </>
  )
}
