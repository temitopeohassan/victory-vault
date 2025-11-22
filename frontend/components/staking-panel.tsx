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

// Detect Farcaster environment
function isInsideFarcaster(): boolean {
  if (typeof window === "undefined") return false
  return !!(window as any).farcaster
}

export function StakingPanel({ match, selectedTeam, onSelectTeam }: StakingPanelProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  const wallet = useWallet()
  const farcaster = useFarcaster()

  /** -------------------------------
   *  FIXED: Correct address + balance logic
   * --------------------------------*/
  
  const address =
    wallet.address ||
    (farcaster.walletAddress ? String(farcaster.walletAddress) : null)

  const isConnected =
    wallet.isConnected || farcaster.isWalletConnected

  const userBalance = (() => {
    if (wallet.balance !== undefined && wallet.balance !== null) {
      return Number(wallet.balance)
    }
    if (farcaster.walletBalance !== null && farcaster.walletBalance !== undefined) {
      return Number(farcaster.walletBalance)
    }
    return 0
  })()

  const { stake, isPending, isSuccess, error } = useStake()

  /** Detect Farcaster presence */
  useEffect(() => {
    const inside = isInsideFarcaster()
    setIsInFarcaster(inside)
  }, [])

  /** AUTO CONNECT FARCASTER WALLET */
  useEffect(() => {
    if (isInFarcaster && !farcaster.isWalletConnected && farcaster.sdk) {
      farcaster.connectWallet().catch((err) =>
        console.warn("[StakingPanel] Auto-connect failed:", err)
      )
    }
  }, [isInFarcaster, farcaster.isWalletConnected, farcaster.sdk])

  const selectedTeamName =
    selectedTeam === "A"
      ? match.teamA
      : selectedTeam === "B"
        ? match.teamB
        : null

  const selectedOdds =
    selectedTeam === "A"
      ? match.odds.teamA
      : selectedTeam === "B"
        ? match.odds.teamB
        : 0

  const potentialWinnings = stakeAmount
    ? (Number(stakeAmount) * selectedOdds).toFixed(2)
    : "0.00"

  const hasEnoughBalance =
    userBalance >= Number(stakeAmount || 0)

  /** Reset form on success */
  useEffect(() => {
    if (isSuccess) {
      setStakeAmount("")
      onSelectTeam(null)
    }
  }, [isSuccess, onSelectTeam])

  /** ------------------------------
   *  FIXED: stake() uses number value
   * --------------------------------*/
  const handleStake = async () => {
    if (!selectedTeam || !stakeAmount || !isConnected || !address) return
    if (!hasEnoughBalance) return

    const outcome = selectedTeam === "A" ? 1 : 2

    await stake(match.id, outcome, Number(stakeAmount))
  }

  /** Button disable logic */
  const isButtonDisabled =
    !stakeAmount ||
    Number(stakeAmount) < 0.1 ||
    !isConnected ||
    !address ||
    isPending ||
    match.status !== "active" ||
    !hasEnoughBalance

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Place Your Stake</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Farcaster connecting UI */}
        {isInFarcaster && !isConnected && (
          <div className="flex gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <div className="text-xs text-blue-500">
              <p className="font-semibold">Connecting to Farcaster wallet…</p>
              <p>Approve connection inside Farcaster</p>
            </div>
          </div>
        )}

        {/* Browser wallet connect UI */}
        {!isInFarcaster && !isConnected && (
          <div className="flex gap-2 bg-muted p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs">Connect your wallet to place stakes</p>
          </div>
        )}

        {/* Balance */}
        {isConnected && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Balance:</span>
            <span className="font-semibold">
              {userBalance.toFixed(4)} CELO
            </span>
          </div>
        )}

        {/* Team Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Select Team</p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedTeam === "A" ? "default" : "outline"}
              disabled={!isConnected}
              onClick={() =>
                onSelectTeam(selectedTeam === "A" ? null : "A")
              }
            >
              {match.teamA.split(" ")[0]}
            </Button>

            <Button
              variant={selectedTeam === "B" ? "default" : "outline"}
              disabled={!isConnected}
              onClick={() =>
                onSelectTeam(selectedTeam === "B" ? null : "B")
              }
            >
              {match.teamB.split(" ")[0]}
            </Button>
          </div>
        </div>

        {/* When team selected */}
        {selectedTeam && (
          <>
            {/* Selected Info */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Selected Team</p>
              <p className="text-lg font-semibold">{selectedTeamName}</p>

              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">Odds</span>
                <Badge variant="outline">
                  {selectedOdds.toFixed(2)}x
                </Badge>
              </div>
            </div>

            {/* Stake Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Stake Amount (CELO)
              </label>

              <Input
                type="number"
                value={stakeAmount}
                min="0.1"
                step="0.1"
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={!isConnected}
                placeholder="Enter amount"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 0.1 CELO</span>

                <button
                  type="button"
                  onClick={() =>
                    setStakeAmount(
                      Math.max(0.1, userBalance * 0.9).toFixed(4)
                    )
                  }
                  className="text-accent hover:underline"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Insufficient balance */}
            {!hasEnoughBalance && stakeAmount && (
              <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive">
                  Insufficient balance: You have{" "}
                  {userBalance.toFixed(4)} CELO
                </p>
              </div>
            )}

            {/* Potential Winnings */}
            <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Stake</span>
                <span className="font-semibold">
                  {stakeAmount || "0.00"} CELO
                </span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  Potential Return
                </span>
                <span className="font-bold text-accent">
                  {potentialWinnings} CELO
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="text-sm font-medium">Net Profit</span>
                <span className="font-bold text-accent">
                  {stakeAmount
                    ? (
                        Number(potentialWinnings) -
                        Number(stakeAmount)
                      ).toFixed(2)
                    : "0.00"} CELO
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive">
                  {error.message || "Transaction failed"}
                </p>
              </div>
            )}

            {/* Success */}
            {isSuccess && (
              <div className="flex gap-2 bg-accent/10 border border-accent/20 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <p className="text-xs text-accent">
                  Stake placed successfully!
                </p>
              </div>
            )}

            {/* Risk Warning */}
            <div className="flex gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-xs text-destructive">
                Staking involves risk.
              </p>
            </div>

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={isButtonDisabled}
              className="w-full"
              size="lg"
            >
              {isPending
                ? "Processing..."
                : isSuccess
                ? "Stake Placed!"
                : !isConnected
                ? isInFarcaster
                  ? "Connecting..."
                  : "Connect Wallet"
                : !address
                ? "No Address"
                : !hasEnoughBalance
                ? "Insufficient Balance"
                : Number(stakeAmount) < 0.1
                ? "Min 0.1 CELO"
                : match.status !== "active"
                ? "Match Not Active"
                : "Confirm Stake"}
            </Button>
          </>
        )}

        {!selectedTeam && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Select a team to place your stake
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
