import { useState, useMemo, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { supabaseUntyped as db } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
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
import {
  Search,
  Plus,
  FileText,
  FolderOpen,
  File,
  FileSpreadsheet,
  FileImage,
  FilePieChart,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  Clock,
  User,
  LayoutGrid,
  List,
  Tag,
} from "lucide-react"

type DocCategory = "governance" | "finance" | "events" | "marketing" | "templates" | "meeting-notes" | "other"
type DocType = "pdf" | "doc" | "spreadsheet" | "image" | "presentation" | "other"

interface Document {
  id: string
  name: string
  category: DocCategory
  type: DocType
  size: string
  uploadedBy: string
  uploadedDate: string
  lastModified: string
  description?: string
  tags: string[]
}

const CATEGORY_CONFIG: Record<DocCategory, { label: string; color: string }> = {
  governance: { label: "Governance", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  finance: { label: "Finance", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  events: { label: "Events", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  marketing: { label: "Marketing", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  templates: { label: "Templates", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  "meeting-notes": { label: "Meeting Notes", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  other: { label: "Other", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
}

const TYPE_ICONS: Record<DocType, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-400" />,
  doc: <File className="h-5 w-5 text-blue-400" />,
  spreadsheet: <FileSpreadsheet className="h-5 w-5 text-emerald-400" />,
  image: <FileImage className="h-5 w-5 text-pink-400" />,
  presentation: <FilePieChart className="h-5 w-5 text-amber-400" />,
  other: <File className="h-5 w-5 text-slate-400" />,
}

const SEED_DOCUMENTS: Document[] = [// seed data used as fallback and for initial DB population
  { id: "d1", name: "Club Constitution 2025-26.pdf", category: "governance", type: "pdf", size: "245 KB", uploadedBy: "Naeem Baig", uploadedDate: "2025-09-01", lastModified: "2025-09-01", description: "Official club constitution ratified for the 2025-26 academic year.", tags: ["official", "governance"] },
  { id: "d2", name: "Budget Proposal - Fall 2026.xlsx", category: "finance", type: "spreadsheet", size: "128 KB", uploadedBy: "Marcus Johnson", uploadedDate: "2025-08-20", lastModified: "2026-01-15", description: "Detailed budget breakdown for Fall 2026 term.", tags: ["budget", "fall-2026"] },
  { id: "d3", name: "Event Planning Template.docx", category: "templates", type: "doc", size: "56 KB", uploadedBy: "Priya Sharma", uploadedDate: "2025-09-10", lastModified: "2025-11-20", description: "Reusable template for planning club events.", tags: ["template", "events"] },
  { id: "d4", name: "Tech Talk Poster - AI 2026.png", category: "marketing", type: "image", size: "2.1 MB", uploadedBy: "Jordan Lee", uploadedDate: "2026-01-28", lastModified: "2026-01-28", tags: ["poster", "tech-talk"] },
  { id: "d5", name: "Exec Meeting Minutes - Feb 6.pdf", category: "meeting-notes", type: "pdf", size: "89 KB", uploadedBy: "Sarah Chen", uploadedDate: "2026-02-06", lastModified: "2026-02-06", description: "Minutes from the February 6th executive meeting.", tags: ["minutes", "february"] },
  { id: "d6", name: "Sponsorship Deck 2026.pptx", category: "marketing", type: "presentation", size: "4.8 MB", uploadedBy: "Alex Rivera", uploadedDate: "2025-10-15", lastModified: "2026-01-20", description: "Pitch deck for prospective sponsors.", tags: ["sponsorship", "pitch"] },
  { id: "d7", name: "Expense Report - January 2026.xlsx", category: "finance", type: "spreadsheet", size: "97 KB", uploadedBy: "Marcus Johnson", uploadedDate: "2026-02-01", lastModified: "2026-02-01", tags: ["expense", "january"] },
  { id: "d8", name: "Valentine Social Run Sheet.docx", category: "events", type: "doc", size: "34 KB", uploadedBy: "Priya Sharma", uploadedDate: "2026-02-10", lastModified: "2026-02-13", description: "Detailed run-of-show for the Valentine Social event.", tags: ["valentine", "run-sheet"] },
  { id: "d9", name: "Social Media Guidelines.pdf", category: "marketing", type: "pdf", size: "156 KB", uploadedBy: "Jordan Lee", uploadedDate: "2025-09-15", lastModified: "2025-09-15", description: "Brand guidelines for all social media posts.", tags: ["guidelines", "brand"] },
  { id: "d10", name: "Reimbursement Form Template.pdf", category: "templates", type: "pdf", size: "42 KB", uploadedBy: "Marcus Johnson", uploadedDate: "2025-09-05", lastModified: "2025-09-05", tags: ["template", "finance"] },
  { id: "d11", name: "Exec Meeting Minutes - Jan 23.pdf", category: "meeting-notes", type: "pdf", size: "76 KB", uploadedBy: "Sarah Chen", uploadedDate: "2026-01-23", lastModified: "2026-01-23", tags: ["minutes", "january"] },
  { id: "d12", name: "Volunteer Sign-up Sheet.xlsx", category: "events", type: "spreadsheet", size: "45 KB", uploadedBy: "Priya Sharma", uploadedDate: "2026-02-05", lastModified: "2026-02-12", tags: ["volunteer", "valentine"] },
  { id: "d13", name: "Club Logo Assets.zip", category: "marketing", type: "other", size: "8.3 MB", uploadedBy: "Jordan Lee", uploadedDate: "2025-09-01", lastModified: "2025-09-01", description: "Logo in various formats (SVG, PNG, AI).", tags: ["logo", "brand"] },
  { id: "d14", name: "Annual Report 2024-25.pdf", category: "governance", type: "pdf", size: "1.2 MB", uploadedBy: "Naeem Baig", uploadedDate: "2025-05-30", lastModified: "2025-05-30", description: "Year-end report summarizing club activities.", tags: ["annual", "report"] },
]

function toDoc(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as DocCategory,
    type: row.type as DocType,
    size: row.size as string,
    uploadedBy: row.uploaded_by as string,
    uploadedDate: row.uploaded_date as string,
    lastModified: row.last_modified as string,
    description: (row.description as string) || undefined,
    tags: (row.tags as string[]) || [],
  }
}

function toRow(d: Document) {
  return {
    name: d.name,
    category: d.category,
    type: d.type,
    size: d.size,
    uploaded_by: d.uploadedBy,
    uploaded_date: d.uploadedDate,
    last_modified: d.lastModified,
    description: d.description || null,
    tags: d.tags,
  }
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const { user } = useAuth()
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Unknown"
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [addOpen, setAddOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)

  // Add form
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<DocCategory>("other")
  const [formType, setFormType] = useState<DocType>("pdf")
  const [formDesc, setFormDesc] = useState("")

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some((t) => t.includes(search.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || d.category === categoryFilter
      const matchesType = typeFilter === "all" || d.type === typeFilter
      return matchesSearch && matchesCategory && matchesType
    })
  }, [documents, search, categoryFilter, typeFilter])

  // Group by category for folder view
  const grouped = useMemo(() => {
    const map: Record<string, Document[]> = {}
    filtered.forEach((d) => {
      if (!map[d.category]) map[d.category] = []
      map[d.category].push(d)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const totalSize = documents.length
  const categoryBreakdown = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    count: documents.filter((d) => d.category === key).length,
  })).filter((c) => c.count > 0)

  function resetForm() {
    setFormName("")
    setFormCategory("other")
    setFormType("pdf")
    setFormDesc("")
  }

  // Load documents from Supabase
  useEffect(() => {
    async function load() {
      const { data, error } = await db.from("documents").select("*").order("created_at", { ascending: false })
      if (error) {
        console.error("Failed to load documents:", error)
        setDocuments(SEED_DOCUMENTS)
        return
      }
      if (data && data.length > 0) {
        setDocuments(data.map(toDoc))
      } else {
        // Seed
        const rows = SEED_DOCUMENTS.map(toRow)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: seeded, error: seedErr } = await db.from("documents").insert(rows).select()
        if (seedErr) {
          console.error("Failed to seed documents:", seedErr)
          setDocuments(SEED_DOCUMENTS)
        } else if (seeded) {
          setDocuments(seeded.map(toDoc))
        }
      }
    }
    load()
  }, [])

  const handleAdd = useCallback(async () => {
    if (!formName.trim()) return
    const newDoc: Document = {
      id: `d${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      type: formType,
      size: "0 KB",
      uploadedBy: currentUserName,
      uploadedDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      description: formDesc.trim() || undefined,
      tags: [],
    }
    const row = toRow(newDoc)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await db.from("documents").insert(row).select().single()
    if (error) {
      console.error("Failed to add document:", error)
      return
    }
    if (data) setDocuments((prev) => [toDoc(data), ...prev])
    resetForm()
    setAddOpen(false)
  }, [formName, formCategory, formType, formDesc, currentUserName])

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await db.from("documents").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete document:", error)
      return
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize and access your club's files, templates, and meeting notes</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Category Quick Stats */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="bg-card border border-border/50 rounded-lg px-3 py-2 flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{totalSize} files</span>
        </div>
        {categoryBreakdown.map((c) => (
          <button
            key={c.key}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium border transition-all",
              categoryFilter === c.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50 hover:border-primary/30"
            )}
            onClick={() => setCategoryFilter(categoryFilter === c.key ? "all" : c.key)}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="File Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">Document</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="h-8 w-8 p-0">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")} className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {documents.length} documents</p>

      {/* Grid View — grouped by category */}
      {view === "grid" && (
        <div className="space-y-6">
          {grouped.map(([category, docs]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{CATEGORY_CONFIG[category as DocCategory]?.label || category}</h3>
                <span className="text-xs text-muted-foreground">({docs.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group bg-card border border-border/50 rounded-xl p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                        {TYPE_ICONS[doc.type]}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc) }}>
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span>{doc.size}</span>
                      <span>&middot;</span>
                      <span>{doc.lastModified}</span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="divide-y divide-border/30">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors cursor-pointer group"
                onClick={() => setPreviewDoc(doc)}
              >
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  {TYPE_ICONS[doc.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", CATEGORY_CONFIG[doc.category].color)}>
                      {CATEGORY_CONFIG[doc.category].label}
                    </span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {doc.uploadedBy}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doc.lastModified}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{doc.size}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Download className="h-4 w-4 mr-2" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-lg">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    {TYPE_ICONS[previewDoc.type]}
                  </div>
                  <span className="truncate">{previewDoc.name}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", CATEGORY_CONFIG[previewDoc.category].color)}>
                    {CATEGORY_CONFIG[previewDoc.category].label}
                  </span>
                  {previewDoc.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>

                {previewDoc.description && (
                  <p className="text-sm text-muted-foreground">{previewDoc.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
                    <p className="text-xs text-muted-foreground">Uploaded By</p>
                    <p className="text-sm font-medium">{previewDoc.uploadedBy}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="text-sm font-medium">{previewDoc.size}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="text-sm font-medium">{previewDoc.uploadedDate}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
                    <p className="text-xs text-muted-foreground">Last Modified</p>
                    <p className="text-sm font-medium">{previewDoc.lastModified}</p>
                  </div>
                </div>

                <div className="bg-muted/20 border border-dashed border-border/50 rounded-lg p-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">File preview not available</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Download to view the full document</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
                <Button className="gap-2"><Download className="h-4 w-4" /> Download</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/20 border border-dashed border-border/50 rounded-lg p-6 text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to select files</p>
              <p className="text-xs text-muted-foreground mt-0.5">File upload will be functional once connected to storage</p>
            </div>
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Budget Report Q1.pdf" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={(v) => setFormCategory(v as DocCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as DocType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Brief description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setAddOpen(false) }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formName.trim()}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
