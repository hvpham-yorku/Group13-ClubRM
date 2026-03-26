import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { FinanceProvider, useFinance, SEED_EXPENSES } from "../../src/context/finance-context"
import type { ReactNode } from "react"

const WAIT_OPTS = { timeout: 5000, interval: 50 }

function wrapper({ children }: { children: ReactNode }) {
  return <FinanceProvider initialExpenses={SEED_EXPENSES}>{children}</FinanceProvider>
}

describe("FinanceContext", () => {
  it("provides initial budget data", async () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    expect(result.current.expenses.length).toBeGreaterThan(0)
    expect(result.current.budget.totalBudget).toBe(18000)
    expect(result.current.budget.termLabel).toBe("Fall 2026")
  })

  it.skip("adds an expense", async () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const before = result.current.expenses.length

    await act(async () => {
      await result.current.addExpense({
        id: "test-e",
        description: "Test Expense",
        amount: 100,
        category: "events",
        date: new Date(),
        status: "pending",
        submittedBy: "Test User",
      })
    })

    await waitFor(() => {
      expect(result.current.expenses.length).toBe(before + 1)
    }, WAIT_OPTS)
  })

  it.skip("updates expense status", async () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const pendingExpense = result.current.expenses.find((e) => e.status === "pending")
    if (!pendingExpense) return

    await act(async () => {
      await result.current.updateExpenseStatus(pendingExpense.id, "approved", "Admin")
    })

    await waitFor(() => {
      const updated = result.current.expenses.find((e) => e.id === pendingExpense.id)
      expect(updated?.status).toBe("approved")
    }, WAIT_OPTS)
  })
})
