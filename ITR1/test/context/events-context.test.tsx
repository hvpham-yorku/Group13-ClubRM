import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { EventsProvider, useEvents } from "../../src/context/events-context"
import type { ReactNode } from "react"

// 1. Hoist the mock data and Supabase object
const { mockEvents, mockSupabase } = vi.hoisted(() => {
  const events = [
    { 
      id: "e1", 
      title: "Seed Event", 
      start_date: new Date().toISOString(), 
      end_date: new Date().toISOString(),
      all_day: false 
    }
  ];
  return {
    mockEvents: events,
    mockSupabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn((cb) => cb({ data: events, error: null })),
      })),
    }
  };
});

// 2. Mock the Supabase library - providing BOTH exports
vi.mock("../../src/lib/supabase", () => ({
  supabase: mockSupabase,
  supabaseUntyped: mockSupabase,
}));

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
        startDate: new Date(),
        endDate: new Date(),
        color: "blue",
        allDay: false,
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