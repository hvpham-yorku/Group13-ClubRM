import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { Calendar, Users, AlertTriangle, MapPin, Clock } from "lucide-react"

export function VPEventsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="Upcoming Events"
        value="4"
        description="Next 30 days"
        trend={{ value: 2, label: "more than last month" }}
        icon={<Calendar className="h-5 w-5" />}
      />
      <StatCard
        title="Total Registrations"
        value="187"
        trend={{ value: 22, label: "vs last term" }}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Volunteer Coverage"
        value="78%"
        trend={{ value: -5, label: "below target" }}
        icon={<Users className="h-5 w-5" />}
      />

      <Widget title="Event Readiness" fullWidth>
        <div className="space-y-3">
          <ProgressBar value={90} label="Tech Talk: AI in 2026" subLabel="Feb 10 • 45/50 registered" color="emerald" />
          <ProgressBar value={80} label="Valentine Social" subLabel="Feb 14 • 80/100 registered" color="pink" />
          <ProgressBar value={40} label="Resume Workshop" subLabel="Feb 20 • 12/30 registered" color="amber" />
          <ProgressBar value={25} label="Hackathon 2026" subLabel="Mar 8 • 25/100 registered" color="default" />
        </div>
      </Widget>

      <Widget title="Volunteer Gaps" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">Manage volunteers →</span>}>
        <DashboardList>
          <DashboardListItem
            title="Valentine Social"
            subtitle="Needs 5 more volunteers for decorations"
            metadata="Urgent"
            icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          />
          <DashboardListItem
            title="Hackathon 2026"
            subtitle="Needs 8 mentors and 3 judges"
            metadata="Medium"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Venue Bookings">
        <DashboardList>
          <DashboardListItem
            title="Room 101, Engineering"
            subtitle="Feb 10, 6-8 PM • Tech Talk"
            metadata="Confirmed"
            icon={<MapPin className="h-4 w-4 text-emerald-500" />}
          />
          <DashboardListItem
            title="Main Hall, Student Center"
            subtitle="Feb 14, 8-11 PM • Valentine Social"
            metadata="Confirmed"
            icon={<MapPin className="h-4 w-4 text-emerald-500" />}
          />
          <DashboardListItem
            title="Lab 201, CS Building"
            subtitle="Feb 20, 2-4 PM • Resume Workshop"
            metadata="Pending"
            icon={<Clock className="h-4 w-4 text-amber-500" />}
          />
        </DashboardList>
      </Widget>
    </div>
  )
}
