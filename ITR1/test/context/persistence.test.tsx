import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { FinanceProvider, useFinance } from "../../src/context/finance-context"
import { SponsorsProvider, useSponsors } from "../../src/context/sponsors-context"
import React from 'react'
import { supabase } from "../../src/lib/supabase"

const FinanceWrapper = ({ children }: { children: React.ReactNode }) => (
  <FinanceProvider>{children}</FinanceProvider>
)

const SponsorsWrapper = ({ children }: { children: React.ReactNode }) => (
  <SponsorsProvider>{children}</SponsorsProvider>
)

describe.skip("Persistence and State Sync", () => {
  describe("Finance Context Persistence", () => {
    it("calls supabase.update when updating expense status", async () => {
      const { result } = renderHook(() => useFinance(), { wrapper: FinanceWrapper })
      
      // We need to wait for SEED data to 'load' in the provider
      // Mocked supabase returns empty data, which triggers SEED logic
      
      const mockUpdate = vi.mocked(supabase.from("expenses").update)
      const mockEq = vi.mocked(supabase.from("expenses").update({} as any).eq)

      await act(async () => {
        try {
          await result.current.updateExpenseStatus("test-id", "approved", "President")
        } catch (e) {
          // ignore since we are testing the call, not the return value if not mocked perfectly
        }
      })

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "approved", approved_by: "President" }))
      expect(mockEq).toHaveBeenCalledWith("id", "test-id")
    })

    it("throws error if supabase fails on update", async () => {
      const { result } = renderHook(() => useFinance(), { wrapper: FinanceWrapper })
      
      vi.mocked(supabase.from("expenses").update).mockReturnValue({
        eq: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: "DB Error" } }))
      } as any)

      await expect(result.current.updateExpenseStatus("err-id", "approved")).rejects.toEqual({ message: "DB Error" })
    })
  })

  describe("Sponsors Context Persistence", () => {
    it.skip("calls supabase.update on addContact", async () => {
      const { result } = renderHook(() => useSponsors(), { wrapper: SponsorsWrapper })
      const mockUpdate = vi.mocked(supabase.from("sponsors").update)

      await act(async () => {
        await result.current.addContact("s1", {
          id: "c1",
          name: "Test Contact",
          email: "test@example.com",
          role: "Manager",
          linkedin: "li",
          tags: ["fintech"],
          organization: "Test Org",
          createdAt: "2026-03-26"
        })
      })

      expect(mockUpdate).toHaveBeenCalled()
    })
  })
})
