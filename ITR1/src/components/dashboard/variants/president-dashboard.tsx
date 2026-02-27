import { StatCard } from "../stat-card";
import { Widget } from "../widget";
import { ProgressBar } from "../progress-bar";
import { DashboardList, DashboardListItem } from "../dashboard-list";
import { Users, Calendar, AlertTriangle, CheckCircle, Activity, DollarSign } from "lucide-react";
import { ExpandableTile } from "../insights/expandable-tile";
import { OrgHealthPanel } from "../insights/panels/org-health-panel";
import { MembersPanel } from "../insights/panels/members-panel";
import { BudgetPanel } from "../insights/panels/budget-panel";
import { EventsPanel } from "../insights/panels/events-panel";
import { RisksPanel } from "../insights/panels/risks-panel";
import { ApprovalsPanel } from "../insights/panels/approvals-panel";
import {
  orgHealthInsight,
  membersInsight,
  budgetInsight,
  eventsInsight,
  risksInsight,
  approvalsInsight,
} from "../insights/mock-data";

export function PresidentDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Row 1: Key Metrics — 3 columns, hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ExpandableTile
          title="Org Health Score — Deep Dive"
          subtitle="Composite score from member engagement, events, budget & tasks"
          insightPanel={<OrgHealthPanel data={orgHealthInsight} />}
        >
          <StatCard
            title="Org Health Score"
            value="88/100"
            trend={{ value: 5, label: "vs last month" }}
            icon={<Activity className="h-5 w-5" />}
          />
        </ExpandableTile>

        <ExpandableTile
          title="Active Members — Full Breakdown"
          subtitle="Demographics, recent joiners, retention & engagement stats"
          insightPanel={<MembersPanel data={membersInsight} />}
        >
          <StatCard
            title="Active Members"
            value="42"
            description="80% of total roster"
            trend={{ value: 12, label: "new this term" }}
            icon={<Users className="h-5 w-5" />}
          />
        </ExpandableTile>

        <ExpandableTile
          title="Budget — Financial Detail"
          subtitle="Spending categories, burn rate, top expenses & alerts"
          insightPanel={<BudgetPanel data={budgetInsight} />}
        >
          <Widget title="Budget Remaining">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">$12,400</span>
              </div>
              <ProgressBar
                value={68}
                label="Total Spent: $5,600"
                subLabel="68% remaining"
                color="pink"
              />
            </div>
          </Widget>
        </ExpandableTile>
      </div>

      {/* Row 2: Operational widgets — 2 + 1 layout for visual hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ExpandableTile
            title="Upcoming Events — Detail & Readiness"
            subtitle="Registration health, volunteer coverage & risk flags per event"
            insightPanel={<EventsPanel data={eventsInsight} />}
          >
            <Widget
              title="Upcoming Events"
              className="h-full"
              footer={
                <span className="cursor-pointer hover:text-primary transition-colors italic">
                  Click to expand full event insights →
                </span>
              }
            >
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
                <DashboardListItem
                  title="Workshop: Resume Design"
                  subtitle="Feb 15 • 2:00 PM • Room 204"
                  metadata="12/30 Reg ⚠️"
                  icon={<Calendar className="h-4 w-4 text-amber-500" />}
                />
              </DashboardList>
            </Widget>
          </ExpandableTile>
        </div>

        <div className="lg:col-span-2">
          <ExpandableTile
            title="Risk Alerts — Analysis & Recommendations"
            subtitle="All active risks with severity, context & recommended actions"
            insightPanel={<RisksPanel data={risksInsight} />}
          >
            <Widget title="Risk Alerts" className="h-full">
              <DashboardList>
                <DashboardListItem
                  title="Workshop under-registered"
                  subtitle="Only 40% capacity with 5 days to go"
                  metadata="High"
                  icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
                />
                <DashboardListItem
                  title="Marketing budget exceeded"
                  subtitle="$200 over allocation"
                  metadata="High"
                  icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
                />
                <DashboardListItem
                  title="Low volunteer coverage"
                  subtitle="Workshop needs 2 more volunteers"
                  metadata="Medium"
                  icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                />
              </DashboardList>
            </Widget>
          </ExpandableTile>
        </div>
      </div>

      {/* Row 3: Approval Queue — full width for maximum scannability */}
      <ExpandableTile
        title="Approval Queue — All Pending Items"
        subtitle="Events, finance, marketing & budget changes awaiting your review"
        insightPanel={<ApprovalsPanel data={approvalsInsight} />}
      >
        <Widget
          title="Approval Queue"
          fullWidth
          footer={
            <span className="cursor-pointer hover:text-primary transition-colors italic">
              Click to expand — 12 items pending review →
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DashboardList>
              <DashboardListItem
                title="Workshop: Resume Design"
                subtitle="Submitted by Mike Johnson • 5 days ago"
                metadata="Event"
                icon={<CheckCircle className="h-4 w-4 text-primary" />}
              />
              <DashboardListItem
                title="Catering Reimbursement #402"
                subtitle="Sarah Smith • $145 • 3 days ago"
                metadata="Finance"
                icon={<CheckCircle className="h-4 w-4 text-primary" />}
              />
            </DashboardList>
            <DashboardList>
              <DashboardListItem
                title="IG Story — Valentine Social Promo"
                subtitle="Jordan Lee • 1 day ago"
                metadata="Marketing"
                icon={<CheckCircle className="h-4 w-4 text-violet-500" />}
              />
              <DashboardListItem
                title="Marketing Budget Increase +$500"
                subtitle="Marcus Johnson • 4 days ago"
                metadata="Budget"
                icon={<CheckCircle className="h-4 w-4 text-amber-500" />}
              />
            </DashboardList>
          </div>
        </Widget>
      </ExpandableTile>
    </div>
  );
}
