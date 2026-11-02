base='ITR1/src/components/marketing/'
def edit(fn, pairs):
    p=base+fn
    s=open(p,encoding='utf-8').read()
    for a,b in pairs:
        assert s.count(a)==1,(fn,a,s.count(a))
        s=s.replace(a,b)
    open(p,'w',encoding='utf-8').write(s)

edit('types.ts',[
('''  engagement: number
  tags: string[]
}

export interface Post {''','''  engagement: number
  tags: string[]
  /** ISO timestamps from the DB (campaigns.created_at / updated_at). */
  createdAt?: string
  updatedAt?: string
}

export interface Post {'''),
('''export const SEED_CAMPAIGNS: Campaign[] = [''','''/**
 * Sample data for tests / storybook only. The app no longer seeds this into
 * the database from the client.
 */
export const SEED_CAMPAIGNS: Campaign[] = ['''),
])

# ---- add-campaign-dialog: support edit mode + status
edit('add-campaign-dialog.tsx',[
('''import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
''','''import {
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
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "./types"
'''),
('''  onAdd: () => void
  onReset: () => void
}''','''  onAdd: () => void
  onReset: () => void
  /** "edit" changes the title / submit label. Defaults to "create". */
  mode?: "create" | "edit"
  /** When provided, a status selector is shown (used when editing). */
  formStatus?: CampaignStatus
  onFormStatusChange?: (value: CampaignStatus) => void
  saving?: boolean
  error?: string | null
}'''),
('''  onAdd,
  onReset,
}: AddCampaignDialogProps) {''','''  onAdd,
  onReset,
  mode = "create",
  formStatus,
  onFormStatusChange,
  saving = false,
  error,
}: AddCampaignDialogProps) {'''),
('''<DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>''','''<DialogHeader><DialogTitle>{mode === "edit" ? "Edit Campaign" : "New Campaign"}</DialogTitle></DialogHeader>'''),
('''            <Input type="number" value={formBudget} onChange={(e) => onFormBudgetChange(e.target.value)} placeholder="0" />
          </div>
        </div>''','''            <Input type="number" min="0" value={formBudget} onChange={(e) => onFormBudgetChange(e.target.value)} placeholder="0" />
          </div>
          {formStatus && onFormStatusChange && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={(v) => onFormStatusChange(v as CampaignStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CAMPAIGN_STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">{error}</p>
          )}
        </div>'''),
('''          <Button onClick={onAdd} disabled={!formName.trim()}>Create Campaign</Button>''','''          <Button onClick={onAdd} disabled={!formName.trim() || saving}>
            {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Campaign"}
          </Button>'''),
])

# ---- detail dialog: edit / delete actions
edit('campaign-detail-dialog.tsx',[
('''import { formatNumber } from "./types"
''','''import { formatNumber } from "./types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
'''),
('''  } | null
}''','''  } | null
  /** Omit to hide (e.g. user lacks marketing.write). */
  onEdit?: () => void
  onDelete?: () => void
}'''),
('''export function CampaignDetailDialog({ open, onOpenChange, campaign }: CampaignDetailDialogProps) {''','''export function CampaignDetailDialog({ open, onOpenChange, campaign, onEdit, onDelete }: CampaignDetailDialogProps) {'''),
('''            </div>
          </div>
        </div>
      </DialogContent>''','''            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2 pt-2">
              {onEdit && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>'''),
])

# ---- marketing page
p=base+'marketing-page.tsx'
s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a,s.count(a))
    s=s.replace(a,b)
rep('''  SEED_CAMPAIGNS, 
''','')
rep('''import { supabase } from "@/lib/supabase"
''','''import { supabase } from "@/lib/supabase"
import { useRole } from "@/context/role-context"
import { hasPermission } from "@/lib/permissions"
import { formatDistanceToNow } from "date-fns"
''')
rep('''    tags: (row.tags as string[]) || [],
  }
}''','''    tags: (row.tags as string[]) || [],
    createdAt: (row.created_at as string) || undefined,
    updatedAt: (row.updated_at as string) || undefined,
  }
}

type FeedEntry = { id: string; campaign: Campaign; kind: "created" | "updated"; at: Date }

/** Activity feed derived from real campaign timestamps (no fabricated entries). */
function buildFeed(campaigns: Campaign[]): FeedEntry[] {
  const entries: FeedEntry[] = []
  for (const c of campaigns) {
    const created = c.createdAt ? new Date(c.createdAt) : null
    const updated = c.updatedAt ? new Date(c.updatedAt) : null
    if (created && !Number.isNaN(created.getTime())) {
      entries.push({ id: `${c.id}-created`, campaign: c, kind: "created", at: created })
    }
    // Only count as an edit if updated_at is meaningfully later than created_at
    if (updated && !Number.isNaN(updated.getTime()) && (!created || updated.getTime() - created.getTime() > 1000)) {
      entries.push({ id: `${c.id}-updated`, campaign: c, kind: "updated", at: updated })
    }
  }
  return entries.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 25)
}''')
rep('''  const [addOpen, setAddOpen] = useState(false)  // ← new
''','''  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formStatus, setFormStatus] = useState<CampaignStatus>("draft")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { role } = useRole()
  // UI gating only — RLS on `campaigns` is the real enforcement.
  const canWrite = hasPermission(role, "marketing.write")
''')
rep('''  function resetForm() {  // ← new
    setFormName("")
    setFormDesc("")
    setFormBudget("")
    setFormStart("")
    setFormEnd("")
  }''','''  function resetForm() {
    setFormName("")
    setFormDesc("")
    setFormBudget("")
    setFormStart("")
    setFormEnd("")
    setFormStatus("draft")
    setEditingId(null)
    setFormError(null)
  }''')
