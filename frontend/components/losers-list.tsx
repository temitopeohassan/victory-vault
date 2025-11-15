"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Loser {
  id: string
  user: string
  stakeAmount: number
  odds: number
  loss: number
}

export function LosersList({ losers }: { losers: Loser[] }) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <X className="w-5 h-5 text-destructive" />
          <CardTitle>Losers</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {losers.map((loser) => (
            <div
              key={loser.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                  Lost
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{loser.user}</p>
                  <p className="text-xs text-muted-foreground">{loser.odds.toFixed(2)}x odds</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${loser.stakeAmount.toLocaleString()}</p>
                <p className="text-xs text-destructive font-bold">-${loser.loss.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
