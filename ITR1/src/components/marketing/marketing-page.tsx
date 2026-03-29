import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { 
  type Campaign, 
  type CampaignStatus, 
  type PostPlatform, 
  SEED_CAMPAIGNS, 
  CAMPAIGN_STATUS_CONFIG, 
  PLATFORM_CONFIG, 
  formatNumber 
} from "./types"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts"
import {
  Search, Plus, Megaphone, Eye, Heart, MessageCircle, 
  Share2, TrendingUp, Target, BarChart3, ChevronRight, 
  Calendar, DollarSign, Activity
} from "lucide-react"

const PIE_COLORS = ["#f472b6", "#38bdf8", "#3b82f6", "#a78bfa", "#818cf8"]

export function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeTab, setActiveTab] = useState<"campaigns" | "analytics" | "calendar" | "live-feed">("campaigns")
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") || ""
  
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // 1. Data Fetching
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: true })
      if (data && data.length > 0) {
        setCampaigns(data.map(toCampaign))
      } else {
        setCampaigns(SEED_CAMPAIGNS)
      }
    }
    load()
  }, [])

  // 2. Computed Analytics Data
  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, search, statusFilter])

  const publishedPosts = useMemo(() => campaigns.flatMap((c) => c.posts).filter((p) => p.status === "published"), [campaigns])

  const chartData = useMemo(() => campaigns.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 10) + '...' : c.name,
    reach: c.reach,
    engagement: c.engagement
  })), [campaigns])

  const platformData = useMemo(() => {
    const platforms: PostPlatform[] = ["instagram", "twitter", "linkedin", "tiktok"]
    return platforms.map(p => ({
      name: PLATFORM_CONFIG[p].label,
      value: publishedPosts.filter(post => post.platform === p).reduce((sum, post) => sum + post.impressions, 0)
    })).filter(d => d.value > 0)
  }, [publishedPosts])

  return (
    <div className="flex flex-col gap-6 p-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
          <p className="text-sm text-muted-foreground">Campaign performance and social reach</p>
        </div>
        <button 
          onClick={() => setAddOpen(true)}
          className="bg-[#FF8A8A] text-white px-4 py-2 rounded-md font-bold hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Toolbar / Navigation */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-md border border-border/50">
            {[
              { id: "campaigns", label: "Campaigns", icon: <Megaphone className="h-4 w-4" /> },
              { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
              { id: "live-feed", label: "Live Feed", icon: <Activity className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearchParams({ search: e.target.value })} 
                className="pl-9 w-[200px] bg-background" 
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(CAMPAIGN_STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === "campaigns" && (
          <div className="grid gap-3">
            {filtered.map((campaign) => (
              <div 
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className="group p-5 border rounded-xl bg-card hover:border-[#FF8A8A]/50 transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg group-hover:text-[#FF8A8A]">{campaign.name}</h3>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", CAMPAIGN_STATUS_CONFIG[campaign.status].color)}>
                      {CAMPAIGN_STATUS_CONFIG[campaign.status].label}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {campaign.startDate}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${campaign.spent} spent</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Reach vs Engagement
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="reach" fill="#f472b6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engagement" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Platform Impressions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={platformData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {platformData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">{selectedCampaign?.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Reach</p>
                <p className="text-xl font-bold">{formatNumber(selectedCampaign?.reach || 0)}</p>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Engagement</p>
                <p className="text-xl font-bold">{formatNumber(selectedCampaign?.engagement || 0)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function toCampaign(row: any): Campaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    posts: row.posts || [],
    budget: Number(row.budget),
    spent: Number(row.spent),
    reach: Number(row.reach),
    engagement: Number(row.engagement),
    tags: row.tags || [],
  }
}