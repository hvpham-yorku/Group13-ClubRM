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
import { ThemeProvider } from './context/theme-context.tsx'
import { SponsorsProvider } from './context/sponsors-context.tsx'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <RoleProvider>
            <MembersProvider>
              <SponsorsProvider>
                <EventsProvider>
                  <TasksProvider>
                    <FinanceProvider>
                      <App />
                    </FinanceProvider>
                  </TasksProvider>
                </EventsProvider>
              </SponsorsProvider>
            </MembersProvider>
          </RoleProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)