import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { useMembers } from "@/context/members-context"
import { type Member, MEMBER_STATUSES, DEPARTMENTS, YEARS } from "./types"
import type { Role } from "@/context/role-context"
import { cn, getEntityColor } from "@/lib/utils"
import { supabaseUntyped as db } from "@/lib/supabase"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  GraduationCap,
  CheckSquare,
  Calendar,
  Eye,
  LayoutGrid,
  List,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Loader2,
  UserCheck2,
} from "lucide-react"

const ALL_ROLES: Role[] = [
  "President",
  "VP Internal",
  "VP Finance",
  "VP Events",
  "VP External",
  "Marketing",
  "Executive",
  "Administrator",
]

const ROLE_COLORS: Record<string, string> = {
  President: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "VP Internal": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "VP Finance": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "VP Events": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "VP External": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Marketing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Executive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  Administrator: "bg-red-500/20 text-red-400 border-red-500/30",
}

interface SocialProfile {
  id: string
  user_id: string
  full_name: string | null
  phone: string | null
  bio: string | null
  instagram: string | null
  facebook: string | null
  linkedin: string | null
  twitter: string | null
  tiktok: string | null
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function SocialBadge({ value, icon, color }: { value: string | null; icon: React.ReactNode; color: string }) {
  if (!value) return null
  return (
    <span className={cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50", color)}>
      {icon} {value}
    </span>
  )
}

function stripToUsername(raw: string): string {
  return raw
    .replace(/https?:\/\/(www\.)?(instagram\.com|facebook\.com|linkedin\.com\/in|twitter\.com|x\.com|tiktok\.com\/@?)\/+/i, "")
    .replace(/\/$/, "")
    .replace(/^@/, "")
    .trim()
}

export function MembersPage() {
  const { members, addMember, updateMember, deleteMember, stats } = useMembers()

  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") || ""

  const handleSearchChange = (val: string) => {
    setSearchParams(prev => {
      if (val) prev.set("search", val)
      else prev.delete("search")
      return prev
    }, { replace: true })
  }

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [addOpen, setAddOpen] = useState(false)
  const [detailMember, setDetailMember] = useState<Member | null>(null)
  const [editMember, setEditMember] = useState<Member | null>(null)

  const [userSearch, setUserSearch] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<SocialProfile[]>([])
  const [userSearchStatus, setUserSearchStatus] = useState<"idle" | "loading" | "done">("idle")
  const [selectedProfile, setSelectedProfile] = useState<SocialProfile | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formRole, setFormRole] = useState<Role>("Executive")
  const [formDept, setFormDept] = useState<string>(DEPARTMENTS[0])
  const [formYear, setFormYear] = useState<string>(YEARS[0])

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.department.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || m.status === statusFilter
      const matchesRole = roleFilter === "all" || m.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [members, search, statusFilter, roleFilter])

  function resetForm() {
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormRole("Executive")
    setFormDept(DEPARTMENTS[0])
    setFormYear(YEARS[0])
    setUserSearch("")
    setUserSearchResults([])
    setUserSearchStatus("idle")
    setSelectedProfile(null)
  }

  const runSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setUserSearchResults([])
      setUserSearchStatus("idle")
      return
    }

    setUserSearchStatus("loading")
    const raw = value.trim()
    const stripped = stripToUsername(raw)

    const { data, error } = await db
      .from("socials")
      .select("*")
      .or(
        `full_name.ilike.%${raw}%,phone.ilike.%${raw}%,instagram.ilike.%${stripped}%,facebook.ilike.%${stripped}%,linkedin.ilike.%${stripped}%,twitter.ilike.%${stripped}%,tiktok.ilike.%${stripped}%`
      )
      .limit(5)

    if (error) {
      console.error("User search failed:", error)
      setUserSearchStatus("done")
      return
    }

    setUserSearchResults((data as SocialProfile[]) ?? [])
    setUserSearchStatus("done")
  }, [])

  const handleUserSearchInput = useCallback((value: string) => {
    setUserSearch(value)
    setSelectedProfile(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 300)
  }, [runSearch])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleSelectProfile(profile: SocialProfile) {
    setSelectedProfile(profile)
    setFormName(profile.full_name ?? "")
    setFormPhone(profile.phone ?? "")
  }

  function handleAdd() {
    if (!formName.trim() || !formEmail.trim()) return
    addMember({
      id: `m${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      role: formRole,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      department: formDept,
      year: formYear,
      tasksCompleted: 0,
      eventsAttended: 0,
    })
    resetForm()
    setAddOpen(false)
  }

  function handleEdit() {
    if (!editMember) return
    updateMember(editMember)
    setEditMember(null)
  }

  const statusMeta = (status: string) => MEMBER_STATUSES.find((s) => s.value === status)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ... (UI code for Header, Stats, Toolbar, Grid/Table - it's identical to what you had) ... */}
      
      {/* To save space, I'm skipping the repetitive UI blocks and jumping to the Edit Dialog you were fixing */}

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent className="sm:max-w-md">
          {editMember && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={editMember.name} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editMember.email} onChange={(e) => setEditMember({ ...editMember, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editMember.phone || ""} onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={editMember.role} onValueChange={(v) => setEditMember({ ...editMember, role: v as Role })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editMember.status} onValueChange={(v) => setEditMember({ ...editMember, status: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MEMBER_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
                <Button onClick={handleEdit}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}