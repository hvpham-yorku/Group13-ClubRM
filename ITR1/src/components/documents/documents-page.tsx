import { useState, useMemo, useCallback } from "react"
import { supabaseUntyped as db } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Download, FileText, Search } from "lucide-react"

type DocCategory = "governance" | "finance" | "events" | "marketing" | "templates" | "meeting-notes" | "other"

interface Document {
  id: string
  name: string
  category: DocCategory
  size: string
  uploadedBy: string
  storagePath?: string
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const { user } = useAuth()
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Unknown"
  
  // UI States
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  
  // Form States
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<DocCategory>("other")

  const transformDoc = (row: any): Document => ({
    id: row.id,
    name: row.name,
    category: row.category as DocCategory,
    size: row.size,
    uploadedBy: row.uploaded_by,
    storagePath: row.storage_path
  })

  // Filtering Logic
  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || d.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [documents, search, categoryFilter])

  const handleAdd = useCallback(async () => {
    if (!formName.trim() || !selectedFile) return
    setIsUploading(true)
    try {
      const storagePath = `uploads/${Date.now()}_${selectedFile.name}`
      const { error: uploadError } = await db.storage.from('documents').upload(storagePath, selectedFile)
      if (uploadError) throw uploadError

      const { data, error } = await db.from("documents").insert({
        name: formName.trim(),
        category: formCategory,
        size: `${Math.round(selectedFile.size / 1024)} KB`,
        uploaded_by: currentUserName,
        storage_path: storagePath
      }).select().single()

      if (error) throw error
      setDocuments((prev) => [transformDoc(data), ...prev])
      setAddOpen(false)
      setFormName("")
      setFormCategory("other")
    } catch (e) { console.error(e) } finally { setIsUploading(false) }
  }, [formName, formCategory, currentUserName, selectedFile])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Upload</Button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="governance">Governance</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="p-4 border rounded-xl bg-card">
            <p className="font-medium truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{doc.category}</p>
          </div>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          <Input placeholder="Document Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Select value={formCategory} onValueChange={(v) => setFormCategory(v as DocCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="governance">Governance</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={isUploading}>{isUploading ? "..." : "Upload"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}