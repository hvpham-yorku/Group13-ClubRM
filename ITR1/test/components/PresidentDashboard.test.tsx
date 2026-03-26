import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "../test-utils"
import { PresidentDashboard } from "../../src/components/dashboard/variants/president-dashboard"
import React from 'react'
import { supabase } from "../../src/lib/supabase"

// Mock fetch for the dashboard API
global.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({
    stats: { members: 10, activeMembers: 8, totalBudget: 1000, spentBudget: 200, onTrackEvents: 1, totalEvents: 1, completedTasks: 1, totalTasks: 2 },
    score: 85,
    insights: { approvals: { items: [] }, risks: { risks: [] }, events: { events: [] } }
  })
})

describe.skip("President Dashboard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the executive summary and approval queue", async () => {
    render(<PresidentDashboard />)
    expect(screen.getByText(/Executive Summary/i)).toBeInTheDocument()
    expect(screen.getByText(/Approval Queue/i)).toBeInTheDocument()
  })

  it.skip("handles successful approval click", async () => {
    const mockUpdate = vi.mocked(supabase.from("expenses").update)
    
    // We need to trigger an approval. Since the API returns empty, 
    // we rely on the context SEED fallback for the list.
    
    render(<PresidentDashboard />)
    
    // Wait for items to appear (fallback to SEED_EXPENSES in FinanceProvider)
    const approveButtons = await screen.findAllByTitle(/Approve Finance/i)
    expect(approveButtons.length).toBeGreaterThan(0)

    fireEvent.click(approveButtons[0])

    await waitFor(() => {
      // Check if update was called
      expect(mockUpdate).toHaveBeenCalled()
      // Check if item is removed (optimistic UI / state sync)
      // Since SEED data for e2 is pending, it should be in the list initially.
    })
  })

  it.skip("shows error alert on failed approval", async () => {
    vi.mocked(supabase.from("expenses").update).mockReturnValue({
      eq: vi.fn().mockReturnValue(Promise.resolve({ error: { message: "Permission Denied" } }))
    } as any)

    render(<PresidentDashboard />)
    
    const approveButtons = await screen.findAllByTitle(/Approve Finance/i)
    fireEvent.click(approveButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Permission Denied/i)).toBeInTheDocument()
    })
  })
})
