import { useState, useMemo, useCallback, useEffect } from "react"
import { supabaseUntyped as db } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, Download, Loader2, Trash2 } from "lucide-react"

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
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const currentUserName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Unknown"
  const userOrgId = user?.user_metadata?.organization_id

  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
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

  useEffect(() => {
    async function fetchDocs() {
      let query = db.from("documents").select("*").order("created_at", { ascending: false })
      if (userOrgId) query = query.eq('organization_id', userOrgId)

      const { data, error } = await query
      if (!error && data) setDocuments(data.map(transformDoc))
      setIsLoading(false)
    }
    fetchDocs()
  }, [userOrgId])

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || d.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [documents, search, categoryFilter])

  const handleAdd = useCallback(async () => {
    if (!formName.trim() || !selectedFile) {
      alert("Please provide a name and select a file");
      return;
    }

    setIsUploading(true);
    try {
      const storagePath = `uploads/${Date.now()}_${selectedFile.name}`;

      const { error: uploadError } = await db.storage
        .from('documents')
        .upload(storagePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data, error } = await db.from("documents").insert({
        name: formName.trim(),
        category: formCategory,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploaded_by: currentUserName,
        storage_path: storagePath,
        organization_id: user?.user_metadata?.organization_id || null
      }).select().single();

      if (error) throw error;

      setDocuments((prev) => [transformDoc(data), ...prev]);
      setAddOpen(false);
      setFormName("");
      setSelectedFile(null);
    } catch (e: any) {
      console.error("Total Failure:", e);
      alert("Upload failed: " + (e.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  }, [formName, formCategory, currentUserName, selectedFile, user]);

  const handleDownload = async (path: string, name: string) => {
    const { data, error } = await db.storage.from('documents').download(path)
    if (error) return alert("Download failed")
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
  }

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error: storageError } = await db.storage.from('documents').remove([storagePath]);
    if (storageError) return alert("Error deleting file from storage");

    const { error: dbError } = await db.from('documents').delete().eq('id', id);
    if (dbError) return alert("Error deleting database record");

    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Upload</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="governance">Governance</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="p-4 border rounded-xl bg-card flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full uppercase font-medium">
                    {doc.size}
                  </span>
                </div>
                <p className="font-semibold truncate mt-2">{doc.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{doc.category}</p>
              </div>

              {/* Clean Action Bar */}
              <div className="flex items-center gap-1 mt-2 border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 text-xs font-medium"
                  onClick={() => handleDownload(doc.storagePath, doc.name)}
                >
                  <Download className="h-3 w-3 mr-1.5" /> Download
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(doc.id, doc.storagePath)}
                  title="Delete Document"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input type="file" onChange={(e) => {
              const file = e.target.files?.[0] || null
              setSelectedFile(file)
              if (file && !formName) setFormName(file.name)
            }} />
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
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={isUploading || !selectedFile}>
              {isUploading ? <Loader2 className="animate-spin mr-2" /> : null}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}