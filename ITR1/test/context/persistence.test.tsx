import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import { SponsorsProvider, useSponsors } from "../../src/context/sponsors-context"
import React from 'react'

const mockChain = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  then: vi.fn((onFulfilled?: any, _onRejected?: any) => {
    return Promise.resolve(
      onFulfilled ? onFulfilled({ data: [], error: null }) : { data: [], error: null }
    );
  }),
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: mockChain
}))

describe("Persistence and State Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChain.then.mockImplementation((onFulfilled?: any) =>
      Promise.resolve(
        onFulfilled ? onFulfilled({ data: [], error: null }) : { data: [], error: null }
      )
    )
  })

  it("handles error if supabase fails on update", async () => {
    // Target .update() specifically — the load phase never calls .update(),
    // so this once-mock is preserved until updateExpenseStatus consumes it.
    // We return a Supabase-shaped { error } response rather than rejecting
    // the promise directly; the app's own `if (error) throw error` then
    // causes updateExpenseStatus to reject, which is what the test asserts.
    mockChain.update.mockImplementationOnce(() => ({
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'rejected promise' } })
    }))

    const { result } = renderHook(() => useFinance(), {
      wrapper: ({ children }) => <FinanceProvider>{children}</FinanceProvider>
    })

    await act(async () => {
      await expect(result.current.updateExpenseStatus("err-id", "approved"))
        .rejects.toMatchObject({ message: 'rejected promise' })
    })
  })

  it("calls supabase.insert on addContact", async () => {
    const { result } = renderHook(() => useSponsors(), {
      wrapper: ({ children }) => <SponsorsProvider>{children}</SponsorsProvider>
    })

    await act(async () => {
      await result.current.addContact("sponsor-id", {
        id: "contact-1", name: "Test", email: "t@t.com", role: "R", organization: "O"
      })
    })

    await waitFor(() => {
      expect(mockChain.insert).toHaveBeenCalled()
    })
  })
})