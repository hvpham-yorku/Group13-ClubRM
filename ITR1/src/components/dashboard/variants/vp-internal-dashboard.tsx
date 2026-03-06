import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { CheckSquare, Clock, Users, AlertTriangle, TrendingUp } from "lucide-react"

export function VPInternalDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="Tasks Completed"
        value="24/40"
        trend={{ value: 8, label: "this week" }}
        icon={<CheckSquare className="h-5 w-5" />}
      />
      <StatCard
        title="Overdue Tasks"
        value="3"
        trend={{ value: 2, label: "vs last week", inverse: true }}
        icon={<Clock className="h-5 w-5" />}
      />
      <StatCard
        title="Team Productivity"
        value="87%"
        trend={{ value: 5, label: "vs last month" }}
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <Widget title="Task Breakdown">
        <div className="space-y-3">
          <ProgressBar value={6} max={40} label="Backlog" subLabel="6 tasks" color="default" />
          <ProgressBar value={8} max={40} label="To Do" subLabel="8 tasks" color="amber" />
          <ProgressBar value={5} max={40} label="In Progress" subLabel="5 tasks" color="pink" />
          <ProgressBar value={3} max={40} label="In Review" subLabel="3 tasks" color="emerald" />
          <ProgressBar value={24} max={40} label="Done" subLabel="24 tasks" color="emerald" />
        </div>
      </Widget>

      <Widget title="Blocked Tasks" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View task board →</span>}>
        <DashboardList>
          <DashboardListItem
            title="Sponsor outreach emails"
            subtitle="Blocked by: awaiting sponsor list from VP External"
            metadata="High"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
          <DashboardListItem
            title="Event poster design"
            subtitle="Blocked by: missing brand assets"
            metadata="Medium"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Team Activity" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View all members →</span>}>
        <DashboardList>
          <DashboardListItem
            title="Sarah Chen completed 3 tasks"
            subtitle="Today at 2:30 PM"
            icon={<Users className="h-4 w-4" />}
          />
          <DashboardListItem
            title="David Kim submitted for review"
            subtitle="Today at 1:15 PM"
            icon={<Users className="h-4 w-4" />}
          />
          <DashboardListItem
            title="Emily Watson started 2 tasks"
            subtitle="Yesterday at 4:00 PM"
            icon={<Users className="h-4 w-4" />}
          />
        </DashboardList>
      </Widget>
    </div>
  )
}
