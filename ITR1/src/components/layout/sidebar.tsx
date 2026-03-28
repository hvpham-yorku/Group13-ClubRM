import {
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
  CheckSquare,
  DollarSign,
  Handshake,
  Megaphone,
  FileText,
  BarChart,
  UserCircle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { useLocation, Link } from "react-router-dom"
import { useRole, type Role } from "@/context/role-context"
import { useTasks } from "@/context/tasks-context"
import { useEvents } from "@/context/events-context"
import { useFinance } from "@/context/finance-context"
import { useAuth } from "@/context/auth-context"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  title: string
  url: string
  icon: LucideIcon
  roles?: Role[]
  badge?: string
}

const items: SidebarItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, badge: "overdueTasks" },
  { title: "Events", url: "/events", icon: Calendar, badge: "eventRisks" },
  { title: "Members", url: "/members", icon: Users },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
    roles: ["President", "VP Finance", "Administrator"],
    badge: "pendingExpenses",
  },
  {
    title: "External",
    url: "/external",
    icon: Handshake,
    roles: ["President", "VP External", "Administrator"],
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: Megaphone,
    roles: ["President", "Marketing", "Administrator"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart,
    roles: ["President", "VP Internal", "VP Finance", "VP Events", "VP External", "Marketing", "Administrator"],
  },
  { title: "Documents", url: "/documents", icon: FileText },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["Administrator"],
  },
]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    "from-rose-500 to-pink-600",
    "from-orange-500 to-amber-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600",
    "from-blue-500 to-violet-600",
    "from-violet-500 to-purple-600",
  ]
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[idx % colors.length]
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const { role } = useRole()
  const { tasks } = useTasks()
  const { expenses } = useFinance()
  const { events } = useEvents()
  const { user } = useAuth()

  const filteredItems = items.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(role)
  })

  const now = new Date()
  const overdueTasks = tasks.filter((t) => {
    const due = t.dueDate ? new Date(t.dueDate) : null
    return due && due < now && t.status !== "done"
  }).length
  const pendingExpenses = expenses.filter((e) => e.status === "pending").length
  const upcomingEvents = events.filter((e) => {
    const start = new Date(e.startDate)
    const diff = start.getTime() - now.getTime()
    return diff > 0 && diff < 48 * 60 * 60 * 1000
  }).length

  const badges: Record<string, string | number> = {}
  if (overdueTasks > 0) badges.overdueTasks = overdueTasks
  if (upcomingEvents > 0) badges.eventRisks = upcomingEvents
  if (pendingExpenses > 0) badges.pendingExpenses = pendingExpenses

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "My Profile"
  const isProfileActive = pathname === "/profile"

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="ClubRM Logo" className="h-8 w-8 object-contain" />
          <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            Club<span className="text-primary">RM</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="h-11 px-3 group/btn hover:bg-primary/5 data-[active=true]:bg-primary data-[active=true]:text-black transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0 group-data-[active=true]/btn:text-black" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && badges[item.badge] && (
                    <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                      {badges[item.badge]}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}