import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import {
  type Expense,
  type Reimbursement,
  type Income,
  type Budget,
  type ExpenseStatus,
  type ReimbursementStatus,
} from "@/components/finance/types"
import { supabase } from "@/lib/supabase"

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

// ---- Row mappers ----
function toExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    description: row.description as string,
    amount: Number(row.amount),
    category: row.category as string,
    date: new Date(row.date as string),
    status: row.status as ExpenseStatus,
    submittedBy: row.submitted_by as string,
    approvedBy: (row.approved_by as string) || undefined,
    receiptUrl: (row.receipt_url as string) || undefined,
    notes: (row.notes as string) || undefined,
  }
}
function expenseToRow(e: Expense) {
  return {
    description: e.description,
    amount: e.amount,
    category: e.category,
    date: new Date(e.date).toISOString().split("T")[0],
    status: e.status,
    submitted_by: e.submittedBy,
    approved_by: e.approvedBy || null,
    receipt_url: e.receiptUrl || null,
    notes: e.notes || null,
  }
}

function toReimbursement(row: Record<string, unknown>): Reimbursement {
  return {
    id: row.id as string,
    submittedBy: row.submitted_by as string,
    amount: Number(row.amount),
    description: row.description as string,
    category: row.category as string,
    date: new Date(row.date as string),
    status: row.status as ReimbursementStatus,
    receiptUrl: (row.receipt_url as string) || undefined,
    approvedBy: (row.approved_by as string) || undefined,
    paidDate: row.paid_date ? new Date(row.paid_date as string) : undefined,
    notes: (row.notes as string) || undefined,
  }
}
function reimbursementToRow(r: Reimbursement) {
  return {
    submitted_by: r.submittedBy,
    amount: r.amount,
    description: r.description,
    category: r.category,
    date: new Date(r.date).toISOString().split("T")[0],
    status: r.status,
    receipt_url: r.receiptUrl || null,
    approved_by: r.approvedBy || null,
    paid_date: r.paidDate ? new Date(r.paidDate).toISOString().split("T")[0] : null,
    notes: r.notes || null,
  }
}

function toIncome(row: Record<string, unknown>): Income {
  return {
    id: row.id as string,
    source: row.source as string,
    amount: Number(row.amount),
    type: row.type as Income["type"],
    date: new Date(row.date as string),
    notes: (row.notes as string) || undefined,
    recurring: row.recurring as boolean | undefined,
  }
}
function incomeToRow(i: Income) {
  return {
    source: i.source,
    amount: i.amount,
    type: i.type,
    date: new Date(i.date).toISOString().split("T")[0],
    notes: i.notes || null,
    recurring: i.recurring || false,
  }
}

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
  const [budget, setBudget] = useState<Budget>(SEED_BUDGET)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [income, setIncome] = useState<Income[]>([])

  // Load all finance data on mount
  useEffect(() => {
    async function load() {
      // Budget
      const { data: budgetData } = await supabase.from("budgets").select("*").limit(1).single()
      if (budgetData) {
        setBudget({ totalBudget: Number(budgetData.total_budget), termLabel: budgetData.term_label as string })
      }

      // Expenses
      const { data: expData, error: expErr } = await supabase.from("expenses").select("*").order("date", { ascending: false })
      if (expErr) {
        console.error("Failed to load expenses:", expErr)
        setExpenses(SEED_EXPENSES)
      } else if (expData && expData.length > 0) {
        setExpenses(expData.map(toExpense))
      } else {
        const rows = SEED_EXPENSES.map(expenseToRow)
        const { data: seeded } = await supabase.from("expenses").insert(rows).select()
        setExpenses(seeded ? seeded.map(toExpense) : SEED_EXPENSES)
      }

      // Reimbursements
      const { data: reimData, error: reimErr } = await supabase.from("reimbursements").select("*").order("date", { ascending: false })
      if (reimErr) {
        console.error("Failed to load reimbursements:", reimErr)
        setReimbursements(SEED_REIMBURSEMENTS)
      } else if (reimData && reimData.length > 0) {
        setReimbursements(reimData.map(toReimbursement))
      } else {
        const rows = SEED_REIMBURSEMENTS.map(reimbursementToRow)
        const { data: seeded } = await supabase.from("reimbursements").insert(rows).select()
        setReimbursements(seeded ? seeded.map(toReimbursement) : SEED_REIMBURSEMENTS)
      }

      // Income
      const { data: incData, error: incErr } = await supabase.from("income").select("*").order("date", { ascending: false })
      if (incErr) {
        console.error("Failed to load income:", incErr)
        setIncome(SEED_INCOME)
      } else if (incData && incData.length > 0) {
        setIncome(incData.map(toIncome))
      } else {
        const rows = SEED_INCOME.map(incomeToRow)
        const { data: seeded } = await supabase.from("income").insert(rows).select()
        setIncome(seeded ? seeded.map(toIncome) : SEED_INCOME)
      }
    }
    load()
  }, [])

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

  const addExpense = useCallback(async (expense: Expense) => {
    const row = expenseToRow(expense)
    const { data, error } = await supabase.from("expenses").insert(row).select().single()
    if (error) { console.error("Failed to add expense:", error); return }
    if (data) setExpenses((prev) => [toExpense(data), ...prev])
  }, [])

  const updateExpenseStatus = useCallback(async (id: string, status: ExpenseStatus, approvedBy?: string) => {
    const update: Record<string, unknown> = { status }
    if (approvedBy) update.approved_by = approvedBy
    const { error } = await supabase.from("expenses").update(update).eq("id", id)
    if (error) { console.error("Failed to update expense:", error); return }
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status, approvedBy: approvedBy || e.approvedBy } : e))
    )
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id)
    if (error) { console.error("Failed to delete expense:", error); return }
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addReimbursement = useCallback(async (reimbursement: Reimbursement) => {
    const row = reimbursementToRow(reimbursement)
    const { data, error } = await supabase.from("reimbursements").insert(row).select().single()
    if (error) { console.error("Failed to add reimbursement:", error); return }
    if (data) setReimbursements((prev) => [toReimbursement(data), ...prev])
  }, [])

  const updateReimbursementStatus = useCallback(
    async (id: string, status: ReimbursementStatus, approvedBy?: string) => {
      const update: Record<string, unknown> = { status }
      if (approvedBy) update.approved_by = approvedBy
      if (status === "paid") update.paid_date = new Date().toISOString().split("T")[0]
      const { error } = await supabase.from("reimbursements").update(update).eq("id", id)
      if (error) { console.error("Failed to update reimbursement:", error); return }
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

  const addIncome = useCallback(async (inc: Income) => {
    const row = incomeToRow(inc)
    const { data, error } = await supabase.from("income").insert(row).select().single()
    if (error) { console.error("Failed to add income:", error); return }
    if (data) setIncome((prev) => [toIncome(data), ...prev])
  }, [])

  const deleteIncome = useCallback(async (id: string) => {
    const { error } = await supabase.from("income").delete().eq("id", id)
    if (error) { console.error("Failed to delete income:", error); return }
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
