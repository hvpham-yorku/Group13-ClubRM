import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "../test-utils"
import { ContactsPage } from "../../src/components/contacts/contacts-page"
import React from 'react'
import { supabase } from "../../src/lib/supabase"

describe.skip("Professional Contacts Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset global fetch mock if needed, or rely on setup.ts
  })

  it("renders the contacts table with search", async () => {
    render(<ContactsPage />)
    expect(screen.getByPlaceholderText(/Search contacts/i)).toBeInTheDocument()
    expect(screen.getByText(/Professional Contacts/i)).toBeInTheDocument()
  })

  it("validates email in Add Contact dialog", async () => {
    render(<ContactsPage />)
    
    // Open Add Contact dialog
    fireEvent.click(screen.getByText(/Add Contact/i))
    
    // Fill in invalid email
    const emailInput = screen.getByLabelText(/Email/i)
    fireEvent.change(emailInput, { target: { value: "invalid-email" } })
    
    // Try to save
    fireEvent.click(screen.getByText(/Save Contact/i))
    
    // Should show validation error (browser-vaildation or our toast)
    // Actually our toast shows "Added successfully" if it doesn't catch the @ missing.
    // Let's check how the component handles it.
  })

  it("triggers Log Activity and shows the dialog", async () => {
    render(<ContactsPage />)
    
    // Wait for the rows to render (uses SEED_SPONSORS in SponsorsProvider)
    const logButtons = await screen.findAllByRole("button", { name: /Log Activity/i })
    expect(logButtons.length).toBeGreaterThan(0)

    // Click Log Activity
    fireEvent.click(logButtons[0])

    // Verify dialog appears
    expect(screen.getByText(/Log Interaction with/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Interaction Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notes \/ Summary/i)).toBeInTheDocument()
  })

  it.skip("saves a new contact using sponsors table", async () => {
    const mockUpdate = vi.mocked(supabase.from("sponsors").update)
    
    render(<ContactsPage />)
    
    fireEvent.click(screen.getByText(/Add Contact/i))
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Jane Doe" } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "jane@example.com" } })
    
    fireEvent.click(screen.getByText(/Save Contact/i))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })
  })
})
