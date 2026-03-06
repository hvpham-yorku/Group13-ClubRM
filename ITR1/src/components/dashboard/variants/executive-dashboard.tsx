import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { CheckSquare, Calendar, Clock, Star } from "lucide-react"

export function ExecutiveDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="My Tasks"
        value="6"
        description="3 due this week"
        trend={{ value: 2, label: "completed today" }}
        icon={<CheckSquare className="h-5 w-5" />}
      />
      <StatCard
        title="Events Attending"
        value="3"
        description="Next 30 days"
        icon={<Calendar className="h-5 w-5" />}
      />
      <StatCard
        title="Hours This Month"
        value="18"
        trend={{ value: 12, label: "vs last month" }}
        icon={<Clock className="h-5 w-5" />}
      />

      <Widget title="My Task Progress" fullWidth>
        <div className="space-y-3">
          <ProgressBar value={100} label="Design event flyer" subLabel="Completed" color="emerald" />
          <ProgressBar value={70} label="Update social media bios" subLabel="In Progress" color="pink" />
          <ProgressBar value={50} label="Collect volunteer sign-ups" subLabel="In Progress" color="amber" />
          <ProgressBar value={0} label="Draft meeting agenda" subLabel="To Do" color="default" />
          <ProgressBar value={0} label="Review sponsorship FAQ" subLabel="To Do" color="default" />
          <ProgressBar value={0} label="Help with venue setup" subLabel="Backlog" color="default" />
        </div>
      </Widget>

      <Widget title="Upcoming Events" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View full calendar →</span>}>
        <DashboardList>
          <DashboardListItem
            title="Tech Talk: AI in 2026"
            subtitle="Feb 10 • 6:00 PM • Room 101"
            metadata="Registered"
            icon={<Calendar className="h-4 w-4" />}
          />
          <DashboardListItem
            title="Valentine Social"
            subtitle="Feb 14 • 8:00 PM • Main Hall"
            metadata="Volunteering"
            icon={<Star className="h-4 w-4 text-amber-400" />}
          />
          <DashboardListItem
            title="Resume Workshop"
            subtitle="Feb 20 • 2:00 PM • Lab 201"
            metadata="Registered"
            icon={<Calendar className="h-4 w-4" />}
          />
        </DashboardList>
      </Widget>
    </div>
  )
}
