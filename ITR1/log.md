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
Developer: Yusuf Garba
Task: Setup the Task Page to handle Professional Contacts
Est. Time: 5 days
Actual Time: Exceeded 5 days
Status: In Progress

User Story: Confidentiality with CRM Access
Developer: Daniel Kyere
Task: Configure the login screen to ensure personal information is kept personal with no data leakage or disclosure of unauthorized access
Est. Time: 4 days
Actual TIme: Exceeded 4 days
Status: In Progress

User Story: Sophisticated Sorting
Developer: Naeem Baig, Yusuf Garba, and Ashdeep Ashdeep Singh
Task: Configure the Events Page, Task Page, and Members Page to have a good sorting algorithm that would help in understanding and going through customer and club info seamlessly
Est. Time: 2 weeks


Actual Time: Still under construction
Status: In Progress

Actual Time: 2 weeks
Status: Completed (Events, Tasks, Finance pages all have sorting/filtering)


Actual Time: 2 weeks
Status: Completed (Events, Tasks, Finance pages all have sorting/filtering)


User Story: View Professional Contact
Developer: Yusuf Garba
Task: Configure the Task page to be able to keep track and view the professional who we are contacting
Est. Time: 3 days
Actual Time: Still under construction
Status: In Progress

User Story: Add new Professional Contact
Developer: Yusuf Garba and Shivam Patel
Task: Configure how to add more professionals to our database
Est. Time: 5 days
Actual Time: Still under construction
Status: In Progress

User Story: Notion UI Configuration for Simplistic Look
Developer: Naeem Baig, Yusuf Garba, Taziz Ahsan, Ashdeep Ashdeep Singh, and Daniel Kyere
Task: As per the customer's instructions/requests, we would spend the time to gain inspiration from Notion's UI for a sleak, simplistic, and nice-to-look-at UI in order to appeal to new users and have them make use of our cool interface.
Est. Time: 2 weeks
Actual Time: Still under construction
Status: In Progress

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
