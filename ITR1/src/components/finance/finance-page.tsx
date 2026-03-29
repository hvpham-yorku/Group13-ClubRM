import { useState } from "react"
import { type FinanceTab } from "./types"
import { BudgetOverview } from "./budget-overview"
import { ExpensesTab } from "./expenses-tab"
import { ReimbursementsTab } from "./reimbursements-tab"
import { IncomeTab } from "./income-tab"
import { AnalyticsTab } from "./analytics-tab"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Receipt, HandCoins, TrendingUp, BarChart3 } from "lucide-react"

const TAB_CONFIG: Record<FinanceTab, { label: string; icon: React.ReactNode; component: React.ComponentType }> = {
  overview: { label: "Budget Overview", icon: <LayoutDashboard className="h-4 w-4" />, component: BudgetOverview },
  expenses: { label: "Expenses", icon: <Receipt className="h-4 w-4" />, component: ExpensesTab },
  reimbursements: { label: "Reimbursements", icon: <HandCoins className="h-4 w-4" />, component: ReimbursementsTab },
  income: { label: "Income", icon: <TrendingUp className="h-4 w-4" />, component: IncomeTab },
  analytics: { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, component: AnalyticsTab },
}

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview")
  const ActiveComponent = TAB_CONFIG[activeTab].component;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Finance</h1>
        <div className="flex items-center gap-1 border-b border-border/50">
          {(Object.keys(TAB_CONFIG) as FinanceTab[]).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px",
                activeTab === tabKey ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              )}
            >
              {TAB_CONFIG[tabKey].icon}
              {TAB_CONFIG[tabKey].label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <ActiveComponent />
      </div>
    </div>
  )
}