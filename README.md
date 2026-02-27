# ClubRM - Club Relationship Manager

A modern CRM platform built specifically for student clubs and associations. Built with React 18, TypeScript, Vite, and TailwindCSS v4.

> **Iteration:** ITR1 | **Term:** Fall 2026 | **Group:** 13

---

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Roles & Permissions](#roles--permissions)
- [Feature Documentation](#feature-documentation)
  - [Dashboard](#dashboard)
  - [Events Module](#events-module)
  - [Tasks Module](#tasks-module)
  - [Finance Module](#finance-module)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Development Guide](#development-guide)
- [Team](#team)

---

## Project Overview

ClubRM is a student organization CRM designed to help university clubs manage their operations — events, tasks, finances, members, and communications — all in one place. Inspired by tools like Notion, Salesforce, and Monday.com, but purpose-built for student associations.

### Key Goals
- **Simplicity first** — Clean, Notion-inspired UI that's easy to pick up
- **Role-based access** — 8 predefined roles with permission-gated features
- **All-in-one** — Events, tasks, finances, and member management in a single app
- **Student-focused** — Built for clubs, not enterprises

### What Was Delivered in ITR1
- Role-switchable dashboard with 8 layout variants
- Full calendar/events module with Month, Week, and Day views
- Task management with 5 views (Board, List, Timeline, Calendar, Workflow)
- Finance module with budget tracking, expenses, reimbursements, income, and analytics
- Sidebar navigation with role-based filtering
- 33 passing unit tests

---

## Getting Started

### Prerequisites

- **Node.js** v18+ — https://nodejs.org/
- **npm** v9+ (bundled with Node.js)

### Install & Run

```bash
# 1. Navigate to the project folder
cd ITR1

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all unit tests (vitest) |
| `npm run lint` | Run ESLint |

---

## Architecture

### High-Level Overview

```
┌───────────────────────────────────────────────────┐
│                  FRONTEND (React)                  │
│                                                    │
│  Pages/Views ──► Components ──► Hooks ──► Context  │
│                                    │               │
│                           API Service Layer        │
│                           (axios / fetch)          │
└─────────────────────────┬─────────────────────────┘
                          │  HTTP/HTTPS + JSON + JWT
┌─────────────────────────▼─────────────────────────┐
│               BACKEND (Node.js/Express)            │
│                                                    │
│  Routes ──► Middleware ──► Controllers ──► Services │
│               (Auth, Permissions, Validation)      │
│                          │                         │
│                     Repositories                   │
└─────────────────────────┬─────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL │
                    └───────────┘
```

### Frontend Architecture (ITR1 — Current)

The frontend uses **React Context** for state management, with each major feature module having its own context provider:

```
main.tsx
  └─► RoleProvider          (user role state)
      └─► EventsProvider    (calendar events CRUD)
          └─► TasksProvider  (task board CRUD)
              └─► FinanceProvider (finance CRUD)
                  └─► App.tsx (routing)
```

**Routing** is handled by React Router DOM v7. Each route maps to a page component:

| Route | Component | Context Used |
|---|---|---|
| `/` | `DashboardPage` | `RoleContext` |
| `/events` | `EventsPage` | `EventsContext` |
| `/tasks` | `TasksPage` | `TasksContext` |
| `/finance` | `FinancePage` | `FinanceContext` |

### Data Flow Pattern

1. **Context providers** hold global state and expose CRUD functions
2. **Page components** consume context via `useEvents()`, `useTasks()`, `useFinance()`
3. **Sub-components** receive data as props or access context directly
4. **Modals/forms** call context mutation functions (add, update, delete)
5. State updates trigger re-renders through React's standard reconciliation

### Planned Backend (ITR2+)

- **REST API** at `/api/v1` with JWT authentication
- **PostgreSQL** database (15+ tables — see `docs/04_DATABASE_SCHEMA.txt`)
- **Permission middleware** enforcing role-based access on every endpoint
- **WebSocket** support for real-time updates

---

## Roles & Permissions

ClubRM supports **8 predefined roles**, each with a tailored dashboard and permission set:

| # | Role | Focus | Dashboard View |
|---|---|---|---|
| 1 | **President** | Organization oversight, approvals | Organization Health |
| 2 | **VP Internal** | Task management, team coordination | Execution Control |
| 3 | **VP Finance** | Budget management, expense tracking | Financial Risk & Flow |
| 4 | **VP Events** | Event planning, logistics, volunteers | Delivery & Readiness |
| 5 | **VP External** | Sponsor relations, partnerships | Pipeline View |
| 6 | **Marketing** | Content creation, social media | Engagement View |
| 7 | **General Executive** | Personal tasks, event support | Personal Action |
| 8 | **Administrator** | System management, role config | System Oversight |

### Permission-Gated Navigation

| Sidebar Item | Accessible By |
|---|---|
| Dashboard | All roles |
| Tasks | All roles |
| Events | All roles |
| Members | All roles |
| Finance | President, VP Finance, Administrator |
| External | President, VP External, Administrator |
| Marketing | President, Marketing, Administrator |
| Reports | All VPs, President, Administrator |
| Settings | Administrator only |

### Role Switching

Users can switch between roles via the **TopBar role selector** to preview different dashboard layouts. In production, roles will be assigned per organization membership.

---

## Feature Documentation

### Dashboard

**Route:** `/`

The dashboard displays role-specific widgets based on the selected role. Each of the 8 roles has a unique layout with relevant stats, charts, and action items.

**Key widgets include:**
- Stat cards (members, events, tasks, budget)
- Activity feed
- Upcoming events
- Task summary
- Quick actions

---

### Events Module

**Route:** `/events`

A full calendar application for managing club events.

#### Views
| View | Description |
|---|---|
| **Month** | Traditional monthly grid with event dots and compact cards |
| **Week** | 7-day horizontal grid with hourly time slots and positioned event blocks |
| **Day** | Single-day detailed view with hourly slots and a schedule sidebar |

#### Features
- **Create events** — Click any time slot or the "+ New Event" button
- **Edit events** — Click an event card to view details, then edit
- **Event fields** — Title, description, date/time, location, color, tags, collaborators, capacity, visibility, status
- **Color coding** — 7 event colors for visual categorization
- **Tags** — Predefined tags (Meeting, Workshop, Social, etc.)
- **Collaborators** — Assign members from a searchable list

#### Components
| Component | File | Purpose |
|---|---|---|
| `EventsPage` | `events/events-page.tsx` | Main orchestrator with navigation and modal state |
| `CalendarHeader` | `events/calendar-header.tsx` | Date navigation and view switching |
| `MonthView` | `events/month-view.tsx` | Monthly calendar grid |
| `WeekView` | `events/week-view.tsx` | Weekly time-grid view |
| `DayView` | `events/day-view.tsx` | Single-day detailed view |
| `EventModal` | `events/event-modal.tsx` | Create/edit event dialog |
| `EventDetailPanel` | `events/event-detail-panel.tsx` | Read-only event detail dialog |
| `EventCard` | `events/event-card.tsx` | Compact/full event display |

---

### Tasks Module

**Route:** `/tasks`

An Asana/Monday-style task management system with 5 views.

#### Views
| View | Description |
|---|---|
| **Board** | Kanban drag-and-drop columns (Backlog → To Do → In Progress → Review → Done) |
| **List** | Sortable, groupable table of all tasks |
| **Timeline** | Gantt chart showing tasks across a monthly timeline with dependency lines |
| **Calendar** | Monthly grid showing tasks by their due/start dates |
| **Workflow** | Visual node-based workflow diagram |

#### Features
- **Drag & drop** — Move tasks between columns on the Board view (@dnd-kit)
- **Task CRUD** — Create, edit, delete tasks with full detail modal
- **Task fields** — Title, description, status, priority, assignees, tags, section, start/due dates, dependencies
- **Filtering** — Filter by status, priority, assignee, tag, section
- **Priority levels** — Critical, High, Medium, Low (color-coded)
- **Sections** — Group tasks by project area (Marketing, Events, Finance, etc.)

#### Components
| Component | File | Purpose |
|---|---|---|
| `TasksPage` | `tasks/tasks-page.tsx` | Main orchestrator with view switching and filters |
| `BoardView` | `tasks/board-view.tsx` | Kanban board with drag-and-drop |
| `ListView` | `tasks/list-view.tsx` | Sortable table view |
| `TimelineView` | `tasks/timeline-view.tsx` | Gantt chart view |
| `CalendarView` | `tasks/calendar-view.tsx` | Monthly task calendar |
| `WorkflowView` | `tasks/workflow-view.tsx` | Visual workflow nodes |
| `TaskCard` | `tasks/task-card.tsx` | Task card for board/list |
| `TaskModal` | `tasks/task-modal.tsx` | Create/edit task dialog |

---

### Finance Module

**Route:** `/finance`

A comprehensive finance management system with 5 tabs.

#### Tabs
| Tab | Description |
|---|---|
| **Budget Overview** | High-level financial health with charts and stats |
| **Expenses** | Full expense tracking with CRUD, filters, and approval flow |
| **Reimbursements** | Member reimbursement requests with approval workflow |
| **Income** | Track dues, sponsorships, fundraising, and donations |
| **Analytics** | Financial trends, forecasting, and breakdowns |

#### Budget Overview
- **Stat cards** — Total budget, total spent, remaining, pending
- **Budget utilization bar** — Visual progress with color thresholds (green/amber/red)
- **Spending by category pie chart** — Events, Marketing, Food, Equipment, Travel, Other
- **Budget vs Actual bar chart** — Allocated vs spent per category
- **Category budget breakdown** — Per-category progress bars with amounts
- **Recent expenses table** — Last 5 expenses with status badges

#### Expenses Tab
- **Searchable table** — Filter by description, submitter
- **Status filters** — All, Pending, Approved, Denied
- **Category filters** — Events, Marketing, Food, Equipment, Travel, Other
- **Actions** — Approve, Deny, Delete expenses
- **Add Expense modal** — Description, amount, category, submitter, date

#### Reimbursements Tab
- **Grouped by status** — Pending, Approved, Denied, Paid sections
- **Status filters** — Toggle visibility of each status group
- **Actions** — Approve, Deny, Mark as Paid
- **Submit Reimbursement modal** — Member name, amount, description, category, receipt date

#### Income Tab
- **Summary cards** — Total income, recurring count, recent additions
- **Income type filters** — Dues, Sponsorship, Fundraising, Donation, Other
- **Pie chart** — Income distribution by type
- **Income table** — All records with type badges, recurring indicators, notes
- **Add Income modal** — Source, amount, type, date, recurring flag, notes

#### Analytics Tab
- **Insight cards** — Net cash flow, burn rate/month, budget remaining %, savings rate
- **Monthly Income vs Expenses bar chart** — 6-month trend comparison
- **Cumulative Spending vs Budget area chart** — Running total against budget line
- **Category Spending Trends** — Month-over-month by category with color coding
- **Income Sources Breakdown** — By type with percentages
- **Financial Insights** — Auto-generated alerts (overspending, savings, trending categories)

#### Expense Categories & Budgets
| Category | Budget Allocation | Color |
|---|---|---|
| Events | $5,000 | Blue |
| Marketing | $3,000 | Pink |
| Food & Beverages | $4,000 | Amber |
| Equipment | $2,500 | Purple |
| Travel | $2,000 | Green |
| Other | $1,500 | Slate |
| **Total** | **$18,000** | |

#### Components
| Component | File | Purpose |
|---|---|---|
| `FinancePage` | `finance/finance-page.tsx` | Tab wrapper with sub-navigation |
| `BudgetOverview` | `finance/budget-overview.tsx` | Stats, charts, category breakdowns |
| `ExpensesTab` | `finance/expenses-tab.tsx` | Expense table, filters, add modal |
| `ReimbursementsTab` | `finance/reimbursements-tab.tsx` | Reimbursement groups, approval flow |
| `IncomeTab` | `finance/income-tab.tsx` | Income list, pie chart, add modal |
| `AnalyticsTab` | `finance/analytics-tab.tsx` | Trends, forecasting, insights |

---

## Project Structure

```
ITR1/
├── src/
│   ├── components/
│   │   ├── dashboard/      # Dashboard variants (President, VP, etc.)
│   │   ├── events/         # Calendar/Events module
│   │   │   ├── types.ts           # Event types, colors, tags, mock data
│   │   │   ├── events-page.tsx    # Main page orchestrator
│   │   │   ├── calendar-header.tsx
│   │   │   ├── month-view.tsx
│   │   │   ├── week-view.tsx
│   │   │   ├── day-view.tsx
│   │   │   ├── event-modal.tsx
│   │   │   ├── event-detail-panel.tsx
│   │   │   └── event-card.tsx
│   │   ├── finance/        # Finance module
│   │   │   ├── types.ts           # Finance types, categories, utilities
│   │   │   ├── finance-page.tsx   # Tab wrapper
│   │   │   ├── budget-overview.tsx
│   │   │   ├── expenses-tab.tsx
│   │   │   ├── reimbursements-tab.tsx
│   │   │   ├── income-tab.tsx
│   │   │   └── analytics-tab.tsx
│   │   ├── layout/         # Sidebar + TopBar
│   │   ├── tasks/          # Task board module
│   │   │   ├── types.ts           # Task types, columns, priorities
│   │   │   ├── tasks-page.tsx     # Main page with view switching
│   │   │   ├── board-view.tsx     # Kanban drag-and-drop
│   │   │   ├── list-view.tsx
│   │   │   ├── timeline-view.tsx  # Gantt chart
│   │   │   ├── calendar-view.tsx
│   │   │   ├── workflow-view.tsx
│   │   │   ├── task-card.tsx
│   │   │   └── task-modal.tsx
│   │   └── ui/             # Reusable UI primitives
│   │       ├── button.tsx, dialog.tsx, select.tsx, tabs.tsx
│   │       ├── popover.tsx, checkbox.tsx, scroll-area.tsx
│   │       └── label.tsx, input.tsx, separator.tsx, ...
│   ├── context/
│   │   ├── role-context.tsx       # User role state + switching
│   │   ├── events-context.tsx     # Events CRUD + seed data
│   │   ├── tasks-context.tsx      # Tasks CRUD + drag-and-drop
│   │   └── finance-context.tsx    # Finance CRUD + calculated totals
│   ├── hooks/
│   │   └── use-mobile.tsx         # Responsive breakpoint hook
│   ├── lib/
│   │   └── utils.ts               # cn() utility for classnames
│   ├── App.tsx                    # Root with routing
│   ├── main.tsx                   # Entry with context providers
│   └── index.css                  # TailwindCSS v4 global styles
├── test/
│   ├── components/
│   │   └── finance/
│   │       └── types.test.ts      # Finance utilities tests (11 tests)
│   └── context/
│       ├── events-context.test.tsx  # Events context tests (5 tests)
│       ├── finance-context.test.tsx # Finance context tests (12 tests)
│       └── tasks-context.test.tsx   # Tasks context tests (5 tests)
├── public/                        # Static assets
├── docs/                          # Design documentation (at repo root)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── log.md                         # Project log
```

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React + TypeScript | 18.3.1 |
| Build Tool | Vite | 7.x |
| Styling | TailwindCSS | v4.1 |
| UI Primitives | Radix UI | Various |
| Charts | Recharts | 3.x |
| Drag & Drop | @dnd-kit | 6.x |
| Date Handling | date-fns | 4.x |
| Routing | React Router DOM | 7.x |
| Form Handling | React Hook Form + Zod | 7.x / 4.x |
| Icons | Lucide React | 0.563 |
| Testing | Vitest + Testing Library | 3.x |

---

## Testing

### Test Suite Summary

| Test File | Tests | Coverage Area |
|---|---|---|
| `test/components/finance/types.test.ts` | 11 | Finance categories, formatCurrency, status configs |
| `test/context/finance-context.test.tsx` | 12 | Budget data, CRUD expenses/reimbursements/income, totals |
| `test/context/tasks-context.test.tsx` | 5 | Task CRUD, move between statuses |
| `test/context/events-context.test.tsx` | 5 | Event CRUD, date filtering |
| **Total** | **33** | |

### Running Tests

```bash
npm test          # Run all tests once
```

---

## Development Guide

### Adding a New Page

1. Create a new folder under `src/components/your-feature/`
2. Add types in `types.ts` with interfaces, enums, and mock data
3. Create a context in `src/context/your-feature-context.tsx` with CRUD functions
4. Build your page component and sub-components
5. Add a route in `src/App.tsx`
6. Wrap with provider in `src/main.tsx`
7. Add sidebar nav item in `src/components/layout/sidebar.tsx`

### UI Component Patterns

- **Dialogs/Modals** — Use `Dialog` from `@/components/ui/dialog` (Radix-based)
- **Selects/Dropdowns** — Use `Select` from `@/components/ui/select`
- **Tabs** — Use `Tabs` from `@/components/ui/tabs`
- **Buttons** — Use `Button` from `@/components/ui/button` with variants
- **Styling** — TailwindCSS utility classes; use `cn()` from `@/lib/utils` for conditional classes

### State Management

All state is managed via **React Context**. Each feature module follows this pattern:

```typescript
// 1. Define the context type
interface MyContextType {
  items: Item[]
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  deleteItem: (id: string) => void
}

// 2. Create the context + provider
const MyContext = createContext<MyContextType | undefined>(undefined)

// 3. Export a custom hook
export function useMyFeature() {
  const ctx = useContext(MyContext)
  if (!ctx) throw new Error("useMyFeature must be used within MyProvider")
  return ctx
}
```

---

## Team

| Member | Role | Contribution (ITR1) |
|---|---|---|
| **Naeem Baig** | Events, Finance, Tasks | Events Page (3 calendar views), Finance Page (5 tabs with charts/analytics), Tasks Board (5 views with drag-and-drop), UI primitives, test suite |
| **Yusuf Garba** | Task Page | Task page setup, professional contact management |
| **Taziz Ahsan** | Dashboard | Role-based dashboard layouts and widgets |
| **Daniel Kyere** | Login Screen | Authentication UI and access control |
| **Ashdeep Singh** | Members Page | Member management interface |
| **Shivam Patel** | Database & Scraper | Database schema work and web scraper |
