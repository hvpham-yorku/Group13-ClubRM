import React, { useState } from "react"
import { type FinanceTab } from "./types"
import { BudgetOverview } from "./budget-overview"
import { ExpensesTab } from "./expenses-tab"
import { ReimbursementsTab } from "./reimbursements-tab"
import { IncomeTab } from "./income-tab"
import { AnalyticsTab } from "./analytics-tab"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"
import { LayoutDashboard, Receipt, HandCoins, TrendingUp, BarChart3, Plus, Sparkles, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const TAB_CONFIG: Record<FinanceTab, { label: string; icon: React.ReactNode; component: React.ComponentType }> = {
  overview:        { label: "Budget Overview",   icon: <LayoutDashboard className="h-4 w-4" />, component: BudgetOverview      },
  expenses:        { label: "Expenses",          icon: <Receipt className="h-4 w-4" />,        component: ExpensesTab          },
  reimbursements:  { label: "Reimbursements",    icon: <HandCoins className="h-4 w-4" />,      component: ReimbursementsTab    },
  income:          { label: "Income",            icon: <TrendingUp className="h-4 w-4" />,     component: IncomeTab            },
  analytics:       { label: "Analytics",         icon: <BarChart3 className="h-4 w-4" />,      component: AnalyticsTab         },
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0 }).format(n)
}

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview")
  const ActiveComponent = TAB_CONFIG[activeTab].component
  const { budget, totalSpent, totalIncome } = useFinance()

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Hero Header — matches MembersPage ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_right,rgba(34,197,94,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Financial Management
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                Track budgets, expenses, reimbursements, and club income
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
            {/* Stat mini-card — shows net cash flow at a glance */}
            <div className="flex min-w-[168px] flex-col justify-between rounded-2xl border border-border/60 bg-background/70 p-3 backdrop-blur">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Net Cash Flow
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold">{fmt(totalIncome - totalSpent)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    income vs spending
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              className="h-auto min-h-[96px] min-w-[184px] self-stretch gap-2 rounded-2xl px-5 text-sm font-semibold shadow-lg shadow-primary/15 sm:min-h-0"
              onClick={() => {/* open new transaction modal */}}
            >
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </div>
      </section>

      {/* ── Tab Toolbar ── */}
      <section className="rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium mr-2 text-muted-foreground">Category:</span>
          <div className="flex gap-1 bg-background/50 p-1 rounded-xl border border-border/60 flex-wrap">
            {(Object.keys(TAB_CONFIG) as FinanceTab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                  activeTab === tabKey
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {TAB_CONFIG[tabKey].icon}
                {TAB_CONFIG[tabKey].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab Content ── */}
      <div className="flex-1 min-h-0 overflow-auto">
        <ActiveComponent />
      </div>
    </div>
  )
}