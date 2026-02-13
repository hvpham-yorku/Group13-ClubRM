import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import {
  type Expense,
  type Reimbursement,
  type Income,
  type Budget,
  type ExpenseStatus,
  type ReimbursementStatus,
} from "@/components/finance/types"

const today = new Date()
const y = today.getFullYear()
const m = today.getMonth()

function d(day: number, month?: number): Date {
  return new Date(y, month !== undefined ? month : m, day)
}

const SEED_BUDGET: Budget = {
  totalBudget: 18000,
  termLabel: "Fall 2026",
}

const SEED_EXPENSES: Expense[] = [
  { id: "e1", description: "Venue deposit - Main Hall", amount: 250, category: "events", date: d(5), status: "approved", submittedBy: "Sarah Smith", approvedBy: "Emily Chen" },
  { id: "e2", description: "Marketing flyers (200 copies)", amount: 89, category: "marketing", date: d(3), status: "pending", submittedBy: "Lisa Wang" },
  { id: "e3", description: "Snacks for exec meeting", amount: 45, category: "food", date: d(1), status: "approved", submittedBy: "Mike Johnson", approvedBy: "Emily Chen" },
  { id: "e4", description: "Photography for Tech Talk", amount: 150, category: "events", date: d(8), status: "approved", submittedBy: "Sarah Smith", approvedBy: "Emily Chen" },
  { id: "e5", description: "Domain renewal - clubrm.org", amount: 35, category: "technology", date: d(2), status: "approved", submittedBy: "Tom Davis", approvedBy: "Emily Chen" },
  { id: "e6", description: "Banner & signage for Valentine Social", amount: 120, category: "marketing", date: d(6), status: "approved", submittedBy: "Lisa Wang", approvedBy: "Emily Chen" },
  { id: "e7", description: "Catering deposit - Valentine Social", amount: 200, category: "food", date: d(7), status: "approved", submittedBy: "Emily Chen", approvedBy: "John Doe" },
  { id: "e8", description: "AV equipment rental", amount: 180, category: "events", date: d(9), status: "pending", submittedBy: "Sarah Smith" },
  { id: "e9", description: "Google Workspace subscription", amount: 72, category: "technology", date: d(1), status: "approved", submittedBy: "Tom Davis", approvedBy: "Emily Chen" },
  { id: "e10", description: "Instagram ad campaign", amount: 50, category: "marketing", date: d(4), status: "approved", submittedBy: "Lisa Wang", approvedBy: "Emily Chen" },
  { id: "e11", description: "Speaker gift cards (x3)", amount: 75, category: "events", date: d(10), status: "pending", submittedBy: "Alex Brown" },
  { id: "e12", description: "Office supplies - notebooks, pens", amount: 32, category: "operations", date: d(2), status: "approved", submittedBy: "Mike Johnson", approvedBy: "Emily Chen" },
  { id: "e13", description: "Zoom Pro annual plan", amount: 150, category: "technology", date: d(1), status: "approved", submittedBy: "Tom Davis", approvedBy: "Emily Chen" },
  { id: "e14", description: "Pizza for study session", amount: 85, category: "food", date: d(11), status: "pending", submittedBy: "Rachel Kim" },
  { id: "e15", description: "T-shirt printing samples", amount: 45, category: "marketing", date: d(9), status: "denied", submittedBy: "Lisa Wang", notes: "Wait until full order is confirmed" },
  { id: "e16", description: "Networking dinner - 20 people", amount: 380, category: "food", date: d(12), status: "approved", submittedBy: "Alex Brown", approvedBy: "Emily Chen" },
  { id: "e17", description: "Workshop materials - 3D printing", amount: 95, category: "events", date: d(10), status: "approved", submittedBy: "David Park", approvedBy: "Emily Chen" },
  { id: "e18", description: "Volunteer appreciation gifts", amount: 60, category: "operations", date: d(11), status: "pending", submittedBy: "Mike Johnson" },
  // Older month expenses for trend data
  { id: "e19", description: "January venue rental", amount: 300, category: "events", date: d(15, m - 1), status: "approved", submittedBy: "Sarah Smith", approvedBy: "Emily Chen" },
  { id: "e20", description: "January marketing materials", amount: 110, category: "marketing", date: d(10, m - 1), status: "approved", submittedBy: "Lisa Wang", approvedBy: "Emily Chen" },
  { id: "e21", description: "January catering", amount: 220, category: "food", date: d(20, m - 1), status: "approved", submittedBy: "Emily Chen", approvedBy: "John Doe" },
  { id: "e22", description: "December social event", amount: 450, category: "events", date: d(10, m - 2), status: "approved", submittedBy: "Sarah Smith", approvedBy: "Emily Chen" },
  { id: "e23", description: "December marketing push", amount: 200, category: "marketing", date: d(5, m - 2), status: "approved", submittedBy: "Lisa Wang", approvedBy: "Emily Chen" },
]

