import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { AuthPage } from '@/components/auth/auth-page'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { ProfilePage } from "@/components/profile/profile-page"

const DashboardPage = React.lazy(() => import('@/components/dashboard/dashboard-page').then(m => ({ default: m.DashboardPage })))
const EventsPage = React.lazy(() => import('@/components/events/events-page').then(m => ({ default: m.EventsPage })))
const TasksPage = React.lazy(() => import('@/components/tasks/tasks-page').then(m => ({ default: m.TasksPage })))
const MembersPage = React.lazy(() => import('@/components/members/members-page').then(m => ({ default: m.MembersPage })))
const FinancePage = React.lazy(() => import('@/components/finance/finance-page').then(m => ({ default: m.FinancePage })))
const ExternalPage = React.lazy(() => import('@/components/external/external-page').then(m => ({ default: m.ExternalPage })))
const MarketingPage = React.lazy(() => import('@/components/marketing/marketing-page').then(m => ({ default: m.MarketingPage })))
const DocumentsPage = React.lazy(() => import('@/components/documents/documents-page').then(m => ({ default: m.DocumentsPage })))
const ReportsPage = React.lazy(() => import('@/components/reports/reports-page').then(m => ({ default: m.ReportsPage })))
const SettingsPage = React.lazy(() => import('@/components/settings/settings-page').then(m => ({ default: m.SettingsPage })))
//const ProfilePage = React.lazy(() => import('@/components/profile/profile-page').then(m => ({ default: m.ProfilePage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-auto bg-background p-4">
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#111', color: '#fff', fontFamily: 'monospace', flexDirection: 'column', gap: 16 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p style={{ color: '#aaa' }}>Checking authentication...</p>
      </div>
    )
  }

  /*if (!user) {
    return <AuthPage />
  }*/

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/external" element={<ExternalPage />} />
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App