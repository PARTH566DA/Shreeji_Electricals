import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import CalculatorPage from './pages/CalculatorPage.jsx'
import Commercial from './pages/Commercial.jsx'
import About from './pages/About.jsx'
import BookSurvey from './pages/BookSurvey.jsx'
import NotFound from './pages/NotFound.jsx'
import './i18n/index.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Shared Layout (Navbar + sky backdrop + Footer + WhatsApp) wraps every page */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/commercial" element={<Commercial />} />
          <Route path="/about" element={<About />} />
          <Route path="/book-survey" element={<BookSurvey />} />
          <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
