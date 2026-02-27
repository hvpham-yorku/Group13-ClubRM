import React, { createContext, useContext, useState, useCallback } from "react"
import { type Member, SEED_MEMBERS } from "@/components/members/types"

interface MembersContextType {
  members: Member[]
  addMember: (member: Member) => void
  updateMember: (member: Member) => void
  deleteMember: (id: string) => void
  getMember: (id: string) => Member | undefined
  stats: {
    total: number
    active: number
    inactive: number
    alumni: number
  }
}

const MembersContext = createContext<MembersContextType | undefined>(undefined)

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS)

  const addMember = useCallback((member: Member) => {
    setMembers((prev) => [...prev, member])
  }, [])

  const updateMember = useCallback((member: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)))
  }, [])

  const deleteMember = useCallback((id: string) => {
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
    <MembersContext.Provider value={{ members, addMember, updateMember, deleteMember, getMember, stats }}>
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  const context = useContext(MembersContext)
  if (!context) throw new Error("useMembers must be used within a MembersProvider")
  return context
}
