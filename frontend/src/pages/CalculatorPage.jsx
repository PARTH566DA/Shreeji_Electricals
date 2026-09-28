import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader.jsx'
import BillUpload from '../components/BillUpload.jsx'
import Calculator from '../components/Calculator.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

// Calculator + bill-upload sizing live together on one page. Bill upload feeds
// detected values into the calculator via shared `preset` state (unchanged logic).
// `?type=commercial` opens the calculator in commercial mode.
export default function CalculatorPage() {
  const { t } = useTranslation()
  usePageTitle(t('pages.calculator.title'))
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
        eyebrow={t('pages.calculator.eyebrow')}
        title={t('pages.calculator.title')}
        subtitle={t('pages.calculator.subtitle')}
      />
      <BillUpload onUseValues={handleUseValues} />
      <Calculator preset={preset} showHeading={false} defaultType={defaultType} />
    </>
  )
}
