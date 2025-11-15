"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Zap } from "lucide-react"
import { type Match } from "@/lib/api"

interface StatsOverviewProps {
  matches?: Match[]
}

export function StatsOverview({ matches = [] }: StatsOverviewProps) {
  const totalVolume = matches.reduce((sum, m) => sum + (m.totalPool || 0), 0)
  const activeMatches = matches.filter(m => m.status === 'active').length

  const stats = [
    {
      title: "Total Volume Staked",
      value: `$${(totalVolume / 1000).toFixed(1)}K`,
      change: null as string | null,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Total Matches",
      value: matches.length.toString(),
      change: null as string | null,
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Active Matches",
      value: activeMatches.toString(),
      change: null as string | null,
      icon: Zap,
      color: "text-accent",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {stat.change && <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>}
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
