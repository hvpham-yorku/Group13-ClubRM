import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import { SponsorsProvider, useSponsors } from "../../src/context/sponsors-context"
import React from 'react'
import { supabase } from "../../src/lib/supabase"

// 1. Comprehensively mock Supabase at the module level
const mockEq = vi.fn().mockResolvedValue({ data: {}, error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

vi.mock("../../src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      update: mockUpdate,
      select: vi.fn().mockReturnThis(),
      eq: mockEq,
    }))
  }
}))

const FinanceWrapper = ({ children }: { children: React.ReactNode }) => (
  <FinanceProvider>{children}</FinanceProvider>
)

const SponsorsWrapper = ({ children }: { children: React.ReactNode }) => (
  <SponsorsProvider>{children}</SponsorsProvider>
)

describe("Persistence and State Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Finance Context Persistence", () => {
    it("calls supabase.update when updating expense status", async () => {
      const { result } = renderHook(() => useFinance(), { wrapper: FinanceWrapper })
      
      await waitFor(() => expect(result.current.expenses).toBeDefined())

      await act(async () => {
        await result.current.updateExpenseStatus("test-id", "approved", "President")
      })

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled()
      })
    })

    it("handles error if supabase fails on update", async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: { message: "rejected promise" } })

      const { result } = renderHook(() => useFinance(), { wrapper: FinanceWrapper })
      await waitFor(() => expect(result.current.expenses).toBeDefined())

      const call = result.current.updateExpenseStatus("err-id", "approved")
      await expect(call).resolves.toBeUndefined()
      
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  describe("Sponsors Context Persistence", () => {
    it("calls supabase.update on addContact", async () => {
      const { result } = renderHook(() => useSponsors(), { wrapper: SponsorsWrapper })
      
      await waitFor(() => expect(result.current.sponsors).toBeDefined())

      await act(async () => {
        await result.current.addContact("s1", {
          id: "c1",
          name: "Test Contact",
          email: "test@example.com",
          role: "Manager",
          linkedin: "li",
          tags: ["fintech"],
          organization: "Test Org",
          createdAt: new Date().toISOString()
        })
      })

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled()
      })
    })
  })
})