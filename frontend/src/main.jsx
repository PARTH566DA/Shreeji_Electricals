import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import i18n from './i18n/index.js'
import './index.css'

// Home loads eagerly; other routes are split so the first visit doesn't download
// the charting library (recharts) and pages it never shows.
const CalculatorPage = lazy(() => import('./pages/CalculatorPage.jsx'))
const Commercial = lazy(() => import('./pages/Commercial.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const BookSurvey = lazy(() => import('./pages/BookSurvey.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label={i18n.t('common.loading')}>
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-sky-deep/20 border-t-sky-deep" />
    </div>
  )
}

const page = (el) => <Suspense fallback={<PageFallback />}>{el}</Suspense>

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Shared Layout (Navbar + sky backdrop + Footer + WhatsApp) wraps every page */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={page(<CalculatorPage />)} />
            <Route path="/commercial" element={page(<Commercial />)} />
            <Route path="/about" element={page(<About />)} />
            <Route path="/book-survey" element={page(<BookSurvey />)} />
            <Route path="*" element={page(<NotFound />)} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
