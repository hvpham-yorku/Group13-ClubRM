# ClubRM - Club Relationship Manager

A modern CRM platform built specifically for student clubs and associations. Built with React 18, TypeScript, Vite, and TailwindCSS v4.

> **Iteration:** ITR3 | **Term:** Winter 2026 | **Group:** 13

---

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Architectural Sketch](#architectural-sketch)
- [Roles & Permissions](#roles--permissions)
- [Feature Documentation](#feature-documentation)
  - [Dashboard](#dashboard)
  - [Global Search](#global-search)
  - [Notification System](#notification-system)
  - [Events Module](#events-module)
  - [Tasks Module](#tasks-module)
  - [Finance Module](#finance-module)
  - [Members Module](#members-module)
  - [External / Sponsors Module](#external--sponsors-module)
  - [Contacts Module](#contacts-module)
  - [Marketing Module](#marketing-module)
  - [Documents Module](#documents-module)
  - [Reports & Analytics Module](#reports--analytics-module)
  - [Settings Module](#settings-module)
  - [Profile Module](#profile-module)
  - [Onboarding Flow](#onboarding-flow)
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

### What Was Delivered in ITR3
- **Supabase integration** — Full database backend with authentication, profiles, and CRUD for all modules
- **8 context providers** with real-time data (Auth, Role, Members, Sponsors, Events, Tasks, Finance, Theme)
- **Global search (Cmd+K / Ctrl+K)** — Instant search across all 8 data types (Events, Tasks, Members, Sponsors, Documents, Finance, etc.) with recent search history
- **Notification system** — Role-based alerts for pending approvals, upcoming events, assigned tasks, and new members
- **Onboarding flow** — Step-by-step wizard for first-time users with role selection and profile setup
- **Member directory** — Full roster with CRUD, role/status filtering, and profile cards
- **Sponsor/External CRM** — Pipeline tracking with tiers (Platinum, Gold, etc.), statuses (Prospect, Pending, Active, Churned), and interaction history
- **Marketing hub** — Campaign management with analytics charts, live feed simulation, and social media profile integration
- **Documents management** — File storage with Supabase Storage buckets, category filtering, and version tracking
- **Reports & Analytics** — Multi-chart dashboard combining member, operations, finance, and event data with CSV export
- **Settings page** — Organization configuration, notification preferences, and theme customization
- **Profile page** — Personal info management with social media account linking (Instagram, Facebook, LinkedIn, X/Twitter, TikTok)
- **Theme system** — Dark/light mode with accent color selection
- **Google Calendar sync** — Export events to personal Google Calendar
- **AI-powered executive brief** — Gemini 2.0 Flash generates role-specific dashboard summaries
- **Drag-and-drop dashboard customization** — Rearrange and toggle widget visibility per role
- **74 passing tests** — 20 test files spanning unit, integration, component, context, and domain tests

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

# 3. Set up environment variables (REQUIRED)
#    Create a .env file with your Supabase credentials:
#    VITE_SUPABASE_URL=<your-supabase-project-url>
#    VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# 4. Start the development server
npm run dev
```

> **Important:** The `.env` file is **not** checked into Git. Every team member must create their own with valid Supabase credentials. Without it, the app will show a **"Failed to fetch"** error on login because the Supabase connection credentials are missing.

The app will be available at **http://localhost:5173**

### Supabase Database Setup

If this is a fresh environment or new tables are missing, run the migration scripts in the **Supabase SQL Editor** (https://supabase.com/dashboard):

1. Open your Supabase project dashboard → **SQL Editor**
2. Run `supabase/migration.sql` — creates the core tables (profiles, members, events, tasks, expenses, reimbursements, income, budgets, sponsors, campaigns)
3. Run `supabase/migration-add-tables.sql` — creates additional tables (documents, notifications, org_settings)
4. Run `supabase/migration-rls-jwt.sql` — configures Row-Level Security policies and JWT authentication
5. Run `supabase/migration-onboarding-flag.sql` — adds onboarding_completed column to profiles

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
│              CLIENT INTERFACE (React)              │
│                                                    │
│  Pages ──► Feature Components ──► Shared UI        │
│  (Dashboard, Tasks, Events,    (Task Board,        │
│   Members, Finance, ...)        Event Cards,       │
│                                  Charts, Modals)   │
└─────────────────────────┬─────────────────────────┘
                          │  React Context + Hooks
┌─────────────────────────▼─────────────────────────┐
│             APPLICATION LOGIC                      │
│                                                    │
│  Feature Services          Access Control          │
│  (Task Mgmt, Event         (Role-based access,     │
│   Handling, Budget &        Task permissions,       │
│   Finance, Chart/Data       User-level authz)       │
│   Visualization)                                   │
└─────────────────────────┬─────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────┐
│               DOMAIN MODEL                         │
│                                                    │
│  User/Profile ──manages──► Task                    │
│       │                     │ assigned to           │
│    contains              contains                   │
│       ▼                     ▼                       │
│     Event ◄──participates── Member                  │
│                              │ linked to            │
│                              ▼                      │
│                          Transaction                │
└─────────────────────────┬─────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────┐
│                DATA LAYER                          │
│                                                    │
│  Supabase Client (API Layer)                       │
│       ▼                                            │
│  Supabase Backend (Auth + Logic)                   │
│       ▼                                            │
│  PostgreSQL Database                               │
│  (profiles, tasks, events, members, transactions)  │
└───────────────────────────────────────────────────┘
```

### Frontend Architecture (ITR3 — Current)

The frontend uses **React Context** for state management, with each major feature module having its own context provider:

```
main.tsx
  └─► ThemeProvider          (dark/light mode)
      └─► AuthProvider       (Supabase auth, user profiles)
          └─► RoleProvider   (user role state + switching)
              └─► MembersProvider    (member roster CRUD)
                  └─► SponsorsProvider   (sponsor tracking CRUD)
                      └─► EventsProvider     (calendar events CRUD)
                          └─► TasksProvider      (task board CRUD)
                              └─► FinanceProvider    (finance CRUD)
                                  └─► App.tsx (routing)
```

**Routing** is handled by React Router DOM v6. Each route maps to a page component (lazy-loaded with Suspense):

| Route | Component | Context Used |
|---|---|---|
| `/` | `PresidentDashboard` | `RoleContext`, all contexts |
| `/dashboard` | `DashboardPage` | `RoleContext`, all contexts |
| `/events` | `EventsPage` | `EventsContext` |
| `/tasks` | `TasksPage` | `TasksContext` |
| `/finance` | `FinancePage` | `FinanceContext` |
| `/members` | `MembersPage` | `MembersContext` |
| `/external` | `ExternalPage` | `SponsorsContext` |
| `/contacts` | `ContactsPage` | `SponsorsContext` |
| `/marketing` | `MarketingPage` | `MembersContext` |
| `/documents` | `DocumentsPage` | `AuthContext` |
| `/reports` | `ReportsPage` | All contexts |
| `/settings` | `SettingsPage` | `AuthContext`, `RoleContext` |
| `/profile` | `ProfilePage` | `AuthContext` |

### Data Flow Pattern

1. **Context providers** hold global state and expose CRUD functions
2. **Page components** consume context via `useEvents()`, `useTasks()`, `useFinance()`, `useMembers()`, `useSponsors()`
3. **Sub-components** receive data as props or access context directly
4. **Modals/forms** call context mutation functions (add, update, delete)
5. State updates trigger re-renders through React's standard reconciliation
6. **Supabase client** (`lib/supabase.ts`) handles all database communication
7. **Custom hooks** (`use-dashboard-insights`, `use-google-calendar`) encapsulate complex data fetching logic

### Backend

- **Supabase** serves as the backend with PostgreSQL, Auth, and Storage
- **Vite middleware** at `/api/dashboard/stats` aggregates data from multiple Supabase tables for dashboard insights
- **Row-Level Security (RLS)** policies enforce data access at the database level
- **JWT authentication** via Supabase Auth with profile management

---

## Architectural Sketch

The project follows a **layered architecture** with clearly defined seams between each layer for testability:

```
ClubRM Architectural Sketch
          │
        Layers
       ┌──┴──────────────────────────────────────────────┐
       │          │              │              │         │
  Client      Application    Domain         Data
  Interface     Logic         Model          Layer
       │          │              │              │
   ┌───┴───┐  ┌──┴──┐      Entities      Supabase Client
   │  │  │ │  │     │     ┌────┴────┐     Supabase Backend
 Pages │ Shared  Feature  Access  User/   PostgreSQL
   │  Feature UI    Services Control Profile    │
   │  Comps  Comps    │      │     Task    ┌───┴───┐
   │   │      │       │      │     Event  profiles
Dashboard TaskBoard Sidebar  Task  Role-   Member tasks
 Tasks  EventCards NavBar   Mgmt  based  Transaction events
 Events Charts  SearchBar Event  access     members
Members       Modals  Handling Task       transactions
Finance       Buttons Budget& perms
                      Finance User-level
                      Chart/  authz
                      DataViz
```

**Integration Test Seams:**
- **Context → Service Interaction** — `EventsContextIntegrationTest`
- **Supabase API Integration** — `SupabaseClientIntegrationTest`
- **Service → Domain Interaction** — `EventServiceIntegrationTest`
- **Data Persistence** — `TaskRepositoryTest`
- **Assignment Logic** — `TaskAssignmentIntegrationTest`

See the full diagram at `docs/ClubRM Architectural Sketch.png`.

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
| Documents | All roles |
| Finance | President, VP Finance, Administrator |
| External | President, VP External, Administrator |
| Contacts | President, VP External, Administrator |
| Marketing | President, Marketing, Administrator |
| Reports | President, All VPs, Marketing, Administrator |
| Settings | Administrator only |

### Role Switching

Users can switch between roles via the **TopBar role selector** to preview different dashboard layouts. In production, roles are assigned per organization membership during onboarding.

---

## Feature Documentation

### Dashboard

**Route:** `/` (home) and `/dashboard`

The dashboard displays role-specific widgets based on the selected role. Each of the 8 roles has a unique layout with relevant stats, charts, and action items.

**Key widgets include:**
- Stat cards (members, events, tasks, budget)
- Activity feed
- Upcoming events
- Task summary
- Quick actions
- Approval Queue widget (approve finance requests from the dashboard)
- Org Health & Risk Alert widget (calculates a health score based on club data)

**Dashboard Customization:**
- Drag-and-drop widget reordering using @dnd-kit
- Toggle widget visibility per role
- Layout preferences persist across sessions

**AI-Powered Executive Brief:**
- Gemini 2.0 Flash generates role-specific summaries of pending tasks and upcoming events
- Refresh button to regenerate the brief
- Fallback messages per role if the API is unavailable

**Insight Panels:**
- Org Health Panel
- Members Panel
- Budget Panel
- Events Panel
- Risks Panel
- Approvals Panel

#### Dashboard Variant Components
| Component | File | Role |
|---|---|---|
| `PresidentDashboard` | `dashboard/variants/president-dashboard.tsx` | President |
| `VPInternalDashboard` | `dashboard/variants/vp-internal-dashboard.tsx` | VP Internal |
| `VPFinanceDashboard` | `dashboard/variants/vp-finance-dashboard.tsx` | VP Finance |
| `VPEventsDashboard` | `dashboard/variants/vp-events-dashboard.tsx` | VP Events |
| `VPExternalDashboard` | `dashboard/variants/vp-external-dashboard.tsx` | VP External |
| `MarketingDashboard` | `dashboard/variants/marketing-dashboard.tsx` | Marketing |
| `ExecutiveDashboard` | `dashboard/variants/executive-dashboard.tsx` | General Executive |
| `AdminDashboard` | `dashboard/variants/admin-dashboard.tsx` | Administrator |

---

### Global Search

**Shortcut:** `Cmd+K` (Mac) / `Ctrl+K` (Windows) — accessible from anywhere in the app

A unified search bar that instantly filters across all modules at once:
- Events (title, location)
- Tasks (title, status)
- Members (name, email)
- Sponsors
- Documents
- Expenses, Reimbursements, Income

**Features:**
- Real-time filtering as you type
- Recent search history (persists between sessions, max 5 entries)
- Click a result to navigate directly to the relevant page
- Keyboard-driven UX

---

### Notification System

**Location:** Bell icon in the TopBar

Role-based alerts that surface actionable items:
- Pending expense approvals
- Pending reimbursements
- Assigned tasks
- Upcoming events (within 48 hours)
- New member joins

**Features:**
- Unread count badge
- Mark all as read
- Click to navigate to the relevant page
- Notification preferences configurable in Settings

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
- **RSVP tracking** — Shows maximum capacity and how many people have RSVP'd
- **Google Calendar sync** — Export events to personal Google Calendar via popup button

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
| `AddToGoogleCalendar` | `events/add-to-google-calendar.tsx` | Google Calendar export button |

---

### Tasks Module

**Route:** `/tasks`

An Asana/Monday-style task management system with 5 views.

#### Views
| View | Description |
|---|---|
| **Board** | Kanban drag-and-drop columns (Backlog → To Do → In Progress → Review → Done) |
| **List** | Sortable, groupable table of all tasks |
| **Timeline** | Gantt chart showing tasks across a monthly timeline with SVG dependency lines connecting parent tasks to child tasks |
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
| `TimelineView` | `tasks/timeline-view.tsx` | Gantt chart view with SVG dependency lines |
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
| **Reimbursements** | Member reimbursement requests with approval workflow (Pending → Approved → Paid) |
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

### Members Module

**Route:** `/members`

A full member directory for managing club roster.

#### Features
- **Roster grid** — All club members displayed in a table, filterable by role and status
- **Profile cards** — Show a member's total tasks completed and events attended
- **Add/edit/delete** members with full detail forms
- **Custom avatar colors** — Automatically generated based on the letters in a member's name
- **Member fields** — Name, email, role, department, year/class level, status, join date
- **Search and filter** — By name, email, role, status, department

---

### External / Sponsors Module

**Route:** `/external`

A sponsorship pipeline for managing corporate sponsors and professional relationships.

#### Features
- **Sponsor management** — Organize sponsors by tiers (Platinum, Gold, Silver, Bronze)
- **Pipeline view** — Track where sponsors are in the process (Prospect, Pending, Active, Churned)
- **Industry categorization** — Tag sponsors by industry
- **Interaction history** — Log every email, call, or meeting with each sponsor contact
- **Contact information** — Email, phone, organization details
- **Sponsorship value tracking** — Dollar amounts per sponsor

---

### Contacts Module

**Route:** `/contacts`

A contact directory view powered by the sponsors context.

#### Features
- **Contact directory** — View all professional contacts from the sponsors database
- **Interaction tracking** — Communication history per contact
- **Sponsor tier visibility** — See tier and status at a glance
- **Contact details management** — Full profile with LinkedIn integration

---

### Marketing Module

**Route:** `/marketing`

A marketing and social media hub for managing campaigns and tracking engagement.

#### Tabs
| Tab | Description |
|---|---|
| **Campaigns** | Campaign management with status tracking |
| **Analytics** | Bar chart comparing reach vs. engagement per campaign |
| **Calendar** | Campaign scheduling |
| **Live Feed** | Real-time social media post simulation with likes and shares |

#### Features
- **Campaign detail dialog** — Full budget usage progress bar, breakdown of every post within a campaign
- **Campaign statuses** — Draft, Scheduled, Active, Completed, Cancelled
- **Platform tracking** — Instagram, Facebook, LinkedIn, X/Twitter, TikTok
- **Performance metrics** — Reach, engagement, clicks per campaign

---

### Documents Module

**Route:** `/documents`

A document storage and management system backed by Supabase Storage.

#### Features
- **File upload** — Upload documents to Supabase Storage buckets
- **Category filtering** — Governance, Finance, Events, Other
- **Search** — Filter documents by name
- **Download** — Retrieve stored documents
- **Version tracking** — History side-panel showing modification log ordered by update metadata
- **Metadata** — Uploaded by, uploaded at, file type, storage path

---

### Reports & Analytics Module

**Route:** `/reports`

A comprehensive analytics dashboard combining data from across the application.

#### Features
- **Multi-tab analytics** — Member analytics, event analytics, task completion, finance trends
- **Visual charts** — Pie charts, radial dials, bar charts, area charts (via Recharts)
- **Member retention** — Retention rates and membership trends
- **Task completion rates** — Completion metrics and team performance
- **Monthly activity trends** — Club activity and spending trends over time (6-month views)
- **Download CSV** — Export all analytics data as a downloadable spreadsheet file
- **Time-period filtering** — Filter by date range
- **Trend indicators** — Up/down arrows with percentage changes

---

### Settings Module

**Route:** `/settings` (Administrator only)

Organization-wide configuration.

#### Features
- **Organization settings** — Name, slug, description, email, website
- **University information** — Institution details
- **Term/semester tracking** — Current academic term
- **Timezone configuration**
- **Notification preferences** — Email digest, task assigned, event reminder, finance alerts, member joined
- **Theme customization** — Dark/light mode, accent color selection
- **Role visibility settings**

---

### Profile Module

**Route:** `/profile`

Personal profile management.

#### Features
- **Personal info** — Name, email, bio, avatar
- **Social media account linking** — Instagram, Facebook, LinkedIn, X/Twitter, TikTok
- **Data persistence** — All profile data persisted to Supabase
- **Clickable preview links** — Open each linked social profile directly

---

### Onboarding Flow

A step-by-step wizard for first-time users before they can access the main application.

#### Steps
1. **Welcome screen** — Introduction to ClubRM
2. **Details form** — Full name and role selection

#### Features
- **Role restriction** — Users cannot choose restricted roles (President, Administrator) during onboarding
- **Access control** — Users must complete onboarding before accessing the main application
- **Profile initialization** — Creates user profile in Supabase on completion
- **Completion tracking** — `onboarding_completed` flag in profiles table

---

## Project Structure

```
ITR1/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── auth-page.tsx            # Login/signup UI
│   │   │   └── onboarding-page.tsx      # First-time user wizard
│   │   ├── dashboard/
│   │   │   ├── dashboard-page.tsx       # Role-based dashboard router
│   │   │   ├── dashboard-list.tsx
│   │   │   ├── widget.tsx
│   │   │   ├── widget-config.ts         # Widget visibility per role
│   │   │   ├── stat-card.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── customization/
│   │   │   │   ├── dashboard-controls.tsx
│   │   │   │   ├── dashboard-layout-provider.tsx
│   │   │   │   └── sortable-widget.tsx  # Drag-and-drop widgets
│   │   │   ├── variants/
│   │   │   │   ├── president-dashboard.tsx
│   │   │   │   ├── vp-internal-dashboard.tsx
│   │   │   │   ├── vp-finance-dashboard.tsx
│   │   │   │   ├── vp-events-dashboard.tsx
│   │   │   │   ├── vp-external-dashboard.tsx
│   │   │   │   ├── marketing-dashboard.tsx
│   │   │   │   ├── executive-dashboard.tsx
│   │   │   │   └── admin-dashboard.tsx
│   │   │   ├── widgets/
│   │   │   │   ├── approval-queue-widget.tsx
│   │   │   │   └── risk-alerts-widget.tsx
│   │   │   └── insights/
│   │   │       ├── expandable-tile.tsx
│   │   │       ├── mock-data.ts
│   │   │       ├── types.ts
│   │   │       └── panels/
│   │   │           ├── approvals-panel.tsx
│   │   │           ├── budget-panel.tsx
│   │   │           ├── events-panel.tsx
│   │   │           ├── members-panel.tsx
│   │   │           ├── org-health-panel.tsx
│   │   │           └── risks-panel.tsx
│   │   ├── events/
│   │   │   ├── events-page.tsx
│   │   │   ├── event-modal.tsx
│   │   │   ├── event-card.tsx
│   │   │   ├── event-detail-panel.tsx
│   │   │   ├── add-to-google-calendar.tsx
│   │   │   ├── calendar-header.tsx
│   │   │   ├── types.ts
│   │   │   ├── month-view.tsx
│   │   │   ├── week-view.tsx
│   │   │   └── day-view.tsx
│   │   ├── tasks/
│   │   │   ├── tasks-page.tsx
│   │   │   ├── TaskPage.tsx
│   │   │   ├── task-modal.tsx
│   │   │   ├── task-card.tsx
│   │   │   ├── types.ts
│   │   │   ├── board-view.tsx
│   │   │   ├── list-view.tsx
│   │   │   ├── timeline-view.tsx
│   │   │   ├── calendar-view.tsx
│   │   │   └── workflow-view.tsx
│   │   ├── finance/
│   │   │   ├── finance-page.tsx
│   │   │   ├── budget-overview.tsx
│   │   │   ├── expenses-tab.tsx
│   │   │   ├── reimbursements-tab.tsx
│   │   │   ├── income-tab.tsx
│   │   │   ├── analytics-tab.tsx
│   │   │   └── types.ts
│   │   ├── members/
│   │   │   ├── members-page.tsx
│   │   │   ├── MembersPage.tsx
│   │   │   └── types.ts
│   │   ├── contacts/
│   │   │   └── contacts-page.tsx
│   │   ├── external/
│   │   │   ├── external-page.tsx
│   │   │   └── types.ts
│   │   ├── marketing/
│   │   │   ├── marketing-page.tsx
│   │   │   └── types.ts
│   │   ├── documents/
│   │   │   └── documents-page.tsx
│   │   ├── reports/
│   │   │   └── reports-page.tsx
│   │   ├── settings/
│   │   │   └── settings-page.tsx
│   │   ├── profile/
│   │   │   └── profile-page.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx              # Role-based navigation menu
│   │   │   └── topbar.tsx               # Global search, notifications, role switcher
│   │   └── ui/                          # 19 Radix-based UI primitives
│   │       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│   │       ├── checkbox.tsx, dialog.tsx, dropdown-menu.tsx
│   │       ├── input.tsx, label.tsx, popover.tsx
│   │       ├── scroll-area.tsx, select.tsx, separator.tsx
│   │       ├── sheet.tsx, sidebar.tsx, skeleton.tsx
│   │       ├── table.tsx, tabs.tsx, tooltip.tsx
│   │       └── ...
│   ├── context/
│   │   ├── auth-context.tsx             # Supabase auth, user profiles
│   │   ├── role-context.tsx             # User role state + switching
│   │   ├── members-context.tsx          # Member roster CRUD
│   │   ├── sponsors-context.tsx         # Sponsor tracking CRUD
│   │   ├── events-context.tsx           # Calendar events CRUD + seed data
│   │   ├── tasks-context.tsx            # Task lifecycle CRUD + drag-and-drop
│   │   ├── finance-context.tsx          # Finance CRUD + calculated totals
│   │   └── theme-context.tsx            # Dark/light mode toggle
│   ├── hooks/
│   │   ├── use-dashboard-insights.ts    # Stats aggregation from /api/dashboard/stats
│   │   ├── use-google-calendar.ts       # Google Calendar integration
│   │   └── use-mobile.ts               # Responsive breakpoint hook
│   ├── lib/
│   │   ├── supabase.ts                  # Supabase client initialization
│   │   ├── database.types.ts            # Type-safe database schema
│   │   ├── dashboard-logic.ts           # Dashboard helper functions
│   │   ├── google-calendar.ts           # Google Calendar utilities
│   │   ├── onboarding-logic.ts          # Onboarding validation & completion checks
│   │   └── utils.ts                     # cn() utility for classnames
│   ├── domain/
│   │   └── Task.ts                      # Task domain model
│   ├── App.tsx                          # Root with routing (13+ routes, lazy-loaded)
│   ├── main.tsx                         # Entry with 8 context providers
│   └── index.css                        # TailwindCSS v4 global styles
├── test/
│   ├── setup.ts                         # Vitest setup with mock Supabase client
│   ├── test-utils.tsx                   # React Testing Library utilities
│   ├── dashboard.test.ts               # Dashboard logic tests (9 tests)
│   ├── documents.test.tsx              # Document management tests (2 tests)
│   ├── components/
│   │   ├── ContactsPage.test.tsx        # Contacts page tests (2 tests)
│   │   ├── PresidentDashboard.test.tsx  # President dashboard tests
│   │   └── finance/
│   │       └── types.test.ts            # Finance utilities tests (11 tests)
│   ├── context/
│   │   ├── events-context.test.tsx      # Events context tests (3 tests)
│   │   ├── finance-context.test.tsx     # Finance context tests (3 tests)
│   │   ├── persistence.test.tsx         # Persistence tests (2 tests)
│   │   └── tasks-context.test.tsx       # Tasks context tests (3 tests)
│   ├── domain/
│   │   ├── OnboardingRules.test.ts      # Onboarding validation (3 tests)
│   │   └── Task.test.ts                 # Task domain model (1 test)
│   ├── unit/
│   │   ├── dashboard-layout.test.tsx    # Dashboard layout tests (4 tests)
│   │   ├── events-navigation.test.tsx   # Events navigation tests (2 tests)
│   │   ├── logic.test.ts               # Business logic tests (9 tests)
│   │   ├── metrics.test.ts             # Metrics calculation tests (4 tests)
│   │   ├── onboarding-logic.test.ts    # Onboarding logic tests (8 tests)
│   │   └── onboarding-page.test.tsx    # Onboarding page tests
│   └── integration/
│       ├── database.test.ts             # Database integration tests (4 tests)
│       ├── documents-persistent.test.tsx # Document persistence tests (1 test)
│       └── onboarding-flow.test.tsx     # Onboarding flow tests (3 tests)
├── supabase/
│   ├── migration.sql                    # Core tables
│   ├── migration-add-tables.sql         # Additional tables
│   ├── migration-rls-jwt.sql            # Row-Level Security & JWT policies
│   └── migration-onboarding-flag.sql    # Onboarding flag
├── docs/
│   ├── 00_MASTER_INDEX.txt
│   ├── 01_NAVIGATION_AND_LAYOUT.txt
│   ├── 02_ROLES_AND_PERMISSIONS.txt
│   ├── 03_DASHBOARD_LAYOUTS.txt
│   ├── 04_DATABASE_SCHEMA.txt
│   ├── 05_API_AND_ARCHITECTURE.txt
│   ├── 06_PAGE_BREAKDOWN_AND_CHECKLIST.txt
│   └── ClubRM Architectural Sketch.png
├── public/                              # Static assets (logo, icons)
├── package.json
├── vite.config.ts                       # Vite + test config + dashboard API middleware
├── tsconfig.json
└── log.md                               # Project log
```

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React + TypeScript | 18.3.1 / 5.9.3 |
| Build Tool | Vite | 7.x |
| Styling | TailwindCSS | v4.1 |
| UI Primitives | Radix UI | Various (19 packages) |
| Charts | Recharts | 3.x |
| Drag & Drop | @dnd-kit | 6.x |
| Date Handling | date-fns | 4.x |
| Routing | React Router DOM | 6.x |
| Form Handling | React Hook Form + Zod | 7.x / 4.x |
| Icons | Lucide React | 0.454 |
| Testing | Vitest + Testing Library | 3.x |
| Database | Supabase (PostgreSQL) | 2.98.0 |
| Server State | TanStack React Query | 5.x |
| HTTP Client | Axios | 1.13.x |
| AI | Google Generative AI (Gemini) | 0.24.1 |

---

## Testing

### Test Suite Summary

| Category | Files | Tests | Coverage Area |
|---|---|---|---|
| Component Tests | 3 | 13+ | ContactsPage, PresidentDashboard, Finance types |
| Context Tests | 4 | 11 | Events, Finance, Tasks contexts, Persistence |
| Domain Tests | 2 | 4 | Onboarding rules, Task domain model |
| Unit Tests | 5 | 27 | Dashboard layout, events nav, logic, metrics, onboarding |
| Integration Tests | 3 | 8 | Database CRUD, document persistence, onboarding flow |
| Feature Tests | 1 | 2 | Documents |
| General Tests | 1 | 9 | Dashboard |
| **Total** | **20** | **74** | |

### Running Tests

```bash
npm test          # Run all tests once (vitest run)
```

### Test Configuration

- **Framework:** Vitest 3.x with global test utilities
- **DOM Environment:** happy-dom (lightweight)
- **Setup file:** `test/setup.ts` (mocks Supabase client)
- **Test utilities:** `test/test-utils.tsx` (React Testing Library wrappers)
- **Pattern:** `test/**/*.test.{ts,tsx}`

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

### Contributions (ITR1)

| Member | Focus Area | Contribution |
|---|---|---|
| **Naeem Baig** | Events, Finance, Tasks | Events Page (3 calendar views), Finance Page (5 tabs with charts/analytics), Tasks Board (5 views with drag-and-drop), UI primitives, test suite |
| **Yusuf Garba** | Task Page | Task page setup, professional contact management |
| **Taziz Ahsan** | Dashboard | Role-based dashboard layouts and widgets |
| **Daniel Kyere** | Login Screen | Authentication UI and access control |
| **Ashdeep Singh** | Members Page | Member management interface |
| **Shivam Patel** | Database & Scraper | Database schema work and web scraper |

### Contributions (ITR3)

| Member | Focus Area | Contribution |
|---|---|---|
| **Taziz Ahsan** | Dashboard, Search, CRM | Role-based dashboard engine with drag-and-drop customization (@dnd-kit), live data dashboard integration via React Contexts and JWT-authenticated KPI Backend API, global search (Ctrl+K) across all 6 modules with persistent search history, end-to-end professional relationship CRM (global SponsorsContext + contact lifecycle visualization with LinkedIn integration), comprehensive testing infrastructure (unit + integration tests), production-grade reliability & verification framework, custom avatar color generation, logic decoupling (useContactSearch hook extraction) |
| **Naeem Baig** | Events, Tasks, Finance | Events page (Month/Week/Day calendar views, event creation/editing modal, event detail panel, events context provider), Tasks page (Board/List/Timeline/Calendar/Workflow views with Kanban drag-and-drop, Gantt chart with SVG dependency lines, task modal, tasks context provider), Finance page (Budget Overview with charts/stats, Expenses CRUD with approve/deny, Reimbursements submit/approve/deny/paid flow, Income tracking, Analytics with trends/burn rate/insights), approval queue dashboard widget, search standardization (SearchStrategy interface across Finance and Contacts) |
| **Yusuf Garba** | Reports, Documents | Reports & analytics dashboard combining member/operations/finance/event data, graphs showing monthly club activity and spending trends, automated document categorization (category dropdown mapped to Supabase), document version tracking (History side-panel with modification log), Supabase document storage integration, UI decomposition (split DashboardPage into StatsCard and Activity components) |
| **Daniel Kyere** | Sponsors, Security | Sponsor management page to organize corporate sponsors by tiers (Platinum, Gold, Silver, Bronze), pipeline view to track sponsor lifecycle (Prospect → Pending → Active → Churned), role-based access control (RBAC) UI ("Access Management" GUI in Settings), security audit log viewer (paginated sensitive system actions), login screen and confidentiality configuration |
| **Ashdeep Singh** | Members, Onboarding | Member directory with full roster grid (filterable by role and status), profile cards showing tasks completed and events attended, sponsor interaction history log (emails, calls, meetings), onboarding flow (step-by-step wizard for first-time users), profile setup rules (restricted role prevention during onboarding), access control logic (must complete onboarding before app access), first-time user guided tour (interactive tooltip-based tour), organization setup portal (create/join organizations via invite codes) |
| **Shivam Patel** | Marketing, Profiles | Marketing page with dedicated Analytics tab (bar chart: reach vs. engagement per campaign), live feed simulation (real-time social media posts with likes/shares), campaign detail dialog (budget usage progress bar, per-post breakdown), personal profile page with social media linking (Instagram, Facebook, LinkedIn, X/Twitter, TikTok with Supabase persistence and clickable preview links), Google Calendar sync button for events, member directory export to CSV, live profile preview cards (hover-triggered ProfileCard with social media data), data layer hardening (Transaction and Event domain objects) |
