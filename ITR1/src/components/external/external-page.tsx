import React, { useState, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useSponsors } from "@/context/sponsors-context"
import { 
  type Sponsor, 
  type SponsorTier, 
  type SponsorStatus, 
  TIER_CONFIG, 
  STATUS_CONFIG, 
  INDUSTRIES, 
  formatCurrency 
} from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  MoreHorizontal,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  FileText,
  Crown,
  MessageSquare,
  Edit,
  Activity,
  ChevronRight
} from "lucide-react"

// --- Helper Functions ---
function getCompanyInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function getCompanyColor(name: string) {
  const colors = [
    "bg-rose-500/20 text-rose-400",
    "bg-orange-500/20 text-orange-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-cyan-500/20 text-cyan-400",
    "bg-blue-500/20 text-blue-400",
    "bg-violet-500/20 text-violet-400",
    "bg-pink-500/20 text-pink-400",
  ]
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[idx % colors.length]
}

const INTERACTION_ICON_MAP: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  meeting: <Users className="h-3.5 w-3.5" />,
  event: <Calendar className="h-3.5 w-3.5" />,
  proposal: <FileText className="h-3.5 w-3.5" />,
}

export function ExternalPage() {
  const { sponsors, addSponsor, updateSponsor, deleteSponsor } = useSponsors()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") || ""
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("pipeline")
  
  const [addOpen, setAddOpen] = useState(false)
  const [detailSponsor, setDetailSponsor] = useState<Sponsor | null>(null)
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null)

  // Form State
  const [formCompany, setFormCompany] = useState("")
  const [formTier, setFormTier] = useState<SponsorTier>("prospect")
  const [formAmount, setFormAmount] = useState("")
  const [formIndustry, setFormIndustry] = useState<string>(INDUSTRIES[0])
  const [formContactName, setFormContactName] = useState("")
  const [formContactEmail, setFormContactEmail] = useState("")
  const [formContactTitle, setFormContactTitle] = useState("")
  const [formNotes, setFormNotes] = useState("")

  // Filter logic
  const filtered = useMemo(() => {
    return sponsors.filter((s) => {
      const matchesSearch = !search || s.company.toLowerCase().includes(search.toLowerCase()) || s.industry.toLowerCase().includes(search.toLowerCase())
      const matchesTier = tierFilter === "all" || s.tier === tierFilter
      return matchesSearch && matchesTier
    })
  }, [sponsors, search, tierFilter])

  // Stats
  const stats = useMemo(() => ({
    totalRevenue: sponsors.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0),
    activeCount: sponsors.filter((s) => s.status === "active").length,
    prospectCount: sponsors.filter((s) => s.status === "prospect").length,
    pipelineValue: sponsors.filter((s) => s.status === "prospect" || s.status === "pending").reduce((sum, s) => sum + s.amount, 0),
    topTier: sponsors.filter((s) => s.tier === "platinum" || s.tier === "gold").length,
    totalInteractions: sponsors.reduce((sum, s) => sum + s.interactions.length, 0)
  }), [sponsors])

  const pipeline: { status: SponsorStatus; sponsors: Sponsor[] }[] = [
    { status: "prospect", sponsors: filtered.filter((s) => s.status === "prospect") },
    { status: "pending", sponsors: filtered.filter((s) => s.status === "pending") },
    { status: "active", sponsors: filtered.filter((s) => s.status === "active") },
    { status: "churned", sponsors: filtered.filter((s) => s.status === "churned") },
  ]

  // Actions
  function resetForm() {
    setFormCompany(""); setFormTier("prospect"); setFormAmount(""); setFormIndustry(INDUSTRIES[0])
    setFormContactName(""); setFormContactEmail(""); setFormContactTitle(""); setFormNotes("")
    setEditingSponsorId(null)
  }

  const handleSave = useCallback(async () => {
    if (!formCompany.trim()) return

    const now = new Date().toISOString()

    if (editingSponsorId) {
      const existing = sponsors.find((s) => s.id === editingSponsorId)
      if (existing) {
        let updatedContacts = existing.contacts
        if (formContactName.trim()) {
          const newContact = { 
            id: existing.contacts[0]?.id || `c${Date.now()}`, 
            name: formContactName.trim(), 
            title: formContactTitle.trim(), 
            email: formContactEmail.trim(), 
            phone: existing.contacts[0]?.phone || "",
            organization: formCompany.trim(),
            tags: existing.contacts[0]?.tags || [],
            createdAt: existing.contacts[0]?.createdAt || now
          }
          updatedContacts = existing.contacts.length > 0 
            ? [newContact, ...existing.contacts.slice(1)] 
            : [newContact]
        }

        await updateSponsor({
          ...existing,
          company: formCompany.trim(),
          tier: formTier,
          amount: Number(formAmount) || 0,
          industry: formIndustry,
          notes: formNotes.trim() || undefined,
          contacts: updatedContacts,
          status: existing.status === formTier ? existing.status : (formTier === "prospect" ? "prospect" : existing.status)
        })
      }
    } else {
      await addSponsor({
        id: `s${Date.now()}`,
        company: formCompany.trim(),
        tier: formTier,
        status: formTier === "prospect" ? "prospect" : "pending",
        amount: Number(formAmount) || 0,
        startDate: now.split("T")[0],
        industry: formIndustry,
        notes: formNotes.trim() || undefined,
        contacts: formContactName.trim() ? [{ 
          id: `c${Date.now()}`, 
          name: formContactName.trim(), 
          title: formContactTitle.trim(), 
          email: formContactEmail.trim(), 
          phone: "",
          organization: formCompany.trim(),
          tags: [],
          createdAt: now
        }] : [],
        interactions: [],
      })
    }
    resetForm(); setAddOpen(false)
  }, [formCompany, formTier, formAmount, formIndustry, formNotes, formContactName, formContactTitle, formContactEmail, editingSponsorId, sponsors, updateSponsor, addSponsor])

  return (
    <div className="flex flex-col gap-6 p-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#FF8A8A]">Sponsorships</h1>
          <p className="text-sm text-muted-foreground">Manage partner relationships and pipeline</p>
        </div>
        <button 
          onClick={() => { resetForm(); setAddOpen(true) }}
          className="bg-[#FF8A8A] text-white px-4 py-2 rounded-md font-bold hover:opacity-90 flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Sponsor
        </button>
      </div>

      {/* 2. Toolbar */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-md border border-border/50 self-start">
            {[
              { id: "pipeline", label: "Pipeline", icon: <TrendingUp className="h-4 w-4" /> },
              { id: "directory", label: "Directory", icon: <Users className="h-4 w-4" /> },
              { id: "interactions", label: "Activity", icon: <Activity className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearchParams({ search: e.target.value })} 
                className="pl-9 w-[180px] md:w-[240px] bg-background" 
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Revenue" value={formatCurrency(stats.totalRevenue)} sub={`${stats.activeCount} active`} icon={<DollarSign />} color="text-emerald-400" />
        <StatCard title="Pipeline" value={formatCurrency(stats.pipelineValue)} sub={`${stats.prospectCount} prospects`} icon={<TrendingUp />} color="text-blue-400" />
        <StatCard title="Top Tier" value={stats.topTier} sub="Platinum & Gold" icon={<Crown />} color="text-amber-400" />
        <StatCard title="Interactions" value={stats.totalInteractions} sub="Total logged" icon={<MessageSquare />} color="text-pink-400" />
      </div>

      {/* 4. Content */}
      <div className="mt-2">
        {activeTab === "pipeline" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map(({ status, sponsors: groupSponsors }) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[status].color.split(" ")[0])} />
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 rounded">{groupSponsors.length}</span>
                </div>
                <div className="space-y-2">
                  {groupSponsors.map((sponsor) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} onClick={() => setDetailSponsor(sponsor)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "directory" && (
           <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
             <Table>
               <TableHeader className="bg-muted/50">
                 <TableRow>
                   <TableHead className="font-bold">Company</TableHead>
                   <TableHead className="font-bold">Tier</TableHead>
                   <TableHead className="font-bold">Status</TableHead>
                   <TableHead className="text-right font-bold">Amount</TableHead>
                   <TableHead className="w-[50px]"></TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filtered.map((sponsor) => (
                   <TableRow key={sponsor.id} className="cursor-pointer group" onClick={() => setDetailSponsor(sponsor)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold", getCompanyColor(sponsor.company))}>
                            {getCompanyInitials(sponsor.company)}
                          </div>
                          <span className="font-medium">{sponsor.company}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", TIER_CONFIG[sponsor.tier].bg)}>
                           {TIER_CONFIG[sponsor.tier].label}
                         </span>
                      </TableCell>
                      <TableCell>
                         <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", STATUS_CONFIG[sponsor.status].color)}>
                           {STATUS_CONFIG[sponsor.status].label}
                         </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(sponsor.amount)}</TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
        )}

        {activeTab === "interactions" && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {sponsors
                .flatMap((s) => s.interactions.map((i) => ({ ...i, company: s.company, sponsorId: s.id })))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 15)
                .map((item) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      {INTERACTION_ICON_MAP[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.company}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold tracking-tighter">{item.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.summary}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{item.date}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingSponsorId ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input value={formCompany} onChange={(e) => setFormCompany(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={formTier} onValueChange={(v) => setFormTier(v as SponsorTier)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (CAD)</Label>
                  <Input value={formAmount} onChange={(e) => setFormAmount(e.target.value)} type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={formIndustry} onValueChange={setFormIndustry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="border-t border-border/30 pt-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Primary Contact (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formContactName} onChange={(e) => setFormContactName(e.target.value)} placeholder="Contact name" />
                  <Input value={formContactTitle} onChange={(e) => setFormContactTitle(e.target.value)} placeholder="Title" />
                </div>
                <Input value={formContactEmail} onChange={(e) => setFormContactEmail(e.target.value)} placeholder="Email" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Any additional notes..." />
              </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
               <Button onClick={handleSave} className="bg-[#FF8A8A] hover:opacity-90">Save Sponsor</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Internal Components ---

function StatCard({ title, value, sub, icon, color }: any) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1 hover:bg-muted/20 transition-colors shadow-sm">
      <div className={cn("flex items-center gap-2", color)}>
        {React.cloneElement(icon, { className: "h-4 w-4" })}
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium">{sub}</p>
    </div>
  )
}

function SponsorCard({ sponsor, onClick }: { sponsor: Sponsor, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border/50 rounded-lg p-4 hover:border-[#FF8A8A]/50 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", getCompanyColor(sponsor.company))}>
          {getCompanyInitials(sponsor.company)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate group-hover:text-[#FF8A8A] transition-colors">{sponsor.company}</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">{sponsor.industry}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold border", TIER_CONFIG[sponsor.tier].bg)}>
          {TIER_CONFIG[sponsor.tier].label}
        </span>
        <span className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(sponsor.amount)}</span>
      </div>
    </div>
  )
}