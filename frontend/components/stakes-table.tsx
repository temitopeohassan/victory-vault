"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useClaimReward, useClaimRefund } from "@/lib/contracts/usePredictionMarket"
import { useAccount } from "wagmi"

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
  matchResult?: string // 'teamA', 'teamB', or 'draw'
}

interface StakesTableProps {
  stakes: Stake[]
  type: "active" | "resolved"
}

export function StakesTable({ stakes, type }: StakesTableProps) {
  const { isConnected } = useAccount()
  const { claimReward, isPending: isClaimingReward, isSuccess: isRewardClaimed, error: claimError } = useClaimReward()
  const { claimRefund, isPending: isClaimingRefund, isSuccess: isRefundClaimed } = useClaimRefund()
  const [claimingMatchId, setClaimingMatchId] = useState<string | null>(null)

  const handleClaim = (stake: Stake) => {
    if (!isConnected || !stake.matchId) return
    
    setClaimingMatchId(stake.matchId)
    
    // Check if match was a draw - use claimRefund
    if (stake.matchResult === 'draw') {
      claimRefund(stake.matchId)
    } else {
      // Otherwise use claimReward (only works if user won)
      claimReward(stake.matchId)
    }
  }

  // Reset claiming state after success
  useEffect(() => {
    if (isRewardClaimed || isRefundClaimed) {
      setClaimingMatchId(null)
    }
  }, [isRewardClaimed, isRefundClaimed])
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
        {/* Claim Error Message */}
        {claimError && claimingMatchId && (
          <div className="mb-4 flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              {claimError.message || "Failed to claim. You may have already claimed or didn't win this match."}
            </p>
          </div>
        )}

        {/* Claim Success Message */}
        {(isRewardClaimed || isRefundClaimed) && (
          <div className="mb-4 flex gap-2 bg-accent/10 border border-accent/20 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-accent">
              {isRefundClaimed ? "Refund claimed successfully!" : "Rewards claimed successfully!"}
            </p>
          </div>
        )}

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

                {/* Claim Button (for resolved won stakes) or View Button */}
                {type === "resolved" && stake.status === "won" && isConnected ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleClaim(stake)}
                    disabled={isClaimingReward || isClaimingRefund || claimingMatchId === stake.matchId}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isClaimingReward || isClaimingRefund ? "Claiming..." : "Claim"}
                  </Button>
                ) : type === "resolved" && stake.matchResult === "draw" && isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaim(stake)}
                    disabled={isClaimingReward || isClaimingRefund || claimingMatchId === stake.matchId}
                  >
                    {isClaimingReward || isClaimingRefund ? "Claiming..." : "Claim Refund"}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
