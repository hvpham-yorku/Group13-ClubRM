import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/auth-context.tsx'
import { RoleProvider } from './context/role-context.tsx'
import { EventsProvider } from './context/events-context.tsx'
import { TasksProvider } from './context/tasks-context.tsx'
import { FinanceProvider } from './context/finance-context.tsx'
import { MembersProvider } from './context/members-context.tsx'
import { SponsorsProvider } from './context/sponsors-context.tsx'
import App from './App.tsx'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ClubRM] ErrorBoundary caught:', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#111', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#f55' }}>Runtime Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 12, opacity: 0.7 }}>{this.state.error.stack}</pre>
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
          <MembersProvider>
            <EventsProvider>
              <TasksProvider>
                <FinanceProvider>
                  <SponsorsProvider>
                    <App />
                  </SponsorsProvider>
                </FinanceProvider>
              </TasksProvider>
            </EventsProvider>
          </MembersProvider>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
)
