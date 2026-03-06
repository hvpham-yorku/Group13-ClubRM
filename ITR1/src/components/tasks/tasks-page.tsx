import { useState, useCallback } from "react"
import { useTasks } from "@/context/tasks-context"
import {
  type Task,
  type TaskStatus,
  type TaskView,
  TASK_MEMBERS,
  PRIORITY_CONFIG,
  type TaskPriority,
} from "./types"
import { BoardView } from "./board-view"
import { ListView } from "./list-view"
import { TimelineView } from "./timeline-view"
import { TaskCalendarView } from "./calendar-view"
import { WorkflowView } from "./workflow-view"
import { TaskModal } from "./task-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Kanban,
  List,
  GanttChart,
  CalendarDays,
  Workflow,
  Filter,
  X,
  Users,
  Flag,
  LayoutGrid,
} from "lucide-react"
import { format, addMonths } from "date-fns"

export function TasksPage() {
  const { addTask, updateTask, deleteTask } = useTasks()

  const [view, setView] = useState<TaskView>("board")
  const [currentDate, setCurrentDate] = useState(new Date())

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo")

  // Filters
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // List view groupBy
  const [groupBy, setGroupBy] = useState<"status" | "priority" | "assignee" | "section">("status")

  const handleCreateTask = useCallback((status?: TaskStatus) => {
    setEditingTask(null)
    setDefaultStatus(status || "todo")
    setModalOpen(true)
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }, [])

  const handleSaveTask = useCallback(
    (task: Task) => {
      if (editingTask) {
        updateTask(task)
      } else {
        addTask(task)
      }
    },
    [editingTask, updateTask, addTask]
  )

  const handleDeleteTask = useCallback(
    (id: string) => {
      deleteTask(id)
    },
    [deleteTask]
  )

  const views: { value: TaskView; label: string; icon: React.ReactNode }[] = [
    { value: "board", label: "Board", icon: <Kanban className="h-3.5 w-3.5" /> },
    { value: "list", label: "List", icon: <List className="h-3.5 w-3.5" /> },
    { value: "timeline", label: "Timeline", icon: <GanttChart className="h-3.5 w-3.5" /> },
    { value: "calendar", label: "Calendar", icon: <CalendarDays className="h-3.5 w-3.5" /> },
    { value: "workflow", label: "Workflow", icon: <Workflow className="h-3.5 w-3.5" /> },
  ]

  const hasFilters = filterAssignee || filterPriority

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>

          {/* Date navigation for timeline/calendar */}
          {(view === "timeline" || view === "calendar") && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCurrentDate((d) => addMonths(d, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-muted-foreground min-w-[100px] text-center">
                {format(currentDate, "MMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCurrentDate((d) => addMonths(d, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Group by (list view only) */}
          {view === "list" && (
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/50">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground ml-2" />
              {(["status", "priority", "assignee", "section"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-medium transition-all capitalize",
                    groupBy === g
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Filter toggle */}
          <Button
            variant={hasFilters ? "default" : "outline"}
            size="xs"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasFilters && (
              <span className="bg-primary-foreground/20 rounded-full px-1 text-[10px]">
                {(filterAssignee ? 1 : 0) + (filterPriority ? 1 : 0)}
              </span>
            )}
          </Button>

          {/* View switcher */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50">
            {views.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  view === v.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          <Button onClick={() => handleCreateTask()} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border border-border/50 bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Assignee filter */}
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Assignee:</span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilterAssignee(null)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all",
                  !filterAssignee
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              {TASK_MEMBERS.slice(0, 6).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFilterAssignee(filterAssignee === m.id ? null : m.id)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all",
                    filterAssignee === m.id
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.initials}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <Flag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Priority:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterPriority(null)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all",
                  !filterPriority
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterPriority(filterPriority === key ? null : key)}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all",
                      filterPriority === key
                        ? cn(config.color)
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {config.icon} {config.label}
                  </button>
                )
              )}
            </div>
          </div>

          {hasFilters && (
            <>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => {
                  setFilterAssignee(null)
                  setFilterPriority(null)
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </>
          )}
        </div>
      )}

      {/* View content */}
      <div className="flex-1 min-h-0">
        {view === "board" && (
          <BoardView
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
          />
        )}
        {view === "list" && (
          <ListView
            onTaskClick={handleTaskClick}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
            groupBy={groupBy}
          />
        )}
        {view === "timeline" && (
          <TimelineView
            currentDate={currentDate}
            onTaskClick={handleTaskClick}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
          />
        )}
        {view === "calendar" && (
          <TaskCalendarView
            currentDate={currentDate}
            onTaskClick={handleTaskClick}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
          />
        )}
        {view === "workflow" && (
          <WorkflowView
            onTaskClick={handleTaskClick}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
          />
        )}
      </div>

      {/* Task modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
