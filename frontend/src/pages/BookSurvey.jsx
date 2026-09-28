import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader.jsx'
import SurveyForm from '../components/SurveyForm.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function BookSurvey() {
  const { t } = useTranslation()
  usePageTitle(t('pages.survey.title'))
  return (
    <>
      <PageHeader
        eyebrow={t('pages.survey.eyebrow')}
        title={t('pages.survey.title')}
        subtitle={t('pages.survey.subtitle')}
      />
      <SurveyForm showHeading={false} />
    </>
  )
}
