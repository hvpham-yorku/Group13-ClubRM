import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useFinance } from "@/context/finance-context"
import {
  type Income,
  type IncomeType,
  INCOME_TYPE_CONFIG,
  formatCurrency,
} from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { format } from "date-fns"
import {
  Plus,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

type SortKey = "date" | "source" | "type" | "amount"

const TYPE_COLORS: Record<IncomeType, string> = {
  dues: "#3b82f6",
  sponsorship: "#8b5cf6",
  fundraising: "#10b981",
  donation: "#ec4899",
  other: "#64748b",
}

export function IncomeTab() {
  const { income, addIncome, deleteIncome, totalIncome } = useFinance()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [filterType, setFilterType] = useState<IncomeType | "all">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [newSource, setNewSource] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newType, setNewType] = useState<IncomeType>("dues")
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [newRecurring, setNewRecurring] = useState(false)
  const [newNotes, setNewNotes] = useState("")

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "date", direction: "desc" })

  const filtered = useMemo(() => {
    return income
      .filter((i) => filterType === "all" || i.type === filterType)
      .sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1
        switch (sortConfig.key) {
          case "date":
            return (a.date.getTime() - b.date.getTime()) * dir
          case "source":
            return a.source.localeCompare(b.source) * dir
          case "type":
            return a.type.localeCompare(b.type) * dir
          case "amount":
            return (a.amount - b.amount) * dir
          default:
            return 0
        }
      })
  }, [income, filterType, sortConfig])

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1.5 h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity inline-block" />
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1.5 h-3 w-3 inline-block" />
    ) : (
      <ArrowDown className="ml-1.5 h-3 w-3 inline-block" />
    )
  }

  const byType = useMemo(() => {
    const map: Record<string, number> = {}
    income.forEach((i) => {
      map[i.type] = (map[i.type] || 0) + i.amount
    })
    return (Object.entries(INCOME_TYPE_CONFIG) as [IncomeType, typeof INCOME_TYPE_CONFIG[IncomeType]][]).map(
      ([key, config]) => ({
        name: config.label,
        value: map[key] || 0,
        color: TYPE_COLORS[key],
      })
    ).filter((d) => d.value > 0)
  }, [income])

  const recurringTotal = income
    .filter((i) => i.recurring)
    .reduce((s, i) => s + i.amount, 0)

  const handleAdd = () => {
    if (!newSource.trim() || !newAmount) return
    const inc: Income = {
      id: `i-${Date.now()}`,
      source: newSource.trim(),
      amount: parseFloat(newAmount),
      type: newType,
      date: new Date(`${newDate}T12:00:00`),
      recurring: newRecurring,
      notes: newNotes || undefined,
    }
    addIncome(inc)
    setModalOpen(false)
    setNewSource("")
    setNewAmount("")
    setNewType("dues")
    setNewDate(format(new Date(), "yyyy-MM-dd"))
    setNewRecurring(false)
    setNewNotes("")
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</div>
          <span className="text-xs text-muted-foreground">{income.length} sources</span>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Recurring</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(recurringTotal)}</div>
          <span className="text-xs text-muted-foreground">{income.filter((i) => i.recurring).length} sources</span>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5 flex items-center gap-4">
          <div className="w-[100px] h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value">
                  {byType.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", color: "hsl(var(--foreground))" }}
                  formatter={(value) => formatCurrency(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {byType.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-muted-foreground">{d.name}: {formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/50">
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
              filterType === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {(Object.entries(INCOME_TYPE_CONFIG) as [IncomeType, typeof INCOME_TYPE_CONFIG[IncomeType]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? "all" : key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                  filterType === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {config.label}
              </button>
            )
          )}
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Income list */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/20">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort("date")}>
                Date <SortIcon columnKey="date" />
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort("source")}>
                Source <SortIcon columnKey="source" />
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort("type")}>
                Type <SortIcon columnKey="type" />
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort("amount")}>
                Amount <SortIcon columnKey="amount" />
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => {
              const config = INCOME_TYPE_CONFIG[inc.type]
              return (
                <tr key={inc.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(inc.date, "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{inc.source}</span>
                      {inc.recurring && (
                        <span title="Recurring"><RefreshCw className="h-3 w-3 text-blue-400" /></span>
                      )}
                    </div>
                    {inc.notes && <div className="text-[11px] text-muted-foreground mt-0.5">{inc.notes}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", config.color)}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right tabular-nums text-emerald-400">
                    +{formatCurrency(inc.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      onClick={() => deleteIncome(inc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No income records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Income Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Record a new income source.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Source</Label>
              <Input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="e.g. TechCorp Sponsorship" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Amount ($)</Label>
                <Input type="number" step="0.01" min="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Type</Label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as IncomeType)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {(Object.entries(INCOME_TYPE_CONFIG) as [IncomeType, typeof INCOME_TYPE_CONFIG[IncomeType]][]).map(
                  ([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  )
                )}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newRecurring} onChange={(e) => setNewRecurring(e.target.checked)} className="rounded" />
              <span className="text-sm">Recurring income</span>
            </label>
            <div className="space-y-2">
              <Label className="text-sm">Notes (optional)</Label>
              <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Additional details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={!newSource.trim() || !newAmount}>Add Income</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