rep('''    async function load() {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: true })
      if (error) {
        logError("Failed to load campaigns", 'MarketingPage', error)
        setCampaigns(SEED_CAMPAIGNS)
        return
      }
      if (data && data.length > 0) {
        setCampaigns(data.map(toCampaign))
      } else {
        const rows = SEED_CAMPAIGNS.map(toRow)
        const { data: seeded, error: seedErr } = await supabase.from("campaigns").insert(rows).select()
        if (seedErr) {
          logError("Failed to seed campaigns", 'MarketingPage', seedErr)
          setCampaigns(SEED_CAMPAIGNS)
        } else if (seeded) {
          setCampaigns(seeded.map(toCampaign))
        }
      }
    }
    load()
  }, [])''','''    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: true })
      if (cancelled) return
      if (error) {
        logError("Failed to load campaigns", 'MarketingPage', error)
        setLoadError(error.message || "Failed to load campaigns.")
        setCampaigns([])
      } else {
        setLoadError(null)
        setCampaigns((data ?? []).map((r) => toCampaign(r as Record<string, unknown>)))
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])''')
old_start=s.index('''  // ← new: ported directly from old code''')
old_end=s.index('''  const filtered = useMemo(() => {''')
s=s[:old_start]+'''  function openCreate() {
    resetForm()
    setAddOpen(true)
  }

  function openEdit(c: Campaign) {
    setEditingId(c.id)
    setFormName(c.name)
    setFormDesc(c.description ?? "")
    setFormBudget(String(c.budget ?? ""))
    setFormStart(c.startDate ?? "")
    setFormEnd(c.endDate ?? "")
    setFormStatus(c.status)
    setFormError(null)
    setSelectedCampaign(null)
    setAddOpen(true)
  }

  const handleSave = useCallback(async () => {
    if (!canWrite || !formName.trim()) return
    const startDate = formStart || new Date().toISOString().split("T")[0]
    const endDate = formEnd || startDate
    if (endDate < startDate) {
      setFormError("End date must be on or after the start date.")
      return
    }
    const budget = Number(formBudget)
    if (formBudget && (!Number.isFinite(budget) || budget < 0)) {
      setFormError("Budget must be a positive number.")
      return
    }
    setFormError(null)
    setSaving(true)
    try {
      if (editingId) {
        const existing = campaigns.find((c) => c.id === editingId)
        if (!existing) throw new Error("Campaign no longer exists.")
        const updated: Campaign = {
          ...existing,
          name: formName.trim(),
          description: formDesc.trim(),
          status: formStatus,
          startDate,
          endDate,
          budget: budget || 0,
        }
        const { data, error } = await supabase
          .from("campaigns")
          .update({ ...toRow(updated), updated_at: new Date().toISOString() })
          .eq("id", editingId)
          .select()
          .single()
        if (error) throw error
        const next = data ? toCampaign(data as Record<string, unknown>) : updated
        setCampaigns((prev) => prev.map((c) => (c.id === editingId ? next : c)))
      } else {
        const newCampaign: Campaign = {
          id: "",
          name: formName.trim(),
          description: formDesc.trim(),
          status: "draft",
          startDate,
          endDate,
          budget: budget || 0,
          spent: 0,
          reach: 0,
          engagement: 0,
          tags: [],
          posts: [],
        }
        const { data, error } = await supabase.from("campaigns").insert(toRow(newCampaign)).select().single()
        if (error) throw error
        if (data) setCampaigns((prev) => [...prev, toCampaign(data as Record<string, unknown>)])
      }
      resetForm()
      setAddOpen(false)
    } catch (err: any) {
      logError(editingId ? "Failed to update campaign" : "Failed to add campaign", 'MarketingPage', err)
      setFormError(err?.message || "Could not save the campaign. Check your permissions and try again.")
    } finally {
      setSaving(false)
    }
  }, [canWrite, formName, formDesc, formStart, formEnd, formBudget, formStatus, editingId, campaigns])

  const handleDelete = useCallback(async (c: Campaign) => {
    if (!canWrite) return
    if (!window.confirm(`Delete campaign "${c.name}"? This cannot be undone.`)) return
    const { error } = await supabase.from("campaigns").delete().eq("id", c.id)
    if (error) {
      logError("Failed to delete campaign", 'MarketingPage', error)
      window.alert(`Could not delete campaign: ${error.message}`)
      return
    }
    setCampaigns((prev) => prev.filter((x) => x.id !== c.id))
    setSelectedCampaign(null)
  }, [canWrite])

'''+s[old_end:]
rep('''  const publishedPosts = useMemo(''','''  const feed = useMemo(() => buildFeed(campaigns), [campaigns])
  const activeCount = useMemo(() => campaigns.filter((c) => c.status === "active").length, [campaigns])

  const publishedPosts = useMemo(''')
