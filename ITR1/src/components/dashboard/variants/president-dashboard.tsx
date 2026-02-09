import { StatCard } from "../stat-card";
import { Widget } from "../widget";
import { ProgressBar } from "../progress-bar";
import { DashboardList, DashboardListItem } from "../dashboard-list";
import { Users, Calendar, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { calculateHealthScore, calculateBudgetPercentage, type OrgStats } from "@/lib/dashboard-logic";

const MOCK_STATS: OrgStats = {
  members: 52,
  activeMembers: 42,
  totalBudget: 18000,
  spentBudget: 5600,
  onTrackEvents: 4,
  totalEvents: 5,
  completedTasks: 18,
  totalTasks: 22,
};

export function PresidentDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Row 1: Key Metrics */}
      <StatCard
        title="Org Health Score"
        value={`${calculateHealthScore(MOCK_STATS)}/100`}
        trend={{ value: 5, label: "vs last month" }}
        icon={<Activity className="h-5 w-5" />}
      />
      <StatCard
        title="Active Members"
        value={MOCK_STATS.activeMembers.toString()}
        description={`${Math.round((MOCK_STATS.activeMembers / MOCK_STATS.members) * 100)}% of total roster`}
        trend={{ value: 12, label: "new this term" }}
        icon={<Users className="h-5 w-5" />}
      />
      <Widget title="Budget Remaining">
        <div className="space-y-4">
          <div className="text-3xl font-bold">${(MOCK_STATS.totalBudget - MOCK_STATS.spentBudget).toLocaleString()}</div>
          <ProgressBar
            value={calculateBudgetPercentage(MOCK_STATS.totalBudget, MOCK_STATS.spentBudget)}
            label={`Total Spent: $${MOCK_STATS.spentBudget.toLocaleString()}`}
            subLabel={`${calculateBudgetPercentage(MOCK_STATS.totalBudget, MOCK_STATS.spentBudget)}% remaining`}
            color="pink"
          />
        </div>
      </Widget>

      {/* Row 2: Operation Slates */}
      <Widget title="Upcoming Events" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View full calendar →</span>}>
        <DashboardList>
          <DashboardListItem
            title="Tech Talk: AI in 2026"
            subtitle="Feb 10 • 6:00 PM • Room 101"
            metadata="45/50 Reg"
            icon={<Calendar className="h-4 w-4" />}
          />
          <DashboardListItem
            title="Valentine Social"
            subtitle="Feb 14 • 8:00 PM • Main Hall"
            metadata="80/100 Reg"
            icon={<Calendar className="h-4 w-4" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Risk Alerts">
        <DashboardList>
          <DashboardListItem
            title="Low volunteer coverage"
            subtitle="Valentine Social (needs 5 more)"
            metadata="High"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
          <DashboardListItem
            title="Budget variance"
            subtitle="Marketing flyer expense over limit"
            metadata="Medium"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Approval Queue" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View all 12 items →</span>}>
        <DashboardList>
          <DashboardListItem
            title="Workshop: Resume Design"
            subtitle="Submitted by Mike Johnson"
            metadata="Event"
            icon={<CheckCircle className="h-4 w-4 text-primary" />}
          />
          <DashboardListItem
            title="Catering Reimbursement #402"
            subtitle="Submitted by Sarah Smith • $145"
            metadata="Finance"
            icon={<CheckCircle className="h-4 w-4 text-primary" />}
          />
        </DashboardList>
      </Widget>
    </div>
  );
}
