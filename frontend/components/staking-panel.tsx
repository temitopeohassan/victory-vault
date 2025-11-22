"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useStake } from "@/lib/contracts/usePredictionMarket"
import { useWallet } from "@/lib/wallet-context"
import { useFarcaster } from "@/lib/farcaster-context"

interface Match {
  id: string
  teamA: string
  teamB: string
  odds: { teamA: number; teamB: number }
  totalPool: number
  status: string
}

interface StakingPanelProps {
  match: Match
  selectedTeam: "A" | "B" | null
  onSelectTeam: (team: "A" | "B" | null) => void
}

export function StakingPanel({ match, selectedTeam, onSelectTeam }: StakingPanelProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  
  // Use custom wallet context instead of wagmi
  const { address: walletAddress, isConnected: walletConnected, balance } = useWallet()
  const farcaster = useFarcaster()
  
  // Use Farcaster wallet as fallback
  const address = walletAddress || farcaster.walletAddress
  const isConnected = walletConnected || farcaster.isWalletConnected
  const userBalance = balance !== undefined ? balance : farcaster.walletBalance
  
  const { stake, isPending, isSuccess, error } = useStake()

  const selectedTeamName = selectedTeam === "A" ? match.teamA : selectedTeam === "B" ? match.teamB : null
  const selectedOdds = selectedTeam === "A" ? match.odds.teamA : selectedTeam === "B" ? match.odds.teamB : 0
  const potentialWinnings = stakeAmount ? (Number.parseFloat(stakeAmount) * selectedOdds).toFixed(2) : "0.00"

  // Check if user has enough balance
  const hasEnoughBalance = userBalance !== undefined && userBalance !== null 
    ? Number(userBalance) >= Number(stakeAmount || 0)
    : true // Default to true if balance not loaded yet

  // Reset form on successful stake
  useEffect(() => {
    if (isSuccess) {
      setStakeAmount("")
      onSelectTeam(null)
    }
  }, [isSuccess, onSelectTeam])

  const handleStake = async () => {
    if (!selectedTeam || !stakeAmount || !isConnected || !address) {
      console.error('[StakingPanel] Missing required data', { 
        selectedTeam, 
        stakeAmount, 
        isConnected, 
        address 
      })
      return
    }
    
    if (!hasEnoughBalance) {
      console.error('[StakingPanel] Insufficient balance')
      return
    }
    
    console.log('[StakingPanel] Placing stake', {
      matchId: match.id,
      selectedTeam,
      stakeAmount,
      address,
      network: 'Celo'
    })
    
    const outcome = selectedTeam === "A" ? 1 : 2 // 1 = TeamA, 2 = TeamB
    await stake(match.id, outcome, stakeAmount)
  }

  // Determine if button should be disabled
  const isButtonDisabled = 
    !stakeAmount || 
    Number(stakeAmount) < 0.1 ||
    isPending || 
    !isConnected || 
    !address ||
    match.status !== 'active' ||
    !hasEnoughBalance

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Place Your Stake</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        {!isConnected && (
          <div className="flex gap-2 bg-muted p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Connect your wallet to place stakes
            </p>
          </div>
        )}

        {/* Balance Display */}
        {isConnected && userBalance !== undefined && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Your Balance:</span>
            <span className="font-semibold text-foreground">
              {Number(userBalance).toFixed(4)} CELO
            </span>
          </div>
        )}

        {/* Team Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Select Team</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedTeam === "A" ? "default" : "outline"}
              onClick={() => onSelectTeam(selectedTeam === "A" ? null : "A")}
              className={selectedTeam === "A" ? "bg-primary text-primary-foreground" : ""}
              disabled={!isConnected}
            >
              {match.teamA.split(" ")[0]}
            </Button>
            <Button
              variant={selectedTeam === "B" ? "default" : "outline"}
              onClick={() => onSelectTeam(selectedTeam === "B" ? null : "B")}
              className={selectedTeam === "B" ? "bg-secondary text-secondary-foreground" : ""}
              disabled={!isConnected}
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
                  {selectedOdds.toFixed(2)}x
                </Badge>
              </div>
            </div>

            {/* Stake Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Stake Amount (CELO)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                min="0.1"
                step="0.1"
                disabled={!isConnected}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 0.1 CELO</span>
                {userBalance !== undefined && (
                  <button 
                    onClick={() => setStakeAmount(Math.max(0.1, Number(userBalance) * 0.9).toFixed(4))}
                    className="text-accent hover:underline"
                    type="button"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {!hasEnoughBalance && stakeAmount && (
              <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Insufficient balance. You have {Number(userBalance).toFixed(4)} CELO
                </p>
              </div>
            )}

            {/* Potential Winnings */}
            <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Stake</span>
                <span className="font-semibold text-foreground">{stakeAmount || "0.00"} CELO</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Potential Return</span>
                <span className="font-bold text-accent">{potentialWinnings} CELO</span>
              </div>
              <div className="border-t border-accent/20 pt-3 flex justify-between">
                <span className="text-sm font-medium text-foreground">Net Profit</span>
                <span className="font-bold text-accent">
                  {stakeAmount
                    ? (Number.parseFloat(potentialWinnings) - Number.parseFloat(stakeAmount)).toFixed(2)
                    : "0.00"} CELO
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  {error.message || "Transaction failed. Please try again."}
                </p>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="flex gap-2 bg-accent/10 border border-accent/20 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-accent">Stake placed successfully!</p>
              </div>
            )}

            {/* Warning */}
            <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">Staking involves risk. Only stake what you can afford to lose.</p>
            </div>

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={isButtonDisabled}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              size="lg"
            >
              {!isConnected 
                ? "Connect Wallet" 
                : !address
                  ? "No Address Found"
                  : isPending 
                    ? "Processing..." 
                    : isSuccess 
                      ? "Stake Placed!" 
                      : !hasEnoughBalance && stakeAmount
                        ? "Insufficient Balance"
                        : Number(stakeAmount) < 0.1
                          ? "Min 0.1 CELO"
                          : match.status !== 'active'
                            ? "Match Not Active"
                            : "Confirm Stake"}
            </Button>
            
            {/* Additional status info */}
            {isButtonDisabled && (
              <p className="text-xs text-center text-muted-foreground">
                {!isConnected 
                  ? "Please connect your wallet first" 
                  : !address
                    ? "Wallet address not detected"
                    : !stakeAmount
                      ? "Enter stake amount"
                      : Number(stakeAmount) < 0.1
                        ? "Minimum stake is 0.1 CELO"
                        : !hasEnoughBalance
                          ? `Need ${Number(stakeAmount).toFixed(4)} CELO, have ${Number(userBalance).toFixed(4)} CELO`
                          : match.status !== 'active'
                            ? "This match is not accepting stakes"
                            : ""}
              </p>
            )}
            
            {/* Debug Info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted rounded">
                <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
                <div>Balance: {userBalance !== undefined ? Number(userBalance).toFixed(4) : 'Loading...'} CELO</div>
                <div>Match Status: {match.status}</div>
                <div>Button Disabled: {isButtonDisabled ? 'Yes' : 'No'}</div>
              </div>
            )}
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