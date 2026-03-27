# Group 13 - Project Log (ITR1)

## Team Meetings

### Feb 6, 2026 - Documentation Handling and UI Design Discussion

- **Attendees:** Yusuf Garba, Shivam Patel, Taziz Ahsan, Ashdeep Ashdeep Singh, Daniel Kyere.
- **Agenda:** Finalizing ITR1 Roles and Expectations
- **Decisions:** Yusuf Garba and Naeem Baig created docs and UI features (through Figma) to get the team organized; visualizations were created for better team productivity
- **Rationale:** Split work of the project by feature. Yusuf assigned the Task page, Naeem assigned the Events Page, Taziz assigned the Dashboard, Daniel assigned the Login Screen, Ashdeep assigned the members page, and Shivam assigned with general database work and Web Scraper.

---

# Task Tracking & Estimates

| User Story | Developer | Task | Est. Time | Actual Time Status |

User Story: Centralized Contact and Organization Management
Developer: Taziz Ahsan
Task: Setup the Task Page to handle Professional Contacts and architect global CRM context
Est. Time: 5 days
Actual Time: 5 days
Status: Completed

User Story: Confidentiality with CRM Access
Developer: Daniel Kyere
Task: Configure the login screen to ensure personal information is kept personal with no data leakage or disclosure of unauthorized access
Est. Time: 4 days
Actual TIme: Exceeded 4 days
Status: In Progress

User Story: Sophisticated Sorting
Developer: Naeem Baig, Yusuf Garba, Ashdeep Ashdeep Singh, and Taziz Ahsan
Task: Configure the Events Page, Task Page, Finance Page and Members Page to have a sleek dynamic sorting algorithm
Est. Time: 2 weeks
Actual Time: 2 weeks
Status: Completed

User Story: View Professional Contact
Developer: Taziz Ahsan
Task: Configure the CRM directory and detail sheets to track and view professional partners
Est. Time: 3 days
Actual Time: 3 days
Status: Completed

User Story: Add new Professional Contact
Developer: Taziz Ahsan
Task: Configure and implement the dialog and logic to add new professionals to our database
Est. Time: 5 days
Actual Time: 4 days
Status: Completed

User Story: Notion UI Configuration for Simplistic Look
Developer: Naeem Baig, Yusuf Garba, Taziz Ahsan, Ashdeep Ashdeep Singh, and Daniel Kyere
Task: Gain inspiration from Notion's UI for a sleek, simplistic UI to appeal to new users.
Est. Time: 2 weeks
Actual Time: 2 weeks
Status: Completed

User Story: Event & Calendar Management
Developer: Naeem Baig
Task: Build the Events Page with Month/Week/Day calendar views, event creation/editing modal, event detail panel, and events context provider
Est. Time: 4 days
Actual Time: 3 days
Status: Completed

User Story: Multi-View Task Board
Developer: Naeem Baig
Task: Build the Tasks Page with Board (Kanban drag-and-drop), List (sortable/groupable), Timeline (Gantt chart), Calendar, and Workflow views, plus task modal and tasks context provider
Est. Time: 5 days
Actual Time: 5 days
Status: Completed

User Story: Club Finance Management
Developer: Naeem Baig
Task: Build the Finance Page with Budget Overview (charts, stats), Expenses tab (CRUD, approve/deny), Reimbursements tab (submit/approve/deny/paid flow), Income tab (dues, sponsorships, fundraising), and Analytics tab (trends, burn rate, insights)
Est. Time: 3 days
Actual Time: 2 days
Status: Completed

User Story: Reusable UI Components
Developer: Naeem Baig
Task: Build shared UI primitives (Dialog, Select, Popover, Tabs, Checkbox, ScrollArea, Label) using Radix UI + TailwindCSS to maintain consistent styling across pages
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Customizable Dashboard Engine
Developer: Taziz Ahsan
Task: Implement a persistent drag-and-drop layout system using @dnd-kit across all 8 role-based dashboards, including widget visibility management.
Est. Time: 4 days
Actual Time: 3 days
Status: Completed

User Story: Live Data Dashboard Integration
Developer: Taziz Ahsan
Task: Connect all role-specific dashboards to real-time application state via React Contexts and implement a secure JWT-authenticated KPI Backend API.
Est. Time: 5 days
Actual Time: 4 days
Status: Completed

User Story: Comprehensive Testing Infrastructure
Developer: Taziz Ahsan
Task: Establish a robust testing suite comprising 10 unit tests (with logic stubs) and 3 integration tests (live Supabase connectivity) to ensure project stability.
Est. Time: 3 days
Actual Time: 2 days
Status: Completed

User Story: Premium UI Polish and Global Search
Developer: Taziz Ahsan
Task: Overhaul sidebar aesthetics, fix collapse behavior glitches, and implement global search persistence with automatic calendar navigation.
Est. Time: 2 days
Actual Time: 2 days
Status: Completed

User Story: Omniscient Global Search & Navigator
Developer: Taziz Ahsan
Task: Implement cross-module indexing for all 6 primary modules, build keyboard-driven UX (Ctrl+K), and develop persistent search history engine.
Est. Time: 4 days
Actual Time: 4 days
Status: Completed

