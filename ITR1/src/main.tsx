import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/auth-context.tsx'
import { RoleProvider } from './context/role-context.tsx'
import App from './App.tsx'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#09090b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#ef4444' }}>System Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#a1a1aa' }}>{this.state.error.message}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Restart Application
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <App />
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
)