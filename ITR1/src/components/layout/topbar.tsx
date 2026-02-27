import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Search, ChevronDown, User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/context/events-context";
import { useTasks } from "@/context/tasks-context";
import { useMembers } from "@/context/members-context";
import { useFinance } from "@/context/finance-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRole, type Role } from "@/context/role-context";
import { useAuth } from "@/context/auth-context";

const ROLES: Role[] = [
  "President",
  "VP Internal",
  "VP Finance",
  "VP Events",
  "VP External",
  "Marketing",
  "Executive",
  "Administrator",
];

export function TopBar() {
  const { role, setRole } = useRole();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { tasks } = useTasks();
  const { members } = useMembers();
  const { expenses, reimbursements } = useFinance();

  // Build real notifications from context data
  const notifications = useMemo(() => {
    const items: { id: string; title: string; sub: string; time: string; route: string; read: boolean }[] = [];
    const now = new Date();

    // Pending expenses
    const pendingExp = expenses.filter((e) => e.status === "pending");
    if (pendingExp.length > 0) {
      items.push({ id: "n-exp", title: `${pendingExp.length} expense(s) awaiting approval`, sub: `Total: $${pendingExp.reduce((s, e) => s + e.amount, 0).toFixed(0)}`, time: "Now", route: "/finance", read: false });
    }

    // Pending reimbursements
    const pendingReim = reimbursements.filter((r) => r.status === "pending");
    if (pendingReim.length > 0) {
      items.push({ id: "n-reim", title: `${pendingReim.length} reimbursement(s) pending`, sub: `Total: $${pendingReim.reduce((s, r) => s + r.amount, 0).toFixed(0)}`, time: "Now", route: "/finance", read: false });
    }

    // Overdue tasks
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done");
    if (overdue.length > 0) {
      items.push({ id: "n-task", title: `${overdue.length} overdue task(s)`, sub: overdue.slice(0, 2).map((t) => t.title).join(", "), time: "Now", route: "/tasks", read: false });
    }

    // Upcoming events (within 48h)
    const upcoming = events.filter((e) => {
      const start = new Date(e.startDate);
      const diff = start.getTime() - now.getTime();
      return diff > 0 && diff < 48 * 60 * 60 * 1000;
    });
    upcoming.forEach((e) => {
      items.push({ id: `n-ev-${e.id}`, title: `Upcoming: ${e.title}`, sub: e.location || "No location", time: "Soon", route: "/events", read: false });
    });

    return items;
  }, [expenses, reimbursements, tasks, events]);

  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const unreadCount = notifications.filter((n) => !readNotifs.has(n.id)).length;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results: { type: string; label: string; sub: string; route: string }[] = [];
    events.filter((e) => e.title.toLowerCase().includes(q)).slice(0, 3).forEach((e) =>
      results.push({ type: "Event", label: e.title, sub: e.location || "", route: "/events" })
    );
    tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3).forEach((t) =>
      results.push({ type: "Task", label: t.title, sub: t.status, route: "/tasks" })
    );
    members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)).slice(0, 3).forEach((m) =>
      results.push({ type: "Member", label: m.name, sub: m.role, route: "/members" })
    );
    return results;
  }, [searchQuery, events, tasks, members]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-2 mr-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 hover:bg-accent/50 transition-colors rounded-md py-1 outline-none">
              <span className="font-semibold text-foreground">TechClub</span>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Fall 2026</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Current Membership</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-between items-center">
              <span>TechClub</span>
              <span className="text-[10px] uppercase font-bold text-primary">Active</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground opacity-50">
              FinanceClub (Waitlisted)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-primary font-medium">
              + Join another organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative flex-1 max-w-xl" ref={searchRef}>
        <div className="flex items-center gap-2 bg-muted/40 hover:bg-muted/60 px-3 py-1.5 rounded-md border border-border/50 focus-within:border-primary/50 transition-all group">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search events, members, tasks..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
          )}
        </div>
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                onClick={() => { navigate(r.route); setSearchQuery(""); setSearchOpen(false); }}
              >
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase">{r.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 p-4 text-center text-xs text-muted-foreground">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{unreadCount}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
              {unreadCount > 0 && (
                <span className="text-[10px] font-normal text-muted-foreground cursor-pointer hover:text-primary" onClick={() => setReadNotifs(new Set(notifications.map((n) => n.id)))}>Mark all read</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-2 px-1 text-center text-xs text-muted-foreground italic h-24 flex items-center justify-center">
                No new notifications
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn("flex flex-col items-start gap-0.5 py-2.5 px-3 cursor-pointer", readNotifs.has(n.id) && "opacity-50")}
                    onClick={() => { setReadNotifs((prev) => new Set(prev).add(n.id)); navigate(n.route); }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold">{n.title}</span>
                      <span className="text-[9px] text-muted-foreground">{n.time}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{n.sub}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-4" />

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 px-2 gap-2 hover:bg-accent/50 flex items-center rounded-md border border-border/50 outline-none">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start leading-none gap-1">
                <span className="text-xs font-semibold">{displayName}</span>
                <span className="text-[10px] text-muted-foreground">{role}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground mr-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                </div>
                <p className="text-xs leading-none text-muted-foreground italic">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Demo Mode Role Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                <span>Switch Role (Demo)</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
                  {ROLES.map((r) => (
                    <DropdownMenuRadioItem key={r} value={r} className="text-xs py-1.5">
                      {r}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/members")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
