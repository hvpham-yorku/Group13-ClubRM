<<<<<<< HEAD
import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { FinanceProvider, useFinance, SEED_EXPENSES } from "../../src/context/finance-context"
import type { ReactNode } from "react"

const WAIT_OPTS = { timeout: 5000, interval: 50 }
=======
import { describe, it, expect, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import type { ReactNode } from "react"

const { mockFinanceSupabase } = vi.hoisted(() => {
  const budget = { total_budget: 18000, term_label: "Fall 2026" };
  const expenses = [
    { id: "e1", description: "Seed Expense", amount: 200, status: "approved", category: "events", date: new Date().toISOString() },
    { id: "e2", description: "Pending Item", amount: 50, status: "pending", category: "food", date: new Date().toISOString() }
  ];
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
        limit: vi.fn().mockReturnThis(),
        then: vi.fn((cb) => {
          let data: any = [];
          if (table === 'budgets') data = budget;
          if (table === 'expenses') data = expenses;
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
>>>>>>> task-page

function wrapper({ children }: { children: ReactNode }) {
  return <FinanceProvider initialExpenses={SEED_EXPENSES}>{children}</FinanceProvider>
}

describe("FinanceContext", () => {
<<<<<<< HEAD
  it("provides initial budget data", async () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    expect(result.current.expenses.length).toBeGreaterThan(0)
    expect(result.current.budget.totalBudget).toBe(18000)
    expect(result.current.budget.termLabel).toBe("Fall 2026")
  })

  it.skip("adds an expense", async () => {
=======
  it("adds an expense", async () => {
>>>>>>> task-page
    const { result } = renderHook(() => useFinance(), { wrapper })
    await waitFor(() => expect(result.current.expenses.length).toBe(2))
    
    const before = result.current.expenses.length
<<<<<<< HEAD

=======
>>>>>>> task-page
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
<<<<<<< HEAD
    }, WAIT_OPTS)
  })

  it.skip("updates expense status", async () => {
=======
    })
  })

  it("updates expense status", async () => {
>>>>>>> task-page
    const { result } = renderHook(() => useFinance(), { wrapper })
    await waitFor(() => expect(result.current.expenses.length).toBe(2))
    
    const pendingExpense = result.current.expenses.find((e) => e.status === "pending")
<<<<<<< HEAD
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
=======
    
    await act(async () => {
      await result.current.updateExpenseStatus(pendingExpense!.id, "approved", "Admin")
    })

    await waitFor(() => {
      const updated = result.current.expenses.find((e) => e.id === pendingExpense!.id)
      expect(updated?.status).toBe("approved")
    })
  })

  it("deletes an expense", async () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    await waitFor(() => expect(result.current.expenses.length).toBe(2))
    
    const firstId = result.current.expenses[0].id
    const before = result.current.expenses.length

    await act(async () => {
      await result.current.deleteExpense(firstId)
    })

    await waitFor(() => {
      expect(result.current.expenses.length).toBe(before - 1)
    })
  })
})
>>>>>>> task-page
