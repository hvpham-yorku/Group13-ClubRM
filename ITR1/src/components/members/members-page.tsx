import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useMembers } from "@/context/members-context";
import { type Member, MEMBER_STATUSES, DEPARTMENTS, YEARS } from "./types";
import type { Role } from "@/context/role-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Sparkles,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";

const ALL_ROLES: Role[] = [
  "President",
  "VP Internal",
  "VP Finance",
  "VP Events",
  "VP External",
  "Marketing",
  "Executive",
  "Administrator",
];

const ROLE_COLORS: Record<string, string> = {
  President: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "VP Internal": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "VP Finance": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "VP Events": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "VP External": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Marketing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Executive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  Administrator: "bg-red-500/20 text-red-400 border-red-500/30",
};

function MemberAvatar({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold shrink-0 transition-all hover:scale-105",
          getAvatarColor(member.name),
          className,
          member.role === "President" &&
            "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background",
        )}
      >
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
    .slice(0, 2);
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
  ];
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[idx % colors.length];
}

export function MembersPage() {
  const { members, addMember, updateMember, deleteMember, stats } =
    useMembers();

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const handleSearchChange = (val: string) => {
    setSearchParams(
      (prev) => {
        if (val) prev.set("search", val);
        else prev.delete("search");
        return prev;
      },
      { replace: true },
    );
  };

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  // Add form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<Role>("Executive");
  const [formDept, setFormDept] = useState<string>(DEPARTMENTS[0]);
  const [formYear, setFormYear] = useState<string>(YEARS[0]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, search, statusFilter, roleFilter]);

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Executive");
    setFormDept(DEPARTMENTS[0]);
    setFormYear(YEARS[0]);
  }

  function handleAdd() {
    if (!formName.trim() || !formEmail.trim()) return;
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
    });
    resetForm();
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editMember) return;
    updateMember(editMember);
    setEditMember(null);
  }

  const statusMeta = (status: string) =>
    MEMBER_STATUSES.find((s) => s.value === status);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_right,rgba(34,197,94,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Member Directory
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Members</h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                Manage your club's roster, roles, and member information
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
            <div className="flex min-w-[168px] flex-col justify-between rounded-2xl border border-border/60 bg-background/70 p-3 backdrop-blur">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Visible Now
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold">{filtered.length}</p>
                  <p className="text-[11px] text-muted-foreground">
                    filtered members
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="h-auto min-h-[96px] min-w-[184px] self-stretch gap-2 rounded-2xl px-5 text-sm font-semibold shadow-lg shadow-primary/15 sm:min-h-0"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight">
            {stats.total}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Everyone currently in the directory
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-card p-4 shadow-sm shadow-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Active
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight">
            {stats.active}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Currently participating members
          </p>
        </div>
        <div className="rounded-2xl border border-slate-500/20 bg-card p-4 shadow-sm shadow-slate-500/5">
          <div className="flex items-center gap-2 text-slate-400">
            <UserX className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Inactive
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight">
            {stats.inactive}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Members currently off-cycle
          </p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-card p-4 shadow-sm shadow-violet-500/5">
          <div className="flex items-center gap-2 text-violet-400">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Alumni
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight">
            {stats.alumni}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Graduated members retained in history
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-10 rounded-xl border-border/60 bg-background/70 pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-[145px] rounded-xl border-border/60 bg-background/70">
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
                <SelectTrigger className="h-10 w-[160px] rounded-xl border-border/60 bg-background/70">
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
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {members.length}
              </span>{" "}
              members
            </p>
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/70 p-1">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("grid")}
                className="h-9 w-9 rounded-lg p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("table")}
                className="h-9 w-9 rounded-lg p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
              onClick={() => setDetailMember(member)}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
              <div className="flex items-start justify-between mb-4">
                <MemberAvatar member={member} className="h-12 w-12 text-sm" />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailMember(member);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMember(member);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMember(member.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative">
                <h3 className="font-semibold text-base">{member.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {member.email}
                </p>
              </div>
              <div className="mt-4 flex min-h-[44px] flex-wrap items-start gap-2">
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                    ROLE_COLORS[member.role],
                  )}
                >
                  {member.role}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    statusMeta(member.status)?.color,
                  )}
                >
                  {statusMeta(member.status)?.label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border/40 bg-background/60 p-3">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <CheckSquare className="h-3 w-3" /> Tasks
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {member.tasksCompleted}
                  </p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/60 p-3">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Events
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {member.eventsAttended}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/20">
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
                      <MemberAvatar
                        member={member}
                        className="h-8 w-8 text-xs"
                      />
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                        ROLE_COLORS[member.role],
                      )}
                    >
                      {member.role}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        statusMeta(member.status)?.color,
                      )}
                    >
                      {statusMeta(member.status)?.label}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm">{member.department}</TableCell>
                  <TableCell className="text-sm">{member.year}</TableCell>
                  <TableCell className="text-right text-sm">
                    {member.tasksCompleted}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {member.eventsAttended}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditMember(member);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMember(member.id);
                          }}
                        >
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
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john.doe@yorku.ca"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(416) 555-0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formRole}
                  onValueChange={(v) => setFormRole(v as Role)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={formYear} onValueChange={setFormYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formDept} onValueChange={setFormDept}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setAddOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formName.trim() || !formEmail.trim()}
            >
              Add Member
            </Button>
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
                  <MemberAvatar
                    member={detailMember}
                    className="h-10 w-10 text-sm"
                  />
                  {detailMember.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium border",
                      ROLE_COLORS[detailMember.role],
                    )}
                  >
                    {detailMember.role}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium",
                      statusMeta(detailMember.status)?.color,
                    )}
                  >
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
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="text-sm font-medium">{detailMember.email}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="text-sm font-medium">
                      {detailMember.phone || "—"}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">
                      {detailMember.department}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="text-sm font-medium">{detailMember.year}</p>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">
                      {detailMember.tasksCompleted}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Tasks Done
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">
                      {detailMember.eventsAttended}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Events
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">
                      {detailMember.joinDate.slice(0, 7)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Joined
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailMember(null);
                    setEditMember(detailMember);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteMember(detailMember.id);
                    setDetailMember(null);
                  }}
                >
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
                  <Input
                    value={editMember.name}
                    onChange={(e) =>
                      setEditMember({ ...editMember, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editMember.email}
                    onChange={(e) =>
                      setEditMember({ ...editMember, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editMember.phone}
                    onChange={(e) =>
                      setEditMember({ ...editMember, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={editMember.role}
                      onValueChange={(v) =>
                        setEditMember({ ...editMember, role: v as Role })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editMember.status}
                      onValueChange={(v) =>
                        setEditMember({
                          ...editMember,
                          status: v as Member["status"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={editMember.department}
                      onValueChange={(v) =>
                        setEditMember({ ...editMember, department: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={editMember.year}
                      onValueChange={(v) =>
                        setEditMember({ ...editMember, year: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMember(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}