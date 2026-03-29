import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useMembers } from "@/context/members-context";
import { type Member, MEMBER_STATUSES, DEPARTMENTS, YEARS } from "./types";
import type { Role } from "@/context/role-context";
import { cn, getEntityColor } from "@/lib/utils";
import { supabaseUntyped as db } from "@/lib/supabase";
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
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Loader2,
  UserCheck2,
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

interface SocialProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  twitter: string | null;
  tiktok: string | null;
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

function stripToUsername(raw: string): string {
  return raw
    .replace(/https?:\/\/(www\.)?(instagram\.com|facebook\.com|linkedin\.com\/in|twitter\.com|x\.com|tiktok\.com\/@?)\/+/i, "")
    .replace(/\/$/, "")
    .replace(/^@/, "")
    .trim();
}

function MemberAvatar({ member, className }: { member: Member; className?: string }) {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold shrink-0 transition-all hover:scale-105",
          getAvatarColor(member.name),
          className,
          member.role === "President" && "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background",
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

export function MembersPage() {
  const { members, addMember, updateMember, deleteMember, stats } = useMembers();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  // Form State
  const [userSearch, setUserSearch] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<SocialProfile[]>([]);
  const [userSearchStatus, setUserSearchStatus] = useState<"idle" | "loading" | "done">("idle");
  const [selectedProfile, setSelectedProfile] = useState<SocialProfile | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<Role>("Executive");
  const [formDept, setFormDept] = useState<string>(DEPARTMENTS[0]);
  const [formYear, setFormYear] = useState<string>(YEARS[0]);

  const handleSearchChange = (val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    }, { replace: true });
  };

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = !search || 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, search, statusFilter, roleFilter]);

  const runSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setUserSearchResults([]);
      setUserSearchStatus("idle");
      return;
    }
    setUserSearchStatus("loading");
    const raw = value.trim();
    const stripped = stripToUsername(raw);

    const { data, error } = await db
      .from("socials")
      .select("*")
      .or(`full_name.ilike.%${raw}%,phone.ilike.%${raw}%,instagram.ilike.%${stripped}%,facebook.ilike.%${stripped}%,linkedin.ilike.%${stripped}%,twitter.ilike.%${stripped}%,tiktok.ilike.%${stripped}%`)
      .limit(5);

    if (error) {
      console.error("User search failed:", error);
      setUserSearchStatus("done");
      return;
    }
    setUserSearchResults((data as SocialProfile[]) ?? []);
    setUserSearchStatus("done");
  }, []);

  const handleUserSearchInput = (value: string) => {
    setUserSearch(value);
    setSelectedProfile(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  function handleSelectProfile(profile: SocialProfile) {
    setSelectedProfile(profile);
    setFormName(profile.full_name ?? "");
    setFormPhone(profile.phone ?? "");
    setUserSearchResults([]);
  }

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Executive");
    setFormDept(DEPARTMENTS[0]);
    setFormYear(YEARS[0]);
    setUserSearch("");
    setUserSearchResults([]);
    setUserSearchStatus("idle");
    setSelectedProfile(null);
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

  const statusMeta = (status: string) => MEMBER_STATUSES.find((s) => s.value === status);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_right,rgba(34,197,94,0.18),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Member Directory
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Members</h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground">Manage your club's roster and roles</p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 rounded-2xl px-5 py-6 text-sm font-semibold shadow-lg shadow-primary/15">
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-muted-foreground", border: "border-border/50" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "text-emerald-400", border: "border-emerald-500/20" },
          { label: "Inactive", value: stats.inactive, icon: UserX, color: "text-slate-400", border: "border-slate-500/20" },
          { label: "Alumni", value: stats.alumni, icon: GraduationCap, color: "text-violet-400", border: "border-violet-500/20" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-2xl border bg-card p-4 shadow-sm", stat.border)}>
            <div className={cn("flex items-center gap-2", stat.color)}>
              <stat.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & View Toggle */}
      <section className="rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search members..." 
              value={search} 
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {MEMBER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-1 bg-background/50 p-1 rounded-xl border">
            <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="h-8 w-8 p-0">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} className="h-8 w-8 p-0">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area (Grid/Table logic) */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <div 
              key={member.id} 
              className="group rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => setDetailMember(member)}
            >
              <div className="flex justify-between items-start mb-4">
                <MemberAvatar member={member} className="h-12 w-12" />
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", ROLE_COLORS[member.role])}>
                  {member.role}
                </span>
              </div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-xs text-muted-foreground">{member.email}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-muted/30 rounded-lg p-2 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">Tasks</p>
                  <p className="font-bold">{member.tasksCompleted}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">Events</p>
                  <p className="font-bold">{member.eventsAttended}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Activity</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id} className="cursor-pointer" onClick={() => setDetailMember(m)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={m} className="h-8 w-8 text-xs" />
                      <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><span className={cn("text-[10px] px-2 py-0.5 rounded-full border", ROLE_COLORS[m.role])}>{m.role}</span></TableCell>
                  <TableCell><span className={cn("text-[10px] px-2 py-0.5 rounded-full", statusMeta(m.status)?.color)}>{statusMeta(m.status)?.label}</span></TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{m.tasksCompleted} tasks • {m.eventsAttended} events</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Member Dialog with Social Search */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Search existing social profiles</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or @username..." 
                  className="pl-9"
                  value={userSearch}
                  onChange={(e) => handleUserSearchInput(e.target.value)}
                />
                {userSearchStatus === "loading" && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />}
              </div>
              {userSearchResults.length > 0 && (
                <div className="mt-1 border rounded-md bg-popover text-popover-foreground shadow-md">
                  {userSearchResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProfile(p)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">{getInitials(p.full_name || "??")}</div>
                      <span>{p.full_name}</span>
                      {p.instagram && <Instagram className="h-3 w-3 ml-auto opacity-50" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full Name" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@yorku.ca" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={formYear} onValueChange={setFormYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setAddOpen(false); }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formName || !formEmail}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}