User Story: Omniscient Global Search & Navigator
Developer: Taziz Ahsan
Developer Story: Multi-Module Search Indexing Logic
Task: Implement client-side indexing for Finance models (Expenses/Income)
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Omniscient Global Search & Navigator
Developer: Taziz Ahsan
Developer Story: Multi-Module Search Indexing Logic
Task: Integrate Document metadata indexing with Supabase pre-fetch
Est. Time: 0.5 days
Actual Time: 0.5 days
Status: Completed

User Story: Omniscient Global Search & Navigator
Developer: Taziz Ahsan
Developer Story: Advanced Command-K Navigation & UX
Task: Implement global keyboard event listener for Ctrl+K/Cmd+K focus traps
Est. Time: 0.5 days
Actual Time: 0.5 days
Status: Completed

User Story: Interactive Dashboard Command Engine
Developer: Taziz Ahsan
Developer Story: Context-Aware Dashboard Mutations
Task: Engineer slot-based entity action system for DashboardListItem
Est. Time: 1.5 days
Actual Time: 1.5 days
Status: Completed

User Story: Interactive Dashboard Command Engine
Developer: Taziz Ahsan
Developer Story: Context-Aware Dashboard Mutations
Task: Implement RSVP logic and Quick Approvals context integration
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Interactive Dashboard Command Engine
Developer: Taziz Ahsan
Developer Story: Dashboard Logic Fallback & Resilience
Task: Develop useDashboardInsights hook to mirror Vercel API production logic
Est. Time: 2 days
Actual Time: 2 days
Status: Completed

User Story: End-to-End Professional Relationship CRM
Developer: Taziz Ahsan
Developer Story: Global CRM State & Directory Architecture
Task: Architect global SponsorsContext provider for unified CRUD management
Est. Time: 2 days
Actual Time: 2 days
Status: Completed

User Story: End-to-End Professional Relationship CRM
Developer: Taziz Ahsan
Developer Story: Global CRM State & Directory Architecture
Task: Design and build the /contacts directory with entity extraction logic
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: End-to-End Professional Relationship CRM
Developer: Taziz Ahsan
Developer Story: Contact Lifecycle & Visualization Sheets
Task: Implement Contact Profile Visualization Sheet with LinkedIn integration
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: End-to-End Professional Relationship CRM
Developer: Taziz Ahsan
Developer Story: Contact Lifecycle & Visualization Sheets
Task: Develop the 'Add Contact' dialog with validation and logic
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Dynamic Club Analytics & Growth Feed
Developer: Taziz Ahsan
Developer Story: Real-time Growth Feed Simulation
Task: Implement simulated live marketing feed using useEffect timers
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Dynamic Club Analytics & Growth Feed
Developer: Taziz Ahsan
Developer Story: Reports & Analytics Engine
Task: Engineer global cross-filtering engine for Report charts
Est. Time: 2 days
Actual Time: 2 days
Status: Completed

User Story: Data-Driven Financial Intelligence Suite
Developer: Taziz Ahsan
Developer Story: Financial UX Standardisation
Task: Implement interactive dynamic column sorting across all financial tables
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Production-Grade Reliability & Verification Framework
Developer: Taziz Ahsan
Developer Story: Deterministic Testing Architecture
Task: Refactor React Providers to support synchronous injection of initialData
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

User Story: Production-Grade Reliability & Verification Framework
Developer: Taziz Ahsan
Developer Story: 70+ Coverage Validation Suite
Task: Develop comprehensive Unit & Integration suite for all 5 Context modules
Est. Time: 3 days
Actual Time: 3 days
Status: Completed

User Story: Production-Grade Reliability & Verification Framework
Developer: Taziz Ahsan
Developer Story: Data Layer Hardening
Task: Implement global error handling to neutralize JSON parsing and Date exceptions
Est. Time: 1 day
Actual Time: 1 day
Status: Completed

---

## Concerns


- **Time management:** Some tasks exceeded original estimates due to the complexity of multi-view components (e.g., Kanban drag-and-drop, Gantt timeline). Better upfront planning and breaking tasks into smaller subtasks could help mitigate this in future iterations.
- **Testing coverage:** Test files were added late in ITR1. For ITR2, tests should be written alongside feature development to catch regressions early.
- **Coordination:** With each team member working on separate pages, ensuring UI consistency required extra effort. The shared UI primitives helped, but a design system document would further improve this.


---

## Major Design Decisions & Rationale

- **Decision:** Simplistic design as opposed to our convoluted everything-app discussion
- **Rationale:** As per the customer's requests, we went with focusing on simplicity rather than versatility of our app so that we also aren't copying other products similar to ours but, instead, we are focused on making it user friendly and still aiming to make it a strong competitor when it comes to professional contact.

---

## Plan Revisions

- **Original Plan (ITR0):** We had the plan to make our very own CRM (ClubRM) to be able to do everything that other CRMs (like Salesforce, Monday, and Zoho) but built specifically for student associations and clubs, essentially pitching a business tool used in the industry but would be used for students, by students.
- **Revised Plan (ITR1):** After talking to the customer, we still have the general idea down, but downsized a bit to ensure that we are able to deliver and prioritize an easier time for our users and to also ensure that the simplicity in its design would attract more users.
- **Reason for Change:** Customer Feedback and Time Considerations.
