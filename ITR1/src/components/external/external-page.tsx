import { useState, useMemo, useEffect, useCallback } from "react"
import { type Sponsor, type SponsorTier, type SponsorStatus, SEED_SPONSORS, TIER_CONFIG, STATUS_CONFIG, INDUSTRIES, formatCurrency } from "./types"
import { supabase } from "@/lib/supabase"
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
} from "lucide-react"

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

function toSponsor(row: Record<string, unknown>): Sponsor {
  return {
    id: row.id as string,
    company: row.company as string,
    logo: (row.logo as string) || undefined,
    tier: row.tier as SponsorTier,
    status: row.status as SponsorStatus,
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

export function ExternalPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [statusFilter] = useState<string>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [detailSponsor, setDetailSponsor] = useState<Sponsor | null>(null)

  // Add form
  const [formCompany, setFormCompany] = useState("")
  const [formTier, setFormTier] = useState<SponsorTier>("prospect")
  const [formAmount, setFormAmount] = useState("")
  const [formIndustry, setFormIndustry] = useState<string>(INDUSTRIES[0])
  const [formContactName, setFormContactName] = useState("")
  const [formContactEmail, setFormContactEmail] = useState("")
  const [formContactTitle, setFormContactTitle] = useState("")
  const [formNotes, setFormNotes] = useState("")

  const filtered = useMemo(() => {
    return sponsors.filter((s) => {
      const matchesSearch = !search || s.company.toLowerCase().includes(search.toLowerCase()) || s.industry.toLowerCase().includes(search.toLowerCase())
      const matchesTier = tierFilter === "all" || s.tier === tierFilter
      const matchesStatus = statusFilter === "all" || s.status === statusFilter
      return matchesSearch && matchesTier && matchesStatus
    })
  }, [sponsors, search, tierFilter, statusFilter])

  const totalRevenue = sponsors.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0)
  const activeCount = sponsors.filter((s) => s.status === "active").length
  const prospectCount = sponsors.filter((s) => s.status === "prospect").length
  const pipelineValue = sponsors.filter((s) => s.status === "prospect" || s.status === "pending").reduce((sum, s) => sum + s.amount, 0)

  function resetForm() {
    setFormCompany("")
    setFormTier("prospect")
    setFormAmount("")
    setFormIndustry(INDUSTRIES[0])
    setFormContactName("")
    setFormContactEmail("")
    setFormContactTitle("")
    setFormNotes("")
  }

  // Load sponsors from Supabase
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // FIX: Inline the reset logic directly inside handleAdd instead of calling resetForm(),
  // which was a stale closure reference not included in the dependency array.
  const handleAdd = useCallback(async () => {
    if (!formCompany.trim()) return
    const newSponsor: Sponsor = {
      id: `s${Date.now()}`,
      company: formCompany.trim(),
      tier: formTier,
      status: formTier === "prospect" ? "prospect" : "pending",
      amount: Number(formAmount) || 0,
      startDate: new Date().toISOString().split("T")[0],
      industry: formIndustry,
      notes: formNotes.trim() || undefined,
      contacts: formContactName.trim()
        ? [{ id: `c${Date.now()}`, name: formContactName.trim(), title: formContactTitle.trim(), email: formContactEmail.trim(), phone: "" }]
        : [],
      interactions: [],
    }
    const row = toRow(newSponsor)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.from("sponsors").insert(row as any).select().single()
    if (error) {
      console.error("Failed to add sponsor:", error)
      return
    }
    if (data) setSponsors((prev) => [...prev, toSponsor(data)])
    setFormCompany("")
    setFormTier("prospect")
    setFormAmount("")
    setFormIndustry(INDUSTRIES[0])
    setFormContactName("")
    setFormContactEmail("")
    setFormContactTitle("")
    setFormNotes("")
    setAddOpen(false)
  }, [formCompany, formTier, formAmount, formIndustry, formNotes, formContactName, formContactTitle, formContactEmail])

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("sponsors").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete sponsor:", error)
      return
    }
    setSponsors((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // Pipeline view — group by status
  const pipeline: { status: SponsorStatus; sponsors: Sponsor[] }[] = [
    { status: "prospect", sponsors: filtered.filter((s) => s.status === "prospect") },
    { status: "pending", sponsors: filtered.filter((s) => s.status === "pending") },
    { status: "active", sponsors: filtered.filter((s) => s.status === "active") },
    { status: "churned", sponsors: filtered.filter((s) => s.status === "churned") },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sponsorship & Partnerships</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage sponsor relationships, track pipeline, and log interactions</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Active Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">{activeCount} active sponsors</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pipeline</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(pipelineValue)}</p>
          <p className="text-xs text-muted-foreground">{prospectCount} prospects</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Crown className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Top Tier</span>
          </div>
          <p className="text-2xl font-bold">{sponsors.filter((s) => s.tier === "platinum" || s.tier === "gold").length}</p>
          <p className="text-xs text-muted-foreground">Platinum & Gold</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-pink-400">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Interactions</span>
          </div>
          <p className="text-2xl font-bold">{sponsors.reduce((sum, s) => sum + s.interactions.length, 0)}</p>
          <p className="text-xs text-muted-foreground">Total logged</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="interactions">Recent Activity</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search sponsors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[200px]" />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pipeline View */}
        <TabsContent value="pipeline">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map(({ status, sponsors: groupSponsors }) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className={cn("inline-block h-2 w-2 rounded-full", STATUS_CONFIG[status].color.split(" ")[0])} />
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <span className="text-xs text-muted-foreground">{groupSponsors.length}</span>
                </div>
                <div className="space-y-2">
                  {groupSponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="bg-card border border-border/50 rounded-lg p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                      onClick={() => setDetailSponsor(sponsor)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", getCompanyColor(sponsor.company))}>
                          {getCompanyInitials(sponsor.company)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{sponsor.company}</h4>
                          <p className="text-xs text-muted-foreground">{sponsor.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", TIER_CONFIG[sponsor.tier].bg)}>
                          {TIER_CONFIG[sponsor.tier].label}
                        </span>
                        {sponsor.amount > 0 && (
                          <span className="text-xs font-medium text-emerald-400">{formatCurrency(sponsor.amount)}</span>
                        )}
                      </div>
                      {sponsor.interactions.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-2 truncate">
                          Last: {sponsor.interactions[0].summary}
                        </p>
                      )}
                    </div>
                  ))}
                  {groupSponsors.length === 0 && (
                    <div className="border border-dashed border-border/50 rounded-lg p-6 text-center text-xs text-muted-foreground">
                      No sponsors
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Directory View */}
        <TabsContent value="directory">
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Company</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sponsor) => (
                  <TableRow key={sponsor.id} className="cursor-pointer" onClick={() => setDetailSponsor(sponsor)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0", getCompanyColor(sponsor.company))}>
                          {getCompanyInitials(sponsor.company)}
                        </div>
                        <span className="font-medium text-sm">{sponsor.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", TIER_CONFIG[sponsor.tier].bg)}>
                        {TIER_CONFIG[sponsor.tier].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_CONFIG[sponsor.status].color)}>
                        {STATUS_CONFIG[sponsor.status].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{sponsor.industry}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{sponsor.amount > 0 ? formatCurrency(sponsor.amount) : "—"}</TableCell>
                    <TableCell className="text-sm">{sponsor.contacts[0]?.name || "—"}</TableCell>
                    <TableCell className="text-sm">{sponsor.interactions.length}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailSponsor(sponsor) }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(sponsor.id) }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="interactions">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="space-y-1">
              {sponsors
                .flatMap((s) => s.interactions.map((i) => ({ ...i, company: s.company, sponsorId: s.id })))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 20)
                .map((interaction) => (
                  <div key={interaction.id} className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
                      {INTERACTION_ICON_MAP[interaction.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{interaction.company}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground capitalize">{interaction.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{interaction.summary}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{interaction.date}</span>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Sponsor Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Sponsor</DialogTitle></DialogHeader>
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
                <Input value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0" type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={formIndustry} onValueChange={setFormIndustry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}
                </SelectContent>
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
            <Button variant="outline" onClick={() => { resetForm(); setAddOpen(false) }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formCompany.trim()}>Add Sponsor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsor Detail Dialog */}
      <Dialog open={!!detailSponsor} onOpenChange={() => setDetailSponsor(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailSponsor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold", getCompanyColor(detailSponsor.company))}>
                    {getCompanyInitials(detailSponsor.company)}
                  </div>
                  <div>
                    <span>{detailSponsor.company}</span>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5">{detailSponsor.industry}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", TIER_CONFIG[detailSponsor.tier].bg)}>
                    {TIER_CONFIG[detailSponsor.tier].label}
                  </span>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", STATUS_CONFIG[detailSponsor.status].color)}>
                    {STATUS_CONFIG[detailSponsor.status].label}
                  </span>
                  {detailSponsor.amount > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/20 text-emerald-400">
                      {formatCurrency(detailSponsor.amount)}
                    </span>
                  )}
                </div>

                {detailSponsor.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{detailSponsor.notes}</p>
                )}

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium mt-0.5">{detailSponsor.startDate}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="font-medium mt-0.5">{detailSponsor.endDate || "Ongoing"}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Interactions</p>
                    <p className="font-medium mt-0.5">{detailSponsor.interactions.length}</p>
                  </div>
                </div>

                {/* Contacts */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contacts</h4>
                  <div className="space-y-2">
                    {detailSponsor.contacts.map((contact) => (
                      <div key={contact.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`mailto:${contact.email}`} className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interaction Timeline */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Interaction History</h4>
                  <div className="space-y-1">
                    {detailSponsor.interactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((interaction) => (
                        <div key={interaction.id} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                          <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                            {INTERACTION_ICON_MAP[interaction.type]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{interaction.summary}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{interaction.type} &middot; {interaction.date}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}