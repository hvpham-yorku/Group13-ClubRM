import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { type Sponsor, type SponsorContact, type Interaction, SEED_SPONSORS } from "@/components/external/types"
import { supabase } from "@/lib/supabase"

function toSponsor(row: Record<string, unknown>): Sponsor {
  return {
    id: row.id as string,
    company: row.company as string,
    logo: (row.logo as string) || undefined,
    tier: row.tier as Sponsor["tier"],
    status: row.status as Sponsor["status"],
    amount: Number(row.amount),
    startDate: row.start_date as string,
    endDate: (row.end_date as string) || undefined,
    contacts: (row.contacts as Sponsor["contacts"]) || [],
    interactions: (row.interactions as Sponsor["interactions"]) || [],
    notes: (row.notes as string) || undefined,
    industry: row.industry as string,
  }
}

function toRow(s: Sponsor) {
  return {
    company: s.company,
    logo: s.logo || null,
    tier: s.tier,
    status: s.status,
    amount: s.amount,
    start_date: s.startDate,
    end_date: s.endDate || null,
    contacts: JSON.parse(JSON.stringify(s.contacts)),
    interactions: JSON.parse(JSON.stringify(s.interactions)),
    notes: s.notes || null,
    industry: s.industry,
  }
}

interface SponsorsContextType {
  sponsors: Sponsor[]
  addSponsor: (sponsor: Sponsor) => Promise<void>
  updateSponsor: (sponsor: Sponsor) => Promise<void>
  deleteSponsor: (id: string) => Promise<void>
  addContact: (sponsorId: string, contact: SponsorContact) => Promise<void>
  updateContact: (sponsorId: string, contact: SponsorContact) => Promise<void>
  addInteraction: (sponsorId: string, interaction: Interaction) => Promise<void>
}

const SponsorsContext = createContext<SponsorsContextType | undefined>(undefined)

export function SponsorsProvider({ children }: { children: React.ReactNode }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("sponsors").select("*").order("created_at", { ascending: true })
      if (error) {
        console.error("Failed to load sponsors:", error)
        setSponsors(SEED_SPONSORS)
        return
      }
      if (data && data.length > 0) {
        setSponsors(data.map(toSponsor))
      } else {
        const rows = SEED_SPONSORS.map(toRow)
        const { data: seeded, error: seedErr } = await supabase.from("sponsors").insert(rows as any).select()
        if (seedErr) {
          console.error("Failed to seed sponsors:", seedErr)
          setSponsors(SEED_SPONSORS)
        } else if (seeded) {
          setSponsors(seeded.map(toSponsor))
        }
      }
    }
    load()
  }, [])

  const addSponsor = useCallback(async (sponsor: Omit<Sponsor, "id"> & { id?: string }) => {
    // If no ID is provided, Supabase usually handles it if DB generates UUIDs,
    // but the types say id is string.
    const row = toRow(sponsor as Sponsor)
    // if UI gave an id like s2344 we keep it, otherwise omit mapping ID if DB generates it
    const payload = sponsor.id ? { id: sponsor.id, ...row } : row
    
    const { data, error } = await supabase.from("sponsors").insert(payload as any).select().single()
    if (error) {
      console.error("Failed to add sponsor:", error)
      return
    }
    if (data) setSponsors((prev) => [...prev, toSponsor(data)])
  }, [])

  const updateSponsor = useCallback(async (sponsor: Sponsor) => {
    const row = toRow(sponsor)
    const { error } = await supabase.from("sponsors").update(row as any).eq("id", sponsor.id)
    if (error) {
      console.error("Failed to update sponsor:", error)
      return
    }
    setSponsors((prev) => prev.map((s) => (s.id === sponsor.id ? sponsor : s)))
  }, [])

  const deleteSponsor = useCallback(async (id: string) => {
    const { error } = await supabase.from("sponsors").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete sponsor:", error)
      return
    }
    setSponsors((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addContact = useCallback(async (sponsorId: string, contact: SponsorContact) => {
    const sponsor = sponsors.find(s => s.id === sponsorId)
    if (!sponsor) return
    const updatedSponsor = { ...sponsor, contacts: [...sponsor.contacts, contact] }
    await updateSponsor(updatedSponsor)
  }, [sponsors, updateSponsor])

  const updateContact = useCallback(async (sponsorId: string, contact: SponsorContact) => {
    const sponsor = sponsors.find(s => s.id === sponsorId)
    if (!sponsor) return
    const updatedSponsor = { 
      ...sponsor, 
      contacts: sponsor.contacts.map(c => c.id === contact.id ? contact : c) 
    }
    await updateSponsor(updatedSponsor)
  }, [sponsors, updateSponsor])

  const addInteraction = useCallback(async (sponsorId: string, interaction: Interaction) => {
    const sponsor = sponsors.find(s => s.id === sponsorId)
    if (!sponsor) return
    const updatedSponsor = { ...sponsor, interactions: [interaction, ...sponsor.interactions] }
    await updateSponsor(updatedSponsor)
  }, [sponsors, updateSponsor])

  return (
    <SponsorsContext.Provider
      value={{
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        addContact,
        updateContact,
        addInteraction,
      }}
    >
      {children}
    </SponsorsContext.Provider>
  )
}

export function useSponsors() {
  const context = useContext(SponsorsContext)
  if (context === undefined) {
    throw new Error("useSponsors must be used within a SponsorsProvider")
  }
  return context
}
