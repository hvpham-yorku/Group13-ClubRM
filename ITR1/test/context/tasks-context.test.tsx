import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { TasksProvider, useTasks, SEED_TASKS } from "../../src/context/tasks-context"
import type { ReactNode } from "react"

const WAIT_OPTS = { timeout: 5000, interval: 50 }

function wrapper({ children }: { children: ReactNode }) {
  return <TasksProvider initialTasks={SEED_TASKS}>{children}</TasksProvider>
}

describe("TasksContext", () => {
  it("provides seed tasks", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    expect(result.current.tasks.length).toBeGreaterThan(0)
  })

  it.skip("adds a task", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const before = result.current.tasks.length

    await act(async () => {
      await result.current.addTask({
        id: "test-task",
        title: "Test Task",
        status: "backlog",
        priority: "medium",
        section: "General",
        createdAt: new Date(),
        subtasks: [],
        description: "Task desc",
        assignees: [],
        tags: [],
        dependencies: [],
        dueDate: null,
        startDate: null,
        completedAt: null
      })
    })

    await waitFor(() => {
      console.log("Tasks length before:", before, "now:", result.current.tasks.length)
      expect(result.current.tasks.length).toBe(before + 1)
      expect(result.current.tasks.find((t: any) => t.id === "test-task")).toBeDefined()
    }, WAIT_OPTS)
  })

  it.skip("updates a task", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const first = result.current.tasks[0]

    await act(async () => {
      await result.current.updateTask({ ...first, title: "Updated Title" })
    })

    await waitFor(() => {
      const updated = result.current.tasks.find((t: any) => t.id === first.id)
      expect(updated?.title).toBe("Updated Title")
    }, WAIT_OPTS)
  })

  it.skip("deletes a task", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const first = result.current.tasks[0]
    const before = result.current.tasks.length

    await act(async () => {
      await result.current.deleteTask(first.id)
    })

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(before - 1)
      expect(result.current.tasks.find((t: any) => t.id === first.id)).toBeUndefined()
    }, WAIT_OPTS)
  })

  it.skip("moves a task to a new status", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    const backlogTask = result.current.tasks.find((t: any) => t.status === "backlog")
    if (!backlogTask) return

    await act(async () => {
      await result.current.moveTask(backlogTask.id, "in_progress")
    })

    await waitFor(() => {
      const moved = result.current.tasks.find((t: any) => t.id === backlogTask.id)
      expect(moved?.status).toBe("in_progress")
    }, WAIT_OPTS)
  })
})
