import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Wallet } from "lucide-react"

export function VPFinanceDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="Budget Remaining"
        value="$12,400"
        description="68% of $18,000 total"
        trend={{ value: -12, label: "burn rate this month", inverse: true }}
        icon={<Wallet className="h-5 w-5" />}
      />
      <StatCard
        title="Pending Approvals"
        value="5"
        trend={{ value: 3, label: "new this week", inverse: true }}
        icon={<AlertTriangle className="h-5 w-5" />}
      />
      <StatCard
        title="Total Income"
        value="$22,350"
        trend={{ value: 15, label: "vs last term" }}
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <Widget title="Budget by Category">
        <div className="space-y-3">
          <ProgressBar value={72} max={100} label="Events" subLabel="$3,600 / $5,000" color="pink" />
          <ProgressBar value={55} max={100} label="Marketing" subLabel="$1,650 / $3,000" color="amber" />
          <ProgressBar value={40} max={100} label="Food & Beverage" subLabel="$1,600 / $4,000" color="emerald" />
          <ProgressBar value={30} max={100} label="Equipment" subLabel="$750 / $2,500" color="default" />
          <ProgressBar value={20} max={100} label="Travel" subLabel="$400 / $2,000" color="default" />
        </div>
      </Widget>

      <Widget title="Pending Reimbursements" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View all reimbursements →</span>}>
        <DashboardList>
          <DashboardListItem
            title="John Doe — Food for networking event"
            subtitle="Submitted Feb 5 • $145"
            metadata="Pending"
            icon={<DollarSign className="h-4 w-4 text-amber-500" />}
          />
          <DashboardListItem
            title="Sarah Smith — Office supplies"
            subtitle="Submitted Feb 4 • $89"
            metadata="Pending"
            icon={<DollarSign className="h-4 w-4 text-amber-500" />}
          />
          <DashboardListItem
            title="Alex Brown — Uber to sponsor meeting"
            subtitle="Submitted Feb 6 • $35"
            metadata="Pending"
            icon={<DollarSign className="h-4 w-4 text-amber-500" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Recent Transactions">
        <DashboardList>
          <DashboardListItem
            title="Venue deposit approved"
            subtitle="Main Hall — $250"
            metadata="Approved"
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          />
          <DashboardListItem
            title="Marketing flyers — pending"
            subtitle="200 copies — $89"
            metadata="Pending"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
          <DashboardListItem
            title="Photography approved"
            subtitle="Tech Talk event — $150"
            metadata="Approved"
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          />
        </DashboardList>
      </Widget>
    </div>
  )
}
