import { Component } from 'react'
import i18n from '../i18n/index.js'

// Catches render/effect errors anywhere below it so the app shows a message
// instead of a blank white screen. Also logs the error to the console.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <h1 style={{ color: '#0B3D91', fontSize: 24, marginBottom: 8 }}>{i18n.t('error.title')}</h1>
            <p style={{ color: '#5B708B', marginBottom: 16 }}>
              {i18n.t('error.text')}
            </p>
            {/* Internal error details are for developers only — never shown on the live site. */}
            {import.meta.env.DEV && (
              <pre style={{ textAlign: 'left', background: '#f4f7fb', color: '#0F2540', padding: 12, borderRadius: 10, fontSize: 12, overflow: 'auto' }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ marginTop: 16, background: '#1B6FD6', color: '#fff', border: 0, borderRadius: 999, padding: '10px 20px', cursor: 'pointer' }}
            >
              {i18n.t('error.reload')}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
