import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"

const DashboardPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground gap-4">
    <div className="p-4 bg-muted rounded-full">
      <span className="text-2xl">📁</span>
    </div>
    <div className="text-center">
       <h3 className="font-semibold text-lg">Layout Shell Loaded</h3>
       <p className="text-sm text-muted-foreground">The Dashboard widgets will be added in Stage 03.</p>
    </div>
  </div>
);

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
        <Route path="/" element={<DashboardPlaceholder />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground animate-pulse gap-4">
            <div className="text-center">
               <h3 className="font-semibold text-lg">Module Under Construction</h3>
               <p className="text-sm">Page implemented by fellow teammates in later iterations.</p>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

export default App
