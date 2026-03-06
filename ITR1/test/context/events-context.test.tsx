import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { EventsProvider, useEvents } from "../../src/context/events-context"
import type { ReactNode } from "react"

function wrapper({ children }: { children: ReactNode }) {
  return <EventsProvider>{children}</EventsProvider>
}

describe("EventsContext", () => {
  it("provides seed events", () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    expect(result.current.events.length).toBeGreaterThan(0)
  })

  it("adds an event", () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    const before = result.current.events.length

    act(() => {
      result.current.addEvent({
        id: "test-event",
        title: "Test Event",
        start: new Date(),
        end: new Date(),
        color: "blue",
        isAllDay: false,
        visibility: "public",
        status: "upcoming",
      })
    })

    expect(result.current.events.length).toBe(before + 1)
  })

  it("updates an event", () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    const first = result.current.events[0]

    act(() => {
      result.current.updateEvent({ ...first, title: "Updated Event" })
    })

    const updated = result.current.events.find((e) => e.id === first.id)
    expect(updated?.title).toBe("Updated Event")
  })

  it("deletes an event", () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    const first = result.current.events[0]
    const before = result.current.events.length

    act(() => {
      result.current.deleteEvent(first.id)
    })

    expect(result.current.events.length).toBe(before - 1)
  })

  it("filters events by date", () => {
    const { result } = renderHook(() => useEvents(), { wrapper })
    const today = new Date()
    const filtered = result.current.getEventsForDate(today)
    expect(Array.isArray(filtered)).toBe(true)
  })
})
