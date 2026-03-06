import { StatCard } from "../stat-card"
import { Widget } from "../widget"
import { ProgressBar } from "../progress-bar"
import { DashboardList, DashboardListItem } from "../dashboard-list"
import { Eye, Heart, Share2, Megaphone, TrendingUp } from "lucide-react"

export function MarketingDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard
        title="Total Reach"
        value="28.1K"
        trend={{ value: 34, label: "vs last month" }}
        icon={<Eye className="h-5 w-5" />}
      />
      <StatCard
        title="Engagement Rate"
        value="14.9%"
        trend={{ value: 3, label: "vs last month" }}
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <StatCard
        title="Active Campaigns"
        value="2"
        description="4 total campaigns"
        icon={<Megaphone className="h-5 w-5" />}
      />

      <Widget title="Campaign Performance">
        <div className="space-y-3">
          <ProgressBar value={64} label="Winter Recruitment Drive" subLabel="$320 / $500 budget" color="emerald" />
          <ProgressBar value={42} label="Tech Talk Series Promo" subLabel="$85 / $200 budget" color="pink" />
          <ProgressBar value={100} label="Valentine Social Event" subLabel="Completed • $150 spent" color="default" />
          <ProgressBar value={0} label="Sponsorship Highlight Reel" subLabel="Draft • $0 / $100 budget" color="amber" />
        </div>
      </Widget>

      <Widget title="Top Posts" footer={<span className="cursor-pointer hover:text-primary transition-colors italic">View all posts →</span>}>
        <DashboardList>
          <DashboardListItem
            title="TikTok — ClubRM Valentine Social"
            subtitle="567 likes • 78 comments • 95 shares"
            metadata="8.2K imp"
            icon={<Heart className="h-4 w-4 text-pink-400" />}
          />
          <DashboardListItem
            title="TikTok — Best club at YorkU"
            subtitle="892 likes • 67 comments • 134 shares"
            metadata="15.2K imp"
            icon={<Heart className="h-4 w-4 text-pink-400" />}
          />
          <DashboardListItem
            title="LinkedIn — Exec team spotlight"
            subtitle="156 likes • 23 comments • 31 shares"
            metadata="4.5K imp"
            icon={<Share2 className="h-4 w-4 text-blue-400" />}
          />
        </DashboardList>
      </Widget>

      <Widget title="Scheduled Posts">
        <DashboardList>
          <DashboardListItem
            title="Instagram — Meet our exec team"
            subtitle="Scheduled for Feb 18"
            metadata="IG"
            icon={<Megaphone className="h-4 w-4 text-amber-400" />}
          />
        </DashboardList>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">No other posts scheduled</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Create new posts in the Marketing module</p>
        </div>
      </Widget>
    </div>
  )
}
