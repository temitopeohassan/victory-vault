"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Medal } from "lucide-react"

interface Ranking {
  rank: number
  username: string
  totalEarned: number
  roi: number
}

interface LeagueRankingsProps {
  rankings: Ranking[]
  userRank: number
}

export function LeagueRankings({ rankings, userRank }: LeagueRankingsProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-orange-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-accent" />
          <CardTitle>Global Rankings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankings.map((ranking) => (
            <div
              key={ranking.rank}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                ranking.rank === userRank ? "bg-accent/10 border border-accent/20" : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`${getMedalColor(ranking.rank)} border-current bg-transparent`}>
                  #{ranking.rank}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{ranking.username}</p>
                  <p className="text-xs text-muted-foreground">{ranking.roi.toFixed(1)}% ROI</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">${ranking.totalEarned.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
