import { type Task, PRIORITY_CONFIG, getTag, getMember, getColumn } from "./types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, CheckCircle2 } from "lucide-react"
import { format, isPast, isToday } from "date-fns"

interface TaskCardProps {
  task: Task
  onClick?: (task: Task) => void
  compact?: boolean
  isDragging?: boolean
}

export function TaskCard({ task, onClick, compact = false, isDragging = false }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority]
  const column = getColumn(task.status)
  const completedSubtasks = task.subtasks.filter((s) => s.done).length
  const totalSubtasks = task.subtasks.length
  const isOverdue = task.dueDate && isPast(task.dueDate) && task.status !== "done"
  const isDueToday = task.dueDate && isToday(task.dueDate)

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(task)}
        className={cn(
          "w-full text-left rounded-lg border border-border/50 bg-card p-2.5 transition-all duration-150",
          "hover:border-border hover:shadow-md hover:-translate-y-0.5",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          isDragging && "shadow-xl rotate-2 scale-105 opacity-90 z-50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", priority.dotColor)} />
          <span className="text-xs font-medium truncate">{task.title}</span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick?.(task)}
      className={cn(
        "w-full text-left rounded-lg border border-border/50 bg-card p-3.5 transition-all duration-200 group",
        "hover:border-border hover:shadow-lg hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        isDragging && "shadow-2xl rotate-1 scale-105 opacity-90 z-50 border-primary/50"
      )}
    >
      {/* Priority & Tags row */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold border uppercase tracking-wide",
            priority.color
          )}
        >
          {priority.label}
        </span>
        {task.tags.slice(0, 2).map((tagId) => {
          const tag = getTag(tagId)
          if (!tag) return null
          return (
            <span
              key={tagId}
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border",
                tag.color
              )}
            >
              {tag.name}
            </span>
          )
        })}
        {task.tags.length > 2 && (
          <span className="text-[10px] text-muted-foreground">+{task.tags.length - 2}</span>
        )}
      </div>

      {/* Title */}
      <h4 className={cn(
        "text-sm font-semibold leading-snug mb-2",
        task.status === "done" && "line-through text-muted-foreground"
      )}>
        {task.title}
      </h4>

      {/* Subtasks progress */}
      {totalSubtasks > 0 && (
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                completedSubtasks === totalSubtasks ? "bg-emerald-500" : column.dotColor
              )}
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-0.5">
            <CheckCircle2 className="h-3 w-3" />
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        {/* Due date */}
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium rounded px-1.5 py-0.5",
                isOverdue
                  ? "bg-red-500/15 text-red-400"
                  : isDueToday
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(task.dueDate, "MMM d")}
            </span>
          )}
        </div>

        {/* Assignee avatars */}
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 3).map((id) => {
            const member = getMember(id)
            if (!member) return null
            return (
              <Avatar key={id} className="h-6 w-6 border-2 border-card" title={member.name}>
                <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            )
          })}
          {task.assignees.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
