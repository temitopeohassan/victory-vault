"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface Winner {
  id: string
  user: string
  stakeAmount: number
  odds: number
  winnings: number
  share: number
}

export function WinnersList({ winners }: { winners: Winner[] }) {
  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <CardTitle>Winners</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {winners.map((winner, index) => (
            <div
              key={winner.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                  #{index + 1}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{winner.user}</p>
                  <p className="text-xs text-muted-foreground">{(winner.share * 100).toFixed(2)}% of pool</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${winner.stakeAmount.toLocaleString()}</p>
                <p className="text-xs text-accent font-bold">+${winner.winnings.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
