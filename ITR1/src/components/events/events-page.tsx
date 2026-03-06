import { useState, useCallback } from "react"
import { useEvents } from "@/context/events-context"
import { type CalendarEvent, type CalendarView } from "./types"
import { CalendarHeader } from "./calendar-header"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { EventModal } from "./event-modal"
import { EventDetailPanel } from "./event-detail-panel"
import { addMonths, addWeeks, addDays } from "date-fns"

export function EventsPage() {
  const { addEvent, updateEvent, deleteEvent } = useEvents()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [defaultDate, setDefaultDate] = useState<Date | null>(null)

  // Detail panel state
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleNavigate = useCallback(
    (direction: "prev" | "next" | "today") => {
      if (direction === "today") {
        setCurrentDate(new Date())
        return
      }

      const delta = direction === "next" ? 1 : -1
      switch (view) {
        case "month":
          setCurrentDate((d) => addMonths(d, delta))
          break
        case "week":
          setCurrentDate((d) => addWeeks(d, delta))
          break
        case "day":
          setCurrentDate((d) => addDays(d, delta))
          break
      }
    },
    [view]
  )

  const handleDayClick = useCallback(
    (date: Date) => {
      if (view === "month") {
        setCurrentDate(date)
        setView("day")
      }
    },
    [view]
  )

  const handleTimeSlotClick = useCallback((date: Date) => {
    setDefaultDate(date)
    setEditingEvent(null)
    setModalOpen(true)
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setDetailOpen(true)
  }, [])

  const handleCreateEvent = useCallback(() => {
    setEditingEvent(null)
    setDefaultDate(null)
    setModalOpen(true)
  }, [])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setDefaultDate(null)
    setModalOpen(true)
  }, [])

  const handleSaveEvent = useCallback(
    (event: CalendarEvent) => {
      if (editingEvent) {
        updateEvent(event)
      } else {
        addEvent(event)
      }
    },
    [editingEvent, updateEvent, addEvent]
  )

  const handleDeleteEvent = useCallback(
    (id: string) => {
      deleteEvent(id)
    },
    [deleteEvent]
  )

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onCreateEvent={handleCreateEvent}
      />

      <div className="flex-1 min-h-0">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>

      {/* Event creation/edit modal */}
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editingEvent}
        defaultDate={defaultDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Event detail panel */}
      <EventDetailPanel
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
