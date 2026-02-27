import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { EventsPage } from "@/components/events/events-page"
import { TasksPage } from "@/components/tasks/tasks-page"
import { MembersPage } from "@/components/members/members-page"
import { FinancePage } from "@/components/finance/finance-page"
import { ExternalPage } from "@/components/external/external-page"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { DocumentsPage } from "@/components/documents/documents-page"
import { ReportsPage } from "@/components/reports/reports-page"
import { SettingsPage } from "@/components/settings/settings-page"

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-auto bg-background p-4">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function ProtectedRoutes() {
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
      </Routes>
    </Layout>
  )
}

export default App
