import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
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
import { useEvents } from "@/context/events-context";
import { useFinance } from "@/context/finance-context";
import { useTasks } from "@/context/tasks-context";
import { format } from "date-fns";

// Full API response type shape
interface DashboardAPIResponse {
  stats: {
    members: number;
    activeMembers: number;
    totalBudget: number;
    spentBudget: number;
    onTrackEvents: number;
    totalEvents: number;
    completedTasks: number;
    totalTasks: number;
  };
  score: number;
  insights: {
    orgHealth: any;
    members: any;
    budget: any;
    events: any;
    risks: any;
    approvals: any;
  };
}

export function PresidentDashboard() {
  const [apiData, setApiData] = useState<DashboardAPIResponse | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      try {
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/dashboard/stats", { headers });
        const data = await res.json();
        setApiData(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    fetchStats();
  }, [session?.access_token]);

  // Fallback to context data for UI widgets not served by API
  const { expenses, reimbursements, budget, totalSpent, totalPending } = useFinance();
  const { events } = useEvents();
  const { tasks } = useTasks();

  // Budget display — prefer API data, fall back to context
  const remaining = apiData
    ? apiData.stats.totalBudget - apiData.stats.spentBudget
    : budget.totalBudget - totalSpent;
  const remainingPct = apiData
    ? apiData.stats.totalBudget > 0 ? Math.round((remaining / apiData.stats.totalBudget) * 100) : 0
    : budget.totalBudget > 0 ? Math.round((remaining / budget.totalBudget) * 100) : 0;
  const displaySpent = apiData ? apiData.stats.spentBudget : totalSpent;

  // Upcoming events list — use context (already filtered by current session)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);
  }, [events]);

  // Risk alerts — prefer API, fall back to local calculation
  const risks = useMemo(() => {
    if (apiData?.insights?.risks?.risks?.length > 0) {
      return apiData.insights.risks.risks.slice(0, 3).map((r: any) => ({
        title: r.title,
        sub: r.description,
        severity: r.severity === "high" ? "High" : r.severity === "medium" ? "Medium" : "Low",
      }));
    }
    // Fallback local calculation
    const items: { title: string; sub: string; severity: string }[] = [];
    const now = new Date();
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done");
    if (overdue.length > 0) items.push({ title: `${overdue.length} overdue task(s)`, sub: overdue[0].title, severity: "High" });
    if (totalPending > 500) items.push({ title: "High pending expenses", sub: `$${totalPending.toFixed(0)} awaiting approval`, severity: "Medium" });
    return items.slice(0, 3);
  }, [apiData, tasks, totalPending]);

  // Pending approvals — prefer API, fall back to context
  const pendingApprovals = useMemo(() => {
    if (apiData?.insights?.approvals?.items?.length > 0) {
      return apiData.insights.approvals.items.slice(0, 4).map((a: any) => ({
        title: a.title,
        sub: `${a.submittedBy} • $${a.amount ?? ""}`,
        type: a.type === "finance" ? "Finance" : "Reimbursement",
      }));
    }
    // Fallback
    const items: { title: string; sub: string; type: string }[] = [];
    expenses.filter((e) => e.status === "pending").slice(0, 2).forEach((e) =>
      items.push({ title: e.description, sub: `${e.submittedBy} • $${e.amount}`, type: "Finance" })
    );
    reimbursements.filter((r) => r.status === "pending").slice(0, 2).forEach((r) =>
      items.push({ title: r.description, sub: `${r.submittedBy} • $${r.amount}`, type: "Reimbursement" })
    );
    return items;
  }, [apiData, expenses, reimbursements]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ExpandableTile
          title="Org Health Score — Deep Dive"
          subtitle="Composite score from member engagement, events, budget & tasks"
          insightPanel={<OrgHealthPanel data={apiData?.insights?.orgHealth || null} />}
        >
          <StatCard
            title="Org Health Score"
            value={apiData ? `${apiData.score}/100` : "..."}
            trend={{ value: apiData ? apiData.score - (apiData.insights?.orgHealth?.previousScore ?? apiData.score) : 0, label: "vs last month" }}
            icon={<Activity className="h-5 w-5" />}
          />
        </ExpandableTile>

        <ExpandableTile
          title="Active Members — Full Breakdown"
          subtitle="Demographics, recent joiners, retention & engagement stats"
          insightPanel={<MembersPanel data={apiData?.insights?.members || null} />}
        >
          <StatCard
            title="Active Members"
            value={apiData ? String(apiData.stats.activeMembers) : "..."}
            description={
              apiData && apiData.stats.members > 0
                ? `${Math.round((apiData.stats.activeMembers / apiData.stats.members) * 100)}% of ${apiData.stats.members} total`
                : "..."
            }
            icon={<Users className="h-5 w-5" />}
          />
        </ExpandableTile>

        <ExpandableTile
          title="Budget — Financial Detail"
          subtitle="Spending categories, burn rate, top expenses & alerts"
          insightPanel={<BudgetPanel data={apiData?.insights?.budget || null} />}
        >
          <Widget title="Budget Remaining">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">${apiData ? remaining.toLocaleString() : "..."}</span>
              </div>
              <ProgressBar
                value={apiData ? remainingPct : 0}
                label={`Total Spent: $${apiData ? displaySpent.toLocaleString() : "..."}`}
                subLabel={apiData ? `${remainingPct}% remaining` : "..."}
                color="pink"
              />
            </div>
          </Widget>
        </ExpandableTile>
      </div>

      {/* Row 2: Events + Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ExpandableTile
            title="Upcoming Events — Detail & Readiness"
            subtitle="Registration health, volunteer coverage & risk flags per event"
            insightPanel={<EventsPanel data={apiData?.insights?.events || null} />}
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
                {upcomingEvents.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>}
                {upcomingEvents.map((e) => (
                  <DashboardListItem
                    key={e.id}
                    title={e.title}
                    subtitle={`${format(new Date(e.startDate), "MMM d • h:mm a")} • ${e.location || "TBD"}`}
                    metadata={e.capacity ? `${e.registered || 0}/${e.capacity} Reg` : "Open"}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                ))}
              </DashboardList>
            </Widget>
          </ExpandableTile>
        </div>

        <div className="lg:col-span-2">
          <ExpandableTile
            title="Risk Alerts — Analysis & Recommendations"
            subtitle="All active risks with severity, context & recommended actions"
            insightPanel={<RisksPanel data={apiData?.insights?.risks || null} />}
          >
            <Widget title="Risk Alerts" className="h-full">
              <DashboardList>
                {risks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No active risks</p>}
                {risks.map((r, i) => (
                  <DashboardListItem
                    key={i}
                    title={r.title}
                    subtitle={r.sub}
                    metadata={r.severity}
                    icon={<AlertTriangle className={`h-4 w-4 ${r.severity === "High" ? "text-destructive" : "text-amber-500"}`} />}
                  />
                ))}
              </DashboardList>
            </Widget>
          </ExpandableTile>
        </div>
      </div>

      {/* Row 3: Approval Queue */}
      <ExpandableTile
        title="Approval Queue — All Pending Items"
        subtitle="Events, finance, marketing & budget changes awaiting your review"
        insightPanel={<ApprovalsPanel data={apiData?.insights?.approvals || null} />}
      >
        <Widget
          title="Approval Queue"
          fullWidth
          footer={
            <span className="cursor-pointer hover:text-primary transition-colors italic">
              Click to expand — {pendingApprovals.length} items pending review →
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DashboardList>
              {pendingApprovals.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No pending approvals</p>}
              {pendingApprovals.slice(0, 2).map((a, i) => (
                <DashboardListItem
                  key={i}
                  title={a.title}
                  subtitle={a.sub}
                  metadata={a.type}
                  icon={<CheckCircle className="h-4 w-4 text-primary" />}
                />
              ))}
            </DashboardList>
            {pendingApprovals.length > 2 && (
              <DashboardList>
                {pendingApprovals.slice(2, 4).map((a, i) => (
                  <DashboardListItem
                    key={i}
                    title={a.title}
                    subtitle={a.sub}
                    metadata={a.type}
                    icon={<CheckCircle className="h-4 w-4 text-amber-500" />}
                  />
                ))}
              </DashboardList>
            )}
          </div>
        </Widget>
      </ExpandableTile>
    </div>
  );
}
