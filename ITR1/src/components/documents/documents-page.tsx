import { useState, useMemo, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { supabaseUntyped as db } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, Search, FileText, Download, Loader2, Trash2, 
  ShieldCheck, Landmark, Calendar, HardDrive, FileQuestion 
} from "lucide-react"

type DocCategory = "governance" | "finance" | "events" | "marketing" | "templates" | "meeting-notes" | "other"

interface Document {
  id: string
  name: string
  category: DocCategory
  size: string
  uploadedBy: string
  storagePath: string
}

export function DocumentsPage() {
  // Navigation & Auth
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const userOrgId = user?.user_metadata?.organization_id
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Unknown"

  // App State 
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all")
  const [addOpen, setAddOpen] = useState(false)
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<DocCategory>("other")

  // Sync Search Params with State
  useEffect(() => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (categoryFilter !== "all") params.category = categoryFilter
    setSearchParams(params, { replace: true })
  }, [search, categoryFilter, setSearchParams])

  // Data Fetching Logic
  const transformDoc = (row: any): Document => ({
    id: row.id,
    name: row.name,
    category: row.category as DocCategory,
    size: row.size || "0 KB",
    uploadedBy: row.uploaded_by,
    storagePath: row.storage_path
  })

  const fetchDocs = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = db.from("documents").select("*").order("created_at", { ascending: false })
      if (userOrgId) query = query.eq('organization_id', userOrgId)

      const { data, error } = await query
      if (error) throw error
      if (data) setDocuments(data.map(transformDoc))
    } catch (err) {
      console.error("Error fetching docs:", err)
    } finally {
      setIsLoading(false)
    }
  }, [userOrgId])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  // Computed Values
  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || d.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [documents, search, categoryFilter])

  const stats = useMemo(() => {
    const totalSize = documents.reduce((acc, doc) => {
      const val = parseFloat(doc.size.replace(/[^\d.-]/g, ''))
      return acc + (isNaN(val) ? 0 : val)
    }, 0)
    return { count: documents.length, size: totalSize.toFixed(2) + " MB" }
  }, [documents])

  // Handlers
  const handleDownload = async (path: string, name: string) => {
    try {
      const { data, error } = await db.storage.from('azure-planbstorage').download(path)
      if (error) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      alert("Download failed")
    }
  }

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return
    try {
      await db.storage.from('azure-planbstorage').remove([storagePath])
      await db.from('documents').delete().eq('id', id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch (e) {
      alert("Delete failed")
    }
  }

  const handleAdd = async () => {
    if (!formName.trim() || !selectedFile) return alert("Missing file or name")
    setIsUploading(true)
    try {
      const path = `${userOrgId || 'gen'}/${Date.now()}_${selectedFile.name}`
      const { error: uploadError } = await db.storage.from('azure-planbstorage').upload(path, selectedFile)
      if (uploadError) throw uploadError
      
      const { data, error: dbError } = await db.from("documents").insert({
        name: formName.trim(),
        category: formCategory,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        uploaded_by: currentUserName,
        storage_path: path,
        organization_id: userOrgId || null
      }).select().single()

      if (dbError) throw dbError
      setDocuments(prev => [transformDoc(data), ...prev])
      setAddOpen(false)
      // Reset form
      setSelectedFile(null)
      setFormName("")
    } catch (e) { 
      alert("Upload failed") 
    } finally { 
      setIsUploading(false) 
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'governance': return <ShieldCheck className="h-4 w-4 text-purple-500" />
      case 'finance': return <Landmark className="h-4 w-4 text-emerald-500" />
      case 'events': return <Calendar className="h-4 w-4 text-blue-500" />
      default: return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Vault</h1>
          <p className="text-muted-foreground text-sm">Centralized documentation and assets.</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl border border-border/50">
          <div className="px-4 border-r border-border/50 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Files</p>
            <p className="text-xl font-bold">{stats.count}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Storage</p>
            <p className="text-xl font-bold">{stats.size}</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="ml-2 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-2 rounded-2xl border">
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto">
          <TabsList className="bg-transparent gap-1">
            {["all", "governance", "finance", "events", "other"].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-background/50 border-none shadow-inner" 
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="animate-spin h-10 w-10 mb-4 opacity-20" />
          <p className="text-sm font-medium animate-pulse">Accessing Secure Storage...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-[2rem] bg-muted/10">
          <FileQuestion className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-xl font-semibold opacity-50">No documents found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((doc) => (
            <div key={doc.id} className="group relative bg-card border rounded-2xl p-5 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                    {getCategoryIcon(doc.category)}
                  </div>
                  <span className="text-[10px] font-mono bg-muted/50 px-2 py-1 rounded-md">{doc.size}</span>
                </div>
                <h4 className="font-bold text-sm leading-tight line-clamp-2">{doc.name}</h4>
                <p className="text-[10px] text-muted-foreground uppercase mt-2 tracking-wider font-semibold">
                  {doc.category} • {doc.uploadedBy}
                </p>
              </div>
              <div className="flex gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <Button variant="secondary" size="sm" className="flex-1 rounded-xl h-9" onClick={() => handleDownload(doc.storagePath, doc.name)}>
                  <Download className="h-3.5 w-3.5 mr-2" /> Get
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(doc.id, doc.storagePath)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader><DialogTitle>Secure Upload</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setSelectedFile(file)
                  if (file) setFormName(file.name)
                }} 
              />
              <HardDrive className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground font-medium">
                {selectedFile ? selectedFile.name : "Click or drag to choose file"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60">Internal Label</label>
              <Input placeholder="Document name..." value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60">Category</label>
              <select 
                className="w-full bg-background border rounded-md p-2 text-sm" 
                value={formCategory} 
                onChange={(e) => setFormCategory(e.target.value as DocCategory)}
              >
                <option value="governance">Governance</option>
                <option value="finance">Finance</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={isUploading || !selectedFile} className="w-full">
              {isUploading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...</> : "Initiate Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}