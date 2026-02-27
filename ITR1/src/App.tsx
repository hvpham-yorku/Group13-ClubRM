import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { PresidentDashboard } from "@/components/dashboard/variants/president-dashboard"
import { EventsPage } from "@/components/events/events-page"
import { FinancePage } from "@/components/finance/finance-page"

// Ashdeep's Component
import MembersPage from "@/components/members/MembersPage"

// Your Specific Task Component
import { TasksPage } from "./components/tasks/TaskPage"

// Database Test Component (Required for ITR1)
import TestDatabase from './Testing/TestDatabase'

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

function App() {
  return (
    <Layout>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={<PresidentDashboard />} />
        
        {/* Integrated Feature Routes */}
        <Route path="/members" element={<MembersPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/test-db" element={<TestDatabase />} />

        {/* Global Catch-all Placeholder */}
        <Route path="/test-db" element={<TestDatabase />} />
        {/* Placeholder for other routes */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground animate-pulse gap-4">
            <div className="p-4 bg-muted rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="text-center">
               <h3 className="font-semibold text-lg">Module Under Construction</h3>
               <p className="text-sm">This page is currently being implemented as per documentation...</p>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

export default App