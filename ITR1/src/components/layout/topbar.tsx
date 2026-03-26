import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Bell, Search, ChevronDown, User, Settings, LogOut, ShieldCheck, DollarSign, FileText, Building2, Calendar, CheckSquare, Users, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/context/events-context";
import { useTasks } from "@/context/tasks-context";
import { useMembers } from "@/context/members-context";
import { useFinance } from "@/context/finance-context";
import { supabase } from "@/lib/supabase";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

/** Type badge config for search result categories */
const SEARCH_TYPE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Event:    { color: "bg-pink-500/20 text-pink-400",    icon: <Calendar   className="h-3 w-3" /> },
  Task:     { color: "bg-amber-500/20 text-amber-400",  icon: <CheckSquare className="h-3 w-3" /> },
  Member:   { color: "bg-primary/20 text-primary",      icon: <Users      className="h-3 w-3" /> },
  Finance:  { color: "bg-emerald-500/20 text-emerald-400", icon: <DollarSign className="h-3 w-3" /> },
  Document: { color: "bg-violet-500/20 text-violet-400", icon: <FileText  className="h-3 w-3" /> },
  Sponsor:  { color: "bg-sky-500/20 text-sky-400",      icon: <Building2  className="h-3 w-3" /> },
};

export function TopBar() {
  const { role, setRole } = useRole();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { tasks } = useTasks();
  const { members } = useMembers();
  const { expenses, reimbursements, income } = useFinance();

  // Lightweight search index for modules without a context (Supabase direct)
  const [searchSponsors, setSearchSponsors] = useState<{ id: string; company: string; industry: string; tier: string }[]>([]);
  const [searchDocs, setSearchDocs] = useState<{ id: string; name: string; category: string; tags: string[] }[]>([]);

  useEffect(() => {
    // Fetch sponsors and documents once for search index
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    Promise.all([
      supabase.from("sponsors").select("id, company, industry, tier"),
      db.from("documents").select("id, name, category, tags"),
    ]).then(([sponsorsRes, docsRes]: [any, any]) => {
      if (sponsorsRes.data) setSearchSponsors(sponsorsRes.data);
      if (docsRes.data) setSearchDocs(docsRes.data);
    });
  }, []);

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

  const [readNotifs, setReadNotifs] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("readNotifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem("readNotifs", JSON.stringify(Array.from(readNotifs)));
  }, [readNotifs]);

  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !readNotifs.has(n.id)).length;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("recentSearches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    searchInputRef.current?.focus();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      // Escape to close
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
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

    // Events
    events
      .filter((e) => e.title.toLowerCase().includes(q) || (e.location || "").toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((e) => results.push({ type: "Event", label: e.title, sub: e.location || "No location", route: "/events" }));

    // Tasks
    tasks
      .filter((t) => t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) => results.push({ type: "Task", label: t.title, sub: t.status, route: "/tasks" }));

    // Members
    members
      .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((m) => results.push({ type: "Member", label: m.name, sub: `${m.role} • ${m.department}`, route: "/members" }));

    // Finance — expenses
    expenses
      .filter((e) => e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((e) => results.push({ type: "Finance", label: e.description, sub: `Expense • $${e.amount} • ${e.status}`, route: "/finance" }));

    // Finance — income
    income
      .filter((i) => i.source.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((i) => results.push({ type: "Finance", label: i.source, sub: `Income • $${i.amount}`, route: "/finance" }));

    // Documents
    searchDocs
      .filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || (d.tags || []).some((t) => t.toLowerCase().includes(q)))
      .slice(0, 3)
      .forEach((d) => results.push({ type: "Document", label: d.name, sub: d.category, route: "/documents" }));

    // Sponsors
    searchSponsors
      .filter((s) => s.company.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q) || s.tier.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((s) => results.push({ type: "Sponsor", label: s.company, sub: `${s.industry} • ${s.tier}`, route: "/external" }));

    return results;
  }, [searchQuery, events, tasks, members, expenses, reimbursements, income, searchDocs, searchSponsors]);

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

      <div className="relative flex-1 max-w-xl" ref={searchContainerRef}>
        <div className="flex items-center gap-2 bg-muted/40 hover:bg-muted/60 px-3 py-1.5 rounded-md border border-border/50 focus-within:border-primary/50 transition-all group">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search events, tasks, members, finance, documents, sponsors..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchQuery ? (
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-muted-foreground hover:text-foreground text-xs p-1 rounded hover:bg-muted transition-colors">✕</button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-background/50 border border-border/40 px-1.5 py-0.5 rounded pointer-events-none select-none">
              <span className="text-[11px] leading-none">⌘</span>K
            </div>
          )}
        </div>

        {/* Recent Searches Dropdown */}
        {searchOpen && searchQuery.length < 2 && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/30 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Recent Searches</span>
              <button onClick={clearRecentSearches} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
            {recentSearches.map((query, i) => (
              <button
                key={i}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/20 last:border-0 group"
                onClick={() => {
                  setSearchQuery(query);
                  saveRecentSearch(query);
                  // We don't navigate immediately here, we just fill the input so the user sees results
                  // (They can press enter or click a result to navigate)
                  searchInputRef.current?.focus();
                }}
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium flex-1 truncate">{query}</span>
              </button>
            ))}
          </div>
        )}

        {/* Regular Search Results Dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
            <div className="px-3 py-2 border-b border-border/30 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Search Results</span>
              <span className="text-[10px] text-muted-foreground">{searchResults.length} match{searchResults.length !== 1 ? "es" : ""}</span>
            </div>
            {searchResults.map((r, i) => {
              const cfg = SEARCH_TYPE_CONFIG[r.type] || { color: "bg-muted text-muted-foreground", icon: null };
              return (
                <button
                  key={i}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/20 last:border-0"
                  onClick={() => { 
                    saveRecentSearch(searchQuery);
                    navigate({ pathname: r.route, search: `?search=${encodeURIComponent(r.label)}` }); 
                    setSearchQuery(""); 
                    setSearchOpen(false); 
                  }}
                >
                  <span className={cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase whitespace-nowrap", cfg.color)}>
                    {cfg.icon}{r.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{r.sub}</p>
                  </div>
                </button>
              );
            })}
            <div className="px-4 py-2 border-t border-border/30 bg-muted/20">
              <p className="text-[10px] text-muted-foreground">
                Searching across events, tasks, members, finance, documents &amp; sponsors
              </p>
            </div>
          </div>
        )}
        {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 p-4 text-center text-xs text-muted-foreground">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 group">
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center animate-in zoom-in">{unreadCount}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-xl" sideOffset={8}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-border/50">
              <span className="font-semibold text-sm">Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
              {unreadCount > 0 && (
                <button 
                  className="text-[10px] font-medium text-primary hover:underline outline-none transition-colors" 
                  onClick={() => setReadNotifs(new Set(notifications.map((n) => n.id)))}
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-sm text-muted-foreground italic h-32 flex items-center justify-center bg-muted/20">
                You're all caught up!
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto w-full">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={cn(
                      "flex flex-col items-start gap-1 w-full p-4 border-b border-border/50 bg-background hover:bg-muted/50 transition-colors text-left outline-none focus-visible:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                      readNotifs.has(n.id) && "opacity-60 bg-muted/20 hover:bg-muted/40"
                    )}
                    onClick={() => { 
                      setReadNotifs((prev) => new Set(prev).add(n.id)); 
                      setNotifOpen(false); 
                      navigate(n.route); 
                    }}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <span className={cn("text-sm font-medium leading-tight text-foreground", !readNotifs.has(n.id) && "text-primary")}>{n.title}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{n.time}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{n.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

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
