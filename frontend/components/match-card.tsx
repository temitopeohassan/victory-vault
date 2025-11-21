"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { useStake } from "@/lib/contracts/usePredictionMarket"
import { useAccount } from "wagmi"
import { useState, useEffect } from "react"
import { useMatchFromContract } from "@/lib/hooks/useMatchFromContract"

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
  console.log('[MatchCard] Component rendered', { matchId: match.id, match })
  
  const { address, isConnected } = useAccount()
  console.log('[MatchCard] useAccount state', { address, isConnected })
  
  const { stake, isPending, error } = useStake()
  console.log('[MatchCard] useStake state', { isPending, error })
  
  const [stakeAmount] = useState("1") // Default stake amount in CELO
  
  // Try to fetch match data from contract to get actual CELO values
  const { match: contractMatch, isLoading: isLoadingContract } = useMatchFromContract(match.id)
  console.log('[MatchCard] Contract match data', { 
    contractMatch, 
    isLoadingContract, 
    hasContractMatch: !!contractMatch,
    contractPoolA: contractMatch?.poolA,
    contractPoolB: contractMatch?.poolB,
    contractTotalPool: contractMatch?.totalPool
  })
  
  // Use contract data if available, otherwise fall back to API data
  // Note: API returns USD values, contract returns CELO values
  const displayMatch = contractMatch || match
  console.log('[MatchCard] Display match (contract or API)', {
    source: contractMatch ? 'contract' : 'API',
    displayMatch,
    poolA: displayMatch.poolA,
    poolB: displayMatch.poolB,
    totalPool: displayMatch.totalPool
  })
  
  const timeUntilStart = Math.max(0, Math.floor((displayMatch.startTime.getTime() - Date.now()) / 1000 / 60))
  const poolAPercent = displayMatch.totalPool > 0 ? (displayMatch.poolA / displayMatch.totalPool) * 100 : 50
  const poolBPercent = displayMatch.totalPool > 0 ? (displayMatch.poolB / displayMatch.totalPool) * 100 : 50
  console.log('[MatchCard] Calculated values', { timeUntilStart, poolAPercent, poolBPercent })

  const handleStake = async (outcome: 1 | 2) => {
    console.log('[MatchCard] handleStake called', { outcome, isConnected, matchId: match.id, stakeAmount })
    if (!isConnected) {
      console.warn('[MatchCard] Cannot stake: wallet not connected')
      return
    }
    try {
      console.log('[MatchCard] Calling stake function', { matchId: match.id, outcome, stakeAmount })
      // Outcome: 1 = TeamA, 2 = TeamB
      // Ensure amount is a valid string for parseEther
      await stake(match.id, outcome, stakeAmount)
      console.log('[MatchCard] Stake function completed successfully')
    } catch (err) {
      // Error is handled by the hook and displayed via the error prop
      console.error("[MatchCard] Staking error:", err)
    }
  }
  
  // Log button state
  useEffect(() => {
    console.log('[MatchCard] Button state check', {
      isConnected,
      isPending,
      matchStatus: displayMatch.status,
      canStake: isConnected && !isPending && displayMatch.status === 'active'
    })
  }, [isConnected, isPending, displayMatch.status])

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{displayMatch.teamA}</h3>
            <p className="text-sm text-muted-foreground">vs</p>
            <h3 className="font-semibold text-foreground text-lg">{displayMatch.teamB}</h3>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
            {displayMatch.status}
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
            <span className="text-foreground font-medium">{displayMatch.teamA}</span>
            <span className="text-muted-foreground">
              {isLoadingContract ? '...' : `${displayMatch.poolA.toFixed(2)} CELO`}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full transition-all" style={{ width: `${poolAPercent}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">{displayMatch.teamB}</span>
            <span className="text-muted-foreground">
              {isLoadingContract ? '...' : `${displayMatch.poolB.toFixed(2)} CELO`}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-secondary h-full transition-all" style={{ width: `${poolBPercent}%` }} />
          </div>
        </div>

        {/* Total Pool */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Total Pool</span>
            <span className="font-semibold text-foreground">
              {isLoadingContract ? '...' : `${displayMatch.totalPool.toFixed(2)} CELO`}
            </span>
          </div>

          {/* Odds */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Odds</p>
              <p className="font-semibold text-foreground">{displayMatch.odds.teamA.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Odds</p>
              <p className="font-semibold text-foreground">{displayMatch.odds.teamB.toFixed(2)}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg mb-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                {error.message || "Transaction failed. Please ensure you have enough CELO (1 CELO + gas fees)."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 relative" style={{ zIndex: 10, pointerEvents: 'auto' }}>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent cursor-pointer relative z-10"
              size="sm"
              type="button"
              onClick={(e) => {
                console.log('[MatchCard] Button TeamA clicked', { 
                  event: e, 
                  isPending, 
                  isConnected, 
                  status: displayMatch.status,
                  disabled: !isConnected || isPending || displayMatch.status !== 'active'
                })
                e.preventDefault()
                e.stopPropagation()
                if (!isPending && isConnected && displayMatch.status === 'active') {
                  console.log('[MatchCard] Calling handleStake(1)')
                  handleStake(1)
                } else {
                  console.warn('[MatchCard] Cannot stake TeamA', { isPending, isConnected, status: displayMatch.status })
                }
              }}
              disabled={!isConnected || isPending || displayMatch.status !== 'active'}
              style={{ pointerEvents: 'auto' }}
            >
              {isPending ? 'Staking...' : `Stake ${displayMatch.teamA.split(" ")[0]}`}
            </Button>
            <Button
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent cursor-pointer relative z-10"
              size="sm"
              type="button"
              onClick={(e) => {
                console.log('[MatchCard] Button TeamB clicked', { 
                  event: e, 
                  isPending, 
                  isConnected, 
                  status: displayMatch.status,
                  disabled: !isConnected || isPending || displayMatch.status !== 'active'
                })
                e.preventDefault()
                e.stopPropagation()
                if (!isPending && isConnected && displayMatch.status === 'active') {
                  console.log('[MatchCard] Calling handleStake(2)')
                  handleStake(2)
                } else {
                  console.warn('[MatchCard] Cannot stake TeamB', { isPending, isConnected, status: displayMatch.status })
                }
              }}
              disabled={!isConnected || isPending || displayMatch.status !== 'active'}
              style={{ pointerEvents: 'auto' }}
            >
              {isPending ? 'Staking...' : `Stake ${displayMatch.teamB.split(" ")[0]}`}
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Connect wallet to stake
            </p>
          )}
          {isConnected && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              Stake amount: 1 CELO
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
