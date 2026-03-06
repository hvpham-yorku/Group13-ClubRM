import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { Shield, Users, Server, Activity, CheckCircle, AlertTriangle } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="System Health"
        value="99.8%"
        trend={{ value: 0.2, label: "uptime this month" }}
        icon={<Server className="h-5 w-5" />}
      />
      <StatCard
        title="Total Users"
        value="42"
        trend={{ value: 8, label: "new this term" }}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Active Roles"
        value="8"
        description="All roles configured"
        icon={<Shield className="h-5 w-5" />}
      />

      <Widget title="Role Distribution">
        <div className="space-y-3">
          <ProgressBar value={1} max={14} label="President" subLabel="1 member" color="amber" />
          <ProgressBar value={1} max={14} label="VP Internal" subLabel="1 member" color="default" />
          <ProgressBar value={1} max={14} label="VP Finance" subLabel="1 member" color="emerald" />
          <ProgressBar value={1} max={14} label="VP Events" subLabel="1 member" color="pink" />
          <ProgressBar value={1} max={14} label="VP External" subLabel="1 member" color="default" />
          <ProgressBar value={1} max={14} label="Marketing" subLabel="1 member" color="amber" />
          <ProgressBar value={6} max={14} label="Executive" subLabel="6 members" color="default" />
          <ProgressBar value={1} max={14} label="Administrator" subLabel="1 member" color="destructive" />
        </div>
      </Widget>

      <Widget title="Recent System Activity" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View audit log →</span>}>
        <DashboardList>
          <DashboardListItem
            title="New member added"
            subtitle="Nina Patel joined as Executive"
            metadata="Jan 15"
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          />
          <DashboardListItem
            title="Role updated"
            subtitle="Jordan Lee → Marketing role"
            metadata="Jan 10"
            icon={<Activity className="h-4 w-4 text-blue-400" />}
          />
          <DashboardListItem
            title="Permission change"
            subtitle="Finance module access expanded"
            metadata="Jan 5"
            icon={<Shield className="h-4 w-4 text-amber-400" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="System Alerts">
        <DashboardList>
          <DashboardListItem
            title="Database backup"
            subtitle="Last backup: 2 hours ago"
            metadata="OK"
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          />
          <DashboardListItem
            title="Storage usage"
            subtitle="2.1 GB of 10 GB used (21%)"
            metadata="OK"
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          />
          <DashboardListItem
            title="1 inactive member"
            subtitle="Lisa Park — inactive since Nov 2025"
            metadata="Review"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
        </DashboardList>
      </Widget>
    </div>
  )
}
