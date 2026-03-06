import { describe, it, expect, beforeEach } from "vitest"
import { supabase } from "../../src/lib/supabase"

/**
 * Integration Test: Live Database Persistence
 * This test uses the actual Supabase client to verify connectivity
 * and data structure integrity.
 */
describe("Supabase Persistence Integration", () => {
  
  it("should successfully connect and fetch from the 'members' table", async () => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .limit(1)

    // We expect either data (if there are members) or at least no connection error
    if (error) {
      console.warn("Supabase Fetch Error:", error.message)
    }
    
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("should successfully fetch from the 'tasks' table", async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .limit(1)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("should successfully fetch from the 'events' table", async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .limit(1)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})
