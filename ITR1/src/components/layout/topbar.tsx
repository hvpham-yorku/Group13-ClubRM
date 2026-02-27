import { Bell, Search, ChevronDown, User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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

      <div className="flex-1 flex max-w-xl items-center gap-2 bg-muted/40 hover:bg-muted/60 px-3 py-1.5 rounded-md border border-border/50 focus-within:border-primary/50 transition-all group">
        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search events, members, tasks... (Cmd+K)"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
        />
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-focus-within:opacity-0 transition-opacity">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background anim-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              Notifications
              <span className="text-[10px] font-normal text-muted-foreground cursor-pointer hover:text-primary">Mark all read</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="py-2 px-1 text-center text-xs text-muted-foreground italic h-24 flex items-center justify-center">
              No new notifications
            </div>
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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
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