rep('''                 <p className="text-2xl font-bold">{filtered.length}</p>''','''                 <p className="text-2xl font-bold">{activeCount}</p>''')
rep('''            <Button 
              onClick={() => setAddOpen(true)}  // ← fixed
              className="h-auto min-h-[80px] min-w-[180px] gap-2 rounded-2xl px-6 text-sm font-bold transition-all duration-300 bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              New Campaign
            </Button>''','''            {canWrite && (
              <Button
                onClick={openCreate}
                className="h-auto min-h-[80px] min-w-[180px] gap-2 rounded-2xl px-6 text-sm font-bold transition-all duration-300 bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
              >
                <Plus className="h-5 w-5" />
                New Campaign
              </Button>
            )}''')
rep('''      {/* Tab Content — unchanged */}
      <div className="flex-1">
        {activeTab === "campaigns" && (
          <div className="grid gap-3 animate-in fade-in duration-300">''','''      {/* Tab Content */}
      <div className="flex-1">
        {loadError && (
          <div role="alert" className="mb-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            Could not load campaigns: {loadError}
          </div>
        )}
        {activeTab === "campaigns" && (
          <div className="grid gap-3 animate-in fade-in duration-300">
            {!loading && filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-2xl bg-card">
                <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">{campaigns.length === 0 ? "No campaigns yet." : "No campaigns match your filters."}</p>
              </div>
            )}''')
rep('''            <div className="relative border-l border-border/60 ml-3 space-y-8 pb-4">
              <div className="relative pl-8">
                <span className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-background" />
                </span>
                <div className="bg-muted/20 border border-border/50 rounded-xl p-4 transition-colors hover:bg-muted/40">
                  <p className="text-sm font-bold text-foreground">Campaign Update</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">Yusuf Garba</span> modified the budget for "Winter Recruitment".
                  </p>
                  <span className="text-[10px] font-medium text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Just now
                  </span>
                </div>
              </div>
            </div>''','''            {feed.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No campaign activity yet.</p>
                <p className="text-xs mt-1">Creating or editing a campaign will show up here.</p>
              </div>
            ) : (
              <div className="relative border-l border-border/60 ml-3 space-y-8 pb-4">
                {feed.map((entry) => (
                  <div key={entry.id} className="relative pl-8">
                    <span className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-background" />
                    </span>
                    <div className="bg-muted/20 border border-border/50 rounded-xl p-4 transition-colors hover:bg-muted/40">
                      <p className="text-sm font-bold text-foreground">
                        {entry.kind === "created" ? "Campaign Created" : "Campaign Updated"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        "<span className="font-semibold text-foreground">{entry.campaign.name}</span>" was {entry.kind === "created" ? "created" : "updated"}
                        {" "}· status {CAMPAIGN_STATUS_CONFIG[entry.campaign.status]?.label ?? entry.campaign.status}
                      </p>
                      <span className="text-[10px] font-medium text-muted-foreground mt-3 flex items-center gap-1" title={entry.at.toLocaleString()}>
                        <Clock className="h-3 w-3" /> {formatDistanceToNow(entry.at, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}''')
rep('''        campaign={selectedCampaign}
      />''','''        campaign={selectedCampaign}
        onEdit={canWrite && selectedCampaign ? () => openEdit(selectedCampaign) : undefined}
        onDelete={canWrite && selectedCampaign ? () => handleDelete(selectedCampaign) : undefined}
      />''')
rep('''        onAdd={handleAdd}
        onReset={resetForm}
      />''','''        onAdd={handleSave}
        onReset={resetForm}
        mode={editingId ? "edit" : "create"}
        formStatus={editingId ? formStatus : undefined}
        onFormStatusChange={editingId ? setFormStatus : undefined}
        saving={saving}
        error={formError}
      />''')
rep('''        open={addOpen}
        onOpenChange={setAddOpen}''','''        open={addOpen && canWrite}
        onOpenChange={setAddOpen}''')
open(p,'w',encoding='utf-8').write(s)
print('ok')
