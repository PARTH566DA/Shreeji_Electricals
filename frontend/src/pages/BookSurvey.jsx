import PageHeader from '../components/PageHeader.jsx'
import SurveyForm from '../components/SurveyForm.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function BookSurvey() {
  usePageTitle('Book a Free Survey')
  return (
    <>
      <PageHeader
        eyebrow="Free, no obligation"
        title="Book a Free Survey"
        subtitle="Tell us a few details and we'll call within 48 hours to assess your roof and DISCOM."
      />
      <SurveyForm showHeading={false} />
    </>
  )
}
