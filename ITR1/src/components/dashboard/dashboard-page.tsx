import { useRole } from "@/context/role-context"
import { PresidentDashboard } from "./variants/president-dashboard"
import { VPInternalDashboard } from "./variants/vp-internal-dashboard"
import { VPFinanceDashboard } from "./variants/vp-finance-dashboard"
import { VPEventsDashboard } from "./variants/vp-events-dashboard"
import { VPExternalDashboard } from "./variants/vp-external-dashboard"
import { MarketingDashboard } from "./variants/marketing-dashboard"
import { ExecutiveDashboard } from "./variants/executive-dashboard"
import { AdminDashboard } from "./variants/admin-dashboard"
import type { Role } from "@/context/role-context"

const DASHBOARD_MAP: Record<Role, React.ComponentType> = {
  "President": PresidentDashboard,
  "VP Internal": VPInternalDashboard,
  "VP Finance": VPFinanceDashboard,
  "VP Events": VPEventsDashboard,
  "VP External": VPExternalDashboard,
  "Marketing": MarketingDashboard,
  "Executive": ExecutiveDashboard,
  "Administrator": AdminDashboard,
}

export function DashboardPage() {
  const { role } = useRole()
  const Dashboard = DASHBOARD_MAP[role] || PresidentDashboard

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {role} view — switch roles from the top bar
        </p>
      </div>
      <Dashboard />
    </div>
  )
}
