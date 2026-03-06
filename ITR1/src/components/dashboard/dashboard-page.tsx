import { useRole } from "@/context/role-context"
import { PresidentDashboard } from "./variants/president-dashboard"
import { AdminDashboard } from "./variants/admin-dashboard"
import { MarketingDashboard } from "./variants/marketing-dashboard"
import { ExecutiveDashboard } from "./variants/executive-dashboard"
import { VPEventsDashboard } from "./variants/vp-events-dashboard"
import { VPExternalDashboard } from "./variants/vp-external-dashboard"
import { VPFinanceDashboard } from "./variants/vp-finance-dashboard"
import { VPInternalDashboard } from "./variants/vp-internal-dashboard"

export function DashboardPage() {
  const { role } = useRole()

  const renderDashboard = () => {
    switch (role) {
      case "Administrator":
        return <AdminDashboard />
      case "President":
        return <PresidentDashboard />
      case "VP Internal":
        return <VPInternalDashboard />
      case "VP Finance":
        return <VPFinanceDashboard />
      case "VP Events":
        return <VPEventsDashboard />
      case "VP External":
        return <VPExternalDashboard />
      case "Marketing":
        return <MarketingDashboard />
      case "Executive":
      default:
        return <ExecutiveDashboard />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground italic">
          Welcome back — you are currently viewing the <span className="text-primary font-medium">{role}</span> workstation.
        </p>
      </div>
      {renderDashboard()}
    </div>
  )
}
