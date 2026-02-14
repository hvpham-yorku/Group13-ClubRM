import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { TasksProvider, useTasks } from "../../src/context/tasks-context"
import type { ReactNode } from "react"

function wrapper({ children }: { children: ReactNode }) {
  return <TasksProvider>{children}</TasksProvider>
}

describe("TasksContext", () => {
  it("provides seed tasks", () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    expect(result.current.tasks.length).toBeGreaterThan(0)
  })

  it("adds a task", () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const before = result.current.tasks.length

    act(() => {
      result.current.addTask({
        id: "test-task",
        title: "Test Task",
        status: "backlog",
        priority: "medium",
        section: "General",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    expect(result.current.tasks.length).toBe(before + 1)
    expect(result.current.tasks.find((t) => t.id === "test-task")).toBeDefined()
  })

  it("updates a task", () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const first = result.current.tasks[0]

    act(() => {
      result.current.updateTask({ ...first, title: "Updated Title" })
    })

    const updated = result.current.tasks.find((t) => t.id === first.id)
    expect(updated?.title).toBe("Updated Title")
  })

  it("deletes a task", () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const first = result.current.tasks[0]
    const before = result.current.tasks.length

    act(() => {
      result.current.deleteTask(first.id)
    })

    expect(result.current.tasks.length).toBe(before - 1)
    expect(result.current.tasks.find((t) => t.id === first.id)).toBeUndefined()
  })

  it("moves a task to a new status", () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const backlogTask = result.current.tasks.find((t) => t.status === "backlog")
    if (!backlogTask) return

    act(() => {
      result.current.moveTask(backlogTask.id, "in-progress")
    })

    const moved = result.current.tasks.find((t) => t.id === backlogTask.id)
    expect(moved?.status).toBe("in-progress")
  })
})
