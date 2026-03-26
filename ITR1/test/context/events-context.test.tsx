import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { EventsProvider, useEvents, SEED_EVENTS } from "../../src/context/events-context"
import type { ReactNode } from "react"

const WAIT_OPTS = { timeout: 5000, interval: 50 }

function wrapper({ children }: { children: ReactNode }) {
  return <EventsProvider initialEvents={SEED_EVENTS}>{children}</EventsProvider>
}

describe("EventsContext", () => {
  it("provides seed events", async () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    expect(result.current.events.length).toBeGreaterThan(0)
  })

  it.skip("adds an event", async () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    const before = result.current.events.length

    await act(async () => {
      await result.current.addEvent({
        id: "test-event",
        title: "Test Event",
        description: "Test Desc",
        startDate: new Date(),
        endDate: new Date(),
        colorId: "blue",
        allDay: false,
        location: "Test Loc",
        tags: [],
        collaborators: [],
        createdBy: "m1",
        isPublic: true,
        status: "confirmed",
      })
    })

    await waitFor(() => {
      expect(result.current.events.length).toBe(before + 1)
    }, WAIT_OPTS)
  })

  it.skip("updates an event", async () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    const first = result.current.events[0]

    await act(async () => {
      await result.current.updateEvent({ ...first, title: "Updated Event" })
    })

    await waitFor(() => {
      const updated = result.current.events.find((e: any) => e.id === first.id)
      expect(updated?.title).toBe("Updated Event")
    }, WAIT_OPTS)
  })
})
