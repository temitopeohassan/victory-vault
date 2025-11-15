"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Zap } from "lucide-react"

interface PortfolioData {
  totalStaked: number
  totalEarned: number
  totalReturned: number
  roi: number
  activeStakes: number
  resolvedStakes: number
  winRate: number
}

export function PortfolioOverview({ data }: { data: PortfolioData }) {
  const stats = [
    {
      title: "Total Staked",
      value: `$${data.totalStaked.toLocaleString()}`,
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Total Earned",
      value: `$${data.totalEarned.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "ROI",
      value: `${data.roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-secondary",
    },
    {
      title: "Win Rate",
      value: `${(data.winRate * 100).toFixed(1)}%`,
      icon: Zap,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
