import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import { SponsorsProvider, useSponsors } from "../../src/context/sponsors-context"
import React from 'react'
import { supabase } from "../../src/lib/supabase"

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

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FinanceProvider>
    <SponsorsProvider>
      {children}
    </SponsorsProvider>
  </FinanceProvider>
)

describe("Contacts Page Persistence and State Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChain.then.mockImplementation((onFulfilled?: any) =>
      Promise.resolve(
        onFulfilled ? onFulfilled({ data: [], error: null }) : { data: [], error: null }
      )
    )
  })

  it("handles error if supabase fails on update", async () => {
    // Target .update() specifically — neither FinanceProvider's load nor
    // SponsorsProvider's load ever calls .update(), only select/insert.
    // So this once-mock is safely preserved until updateExpenseStatus fires it.
    // Returning a Supabase-shaped error lets the app's `if (error) throw error`
    // reject the promise, which is what the test asserts against.
    mockChain.update.mockImplementationOnce(() => ({
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'rejected promise' } })
    }))

    const { result } = renderHook(() => useFinance(), { wrapper: Wrapper })

    await act(async () => {
      const call = result.current.updateExpenseStatus("err-id", "approved")
      await expect(call).rejects.toMatchObject({ message: 'rejected promise' })
    })
  })

  it("calls supabase.insert on addContact", async () => {
    const { result } = renderHook(() => useSponsors(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.addContact("sponsor-123", {
        id: "new-contact",
        name: "Test User",
        email: "test@example.com",
        role: "Lead",
        organization: "Tech Corp"
      })
    })

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('sponsors')
      expect(mockChain.insert).toHaveBeenCalled()
    })
  })
})