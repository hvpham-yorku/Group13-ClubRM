# ClubRM - Club Relationship Manager (ITR1)

A modern CRM platform built specifically for student clubs and associations. Built with React 18, TypeScript, Vite, and TailwindCSS v4.

## Prerequisites

- **Node.js** v18+ (https://nodejs.org/)
- **npm** v9+ (comes with Node.js)

## Quick Start

```bash
# 1. Navigate to the project folder
cd ITR1

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Run Tests

```bash
npm test
```

## Run Linting

```bash
npm run lint
```

## Project Structure

```
ITR1/
├── src/
│   ├── components/         # UI components organized by feature
│   │   ├── dashboard/      # Dashboard variants (President, VP, etc.)
│   │   ├── events/         # Calendar/Events module (Month, Week, Day views)
│   │   ├── finance/        # Finance module (Budget, Expenses, Reimbursements, Income, Analytics)
│   │   ├── layout/         # Sidebar + TopBar layout components
│   │   ├── tasks/          # Task board module (Board, List, Timeline, Calendar, Workflow views)
│   │   └── ui/             # Reusable UI primitives (Button, Dialog, Select, Tabs, etc.)
│   ├── context/            # React Context providers
│   │   ├── events-context.tsx
│   │   ├── finance-context.tsx
│   │   ├── role-context.tsx
│   │   └── tasks-context.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Entry point with providers
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── log.md                  # Project log (meeting minutes, tasks, decisions)
```

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 7 |
| Styling | TailwindCSS v4 |
| UI Primitives | Radix UI |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Date Handling | date-fns |
| Routing | React Router DOM v7 |
| Form Handling | React Hook Form + Zod |
| Icons | Lucide React |

## Implemented Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Role-based dashboard with stats, charts, and activity feed |
| `/events` | Events | Calendar with Month/Week/Day views, event CRUD, and detail panel |
| `/tasks` | Tasks | Asana-style task board with Board, List, Timeline, Calendar, Workflow views |
| `/finance` | Finance | Budget overview, expenses, reimbursements, income tracking, analytics |

## Team

- **Yusuf Garba** — Task Page
- **Naeem Baig** — Events Page, Finance Page, Tasks Board
- **Taziz Ahsan** — Dashboard
- **Daniel Kyere** — Login Screen
- **Ashdeep Singh** — Members Page
- **Shivam Patel** — Database & Web Scraper
