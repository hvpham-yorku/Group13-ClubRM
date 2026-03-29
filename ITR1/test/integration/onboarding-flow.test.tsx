import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import App from "../../src/App"

const authState = vi.hoisted(() => ({
  user: null as any,
  profile: null as any,
  loading: false,
  profileLoading: false,
}))

vi.mock("../../src/context/auth-context", () => ({
  useAuth: () => authState,
}))

vi.mock("../../src/components/auth/auth-page", () => ({
  AuthPage: () => <div>Mock Auth Page</div>,
}))

vi.mock("../../src/components/auth/onboarding-page", () => ({
  OnboardingPage: () => <div>Mock Onboarding Page</div>,
}))

vi.mock("../../src/components/layout/sidebar", () => ({
  AppSidebar: () => <aside>Mock Sidebar</aside>,
}))

vi.mock("../../src/components/layout/topbar", () => ({
  TopBar: () => <header>Mock TopBar</header>,
}))

vi.mock("../../src/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("../../src/context/events-context.tsx", () => ({
  EventsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("../../src/context/tasks-context.tsx", () => ({
  TasksProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("../../src/context/finance-context.tsx", () => ({
  FinanceProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("../../src/context/members-context.tsx", () => ({
  MembersProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/dashboard/dashboard-page", () => ({
  DashboardPage: () => <div>Mock Dashboard</div>,
}))

vi.mock("@/components/events/events-page", () => ({
  EventsPage: () => <div>Mock Events</div>,
}))

vi.mock("@/components/tasks/tasks-page", () => ({
  TasksPage: () => <div>Mock Tasks</div>,
}))

vi.mock("@/components/members/members-page", () => ({
  MembersPage: () => <div>Mock Members</div>,
}))

vi.mock("@/components/finance/finance-page", () => ({
  FinancePage: () => <div>Mock Finance</div>,
}))

vi.mock("@/components/external/external-page", () => ({
  ExternalPage: () => <div>Mock External</div>,
}))

vi.mock("@/components/contacts/contacts-page", () => ({
  ContactsPage: () => <div>Mock Contacts</div>,
}))

vi.mock("@/components/marketing/marketing-page", () => ({
  MarketingPage: () => <div>Mock Marketing</div>,
}))

vi.mock("@/components/documents/documents-page", () => ({
  DocumentsPage: () => <div>Mock Documents</div>,
}))

vi.mock("@/components/reports/reports-page", () => ({
  ReportsPage: () => <div>Mock Reports</div>,
}))

vi.mock("@/components/settings/settings-page", () => ({
  SettingsPage: () => <div>Mock Settings</div>,
}))

vi.mock("../../src/Testing/TestDatabase", () => ({
  default: () => <div>Mock Test Database</div>,
}))

describe("Onboarding flow integration", () => {
  beforeEach(() => {
    authState.user = null
    authState.profile = null
    authState.loading = false
    authState.profileLoading = false
  })

  it("shows the auth page when the user is signed out", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText("Mock Auth Page")).toBeInTheDocument()
  })

  it("shows the onboarding page for signed-in users with incomplete onboarding", async () => {
    authState.user = { id: "user-1", email: "test@yorku.ca" }
    authState.profile = {
      onboarding_completed: false,
    }

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText("Mock Onboarding Page")).toBeInTheDocument()
  })

  it("shows the main app once onboarding is complete", async () => {
    authState.user = { id: "user-1", email: "test@yorku.ca" }
    authState.profile = {
      onboarding_completed: true,
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByText("Mock Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Mock Sidebar")).toBeInTheDocument()
    expect(screen.getByText("Mock TopBar")).toBeInTheDocument()
  })
})
