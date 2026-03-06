import { useState, useMemo } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTasks } from "@/context/tasks-context"
import { type Task, type TaskStatus, TASK_COLUMNS } from "./types"
import { TaskCard } from "./task-card"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"

interface BoardViewProps {
  onTaskClick: (task: Task) => void
  onCreateTask: (status: TaskStatus) => void
  filterAssignee: string | null
  filterPriority: string | null
  searchQuery?: string
}

function SortableTask({
  task,
  onClick,
}: {
  task: Task
  onClick: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}

function DroppableColumn({
  column,
  tasks,
  onTaskClick,
  onCreateTask,
}: {
  column: (typeof TASK_COLUMNS)[0]
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] flex-1 rounded-xl border border-border/50 bg-muted/20 transition-colors duration-200",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", column.dotColor)} />
          <span className="text-sm font-semibold">{column.title}</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onCreateTask}
          className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Task cards */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/50 text-xs">
            <span>No tasks</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function BoardView({ onTaskClick, onCreateTask, filterAssignee, filterPriority, searchQuery = "" }: BoardViewProps) {
  const { tasks, moveTask } = useTasks()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee && !t.assignees.includes(filterAssignee)) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [tasks, filterAssignee, filterPriority, searchQuery])

  const columnTasks = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    }
    filteredTasks.forEach((t) => map[t.status].push(t))
    return map
  }, [filteredTasks])

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // visual feedback handled by isOver in DroppableColumn
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const isColumn = TASK_COLUMNS.some((c) => c.id === overId)
    if (isColumn) {
      moveTask(taskId, overId as TaskStatus)
      return
    }

    // Dropped on another task - find that task's status
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && overTask.id !== taskId) {
      moveTask(taskId, overTask.status)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {TASK_COLUMNS.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={columnTasks[column.id]}
            onTaskClick={onTaskClick}
            onCreateTask={() => onCreateTask(column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[300px]">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
