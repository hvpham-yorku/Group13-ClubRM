import { useState, useMemo } from "react"
import { useMembers } from "@/context/members-context"
import { useEvents } from "@/context/events-context"
import { useTasks } from "@/context/tasks-context"
import { useFinance } from "@/context/finance-context"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Line,
} from "recharts"
import {
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileBarChart,
  Activity,
  Target,
  Zap,
  Download,
  AlertTriangle,
  Clock,
  Award,
  Shield,
  BarChart3,
  PieChart as PieChartIcon,
  UserCheck,
  UserX,
  CalendarCheck,
  Wallet,
  Receipt,
  CircleDollarSign,
  Gauge,
  Flame,
  Star,
} from "lucide-react"

const PIE_COLORS = ["#f472b6", "#38bdf8", "#34d399", "#fbbf24", "#a78bfa", "#fb923c", "#f87171", "#06b6d4"]
const STATUS_COLORS: Record<string, string> = {
  backlog: "#64748b", todo: "#3b82f6", in_progress: "#f59e0b", in_review: "#8b5cf6", done: "#10b981",
}
const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e",
}

const TOOLTIP_STYLE = { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }
const AXIS_TICK = { fontSize: 11, fill: "#94a3b8" }
const AXIS_TICK_SM = { fontSize: 10, fill: "#94a3b8" }
const AXIS_STROKE = "#475569"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pieLabel = (props: any) => {
  const { name, percent, x, y, textAnchor } = props
  return <text x={x} y={y} textAnchor={textAnchor} fill="#94a3b8" fontSize={10}>{`${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}</text>
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0 }).format(n)
}

function pct(a: number, b: number) {
  return b > 0 ? ((a / b) * 100).toFixed(1) : "0"
}

/** Safely parse a value that may be a Date, string, or null from the DB */
function safeDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export function ReportsPage() {
  const { members, stats: memberStats } = useMembers()
  const { events } = useEvents()
  const { tasks } = useTasks()
  const { budget, totalSpent, totalIncome, totalPending, expenses, reimbursements, income } = useFinance()
  const [period] = useState("this-term")

  // ─── Derived: Tasks (DB-safe: guards on nullable arrays/dates) ───
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
  const now = new Date()
  const overdueTasks = tasks.filter((t) => {
    const due = safeDate(t.dueDate)
    return due && due < now && t.status !== "done"
  })
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length
  const totalSubtasks = tasks.reduce((s, t) => s + (t.subtasks ?? []).length, 0)
  const doneSubtasks = tasks.reduce((s, t) => s + (t.subtasks ?? []).filter((st) => st.done).length, 0)
  const subtaskRate = totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0
  const avgSubtasksPerTask = tasks.length > 0 ? (totalSubtasks / tasks.length).toFixed(1) : "0"

  const tasksByStatus = useMemo(() =>
    (["backlog", "todo", "in_progress", "in_review", "done"] as const).map((s) => ({
      name: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: tasks.filter((t) => t.status === s).length,
      fill: STATUS_COLORS[s],
    })), [tasks])

  const tasksByPriority = useMemo(() =>
    (["urgent", "high", "medium", "low"] as const).map((p) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      value: tasks.filter((t) => t.priority === p).length,
      fill: PRIORITY_COLORS[p],
    })), [tasks])

  const tasksBySection = useMemo(() => {
    const map: Record<string, number> = {}
    tasks.forEach((t) => { const s = t.section || "Unsorted"; map[s] = (map[s] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [tasks])

  const tasksByTag = useMemo(() => {
    const map: Record<string, number> = {}
    tasks.forEach((t) => (t.tags ?? []).forEach((tag) => { map[tag] = (map[tag] || 0) + 1 }))
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a, b) => b.value - a.value)
  }, [tasks])

  // Assignee productivity (DB-safe: guard assignees array)
  const assigneeStats = useMemo(() => {
    const map: Record<string, { assigned: number; completed: number }> = {}
    tasks.forEach((t) => {
      ;(t.assignees ?? []).forEach((a) => {
        if (!map[a]) map[a] = { assigned: 0, completed: 0 }
        map[a].assigned++
        if (t.status === "done") map[a].completed++
      })
    })
    return Object.entries(map)
      .map(([id, stats]) => {
        const member = members.find((m) => m.id === id)
        return { id, name: member?.name || id, ...stats, rate: stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0 }
      })
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 8)
  }, [tasks, members])

  // ─── Derived: Events (DB-safe: guard date parsing) ───
  const upcomingEvents = events.filter((e) => { const d = safeDate(e.startDate); return d && d > now }).length
  const pastEvents = events.filter((e) => { const d = safeDate(e.endDate); return d && d < now }).length
  const eventsWithCapacity = events.filter((e) => e.capacity && e.capacity > 0)
  const totalCapacity = eventsWithCapacity.reduce((s, e) => s + (e.capacity || 0), 0)
  const totalRegistered = eventsWithCapacity.reduce((s, e) => s + (e.registered || 0), 0)
  const avgFillRate = totalCapacity > 0 ? (totalRegistered / totalCapacity) * 100 : 0

  const eventsByTag = useMemo(() => {
    const map: Record<string, number> = {}
    events.forEach((e) => (e.tags ?? []).forEach((t) => { map[t] = (map[t] || 0) + 1 }))
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [events])

  const eventFillData = useMemo(() =>
    eventsWithCapacity.map((e) => ({
      name: e.title.length > 18 ? e.title.slice(0, 18) + "..." : e.title,
      registered: e.registered || 0,
      capacity: e.capacity || 0,
      fill: ((e.registered || 0) / (e.capacity || 1)) * 100,
    })), [eventsWithCapacity])

  const eventsByStatus = useMemo(() => {
    const map: Record<string, number> = {}
    events.forEach((e) => { const s = e.status || "confirmed"; map[s] = (map[s] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [events])

  // ─── Derived: Finance ───
  const budgetUtil = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0
  const budgetRemaining = budget.totalBudget - totalSpent
  const netCashFlow = totalIncome - totalSpent
  const approvedExpenses = expenses.filter((e) => e.status === "approved").length
  const pendingExpenses = expenses.filter((e) => e.status === "pending").length
  const deniedExpenses = expenses.filter((e) => e.status === "denied").length
  const expenseApprovalRate = expenses.length > 0 ? (approvedExpenses / expenses.length) * 100 : 0
  const pendingReimb = reimbursements.filter((r) => r.status === "pending").length

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount })
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a, b) => b.value - a.value)
  }, [expenses])

  const incomeByType = useMemo(() => {
    const map: Record<string, number> = {}
    income.forEach((i) => { map[i.type] = (map[i.type] || 0) + i.amount })
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a, b) => b.value - a.value)
  }, [income])

  const topExpenses = useMemo(() =>
    [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 8), [expenses])

  const topIncomes = useMemo(() =>
    [...income].sort((a, b) => b.amount - a.amount).slice(0, 6), [income])

  // ─── Monthly Trend (computed from actual data — production-ready) ───
  const monthlyTrend = useMemo(() => {
    const months: { month: string; members: number; events: number; tasks: number; income: number; spending: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      const label = format(date, "MMM")

      const monthIncome = income
        .filter((inc) => { const d = safeDate(inc.date); return d && isWithinInterval(d, { start, end }) })
        .reduce((s, inc) => s + inc.amount, 0)

      const monthSpending = expenses
        .filter((exp) => { const d = safeDate(exp.date); return d && isWithinInterval(d, { start, end }) })
        .reduce((s, exp) => s + exp.amount, 0)

      const monthEvents = events
        .filter((ev) => { const d = safeDate(ev.startDate); return d && isWithinInterval(d, { start, end }) }).length

      const monthTasks = tasks
        .filter((t) => { const d = safeDate(t.createdAt); return d && isWithinInterval(d, { start, end }) }).length

      // Member count: those who joined on or before end of this month and are still active
      const monthMembers = members
        .filter((m) => { const d = safeDate(m.joinDate); return d && d <= end && m.status === "active" }).length

      months.push({ month: label, members: monthMembers, events: monthEvents, tasks: monthTasks, income: Math.round(monthIncome), spending: Math.round(monthSpending) })
    }
    return months
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `now` excluded: stable within session, data arrays drive recomputation
  }, [expenses, income, events, tasks, members])

  // ─── Derived: Members ───
  const membersByRole = useMemo(() => {
    const map: Record<string, number> = {}
    members.forEach((m) => { map[m.role] = (map[m.role] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [members])

  const membersByDept = useMemo(() => {
    const map: Record<string, number> = {}
    members.forEach((m) => { map[m.department] = (map[m.department] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 14) + "..." : name, value })).sort((a, b) => b.value - a.value)
  }, [members])

  const membersByYear = useMemo(() => {
    const map: Record<string, number> = {}
    members.forEach((m) => { map[m.year] = (map[m.year] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [members])

  const engagementScores = useMemo(() =>
    members
      .filter((m) => m.status === "active")
      .map((m) => {
        const score = Math.min(100, Math.round((m.tasksCompleted * 2 + m.eventsAttended * 3) / 1.5))
        return { ...m, score }
      })
      .sort((a, b) => b.score - a.score), [members])

  const avgEngagement = engagementScores.length > 0 ? Math.round(engagementScores.reduce((s, m) => s + m.score, 0) / engagementScores.length) : 0
  const atRiskMembers = engagementScores.filter((m) => m.score < 20)
  const retentionRate = memberStats.total > 0 ? ((memberStats.active / memberStats.total) * 100).toFixed(0) : "0"

  // ─── Org Health Score (composite) ───
  const orgHealth = useMemo(() => {
    const retention = memberStats.total > 0 ? (memberStats.active / memberStats.total) * 100 : 0
    const taskHealth = completionRate
    const budgetHealth = Math.max(0, 100 - Math.abs(budgetUtil - 50))
    const eventHealth = avgFillRate
    const score = Math.round(retention * 0.3 + taskHealth * 0.25 + budgetHealth * 0.2 + eventHealth * 0.25)
    return Math.min(100, Math.max(0, score))
  }, [memberStats, completionRate, budgetUtil, avgFillRate])

  const healthColor = orgHealth >= 75 ? "text-emerald-400" : orgHealth >= 50 ? "text-amber-400" : "text-red-400"
  const healthBg = orgHealth >= 75 ? "bg-emerald-500" : orgHealth >= 50 ? "bg-amber-500" : "bg-red-500"
  const healthLabel = orgHealth >= 75 ? "Excellent" : orgHealth >= 50 ? "Good" : "Needs Attention"

  // Radial bar data for org health
  const healthRadial = [{ name: "Health", value: orgHealth, fill: orgHealth >= 75 ? "#10b981" : orgHealth >= 50 ? "#f59e0b" : "#ef4444" }]

  // ─── Smart Insights Engine ───
  const insights = useMemo(() => {
    const list: { type: "success" | "warning" | "danger" | "info"; title: string; detail: string }[] = []

    if (Number(retentionRate) >= 80) list.push({ type: "success", title: "Strong member retention", detail: `${retentionRate}% of members are active — above the 80% benchmark` })
    else list.push({ type: "warning", title: "Member retention below target", detail: `${retentionRate}% active — ${memberStats.inactive} inactive member(s) need re-engagement` })

    if (overdueTasks.length > 0) list.push({ type: "danger", title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`, detail: overdueTasks.map((t) => t.title).slice(0, 3).join(", ") })
    if (completionRate >= 60) list.push({ type: "success", title: `Task completion at ${completionRate.toFixed(0)}%`, detail: `${completedTasks} of ${tasks.length} tasks done — solid progress` })
    else list.push({ type: "warning", title: `Task completion at ${completionRate.toFixed(0)}%`, detail: `Only ${completedTasks} of ${tasks.length} tasks done — may need resource reallocation` })

    if (budgetUtil > 85) list.push({ type: "danger", title: `Budget ${budgetUtil.toFixed(0)}% utilized`, detail: `Only ${fmt(budgetRemaining)} remaining — review upcoming expenses` })
    else if (budgetUtil > 60) list.push({ type: "info", title: `Budget ${budgetUtil.toFixed(0)}% utilized`, detail: `${fmt(budgetRemaining)} remaining — on track for the term` })
    else list.push({ type: "success", title: `Budget ${budgetUtil.toFixed(0)}% utilized`, detail: `${fmt(budgetRemaining)} remaining — healthy budget position` })

    if (pendingExpenses > 3) list.push({ type: "warning", title: `${pendingExpenses} pending expense approvals`, detail: `${fmt(totalPending)} waiting for VP Finance review` })
    if (avgFillRate > 70) list.push({ type: "success", title: `Events averaging ${avgFillRate.toFixed(0)}% fill rate`, detail: `${totalRegistered} total registrations across ${eventsWithCapacity.length} events` })
    if (atRiskMembers.length > 0) list.push({ type: "warning", title: `${atRiskMembers.length} at-risk member${atRiskMembers.length > 1 ? "s" : ""}`, detail: atRiskMembers.map((m) => m.name).join(", ") + " — low engagement scores" })
    if (netCashFlow > 0) list.push({ type: "success", title: `Positive cash flow: ${fmt(netCashFlow)}`, detail: `Income (${fmt(totalIncome)}) exceeds spending (${fmt(totalSpent)})` })
    else list.push({ type: "danger", title: `Negative cash flow: ${fmt(netCashFlow)}`, detail: `Spending exceeds income — review budget allocation` })

    return list
  }, [retentionRate, memberStats, overdueTasks, completionRate, completedTasks, tasks, budgetUtil, budgetRemaining, pendingExpenses, totalPending, avgFillRate, totalRegistered, eventsWithCapacity, atRiskMembers, netCashFlow, totalIncome, totalSpent])

  const insightColors = { success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", warning: "bg-amber-500/10 border-amber-500/20 text-amber-400", danger: "bg-red-500/10 border-red-500/20 text-red-400", info: "bg-blue-500/10 border-blue-500/20 text-blue-400" }
  const insightIcons = { success: <ArrowUpRight className="h-4 w-4" />, warning: <AlertTriangle className="h-4 w-4" />, danger: <Flame className="h-4 w-4" />, info: <Activity className="h-4 w-4" /> }

  function handleExport(format: string) {
    alert(`Export as ${format} will be available once the backend is connected.\n\nThis will generate a downloadable ${format.toUpperCase()} file with all current report data.`)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Cross-module intelligence across members, operations, finance, and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={() => {}}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="this-term">This Term</SelectItem>
              <SelectItem value="last-term">Last Term</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => handleExport("csv")}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => handleExport("pdf")}>
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Org Health Hero + KPI Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Org Health Score */}
        <div className="lg:col-span-3 bg-card border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider mb-1">Org Health Score</p>
          <div className="relative">
            <ResponsiveContainer width={140} height={140}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={healthRadial}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className={cn("text-3xl font-bold", healthColor)}>{orgHealth}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={cn("h-2 w-2 rounded-full", healthBg)} />
            <span className={cn("text-xs font-medium", healthColor)}>{healthLabel}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Based on retention, tasks, budget & events</p>
        </div>

        {/* KPI Cards */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Active Members", value: memberStats.active, sub: `of ${memberStats.total} total`, icon: <UserCheck className="h-4 w-4" />, color: "text-emerald-400", trend: `${retentionRate}% retention` },
            { label: "Task Completion", value: `${completionRate.toFixed(0)}%`, sub: `${completedTasks}/${tasks.length} done`, icon: <Target className="h-4 w-4" />, color: "text-violet-400", trend: `${overdueTasks.length} overdue` },
            { label: "Budget Used", value: `${budgetUtil.toFixed(0)}%`, sub: `${fmt(budgetRemaining)} left`, icon: <Wallet className="h-4 w-4" />, color: "text-cyan-400", trend: fmt(budget.totalBudget) + " total" },
            { label: "Net Cash Flow", value: fmt(netCashFlow), sub: `${fmt(totalIncome)} in / ${fmt(totalSpent)} out`, icon: netCashFlow >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />, color: netCashFlow >= 0 ? "text-emerald-400" : "text-red-400", trend: netCashFlow >= 0 ? "Positive" : "Negative" },
            { label: "Events", value: events.length, sub: `${upcomingEvents} upcoming`, icon: <Calendar className="h-4 w-4" />, color: "text-pink-400", trend: `${pastEvents} completed` },
            { label: "Avg Fill Rate", value: `${avgFillRate.toFixed(0)}%`, sub: `${totalRegistered} registrations`, icon: <CalendarCheck className="h-4 w-4" />, color: "text-amber-400", trend: `${eventsWithCapacity.length} events` },
            { label: "Pending Approvals", value: pendingExpenses + pendingReimb, sub: `${fmt(totalPending)} expenses`, icon: <Clock className="h-4 w-4" />, color: "text-orange-400", trend: `${pendingReimb} reimbursements` },
            { label: "Engagement Avg", value: `${avgEngagement}`, sub: `${atRiskMembers.length} at risk`, icon: <Activity className="h-4 w-4" />, color: "text-blue-400", trend: `${engagementScores.length} active` },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border/50 rounded-xl p-3 space-y-1 hover:border-primary/30 transition-colors">
              <div className={cn("flex items-center gap-1.5", kpi.color)}>
                {kpi.icon}
                <span className="text-[10px] font-medium uppercase tracking-wide">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold leading-none">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
              <p className="text-[9px] text-muted-foreground/70 italic">{kpi.trend}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="executive" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="executive" className="gap-1.5 text-xs"><Gauge className="h-3 w-3" /> Executive Summary</TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5 text-xs"><Users className="h-3 w-3" /> Members</TabsTrigger>
          <TabsTrigger value="operations" className="gap-1.5 text-xs"><CheckSquare className="h-3 w-3" /> Operations</TabsTrigger>
          <TabsTrigger value="financial" className="gap-1.5 text-xs"><DollarSign className="h-3 w-3" /> Financial</TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 text-xs"><Calendar className="h-3 w-3" /> Events</TabsTrigger>
        </TabsList>

        {/* ─── EXECUTIVE SUMMARY ─── */}
        <TabsContent value="executive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Trend */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileBarChart className="h-4 w-4 text-primary" /> Monthly Activity & Spending Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis yAxisId="left" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis yAxisId="right" orientation="right" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area yAxisId="left" type="monotone" dataKey="tasks" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.08} name="Tasks" />
                  <Bar yAxisId="left" dataKey="members" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Members" barSize={20} />
                  <Bar yAxisId="left" dataKey="events" fill="#f472b6" radius={[3, 3, 0, 0]} name="Events" barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Spending ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Income ($)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Smart Insights */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Smart Insights ({insights.length})</h3>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {insights.map((insight, i) => (
                  <div key={i} className={cn("border rounded-lg p-3", insightColors[insight.type])}>
                    <div className="flex items-center gap-2">
                      {insightIcons[insight.type]}
                      <p className="text-sm font-medium">{insight.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">{insight.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Breakdown */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Module Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: "Members", val: memberStats.active, max: memberStats.total, color: "#3b82f6", detail: `${memberStats.inactive} inactive, ${memberStats.alumni} alumni` },
                  { label: "Tasks Done", val: completedTasks, max: tasks.length, color: "#10b981", detail: `${inProgressTasks} in progress, ${overdueTasks.length} overdue` },
                  { label: "Budget", val: Math.round(totalSpent), max: budget.totalBudget, color: budgetUtil > 85 ? "#ef4444" : "#f59e0b", detail: `${fmt(budgetRemaining)} remaining` },
                  { label: "Events", val: pastEvents, max: events.length, color: "#f472b6", detail: `${upcomingEvents} upcoming, ${avgFillRate.toFixed(0)}% avg fill` },
                  { label: "Subtasks", val: doneSubtasks, max: totalSubtasks, color: "#8b5cf6", detail: `${subtaskRate.toFixed(0)}% done, ${avgSubtasksPerTask} avg per task` },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground text-xs">{item.val} / {item.max} ({item.max > 0 ? ((item.val / item.max) * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.max > 0 ? (item.val / item.max) * 100 : 0}%`, backgroundColor: item.color }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── MEMBERS TAB ─── */}
        <TabsContent value="members">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Leaderboard */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Engagement Leaderboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {engagementScores.slice(0, 9).map((m, idx) => (
                  <div key={m.id} className={cn("flex items-center gap-3 rounded-lg p-3 border transition-colors", idx < 3 ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/30")}>
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", idx === 0 ? "bg-amber-500/20 text-amber-400" : idx === 1 ? "bg-slate-300/20 text-slate-300" : idx === 2 ? "bg-orange-700/20 text-orange-400" : "bg-muted/50 text-muted-foreground")}>
                      {idx < 3 ? <Star className="h-4 w-4" /> : `#${idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">{m.role} · {m.department}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", m.score >= 70 ? "text-emerald-400" : m.score >= 40 ? "text-amber-400" : "text-red-400")}>{m.score}</p>
                      <p className="text-[9px] text-muted-foreground">score</p>
                    </div>
                    <div className="w-12 h-2 bg-muted/50 rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: m.score >= 70 ? "#10b981" : m.score >= 40 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Members by Role */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Distribution by Role</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={membersByRole} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis type="category" dataKey="name" tick={AXIS_TICK_SM} stroke={AXIS_STROKE} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Members" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Members by Department */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> Distribution by Department</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={260}>
                  <PieChart>
                    <Pie data={membersByDept} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={pieLabel} labelLine={false}>
                      {membersByDept.map((_, idx) => (<Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {membersByDept.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="truncate flex-1">{d.name}</span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Year Distribution + At-Risk */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Members by Year</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={membersByYear}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={AXIS_TICK_SM} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Members" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* At-Risk Members */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><UserX className="h-4 w-4 text-red-400" /> At-Risk Members ({atRiskMembers.length})</h3>
              {atRiskMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <UserCheck className="h-8 w-8 mb-2 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-400">All members are engaged!</p>
                  <p className="text-xs mt-0.5">No members below the risk threshold</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {atRiskMembers.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.role} · {m.tasksCompleted} tasks, {m.eventsAttended} events</p>
                      </div>
                      <span className="text-xs font-bold text-red-400">{m.score}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground mt-2 italic">Members with engagement scores below 20 are flagged as at-risk</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── OPERATIONS TAB ─── */}
        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Pipeline */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /> Task Pipeline</h3>
              <div className="space-y-3">
                {tasksByStatus.map((s) => {
                  const width = tasks.length > 0 ? (s.value / tasks.length) * 100 : 0
                  return (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.fill }} />
                          <span className="font-medium">{s.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{s.value} ({width.toFixed(0)}%)</span>
                      </div>
                      <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, backgroundColor: s.fill }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Priority Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={tasksByPriority} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value" label={pieLabel}>
                    {tasksByPriority.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Workload by Section */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Workload by Section</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tasksBySection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={AXIS_TICK_SM} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tags Distribution */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Tasks by Tag</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tasksByTag} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis type="category" dataKey="name" tick={AXIS_TICK_SM} stroke={AXIS_STROKE} width={80} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Assignee Productivity */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Assignee Productivity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                      <th className="text-left py-2 pr-4 font-medium">Member</th>
                      <th className="text-center py-2 px-3 font-medium">Assigned</th>
                      <th className="text-center py-2 px-3 font-medium">Completed</th>
                      <th className="text-center py-2 px-3 font-medium">Rate</th>
                      <th className="text-left py-2 pl-3 font-medium w-40">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assigneeStats.map((a) => (
                      <tr key={a.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 pr-4 font-medium">{a.name}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{a.assigned}</td>
                        <td className="py-2.5 px-3 text-center">{a.completed}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={cn("font-medium", a.rate >= 70 ? "text-emerald-400" : a.rate >= 40 ? "text-amber-400" : "text-red-400")}>{a.rate}%</span>
                        </td>
                        <td className="py-2.5 pl-3">
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${a.rate}%`, backgroundColor: a.rate >= 70 ? "#10b981" : a.rate >= 40 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Overdue Tasks ({overdueTasks.length})</h3>
              {overdueTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-400">All tasks are on schedule!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {overdueTasks.map((t) => {
                    const daysOver = Math.ceil((new Date().getTime() - new Date(t.dueDate!).getTime()) / 86400000)
                    return (
                      <div key={t.id} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", daysOver > 5 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400")}>
                          {daysOver}d
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground">{t.section} · {t.priority} priority · {t.assignees.length} assignee{t.assignees.length > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── FINANCIAL TAB ─── */}
        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Trend */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-primary" /> Income vs Expenses Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => fmt(value as number)} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Income" />
                  <Area type="monotone" dataKey="spending" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Spending" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Spending by Category */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> Spending by Category</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={240}>
                  <PieChart>
                    <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value">
                      {expenseByCategory.map((_, idx) => (<Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => fmt(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {expenseByCategory.map((item, idx) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{fmt(item.value)}</span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct(item.value, totalSpent)}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Income by Type */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Income by Source</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={240}>
                  <PieChart>
                    <Pie data={incomeByType} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value">
                      {incomeByType.map((_, idx) => (<Cell key={idx} fill={PIE_COLORS[(idx + 3) % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => fmt(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {incomeByType.map((item, idx) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[(idx + 3) % PIE_COLORS.length] }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{fmt(item.value)}</span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct(item.value, totalIncome)}%`, backgroundColor: PIE_COLORS[(idx + 3) % PIE_COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Health Cards */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Financial Health Dashboard</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-muted/20 rounded-lg p-3 text-center space-y-1">
                  <Wallet className="h-4 w-4 text-cyan-400 mx-auto" />
                  <p className="text-lg font-bold">{fmt(budget.totalBudget)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Budget</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center space-y-1">
                  <TrendingDown className="h-4 w-4 text-red-400 mx-auto" />
                  <p className="text-lg font-bold">{fmt(totalSpent)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Spent</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center space-y-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto" />
                  <p className="text-lg font-bold">{fmt(totalIncome)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Income</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center space-y-1">
                  <div className={cn("h-4 w-4 mx-auto", netCashFlow >= 0 ? "text-emerald-400" : "text-red-400")}>{netCashFlow >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}</div>
                  <p className="text-lg font-bold" style={{ color: netCashFlow >= 0 ? "#10b981" : "#ef4444" }}>{fmt(netCashFlow)}</p>
                  <p className="text-[10px] text-muted-foreground">Net Cash Flow</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center space-y-1">
                  <Clock className="h-4 w-4 text-amber-400 mx-auto" />
                  <p className="text-lg font-bold">{fmt(totalPending)}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center space-y-1">
                  <Shield className="h-4 w-4 text-violet-400 mx-auto" />
                  <p className="text-lg font-bold">{expenseApprovalRate.toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Approval Rate</p>
                </div>
              </div>
            </div>

            {/* Top Expenses Table */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Top Expenses</h3>
              <div className="space-y-2">
                {topExpenses.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">{e.description}</p>
                      <p className="text-[10px] text-muted-foreground">{e.category} · {e.submittedBy}</p>
                    </div>
                    <span className={cn("text-xs font-bold shrink-0", e.status === "approved" ? "text-emerald-400" : e.status === "pending" ? "text-amber-400" : "text-red-400")}>{fmt(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Income + Approval Funnel */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Top Income Sources</h3>
              <div className="space-y-2 mb-6">
                {topIncomes.map((i, idx) => (
                  <div key={i.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">{i.source}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{i.type}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 shrink-0">{fmt(i.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Expense Approval Funnel</h4>
                <div className="space-y-2">
                  {[
                    { label: "Total Submitted", value: expenses.length, color: "#3b82f6" },
                    { label: "Approved", value: approvedExpenses, color: "#10b981" },
                    { label: "Pending", value: pendingExpenses, color: "#f59e0b" },
                    { label: "Denied", value: deniedExpenses, color: "#ef4444" },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: step.color }} />
                      <span className="flex-1">{step.label}</span>
                      <span className="font-bold">{step.value}</span>
                      <div className="w-16 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${expenses.length > 0 ? (step.value / expenses.length) * 100 : 0}%`, backgroundColor: step.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── EVENTS TAB ─── */}
        <TabsContent value="events">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event KPI Strip */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Event Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-muted/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-[10px] text-muted-foreground">Total Events</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{pastEvents}</p>
                  <p className="text-[10px] text-muted-foreground">Completed</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{upcomingEvents}</p>
                  <p className="text-[10px] text-muted-foreground">Upcoming</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{avgFillRate.toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Avg Fill Rate</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-pink-400">{totalRegistered}</p>
                  <p className="text-[10px] text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </div>

            {/* Registration Fill Rates */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Registration Fill Rates</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={eventFillData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 'dataMax']} />
                  <YAxis type="category" dataKey="name" tick={AXIS_TICK_SM} stroke={AXIS_STROKE} width={120} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="registered" fill="#f472b6" radius={[0, 4, 4, 0]} name="Registered" />
                  <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Event Types (Tags) */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Event Categories</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={eventsByTag} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value" label={pieLabel}>
                    {eventsByTag.map((_, idx) => (<Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Event Status + Individual Breakdown */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Event Status & Details</h3>
              <div className="flex items-center gap-4 mb-4">
                {eventsByStatus.map((s) => (
                  <div key={s.name} className="bg-muted/20 rounded-lg px-3 py-2 text-center flex-1">
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{s.name}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {events.map((e) => {
                  const fill = e.capacity ? ((e.registered || 0) / e.capacity) * 100 : null
                  return (
                    <div key={e.id} className="flex items-center gap-3 text-xs bg-muted/10 rounded-lg p-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground">{e.location}</p>
                      </div>
                      {fill !== null && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-12 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${fill}%`, backgroundColor: fill > 80 ? "#10b981" : fill > 50 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span className="text-[10px] font-medium">{fill.toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
