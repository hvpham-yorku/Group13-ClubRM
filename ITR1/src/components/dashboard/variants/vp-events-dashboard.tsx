import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { Calendar, Users, AlertTriangle, MapPin, Clock, CheckCircle, Settings2, RotateCcw, Save, Plus } from "lucide-react"
import { DashboardLayoutProvider, useDashboardLayout } from "../customization/dashboard-layout-provider"
import { SortableWidget } from "../customization/sortable-widget"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useEvents } from "@/context/events-context"
import { useMemo } from "react"

const WIDGET_TITLES: Record<string, string> = {
  "upcoming-events-count": "Upcoming Events",
  "total-registrations": "Total Registrations",
  "volunteer-coverage": "Volunteer Coverage",
  "event-readiness": "Event Readiness",
  "volunteer-gaps": "Volunteer Gaps",
  "venue-bookings": "Venue Bookings"
}

const DEFAULT_WIDGETS = [
  "upcoming-events-count",
  "total-registrations",
  "volunteer-coverage",
  "event-readiness",
  "volunteer-gaps",
  "venue-bookings"
]

export function VPEventsDashboard() {
  return (
    <DashboardLayoutProvider role="VP Events" defaultWidgets={DEFAULT_WIDGETS}>
      <VPEventsDashboardContent />
    </DashboardLayoutProvider>
  )
}

function VPEventsDashboardContent() {
  const { isCustomizing, setIsCustomizing, layout, visibleWidgets, resetLayout, toggleWidgetVisibility } = useDashboardLayout()
  const { events } = useEvents()

  const upcomingEvents = useMemo(() => events.filter(e => new Date(e.startDate) > new Date()), [events])
  const totalRegistrations = useMemo(() => events.reduce((sum, e) => sum + (e.registered || 0), 0), [events])
  const confirmedEvents = useMemo(() => events.filter(e => e.status === 'confirmed'), [events])
  const eventReadiness = useMemo(() => events.length > 0 ? (confirmedEvents.length / events.length) * 100 : 0, [confirmedEvents, events])

  const renderWidget = (id: string) => {
    if (!visibleWidgets.has(id)) return null

    switch (id) {
      case "upcoming-events-count":
        return (
          <StatCard
            title="Upcoming Events"
            value={upcomingEvents.length.toString()}
            description="Next 30 days"
            trend={{ value: confirmedEvents.length, label: "confirmed" }}
            icon={<Calendar className="h-5 w-5" />}
          />
        )
      case "total-registrations":
        return (
          <StatCard
            title="Total Registrations"
            value={totalRegistrations.toString()}
            trend={{ value: Math.round(totalRegistrations / (events.length || 1)), label: "avg per event" }}
            icon={<Users className="h-5 w-5" />}
          />
        )
      case "volunteer-coverage":
        return (
          <StatCard
            title="Confirmed Events"
            value={confirmedEvents.length.toString()}
            description={`${events.length - confirmedEvents.length} still in draft`}
            icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
          />
        )
      case "event-readiness":
        return (
          <Widget title="Registration Progress" fullWidth>
            <div className="space-y-3">
              {events.slice(0, 4).map(event => (
                <ProgressBar 
                  key={event.id}
                  value={event.capacity ? ((event.registered || 0) / event.capacity) * 100 : 0} 
                  label={event.title} 
                  subLabel={`${event.registered || 0}/${event.capacity || '∞'} registered`} 
                  color={(event.registered || 0) >= (event.capacity || 0) * 0.8 ? "emerald" : "default"} 
                />
              ))}
              {events.length === 0 && <p className="text-sm text-muted-foreground italic">No events scheduled</p>}
            </div>
          </Widget>
        )
      case "volunteer-gaps":
        return (
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
        )
      case "venue-bookings":
        return (
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
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Events Management</h2>
          <p className="text-sm text-muted-foreground">Monitor registration health and event logistics.</p>
        </div>
        <div className="flex items-center gap-2">
          {isCustomizing ? (
            <>
              {Array.from(visibleWidgets).length < DEFAULT_WIDGETS.length && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-dashed text-primary hover:text-primary/80">
                      <Plus className="h-4 w-4" />
                      Add Widget
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Available Widgets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {DEFAULT_WIDGETS.filter(id => !visibleWidgets.has(id)).map(id => (
                      <DropdownMenuItem key={id} onClick={() => toggleWidgetVisibility(id)}>
                        {WIDGET_TITLES[id] || id}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="outline" size="sm" onClick={resetLayout} className="gap-2 transition-all duration-300">
                <RotateCcw className="h-4 w-4" /> Reset layout
              </Button>
              <Button variant="default" size="sm" onClick={() => setIsCustomizing(false)} className="gap-2 bg-primary text-black hover:bg-primary/90 transition-all duration-300">
                <Save className="h-4 w-4" /> Stop customizing
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsCustomizing(true)} className="gap-2 transition-all duration-300">
              <Settings2 className="h-4 w-4" /> Customize
            </Button>
          )}
        </div>
      </div>

      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500",
        isCustomizing && "scale-[0.98] blur-[0.5px]"
      )}>
        {layout.map((id) => (
          <SortableWidget key={id} id={id} isCustomizing={isCustomizing}>
            {renderWidget(id)}
          </SortableWidget>
        ))}
      </div>
    </div>
  )
}
