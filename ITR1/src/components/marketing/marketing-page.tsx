import { useState, useMemo } from "react"
import { type Campaign, type PostPlatform, SEED_CAMPAIGNS, CAMPAIGN_STATUS_CONFIG, PLATFORM_CONFIG, POST_STATUS_CONFIG, formatNumber } from "./types"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Search,
  Plus,
  Megaphone,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Target,
  BarChart3,
  ChevronRight,
  Calendar,
  DollarSign,
  ArrowUpRight,
} from "lucide-react"

const PIE_COLORS = ["#f472b6", "#38bdf8", "#3b82f6", "#a78bfa", "#818cf8"]

export function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // Add form
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formBudget, setFormBudget] = useState("")
  const [formStart, setFormStart] = useState("")
  const [formEnd, setFormEnd] = useState("")

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, search, statusFilter])

  // Aggregate stats
  const allPosts = campaigns.flatMap((c) => c.posts)
  const publishedPosts = allPosts.filter((p) => p.status === "published")
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0)
  const totalEngagement = campaigns.reduce((sum, c) => sum + c.engagement, 0)
  const totalLikes = publishedPosts.reduce((sum, p) => sum + p.likes, 0)
  const totalComments = publishedPosts.reduce((sum, p) => sum + p.comments, 0)
  const totalShares = publishedPosts.reduce((sum, p) => sum + p.shares, 0)
  const engagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : "0"

  // Platform breakdown for pie chart
  const platformData = (["instagram", "twitter", "linkedin", "tiktok", "facebook"] as PostPlatform[]).map((platform) => {
    const posts = publishedPosts.filter((p) => p.platform === platform)
    return {
      name: PLATFORM_CONFIG[platform].label,
      value: posts.reduce((sum, p) => sum + p.impressions, 0),
      posts: posts.length,
    }
  }).filter((d) => d.value > 0)

  // Campaign performance bar chart
  const campaignChartData = campaigns
    .filter((c) => c.status !== "draft")
    .map((c) => ({
      name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
      reach: c.reach,
      engagement: c.engagement,
    }))

  function resetForm() {
    setFormName("")
    setFormDesc("")
    setFormBudget("")
    setFormStart("")
    setFormEnd("")
  }

  function handleAdd() {
    if (!formName.trim()) return
    const newCampaign: Campaign = {
      id: `camp${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim(),
      status: "draft",
      startDate: formStart || new Date().toISOString().split("T")[0],
      endDate: formEnd || "",
      budget: Number(formBudget) || 0,
      spent: 0,
      reach: 0,
      engagement: 0,
      tags: [],
      posts: [],
    }
    setCampaigns((prev) => [...prev, newCampaign])
    resetForm()
    setAddOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing & Social Media</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage campaigns, track posts, and measure engagement across platforms</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-pink-400">
            <Eye className="h-4 w-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Total Reach</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalReach)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Engagement</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalEngagement)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-rose-400">
            <Heart className="h-4 w-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Likes</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalLikes)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <MessageCircle className="h-4 w-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Comments</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalComments)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-violet-400">
            <Share2 className="h-4 w-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Shares</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalShares)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Target className="h-4 w-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Eng. Rate</span>
          </div>
          <p className="text-xl font-bold">{engagementRate}%</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[200px]" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(CAMPAIGN_STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            {filtered.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", CAMPAIGN_STATUS_CONFIG[campaign.status].color)}>
                        {CAMPAIGN_STATUS_CONFIG[campaign.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {campaign.startDate} — {campaign.endDate || "Ongoing"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" /> ${campaign.spent} / ${campaign.budget}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Megaphone className="h-3 w-3" /> {campaign.posts.length} posts
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>

                {/* Platform badges + quick stats */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    {[...new Set(campaign.posts.map((p) => p.platform))].map((platform) => (
                      <span key={platform} className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", PLATFORM_CONFIG[platform].color)}>
                        {PLATFORM_CONFIG[platform].icon}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(campaign.reach)}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(campaign.engagement)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Campaign Performance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={campaignChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#475569" />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#475569" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }}
                    formatter={(value) => formatNumber(value as number)}
                  />
                  <Bar dataKey="reach" fill="#f472b6" radius={[4, 4, 0, 0]} name="Reach" />
                  <Bar dataKey="engagement" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Impressions by Platform</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                      {platformData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }}
                      formatter={(value) => formatNumber(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {platformData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-card border border-border/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-primary" /> Top Performing Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {publishedPosts
                  .sort((a, b) => b.impressions - a.impressions)
                  .slice(0, 6)
                  .map((post) => {
                    const campaign = campaigns.find((c) => c.id === post.campaignId)
                    return (
                      <div key={post.id} className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", PLATFORM_CONFIG[post.platform].color)}>
                            {PLATFORM_CONFIG[post.platform].icon}
                          </span>
                          <span className="text-xs text-muted-foreground">{campaign?.name}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(post.impressions)}</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(post.likes)}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
                          <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {post.shares}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content Calendar Tab */}
        <TabsContent value="calendar">
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Upcoming & Recent Posts</h3>
            <div className="space-y-2">
              {allPosts
                .filter((p) => p.scheduledDate || p.publishedDate)
                .sort((a, b) => {
                  const dateA = a.scheduledDate || a.publishedDate || ""
                  const dateB = b.scheduledDate || b.publishedDate || ""
                  return new Date(dateB).getTime() - new Date(dateA).getTime()
                })
                .map((post) => {
                  const campaign = campaigns.find((c) => c.id === post.campaignId)
                  return (
                    <div key={post.id} className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0">
                      <div className="text-center shrink-0 w-14">
                        <p className="text-lg font-bold">{(post.publishedDate || post.scheduledDate || "").slice(8, 10)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {new Date(post.publishedDate || post.scheduledDate || "").toLocaleString("default", { month: "short" })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", PLATFORM_CONFIG[post.platform].color)}>
                            {PLATFORM_CONFIG[post.platform].icon}
                          </span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", POST_STATUS_CONFIG[post.status].color)}>
                            {POST_STATUS_CONFIG[post.status].label}
                          </span>
                          <span className="text-xs text-muted-foreground">{campaign?.name}</span>
                        </div>
                        <p className="text-sm truncate">{post.content}</p>
                        {post.status === "published" && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{formatNumber(post.impressions)} impressions</span>
                            <span>{formatNumber(post.likes)} likes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  {selectedCampaign.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", CAMPAIGN_STATUS_CONFIG[selectedCampaign.status].color)}>
                    {CAMPAIGN_STATUS_CONFIG[selectedCampaign.status].label}
                  </span>
                  {selectedCampaign.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground capitalize">{tag}</span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">{formatNumber(selectedCampaign.reach)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Reach</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">{formatNumber(selectedCampaign.engagement)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Engagement</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">{selectedCampaign.posts.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Posts</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold">${selectedCampaign.spent}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Spent</p>
                  </div>
                </div>

                {/* Budget bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Budget Usage</span>
                    <span>${selectedCampaign.spent} / ${selectedCampaign.budget}</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((selectedCampaign.spent / selectedCampaign.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Posts */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Posts</h4>
                  <div className="space-y-2">
                    {selectedCampaign.posts.map((post) => (
                      <div key={post.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", PLATFORM_CONFIG[post.platform].color)}>
                            {PLATFORM_CONFIG[post.platform].icon}
                          </span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", POST_STATUS_CONFIG[post.status].color)}>
                            {POST_STATUS_CONFIG[post.status].label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {post.publishedDate || post.scheduledDate || "No date"}
                          </span>
                        </div>
                        <p className="text-sm">{post.content}</p>
                        {post.status === "published" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/20">
                            <span><Eye className="h-3 w-3 inline mr-1" />{formatNumber(post.impressions)}</span>
                            <span><Heart className="h-3 w-3 inline mr-1" />{formatNumber(post.likes)}</span>
                            <span><MessageCircle className="h-3 w-3 inline mr-1" />{post.comments}</span>
                            <span><Share2 className="h-3 w-3 inline mr-1" />{post.shares}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Campaign Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Spring Recruitment" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Brief description of the campaign..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget ($)</Label>
              <Input type="number" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setAddOpen(false) }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formName.trim()}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
