import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import type { ReactNode } from "react"

// 1. Mock the Supabase data for all finance tables
const { mockFinanceSupabase } = vi.hoisted(() => {
  const budget = { total_budget: 18000, term_label: "Fall 2026" };
  const expenses = [
    { id: "e1", description: "Seed Expense", amount: 200, status: "approved", category: "events", date: new Date().toISOString() },
    { id: "e2", description: "Pending Item", amount: 50, status: "pending", category: "food", date: new Date().toISOString() }
  ];
  const income = [{ id: "i1", source: "Dues", amount: 1000, type: "dues", date: new Date().toISOString() }];
  const reimbursements = [{ id: "r1", description: "Travel", amount: 30, status: "approved", category: "travel", date: new Date().toISOString() }];

  return {
    mockFinanceSupabase: {
      from: vi.fn((table) => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn((cb) => {
          let data: any = [];
          if (table === 'budgets') data = budget;
          if (table === 'expenses') data = expenses;
          if (table === 'income') data = income;
          if (table === 'reimbursements') data = reimbursements;
          return cb({ data, error: null });
        }),
      })),
    }
  };
});

vi.mock("../../src/lib/supabase", () => ({
  supabase: mockFinanceSupabase,
  supabaseUntyped: mockFinanceSupabase,
}));

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
  })

  it("deletes an expense", () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    const first = result.current.expenses[0]
    const before = result.current.expenses.length

    act(() => {
      result.current.deleteExpense(first.id)
    })

    expect(result.current.expenses.length).toBe(before - 1)
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
})