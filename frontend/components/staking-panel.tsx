"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface Match {
  teamA: string
  teamB: string
  odds: { teamA: number; teamB: number }
  totalPool: number
}

interface StakingPanelProps {
  match: Match
  selectedTeam: "A" | "B" | null
  onSelectTeam: (team: "A" | "B" | null) => void
}

export function StakingPanel({ match, selectedTeam, onSelectTeam }: StakingPanelProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const selectedTeamName = selectedTeam === "A" ? match.teamA : selectedTeam === "B" ? match.teamB : null
  const selectedOdds = selectedTeam === "A" ? match.odds.teamA : selectedTeam === "B" ? match.odds.teamB : 0
  const potentialWinnings = stakeAmount ? (Number.parseFloat(stakeAmount) * selectedOdds).toFixed(2) : "0.00"

  const handleStake = async () => {
    if (!selectedTeam || !stakeAmount) return
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStakeAmount("")
    onSelectTeam(null)
  }

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Place Your Stake</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Select Team</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedTeam === "A" ? "default" : "outline"}
              onClick={() => onSelectTeam(selectedTeam === "A" ? null : "A")}
              className={selectedTeam === "A" ? "bg-primary text-primary-foreground" : ""}
            >
              {match.teamA.split(" ")[0]}
            </Button>
            <Button
              variant={selectedTeam === "B" ? "default" : "outline"}
              onClick={() => onSelectTeam(selectedTeam === "B" ? null : "B")}
              className={selectedTeam === "B" ? "bg-secondary text-secondary-foreground" : ""}
            >
              {match.teamB.split(" ")[0]}
            </Button>
          </div>
        </div>

        {selectedTeam && (
          <>
            {/* Selected Team Info */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Selected Team</p>
              <p className="text-lg font-semibold text-foreground">{selectedTeamName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Odds</span>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                  {selectedOdds.toFixed(2)}
                </Badge>
              </div>
            </div>

            {/* Stake Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Stake Amount (USDC)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                min="0"
                step="100"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: $100</span>
                <span>Max: $100,000</span>
              </div>
            </div>

            {/* Potential Winnings */}
            <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Stake</span>
                <span className="font-semibold text-foreground">${stakeAmount || "0.00"}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Potential Winnings</span>
                <span className="font-bold text-accent">${potentialWinnings}</span>
              </div>
              <div className="border-t border-accent/20 pt-3 flex justify-between">
                <span className="text-sm font-medium text-foreground">Net Profit</span>
                <span className="font-bold text-accent">
                  $
                  {stakeAmount
                    ? (Number.parseFloat(potentialWinnings) - Number.parseFloat(stakeAmount)).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">Staking involves risk. Only stake what you can afford to lose.</p>
            </div>

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={!stakeAmount || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isLoading ? "Processing..." : "Confirm Stake"}
            </Button>
          </>
        )}

        {!selectedTeam && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Select a team to place your stake</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
