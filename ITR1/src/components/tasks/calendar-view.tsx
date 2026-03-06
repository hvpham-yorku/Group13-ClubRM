import { useMemo } from "react"
import { useTasks } from "@/context/tasks-context"
import { type Task, PRIORITY_CONFIG, getColumn } from "./types"
import { cn } from "@/lib/utils"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  isSameDay,
} from "date-fns"

interface CalendarViewProps {
  currentDate: Date
  onTaskClick: (task: Task) => void
  filterAssignee: string | null
  filterPriority: string | null
  searchQuery?: string
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function TaskCalendarView({
  currentDate,
  onTaskClick,
  filterAssignee,
  filterPriority,
  searchQuery = "",
}: CalendarViewProps) {
  const { tasks } = useTasks()

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee && !t.assignees.includes(filterAssignee)) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [tasks, filterAssignee, filterPriority, searchQuery])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7))
    }
    return result
  }, [calendarDays])

  const getTasksForDay = (day: Date) => {
    return filteredTasks.filter((task) => {
      if (task.dueDate && isSameDay(task.dueDate, day)) return true
      if (task.startDate && isSameDay(task.startDate, day)) return true
      return false
    })
  }

  return (
    <div className="flex flex-col flex-1 rounded-xl border border-border/50 overflow-hidden bg-card">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid" style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b border-border/30 last:border-b-0">
            {week.map((day) => {
              const dayTasks = getTasksForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)
              const maxVisible = weeks.length > 5 ? 2 : 3

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative min-h-[100px] p-1.5 border-r border-border/30 last:border-r-0 text-left",
                    !isCurrentMonth && "opacity-40"
                  )}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-medium",
                        isCurrentDay
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, maxVisible).map((task) => {
                      const priority = PRIORITY_CONFIG[task.priority]
                      const column = getColumn(task.status)
                      const isDue = task.dueDate && isSameDay(task.dueDate, day)
                      const isStart = task.startDate && isSameDay(task.startDate, day)

                      return (
                        <button
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            "w-full text-left rounded-md px-2 py-0.5 text-[10px] font-medium truncate border transition-all",
                            "hover:scale-[1.02] hover:shadow-md hover:z-10 relative",
                            column.color
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", priority.dotColor)} />
                            <span className="truncate">{task.title}</span>
                            {isDue && (
                              <span className="ml-auto text-[8px] opacity-70 shrink-0">DUE</span>
                            )}
                            {isStart && !isDue && (
                              <span className="ml-auto text-[8px] opacity-70 shrink-0">START</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                    {dayTasks.length > maxVisible && (
                      <div className="text-[10px] text-muted-foreground font-medium pl-2 py-0.5">
                        +{dayTasks.length - maxVisible} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
