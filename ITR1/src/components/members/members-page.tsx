import { useState, useMemo } from "react"
import { useMembers } from "@/context/members-context"
import { type Member, MEMBER_STATUSES, DEPARTMENTS, YEARS } from "./types"
import type { Role } from "@/context/role-context"
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

function MemberAvatar({ 
  member, 
  className 
}: { 
  member: Member, // Fixed 'any' to 'Member'
  className?: string 
}) {
  return (
    <div className="relative inline-block">
      <div className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 transition-all hover:scale-105", 
        getAvatarColor(member.name), 
        className,
        member.role === "President" && "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background"
      )}>
        {getInitials(member.name)}
      </div>

      {member.status === "active" && (
        <span className="absolute bottom-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-background"></span>
        </span>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-rose-500/20 text-rose-400",
    "bg-orange-500/20 text-orange-400",
    "bg-amber-500/20 text-amber-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-cyan-500/20 text-cyan-400",
    "bg-blue-500/20 text-blue-400",
    "bg-violet-500/20 text-violet-400",
    "bg-pink-500/20 text-pink-400",
  ]
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[idx % colors.length]
}

export function MembersPage() {
  const { members, addMember, updateMember, deleteMember, stats } = useMembers()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [addOpen, setAddOpen] = useState(false)
  const [detailMember, setDetailMember] = useState<Member | null>(null)
  const [editMember, setEditMember] = useState<Member | null>(null)

  // Add form state
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

  const statusMeta = (status: string) =>
    MEMBER_STATUSES.find((s) => s.value === status)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your club's roster, roles, and member information
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Active</span>
          </div>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-slate-400">
            <UserX className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Inactive</span>
          </div>
          <p className="text-2xl font-bold">{stats.inactive}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-violet-400">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Alumni</span>
          </div>
          <p className="text-2xl font-bold">{stats.alumni}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {MEMBER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
            className="h-8 w-8 p-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {members.length} members
      </p>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <div
            key={member.id}
            className="group bg-card border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
            onClick={() => setDetailMember(member)}
            >
              <div className="flex items-start justify-between mb-4">
                <MemberAvatar member={member} className="h-12 w-12 text-sm" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailMember(member) }}>
                      <Eye className="h-4 w-4 mr-2" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditMember(member) }}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteMember(member.id) }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-semibold text-sm">{member.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", ROLE_COLORS[member.role])}>
                  {member.role}
                </span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusMeta(member.status)?.color)}>
                  {statusMeta(member.status)?.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" /> {member.tasksCompleted} tasks
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {member.eventsAttended} events
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

       {/* Table View */}
       {view === "table" && (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Tasks</TableHead>
                <TableHead className="text-right">Events</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <TableRow
                  key={member.id} 
                  className="cursor-pointer" 
                  onClick={() => setDetailMember(member)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <MemberAvatar member={member} className="h-8 w-8 text-xs" />
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
            
                    <TableCell>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", ROLE_COLORS[member.role])}>
                        {member.role}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusMeta(member.status)?.color)}>
                        {statusMeta(member.status)?.label}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-sm">{member.department}</TableCell>
                    <TableCell className="text-sm">{member.year}</TableCell>
                    <TableCell className="text-right text-sm">{member.tasksCompleted}</TableCell>
                    <TableCell className="text-right text-sm">{member.eventsAttended}</TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditMember(member) }}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteMember(member.id) }}>
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
        )}

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="john.doe@yorku.ca" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(416) 555-0000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={formYear} onValueChange={setFormYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formDept} onValueChange={setFormDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setAddOpen(false) }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formName.trim() || !formEmail.trim()}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Detail Panel */}
      <Dialog open={!!detailMember} onOpenChange={() => setDetailMember(null)}>
        <DialogContent className="sm:max-w-lg">
          {detailMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <MemberAvatar member={detailMember} className="h-10 w-10 text-sm" />
                  {detailMember.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", ROLE_COLORS[detailMember.role])}>
                    {detailMember.role}
                  </span>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", statusMeta(detailMember.status)?.color)}>
                    {statusMeta(detailMember.status)?.label}
                  </span>
                </div>

                {/* Bio Section */}
                {detailMember.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {detailMember.bio}
                  </p>
                )}

                {/* Contact Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</p>
                    <p className="text-sm font-medium">{detailMember.email}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone</p>
                    <p className="text-sm font-medium">{detailMember.phone || "—"}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{detailMember.department}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="text-sm font-medium">{detailMember.year}</p>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">{detailMember.tasksCompleted}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks Done</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">{detailMember.eventsAttended}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Events</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">{detailMember.joinDate.slice(0, 7)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Joined</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setDetailMember(null); setEditMember(detailMember) }}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => { deleteMember(detailMember.id); setDetailMember(null) }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                  <Input value={editMember.phone} onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={editMember.role} onValueChange={(v) => setEditMember({ ...editMember, role: v as Role })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editMember.status} onValueChange={(v) => setEditMember({ ...editMember, status: v as Member["status"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MEMBER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={editMember.department} onValueChange={(v) => setEditMember({ ...editMember, department: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={editMember.year} onValueChange={(v) => setEditMember({ ...editMember, year: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
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
