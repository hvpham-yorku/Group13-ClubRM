import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { type Member, SEED_MEMBERS } from "@/components/members/types"
import { supabase } from "@/lib/supabase"

interface MembersContextType {
  members: Member[]
  addMember: (member: Member) => void
  updateMember: (member: Member) => void
  deleteMember: (id: string) => void
  getMember: (id: string) => Member | undefined
  loading: boolean
  stats: {
    total: number
    active: number
    inactive: number
    alumni: number
  }
}

const MembersContext = createContext<MembersContextType | undefined>(undefined)

function toMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    role: row.role as Member["role"],
    status: row.status as Member["status"],
    joinDate: row.join_date as string,
    avatar: (row.avatar as string) || undefined,
    department: row.department as string,
    year: row.year as string,
    tasksCompleted: row.tasks_completed as number,
    eventsAttended: row.events_attended as number,
    bio: (row.bio as string) || undefined,
  }
}

function toRow(m: Member) {
  return {
    name: m.name,
    email: m.email,
    phone: m.phone,
    role: m.role,
    status: m.status,
    join_date: m.joinDate,
    avatar: m.avatar || null,
    department: m.department,
    year: m.year,
    tasks_completed: m.tasksCompleted,
    events_attended: m.eventsAttended,
    bio: m.bio || null,
  }
}

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: true })
      if (error) {
        console.error("Failed to load members:", error)
        setMembers(SEED_MEMBERS)
        setLoading(false)
        return
      }
      if (data && data.length > 0) {
        setMembers(data.map(toMember))
      } else {
        // Seed the database on first run
        const rows = SEED_MEMBERS.map((m) => toRow(m))
        const { data: seeded, error: seedErr } = await supabase.from("members").insert(rows).select()
        if (seedErr) {
          console.error("Failed to seed members:", seedErr)
          setMembers(SEED_MEMBERS)
        } else if (seeded) {
          setMembers(seeded.map(toMember))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const addMember = useCallback(async (member: Member) => {
    const row = toRow(member)
    const { data, error } = await supabase.from("members").insert(row).select().single()
    if (error) {
      console.error("Failed to add member:", error)
      return
    }
    if (data) setMembers((prev) => [...prev, toMember(data)])
  }, [])

  const updateMember = useCallback(async (member: Member) => {
    const row = toRow(member)
    const { error } = await supabase.from("members").update(row).eq("id", member.id)
    if (error) {
      console.error("Failed to update member:", error)
      return
    }
    setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)))
  }, [])

  const deleteMember = useCallback(async (id: string) => {
    const { error } = await supabase.from("members").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete member:", error)
      return
    }
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const getMember = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  )

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    inactive: members.filter((m) => m.status === "inactive").length,
    alumni: members.filter((m) => m.status === "alumni").length,
  }

  return (
    <MembersContext.Provider value={{ members, addMember, updateMember, deleteMember, getMember, loading, stats }}>
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  const context = useContext(MembersContext)
  if (!context) throw new Error("useMembers must be used within a MembersProvider")
  return context
}
