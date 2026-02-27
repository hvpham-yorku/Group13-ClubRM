export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "prospect"
export type SponsorStatus = "active" | "pending" | "churned" | "prospect"
export type InteractionType = "email" | "call" | "meeting" | "event" | "proposal"

export interface SponsorContact {
  id: string
  name: string
  title: string
  email: string
  phone: string
}

export interface Interaction {
  id: string
  type: InteractionType
  date: string
  summary: string
  contactId: string
}

export interface Sponsor {
  id: string
  company: string
  logo?: string
  tier: SponsorTier
  status: SponsorStatus
  amount: number
  startDate: string
  endDate?: string
  contacts: SponsorContact[]
  interactions: Interaction[]
  notes?: string
  industry: string
}

export const TIER_CONFIG: Record<SponsorTier, { label: string; color: string; bg: string }> = {
  platinum: { label: "Platinum", color: "text-slate-300", bg: "bg-slate-300/20 border-slate-300/30" },
  gold: { label: "Gold", color: "text-amber-400", bg: "bg-amber-400/20 border-amber-400/30" },
  silver: { label: "Silver", color: "text-slate-400", bg: "bg-slate-400/20 border-slate-400/30" },
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/20 border-orange-400/30" },
  prospect: { label: "Prospect", color: "text-blue-400", bg: "bg-blue-400/20 border-blue-400/30" },
}

export const STATUS_CONFIG: Record<SponsorStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400" },
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-400" },
  churned: { label: "Churned", color: "bg-red-500/20 text-red-400" },
  prospect: { label: "Prospect", color: "bg-blue-500/20 text-blue-400" },
}

export const INTERACTION_ICONS: Record<InteractionType, string> = {
  email: "Mail",
  call: "Phone",
  meeting: "Users",
  event: "Calendar",
  proposal: "FileText",
}

export const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Consulting",
  "Food & Beverage",
  "Retail",
  "Media & Entertainment",
  "Healthcare",
  "Education",
  "Non-Profit",
  "Other",
] as const

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0 }).format(amount)
}

export const SEED_SPONSORS: Sponsor[] = [
  {
    id: "s1",
    company: "TechNova Solutions",
    tier: "platinum",
    status: "active",
    amount: 5000,
    startDate: "2025-09-01",
    endDate: "2026-08-31",
    industry: "Technology",
    notes: "Interested in co-hosting a hackathon in Winter 2026.",
    contacts: [
      { id: "c1", name: "Jennifer Wu", title: "Campus Relations Manager", email: "j.wu@technova.com", phone: "(416) 555-1001" },
      { id: "c2", name: "Raj Patel", title: "VP Marketing", email: "r.patel@technova.com", phone: "(416) 555-1002" },
    ],
    interactions: [
      { id: "i1", type: "meeting", date: "2026-02-10", summary: "Discussed hackathon sponsorship details and brand placement.", contactId: "c1" },
      { id: "i2", type: "email", date: "2026-02-05", summary: "Sent sponsorship renewal proposal for 2026-27.", contactId: "c1" },
      { id: "i3", type: "call", date: "2026-01-20", summary: "Initial check-in for new term.", contactId: "c2" },
    ],
  },
  {
    id: "s2",
    company: "MapleLeaf Capital",
    tier: "gold",
    status: "active",
    amount: 3000,
    startDate: "2025-10-01",
    endDate: "2026-09-30",
    industry: "Finance & Banking",
    contacts: [
      { id: "c3", name: "Michael Torres", title: "Community Engagement Lead", email: "m.torres@maplecap.ca", phone: "(416) 555-2001" },
    ],
    interactions: [
      { id: "i4", type: "event", date: "2026-01-25", summary: "Attended our Finance Workshop as guest speaker.", contactId: "c3" },
      { id: "i5", type: "email", date: "2026-01-10", summary: "Confirmed speaking slot for Finance Workshop.", contactId: "c3" },
    ],
  },
  {
    id: "s3",
    company: "ByteCraft Studios",
    tier: "silver",
    status: "active",
    amount: 1500,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    industry: "Technology",
    contacts: [
      { id: "c4", name: "Anna Schmidt", title: "HR Director", email: "a.schmidt@bytecraft.io", phone: "(647) 555-3001" },
    ],
    interactions: [
      { id: "i6", type: "proposal", date: "2025-12-15", summary: "Sent silver tier sponsorship proposal.", contactId: "c4" },
      { id: "i7", type: "meeting", date: "2025-12-01", summary: "Coffee chat to introduce our club.", contactId: "c4" },
    ],
  },
  {
    id: "s4",
    company: "Campus Eats Co.",
    tier: "bronze",
    status: "active",
    amount: 750,
    startDate: "2025-09-01",
    endDate: "2026-04-30",
    industry: "Food & Beverage",
    contacts: [
      { id: "c5", name: "Derek Chan", title: "Owner", email: "derek@campuseats.ca", phone: "(416) 555-4001" },
    ],
    interactions: [
      { id: "i8", type: "email", date: "2026-02-01", summary: "Arranged catering discount for Valentine Social event.", contactId: "c5" },
    ],
  },
  {
    id: "s5",
    company: "Innovate Consulting",
    tier: "prospect",
    status: "prospect",
    amount: 0,
    startDate: "2026-02-15",
    industry: "Consulting",
    notes: "Warm lead from LinkedIn. Interested in recruiting pipeline.",
    contacts: [
      { id: "c6", name: "Samantha Green", title: "Talent Acquisition", email: "s.green@innovateconsulting.ca", phone: "(905) 555-5001" },
    ],
    interactions: [
      { id: "i9", type: "email", date: "2026-02-15", summary: "Cold outreach introducing the club and sponsorship tiers.", contactId: "c6" },
    ],
  },
  {
    id: "s6",
    company: "UrbanPrint Media",
    tier: "gold",
    status: "churned",
    amount: 2500,
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    industry: "Media & Entertainment",
    notes: "Budget cuts caused them to drop sponsorship. Keep warm for future.",
    contacts: [
      { id: "c7", name: "Karen Osei", title: "Partnerships Manager", email: "k.osei@urbanprint.ca", phone: "(416) 555-6001" },
    ],
    interactions: [
      { id: "i10", type: "call", date: "2025-07-10", summary: "Informed us they won't renew due to internal budget cuts.", contactId: "c7" },
    ],
  },
]
