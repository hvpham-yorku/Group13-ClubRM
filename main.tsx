import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { RoleProvider } from './context/role-context.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <RoleProvider>
      <App />
    </RoleProvider>
  </BrowserRouter>
)
