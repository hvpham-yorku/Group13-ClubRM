import { useState } from "react"
import { type FinanceTab } from "./types"
import { BudgetOverview } from "./budget-overview"
import { ExpensesTab } from "./expenses-tab"
import { ReimbursementsTab } from "./reimbursements-tab"
import { IncomeTab } from "./income-tab"
import { AnalyticsTab } from "./analytics-tab"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  HandCoins,
  TrendingUp,
  BarChart3,
} from "lucide-react"

const TABS: { value: FinanceTab; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Budget Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { value: "expenses", label: "Expenses", icon: <Receipt className="h-4 w-4" /> },
  { value: "reimbursements", label: "Reimbursements", icon: <HandCoins className="h-4 w-4" /> },
  { value: "income", label: "Income", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
]

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview")

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header with sub-navigation */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Finance</h1>
        <div className="flex items-center gap-1 border-b border-border/50">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px",
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "overview" && <BudgetOverview />}
        {activeTab === "expenses" && <ExpensesTab />}
        {activeTab === "reimbursements" && <ReimbursementsTab />}
        {activeTab === "income" && <IncomeTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  )
}
