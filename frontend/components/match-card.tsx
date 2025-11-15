"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useStake } from "@/lib/contracts/usePredictionMarket"
import { useAccount } from "wagmi"
import { useState } from "react"

interface Match {
  id: string
  teamA: string
  teamB: string
  startTime: Date
  status: string
  totalPool: number
  poolA: number
  poolB: number
  odds: { teamA: number; teamB: number }
}

export function MatchCard({ match }: { match: Match }) {
  const { address, isConnected } = useAccount()
  const { stake, isPending } = useStake()
  const [stakeAmount, setStakeAmount] = useState("10")
  const timeUntilStart = Math.max(0, Math.floor((match.startTime.getTime() - Date.now()) / 1000 / 60))
  const poolAPercent = (match.poolA / match.totalPool) * 100
  const poolBPercent = (match.poolB / match.totalPool) * 100

  const handleStake = (outcome: 1 | 2) => {
    if (!isConnected) return
    // Convert match.id to bytes32
    const matchIdBytes32 = match.id.startsWith('0x') 
      ? match.id as `0x${string}`
      : `0x${match.id.padStart(64, '0')}` as `0x${string}`
    
    stake(matchIdBytes32, outcome, stakeAmount)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{match.teamA}</h3>
            <p className="text-sm text-muted-foreground">vs</p>
            <h3 className="font-semibold text-foreground text-lg">{match.teamB}</h3>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
            {match.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Starts in {timeUntilStart} minutes</span>
        </div>

        {/* Pool Distribution */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">{match.teamA}</span>
            <span className="text-muted-foreground">${match.poolA.toLocaleString()}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full transition-all" style={{ width: `${poolAPercent}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">{match.teamB}</span>
            <span className="text-muted-foreground">${match.poolB.toLocaleString()}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-secondary h-full transition-all" style={{ width: `${poolBPercent}%` }} />
          </div>
        </div>

        {/* Total Pool */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Total Pool</span>
            <span className="font-semibold text-foreground">${match.totalPool.toLocaleString()}</span>
          </div>

          {/* Odds */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Odds</p>
              <p className="font-semibold text-foreground">{match.odds.teamA.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Odds</p>
              <p className="font-semibold text-foreground">{match.odds.teamB.toFixed(2)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              size="sm"
              onClick={() => handleStake(1)}
              disabled={!isConnected || isPending || match.status !== 'active'}
            >
              {isPending ? 'Staking...' : `Stake ${match.teamA.split(" ")[0]}`}
            </Button>
            <Button
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
              size="sm"
              onClick={() => handleStake(2)}
              disabled={!isConnected || isPending || match.status !== 'active'}
            >
              {isPending ? 'Staking...' : `Stake ${match.teamB.split(" ")[0]}`}
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Connect wallet to stake
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
