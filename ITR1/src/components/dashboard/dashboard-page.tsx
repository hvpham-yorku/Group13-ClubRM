import { useRole } from "@/context/role-context"
import { PresidentDashboard } from "./variants/president-dashboard"

export function DashboardPage() {
  const { role } = useRole()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {role} view — switch roles from the top bar
        </p>
      </div>
      <PresidentDashboard />
    </div>
  )
}
