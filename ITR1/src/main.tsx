import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { RoleProvider } from './context/role-context.tsx'
import { EventsProvider } from './context/events-context.tsx'
import { TasksProvider } from './context/tasks-context.tsx'
import { FinanceProvider } from './context/finance-context.tsx'
import { MembersProvider } from './context/members-context.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <RoleProvider>
      <MembersProvider>
        <EventsProvider>
          <TasksProvider>
            <FinanceProvider>
              <App />
            </FinanceProvider>
          </TasksProvider>
        </EventsProvider>
      </MembersProvider>
    </RoleProvider>
  </BrowserRouter>
)
