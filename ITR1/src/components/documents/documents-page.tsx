import { useState, useMemo, useEffect, useCallback } from "react"
import { supabaseUntyped as db } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Download, FileText } from "lucide-react"

// Minimal Types
type DocCategory = "governance" | "finance" | "events" | "marketing" | "templates" | "meeting-notes" | "other"
type DocType = "pdf" | "doc" | "spreadsheet" | "image" | "presentation" | "other"

interface Document {
  id: string
  name: string
  category: DocCategory
  type: DocType
  size: string
  uploadedBy: string
  storagePath?: string
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const { user } = useAuth()
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Unknown"
  
  const [addOpen, setAddOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formName, setFormName] = useState("")

  // Getting the documents from Database
  useEffect(() => {
    async function load() {
      const { data, error } = await db.from("documents").select("*")
      if (!error && data) {
        setDocuments(data.map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          type: row.type,
          size: row.size,
          uploadedBy: row.uploaded_by,
          storagePath: row.storage_path
        })))
      }
    }
    load()
  }, [])

  // Secure File Access: Generate short-lived URL
  const handleDownload = async (doc: Document) => {
    if (!doc.storagePath) return
    const { data, error } = await db.storage.from("documents").createSignedUrl(doc.storagePath, 60)
    if (!error && data.signedUrl) window.open(data.signedUrl, "_blank")
  }

  // Upload 
  const handleAdd = useCallback(async () => {
    if (!formName.trim() || !selectedFile) return
    setIsUploading(true)
    try {
      const storagePath = `uploads/${Date.now()}_${selectedFile.name}`
      
      const { error: uploadError } = await db.storage.from('documents').upload(storagePath, selectedFile)
      if (uploadError) throw uploadError

      const newDoc = {
        name: formName.trim(),
        category: "other",
        type: "pdf",
        size: `${Math.round(selectedFile.size / 1024)} KB`,
        uploaded_by: currentUserName,
        storage_path: storagePath
      }

      const { data, error } = await db.from("documents").insert(newDoc).select().single()
      if (error) throw error
      if (data) setDocuments((prev) => [data, ...prev])
      
      setAddOpen(false)
      setSelectedFile(null)
      setFormName("")
    } catch (e) { console.error(e) } finally { setIsUploading(false) }
  }, [formName, currentUserName, selectedFile])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Upload</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 border rounded-xl flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <p className="font-medium text-sm truncate">{doc.name}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownload(doc)}><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          <Input placeholder="Document Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleAdd} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}