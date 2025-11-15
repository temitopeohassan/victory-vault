"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Zap, Award } from "lucide-react"

interface Profile {
  totalStaked: number
  totalEarned: number
  totalReturned: number
  roi: number
  winRate: number
  averageOdds: number
  bestWin: number
  longestWinStreak: number
}

export function ProfileStats({ profile }: { profile: Profile }) {
  const stats = [
    {
      title: "Total Staked",
      value: `$${profile.totalStaked.toLocaleString()}`,
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Total Earned",
      value: `$${profile.totalEarned.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "ROI",
      value: `${profile.roi.toFixed(1)}%`,
      icon: Award,
      color: "text-secondary",
    },
    {
      title: "Win Rate",
      value: `${(profile.winRate * 100).toFixed(1)}%`,
      icon: Zap,
      color: "text-primary",
    },
    {
      title: "Avg Odds",
      value: `${profile.averageOdds.toFixed(2)}x`,
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Best Win",
      value: `$${profile.bestWin.toLocaleString()}`,
      icon: Award,
      color: "text-secondary",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <Icon className={`w-6 h-6 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
