"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface Stake {
  id: string
  matchId: string
  teamA: string
  teamB: string
  stakedTeam: string
  amount: number
  odds: number
  potentialWinnings?: number
  actualWinnings?: number
  status: string
  placedAt: Date
  matchTime?: Date
  resolvedAt?: Date
}

interface StakesTableProps {
  stakes: Stake[]
  type: "active" | "resolved"
}

export function StakesTable({ stakes, type }: StakesTableProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-accent/10 text-accent border-accent"
      case "lost":
        return "bg-destructive/10 text-destructive border-destructive"
      case "active":
        return "bg-primary/10 text-primary border-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "active" ? "Active Stakes" : "Stake History"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stakes.map((stake) => (
            <div
              key={stake.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {stake.teamA} vs {stake.teamB}
                    </p>
                    <p className="text-sm text-muted-foreground">Staked on {stake.stakedTeam}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Stake Amount */}
                <div className="text-right">
                  <p className="font-semibold text-foreground">${stake.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stake.odds.toFixed(2)}x odds</p>
                </div>

                {/* Winnings */}
                {type === "active" ? (
                  <div className="text-right">
                    <p className="font-semibold text-accent">${stake.potentialWinnings?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Potential</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className={`font-semibold ${stake.status === "won" ? "text-accent" : "text-destructive"}`}>
                      ${stake.actualWinnings?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{stake.status === "won" ? "Won" : "Lost"}</p>
                  </div>
                )}

                {/* Status Badge */}
                <Badge variant="outline" className={getStatusColor(stake.status)}>
                  {stake.status === "active" ? "Pending" : stake.status === "won" ? "Won" : "Lost"}
                </Badge>

                {/* Date */}
                <div className="text-right text-xs text-muted-foreground min-w-fit">
                  <p>{formatDate(type === "active" ? stake.matchTime! : stake.resolvedAt!)}</p>
                </div>

                {/* Action Button */}
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
