import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import type { ReactNode } from "react"

function wrapper({ children }: { children: ReactNode }) {
  return <FinanceProvider>{children}</FinanceProvider>
}

describe("FinanceContext", () => {
  it("provides initial budget data", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    expect(result.current.budget.totalBudget).toBe(18000)
    expect(result.current.budget.termLabel).toBe("Fall 2026")
  })

  it("has seed expenses", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    expect(result.current.expenses.length).toBeGreaterThan(0)
  })

  it("calculates totalSpent from approved expenses", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const manualTotal = result.current.expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + e.amount, 0)
    expect(result.current.totalSpent).toBe(manualTotal)
  })

  it("calculates totalPending from pending expenses", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const manualPending = result.current.expenses
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0)
    expect(result.current.totalPending).toBe(manualPending)
  })

  it("calculates totalIncome from all income records", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const manualIncome = result.current.income.reduce((sum, i) => sum + i.amount, 0)
    expect(result.current.totalIncome).toBe(manualIncome)
  })

  it("adds an expense", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const before = result.current.expenses.length

    act(() => {
      result.current.addExpense({
        id: "test-e",
        description: "Test Expense",
        amount: 100,
        category: "events",
        date: new Date(),
        status: "pending",
        submittedBy: "Test User",
      })
    })

    expect(result.current.expenses.length).toBe(before + 1)
    expect(result.current.expenses[0].id).toBe("test-e")
  })

  it("updates expense status", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const pendingExpense = result.current.expenses.find((e) => e.status === "pending")
    if (!pendingExpense) return

    act(() => {
      result.current.updateExpenseStatus(pendingExpense.id, "approved", "Admin")
    })

    const updated = result.current.expenses.find((e) => e.id === pendingExpense.id)
    expect(updated?.status).toBe("approved")
    expect(updated?.approvedBy).toBe("Admin")
  })

  it("deletes an expense", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const first = result.current.expenses[0]
    const before = result.current.expenses.length

    act(() => {
      result.current.deleteExpense(first.id)
    })

    expect(result.current.expenses.length).toBe(before - 1)
    expect(result.current.expenses.find((e) => e.id === first.id)).toBeUndefined()
  })

  it("adds a reimbursement", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const before = result.current.reimbursements.length

    act(() => {
      result.current.addReimbursement({
        id: "test-r",
        submittedBy: "Test User",
        amount: 50,
        description: "Test Reimbursement",
        category: "food",
        date: new Date(),
        status: "pending",
      })
    })

    expect(result.current.reimbursements.length).toBe(before + 1)
  })

  it("updates reimbursement status to paid with paidDate", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const approved = result.current.reimbursements.find((r) => r.status === "approved")
    if (!approved) return

    act(() => {
      result.current.updateReimbursementStatus(approved.id, "paid")
    })

    const updated = result.current.reimbursements.find((r) => r.id === approved.id)
    expect(updated?.status).toBe("paid")
    expect(updated?.paidDate).toBeDefined()
  })

  it("adds income", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const before = result.current.income.length

    act(() => {
      result.current.addIncome({
        id: "test-i",
        source: "Test Income",
        amount: 500,
        type: "donation",
        date: new Date(),
      })
    })

    expect(result.current.income.length).toBe(before + 1)
  })

  it("deletes income", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const first = result.current.income[0]
    const before = result.current.income.length

    act(() => {
      result.current.deleteIncome(first.id)
    })

    expect(result.current.income.length).toBe(before - 1)
  })
})
