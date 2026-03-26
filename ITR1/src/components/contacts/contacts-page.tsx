import { useState, useMemo, useCallback } from "react"
import { useSponsors } from "@/context/sponsors-context"
import { type InteractionType, TIER_CONFIG, INTERACTION_ICONS } from "@/components/external/types"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Mail,
  Phone,
  MessageSquarePlus,
  Building2,
  Calendar,
  Users,
  FileText,
} from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  Mail,
  Phone,
  Users,
  Calendar,
  FileText,
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function getColorBlock(name: string) {
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

export function ContactsPage() {
  const { sponsors, addInteraction } = useSponsors()
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  
  // Dialog state for logging interactions
  const [logOpen, setLogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<{id: string; name: string; sponsorId: string; company: string} | null>(null)
  const [formType, setFormType] = useState<InteractionType>("email")
  const [formSummary, setFormSummary] = useState("")

  const allContacts = useMemo(() => {
    return sponsors.flatMap(s => 
      s.contacts.map(c => ({
        ...c,
        sponsorId: s.id,
        company: s.company,
        tier: s.tier,
      }))
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [sponsors])

  const filtered = useMemo(() => {
    return allContacts.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = companyFilter === "all" || c.sponsorId === companyFilter
      return matchesSearch && matchesCompany
    })
  }, [allContacts, search, companyFilter])

  const companiesWithContacts = useMemo(() => {
    const map = new Map<string, string>()
    allContacts.forEach(c => map.set(c.sponsorId, c.company))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [allContacts])

  const handleOpenLog = (contact: any) => {
    setSelectedContact(contact)
    setFormType("email")
    setFormSummary("")
    setLogOpen(true)
  }

  const handleSaveLog = async () => {
    if (!selectedContact || !formSummary.trim()) return
    await addInteraction(selectedContact.sponsorId, {
      id: `i${Date.now()}`,
      type: formType,
      date: new Date().toISOString().split("T")[0],
      summary: formSummary.trim(),
      contactId: selectedContact.id
    })
    setLogOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Professional Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">Directory of all external contacts and sponsors</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contacts..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9 w-[250px]" 
            />
          </div>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companiesWithContacts.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-md">
          {filtered.length} Contacts
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Contact Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0", getColorBlock(contact.name))}>
                      {getInitials(contact.name)}
                    </div>
                    <div>
                      <span className="font-medium text-sm block">{contact.name}</span>
                      <span className="text-xs text-muted-foreground">{contact.title || "No Title"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{contact.company}</span>
                    <span className={cn("ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium border", TIER_CONFIG[contact.tier].bg)}>
                      {TIER_CONFIG[contact.tier].label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">{contact.email}</a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">{contact.phone}</a>
                      </div>
                    )}
                    {!contact.email && !contact.phone && <span className="text-sm text-muted-foreground italic">No contact info</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-2 hover:bg-primary/20 hover:text-primary"
                    onClick={() => handleOpenLog(contact)}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Log Activity
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium">Contacting: <span className="text-primary">{selectedContact?.name}</span></p>
              <p className="text-xs text-muted-foreground">from {selectedContact?.company}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Interaction Type</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as InteractionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INTERACTION_ICONS).map(([key, iconName]) => {
                    const Icon = ICON_MAP[iconName]
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{key}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Summary Notes</Label>
              <Input 
                value={formSummary} 
                onChange={(e) => setFormSummary(e.target.value)} 
                placeholder="e.g. Sent introductory email" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveLog} disabled={!formSummary.trim()}>Save Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