const SEED_REIMBURSEMENTS: Reimbursement[] = [
  { id: "r1", submittedBy: "John Doe", amount: 145, description: "Food for networking event", category: "food", date: d(5), status: "pending" },
  { id: "r2", submittedBy: "Sarah Smith", amount: 89, description: "Office supplies", category: "operations", date: d(4), status: "pending" },
  { id: "r3", submittedBy: "Alex Brown", amount: 35, description: "Uber to sponsor meeting", category: "operations", date: d(6), status: "pending" },
  { id: "r4", submittedBy: "Lisa Wang", amount: 62, description: "Canva Pro subscription (1 month)", category: "technology", date: d(1), status: "approved", approvedBy: "Emily Chen" },
  { id: "r5", submittedBy: "Tom Davis", amount: 28, description: "USB drives for workshop", category: "technology", date: d(2), status: "approved", approvedBy: "Emily Chen" },
  { id: "r6", submittedBy: "Mike Johnson", amount: 95, description: "Decorations for Valentine Social", category: "events", date: d(7), status: "approved", approvedBy: "Emily Chen", paidDate: d(9) },
  { id: "r7", submittedBy: "Rachel Kim", amount: 40, description: "Printing costs for handouts", category: "marketing", date: d(3), status: "paid", approvedBy: "Emily Chen", paidDate: d(8) },
  { id: "r8", submittedBy: "David Park", amount: 110, description: "Emergency supplies for workshop", category: "events", date: d(8), status: "denied", notes: "Not pre-approved; submit for next time" },
]

const SEED_INCOME: Income[] = [
  { id: "i1", source: "Member Dues - Fall Term (42 members)", amount: 4200, type: "dues", date: d(1, m - 2), recurring: true },
  { id: "i2", source: "TechCorp Sponsorship - Gold Tier", amount: 5000, type: "sponsorship", date: d(15, m - 1) },
  { id: "i3", source: "StartupX Sponsorship - Silver Tier", amount: 2000, type: "sponsorship", date: d(20, m - 1) },
  { id: "i4", source: "Bake Sale Fundraiser", amount: 340, type: "fundraising", date: d(5) },
  { id: "i5", source: "LocalBiz Sponsorship - Bronze", amount: 1500, type: "sponsorship", date: d(8) },
  { id: "i6", source: "Alumni Donation - Class of 2024", amount: 500, type: "donation", date: d(10) },
  { id: "i7", source: "Hackathon Entry Fees (50 teams)", amount: 2500, type: "fundraising", date: d(3) },
  { id: "i8", source: "Merch Sales - Stickers & Pins", amount: 185, type: "other", date: d(7) },
  { id: "i9", source: "Winter term dues carry-over", amount: 800, type: "dues", date: d(1, m - 2) },
]

interface FinanceContextType {
  budget: Budget
  expenses: Expense[]
  reimbursements: Reimbursement[]
  income: Income[]
  addExpense: (expense: Expense) => void
  updateExpenseStatus: (id: string, status: ExpenseStatus, approvedBy?: string) => void
  deleteExpense: (id: string) => void
  addReimbursement: (reimbursement: Reimbursement) => void
  updateReimbursementStatus: (id: string, status: ReimbursementStatus, approvedBy?: string) => void
  addIncome: (income: Income) => void
  deleteIncome: (id: string) => void
  totalSpent: number
  totalIncome: number
  totalPending: number
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [budget] = useState<Budget>(SEED_BUDGET)
  const [expenses, setExpenses] = useState<Expense[]>(SEED_EXPENSES)
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(SEED_REIMBURSEMENTS)
  const [income, setIncome] = useState<Income[]>(SEED_INCOME)

  const totalSpent = useMemo(
    () => expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const totalIncome = useMemo(
    () => income.reduce((sum, i) => sum + i.amount, 0),
    [income]
  )

  const totalPending = useMemo(
    () => expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => [expense, ...prev])
  }, [])

  const updateExpenseStatus = useCallback((id: string, status: ExpenseStatus, approvedBy?: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status, approvedBy: approvedBy || e.approvedBy } : e))
    )
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addReimbursement = useCallback((reimbursement: Reimbursement) => {
    setReimbursements((prev) => [reimbursement, ...prev])
  }, [])

  const updateReimbursementStatus = useCallback(
    (id: string, status: ReimbursementStatus, approvedBy?: string) => {
      setReimbursements((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                approvedBy: approvedBy || r.approvedBy,
                paidDate: status === "paid" ? new Date() : r.paidDate,
              }
            : r
        )
      )
    },
    []
  )

  const addIncome = useCallback((inc: Income) => {
    setIncome((prev) => [inc, ...prev])
  }, [])

  const deleteIncome = useCallback((id: string) => {
    setIncome((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return (
    <FinanceContext.Provider
      value={{
        budget,
        expenses,
        reimbursements,
        income,
        addExpense,
        updateExpenseStatus,
        deleteExpense,
        addReimbursement,
        updateReimbursementStatus,
        addIncome,
        deleteIncome,
        totalSpent,
        totalIncome,
        totalPending,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
