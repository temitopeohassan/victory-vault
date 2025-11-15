"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Stake {
  id: string
  user: string
  team: string
  amount: number
  odds: number
  timestamp: number
}

export function RecentStakes({ stakes }: { stakes: Stake[] }) {
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Stakes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stakes.map((stake) => (
            <div
              key={stake.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{stake.user}</p>
                <p className="text-xs text-muted-foreground">{stake.team}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${stake.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{formatTime(stake.timestamp)}</p>
              </div>
              <Badge variant="outline" className="ml-3 bg-accent/10 text-accent border-accent">
                {stake.odds.toFixed(2)}x
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
