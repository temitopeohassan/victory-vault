"use client"

import { Header } from "@/components/header"
import { MatchResultsHeader } from "@/components/match-results-header"
import { ResultsDistribution } from "@/components/results-distribution"
import { WinnersList } from "@/components/winners-list"
import { LosersList } from "@/components/losers-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock resolved match data
const mockResolvedMatch = {
  id: "1",
  teamA: "Manchester United",
  teamB: "Liverpool",
  result: "A",
  score: "2-1",
  startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
  endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
  status: "resolved",
  totalPool: 125000,
  poolA: 75000,
  poolB: 50000,
  winningPool: 75000,
  losingPool: 50000,
  platformFee: 2500,
  totalRewards: 122500,
  resolved: true,
  league: "Premier League",
  stadium: "Old Trafford",
  date: "2024-10-20",
}

const mockWinners = [
  {
    id: "1",
    user: "0x1234...5678",
    stakeAmount: 5000,
    odds: 1.45,
    winnings: 7250,
    share: 0.0667,
  },
  {
    id: "2",
    user: "0x5555...6666",
    stakeAmount: 7500,
    odds: 1.45,
    winnings: 10875,
    share: 0.1,
  },
  {
    id: "3",
    user: "0x9999...0000",
    stakeAmount: 4200,
    odds: 1.45,
    winnings: 6090,
    share: 0.056,
  },
]

const mockLosers = [
  {
    id: "4",
    user: "0x9876...5432",
    stakeAmount: 3000,
    odds: 2.8,
    loss: 3000,
  },
  {
    id: "5",
    user: "0x7777...8888",
    stakeAmount: 2000,
    odds: 2.8,
    loss: 2000,
  },
]

export default function MatchResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Button>
        </Link>

        {/* Match Results Header */}
        <MatchResultsHeader match={mockResolvedMatch} />

        {/* Results Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ResultsDistribution match={mockResolvedMatch} />
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Resolution Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Pool</span>
                  <span className="font-semibold text-foreground">${mockResolvedMatch.totalPool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Platform Fee (2%)</span>
                  <span className="font-semibold text-destructive">
                    ${mockResolvedMatch.platformFee.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-sm font-medium text-foreground">Total Rewards</span>
                  <span className="font-bold text-accent">${mockResolvedMatch.totalRewards.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Winning Team</h3>
              <p className="text-2xl font-bold text-foreground">{mockResolvedMatch.teamA}</p>
              <p className="text-sm text-muted-foreground mt-1">Score: {mockResolvedMatch.score}</p>
            </div>
          </div>
        </div>

        {/* Winners and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <WinnersList winners={mockWinners} />
          <LosersList losers={mockLosers} />
        </div>
      </main>
    </div>
  )
}
