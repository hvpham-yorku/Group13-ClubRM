import React, { useState } from "react"
import { type FinanceTab } from "./types"
import { BudgetOverview } from "./budget-overview"
import { ExpensesTab } from "./expenses-tab"
import { ReimbursementsTab } from "./reimbursements-tab"
import { IncomeTab } from "./income-tab"
import { AnalyticsTab } from "./analytics-tab"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Receipt, HandCoins, TrendingUp, BarChart3, Plus } from "lucide-react"

const TAB_CONFIG: Record<FinanceTab, { label: string; icon: React.ReactNode; component: React.ComponentType }> = {
  overview: { label: "Budget Overview", icon: <LayoutDashboard className="h-4 w-4" />, component: BudgetOverview },
  expenses: { label: "Expenses", icon: <Receipt className="h-4 w-4" />, component: ExpensesTab },
  reimbursements: { label: "Reimbursements", icon: <HandCoins className="h-4 w-4" />, component: ReimbursementsTab },
  income: { label: "Income", icon: <TrendingUp className="h-4 w-4" />, component: IncomeTab },
  analytics: { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, component: AnalyticsTab },
}

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview")
  const ActiveComponent = TAB_CONFIG[activeTab].component

  return (
    <div className="flex flex-col gap-6 p-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header: Matches Task Page Header Layout */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <button 
          className="bg-[#FF8A8A] text-white px-4 py-2 rounded-md font-bold hover:opacity-90 flex items-center gap-2"
          onClick={() => {/* Implement new transaction modal if needed */}}
        >
          <Plus className="h-4 w-4" />
          New Transaction
        </button>
      </div>

      {/* Toolbar Sub-Navigation: Matches Task Page Toolbar Layout */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium mr-2">Category:</span>
          <div className="flex gap-1 bg-background/50 p-1 rounded-md border border-border/50">
            {(Object.keys(TAB_CONFIG) as FinanceTab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
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
      </div>

      {/* Tab content: Full Stack Integration with Sub-Components */}
      <div className="flex-1 min-h-0 overflow-auto">
        <ActiveComponent />
      </div>
    </div>
  )
}