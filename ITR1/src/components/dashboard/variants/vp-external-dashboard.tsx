import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { Handshake, DollarSign, TrendingUp, Mail, Phone } from "lucide-react"

export function VPExternalDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="Active Sponsors"
        value="4"
        trend={{ value: 1, label: "new this term" }}
        icon={<Handshake className="h-5 w-5" />}
      />
      <StatCard
        title="Sponsorship Revenue"
        value="$10,250"
        trend={{ value: 18, label: "vs last term" }}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Pipeline Value"
        value="$3,500"
        description="2 prospects in pipeline"
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <Widget title="Sponsor Tiers">
        <div className="space-y-3">
          <ProgressBar value={100} label="Platinum" subLabel="1 sponsor • $5,000" color="default" />
          <ProgressBar value={66} label="Gold" subLabel="2 sponsors • $5,500" color="amber" />
          <ProgressBar value={33} label="Silver" subLabel="1 sponsor • $1,500" color="default" />
          <ProgressBar value={16} label="Bronze" subLabel="1 sponsor • $750" color="default" />
        </div>
      </Widget>

      <Widget title="Recent Outreach" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View all interactions →</span>}>
        <DashboardList>
          <DashboardListItem
            title="TechNova Solutions — Meeting"
            subtitle="Discussed hackathon sponsorship details"
            metadata="Feb 10"
            icon={<Phone className="h-4 w-4 text-blue-400" />}
          />
          <DashboardListItem
            title="TechNova Solutions — Email"
            subtitle="Sent renewal proposal for 2026-27"
            metadata="Feb 5"
            icon={<Mail className="h-4 w-4 text-emerald-400" />}
          />
          <DashboardListItem
            title="Innovate Consulting — Email"
            subtitle="Cold outreach introducing the club"
            metadata="Feb 15"
            icon={<Mail className="h-4 w-4 text-emerald-400" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Upcoming Renewals">
        <DashboardList>
          <DashboardListItem
            title="Campus Eats Co."
            subtitle="Bronze tier • Expires Apr 30"
            metadata="$750"
            icon={<Handshake className="h-4 w-4 text-amber-400" />}
          />
          <DashboardListItem
            title="TechNova Solutions"
            subtitle="Platinum tier • Expires Aug 31"
            metadata="$5,000"
            icon={<Handshake className="h-4 w-4 text-slate-300" />}
          />
        </DashboardList>
      </Widget>
    </div>
  )
}
