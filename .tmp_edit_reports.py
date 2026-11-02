p='ITR1/src/components/reports/reports-page.tsx'
s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a,s.count(a))
    s=s.replace(a,b)
rep('''import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
''','''import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, startOfYear } from "date-fns"
import { toCsv, downloadCsv, type CsvCell } from "@/lib/csv"
''')
rep('''// ─── Component ───────────────────────────────────────────────────────────────''','''// ─── Period filter ───────────────────────────────────────────────────────────
// Academic terms: Winter (Jan–Apr), Summer (May–Aug), Fall (Sep–Dec).
export type ReportPeriod = "this-term" | "last-term" | "ytd" | "all-time"

export function getPeriodRange(period: string, ref: Date = new Date()): { start: Date; end: Date } | null {
  const termStartMonth = Math.floor(ref.getMonth() / 4) * 4
  switch (period) {
    case "this-term": {
      const start = new Date(ref.getFullYear(), termStartMonth, 1)
      const end = endOfMonth(new Date(ref.getFullYear(), termStartMonth + 3, 1))
      return { start, end }
    }
    case "last-term": {
      const start = new Date(ref.getFullYear(), termStartMonth - 4, 1) // Date handles negative months
      const end = endOfMonth(new Date(start.getFullYear(), start.getMonth() + 3, 1))
      return { start, end }
    }
    case "ytd":
      return { start: startOfYear(ref), end: ref }
    default:
      return null // all-time
  }
}

function inRange(value: Date | string | null | undefined, range: { start: Date; end: Date } | null): boolean {
  if (!range) return true
  const d = safeDate(value)
  return !!d && d >= range.start && d <= range.end
}

// ─── Component ───────────────────────────────────────────────────────────────''')
rep('''  const fMembers      = useMemo(() => selectedDept === "all" ? members  : members.filter(m => m.department === selectedDept), [members, selectedDept])
  const fTasks        = useMemo(() => selectedDept === "all" ? tasks    : tasks.filter(t => t.section === selectedDept), [tasks, selectedDept])
  const fEvents       = useMemo(() => selectedDept === "all" ? events   : events.filter(e => e.tags.some(t => t.toLowerCase() === selectedDept.toLowerCase())), [events, selectedDept])
  const fExpenses     = useMemo(() => selectedDept === "all" ? expenses : expenses.filter(e => e.category.toLowerCase() === selectedDept.toLowerCase()), [expenses, selectedDept])
  const fIncome       = useMemo(() => selectedDept === "all" ? income   : income.filter(i => i.type.toLowerCase() === selectedDept.toLowerCase()), [income, selectedDept])
  const fReimbursements = useMemo(() => selectedDept === "all" ? reimbursements : reimbursements.filter(r => r.category.toLowerCase() === selectedDept.toLowerCase()), [reimbursements, selectedDept])
''','''  // Period filter: dated records must fall inside the selected range.
  // Members are a roster, so we keep everyone who had joined by the end of the period.
  const range = useMemo(() => getPeriodRange(period), [period])
  const deptMatch = (v: string | undefined | null) => selectedDept === "all" || (v ?? "").toLowerCase() === selectedDept.toLowerCase()

  const fMembers      = useMemo(() => members.filter(m => (selectedDept === "all" || m.department === selectedDept) && (!range || !safeDate(m.joinDate) || safeDate(m.joinDate)! <= range.end)), [members, selectedDept, range])
  const fTasks        = useMemo(() => tasks.filter(t => (selectedDept === "all" || t.section === selectedDept) && inRange(t.createdAt, range)), [tasks, selectedDept, range])
  const fEvents       = useMemo(() => events.filter(e => (selectedDept === "all" || (e.tags ?? []).some(t => t.toLowerCase() === selectedDept.toLowerCase())) && inRange(e.startDate, range)), [events, selectedDept, range])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fExpenses     = useMemo(() => expenses.filter(e => deptMatch(e.category) && inRange(e.date, range)), [expenses, selectedDept, range])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fIncome       = useMemo(() => income.filter(i => deptMatch(i.type) && inRange(i.date, range)), [income, selectedDept, range])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fReimbursements = useMemo(() => reimbursements.filter(r => deptMatch(r.category) && inRange(r.date, range)), [reimbursements, selectedDept, range])
''')
old_start = s.index('''  function handleExport(exportFormat: string) {''')
old_end = s.index('''  // ─── Render ──''')
new_export = '''  function handleExport(exportFormat: string) {
    if (exportFormat === "csv") {
      const ymd = (v: Date | string | null | undefined) => { const d = safeDate(v); return d ? format(d, "yyyy-MM-dd") : "" }
      const rows: CsvCell[][] = [
        ["Report", "Period", period],
        ["Report", "Department", selectedDept],
        ["Members", "Total", fMemberStats.total],
        ["Members", "Active", fMemberStats.active],
        ["Members", "Inactive", fMemberStats.inactive],
        ["Members", "Alumni", fMemberStats.alumni],
        ["Members", "Retention Rate", `${retentionRate}%`],
        ["Tasks", "Total", fTasks.length],
        ["Tasks", "Completed", completedTasks],
        ["Tasks", "Completion Rate", `${completionRate.toFixed(1)}%`],
        ["Tasks", "Overdue", overdueTasks.length],
        ["Tasks", "In Progress", inProgressTasks],
        ["Finance", "Budget Total", budget.totalBudget],
        ["Finance", "Total Spent", fTotalSpent],
        ["Finance", "Remaining", budgetRemaining],
        ["Finance", "Total Income", fTotalIncome],
        ["Finance", "Net Cash Flow", netCashFlow],
        ["Finance", "Pending Approvals", pendingExpenses],
        ["Events", "Total", fEvents.length],
        ["Events", "Upcoming", upcomingEvents],
        ["Events", "Past", pastEvents],
        ["Events", "Avg Fill Rate", `${avgFillRate.toFixed(1)}%`],
        ["Org Health", "Score", `${orgHealth}/100`],
      ]
      const sections = [
        toCsv(["Module", "Metric", "Value"], rows),
        "--- Expenses ---",
        toCsv(
          ["Description", "Amount", "Category", "Status", "Submitted By", "Date"],
          fExpenses.map(e => [e.description, e.amount, e.category, e.status, e.submittedBy, ymd(e.date)]),
        ),
        "--- Income ---",
        toCsv(
          ["Source", "Amount", "Type", "Date"],
          fIncome.map(i => [i.source, i.amount, i.type, ymd(i.date)]),
        ),
      ]
      downloadCsv(`clubrm-report-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`, sections.join("\\r\\n\\r\\n"))
    } else {
      window.print()
    }
  }

'''
s = s[:old_start] + new_export + s[old_end:]
open(p,'w',encoding='utf-8').write(s)
print('ok')
