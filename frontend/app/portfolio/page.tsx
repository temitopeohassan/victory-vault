"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { PortfolioChart } from "@/components/portfolio-chart"
import { StakesTable } from "@/components/stakes-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/lib/wallet-context"
import { getStakes, getMatches, getUserByWallet, type Stake, type Match } from "@/lib/api"
import { useAccount } from "wagmi"

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioData, setPortfolioData] = useState({
    totalStaked: 0,
    totalEarned: 0,
    totalReturned: 0,
    roi: 0,
    activeStakes: 0,
    resolvedStakes: 0,
    winRate: 0,
  })
  const [activeStakes, setActiveStakes] = useState<any[]>([])
  const [resolvedStakes, setResolvedStakes] = useState<any[]>([])
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [userStakes, setUserStakes] = useState<Stake[]>([])

  useEffect(() => {
    if (isConnected && address) {
      loadPortfolioData()
    } else {
      setLoading(false)
    }
  }, [isConnected, address])

  const loadPortfolioData = async () => {
    if (!address) return

    try {
      setLoading(true)
      setError(null)

      // Fetch user data, stakes, and matches in parallel
      const [userData, allStakes, allMatches] = await Promise.all([
        getUserByWallet(address).catch(() => null), // User might not exist yet
        getStakes(),
        getMatches(),
      ])

      // Filter stakes for current user
      const userStakes = allStakes.filter((s: Stake) => s.userId === address)

      // Separate active and resolved stakes
      const active = userStakes.filter((s: Stake) => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        return match && match.status === 'active'
      })

      const resolved = userStakes.filter((s: Stake) => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        return match && match.status === 'resolved'
      })

      // Calculate portfolio stats
      const totalStaked = userData?.totalStaked || userStakes.reduce((sum, s) => sum + s.amount, 0)
      const totalEarned = userData?.totalEarned || 0
      const totalReturned = totalStaked + totalEarned
      const roi = totalStaked > 0 ? (totalEarned / totalStaked) * 100 : 0

      // Calculate win rate from resolved stakes
      const wonStakes = resolved.filter(s => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        return match && match.result === s.outcome
      })

      const winRate = resolved.length > 0 ? wonStakes.length / resolved.length : 0

      setPortfolioData({
        totalStaked,
        totalEarned,
        totalReturned,
        roi,
        activeStakes: active.length,
        resolvedStakes: resolved.length,
        winRate,
      })

      // Format stakes with match data for display
      const formatStakes = (stakes: Stake[], matches: Match[]) => {
        return stakes.map((stake: Stake) => {
          const match = matches.find((m: Match) => m.id === stake.matchId)
          if (!match) return null

          const odds = stake.outcome === 'teamA'
            ? (match.poolA > 0 ? match.totalPool / match.poolA : 1)
            : (match.poolB > 0 ? match.totalPool / match.poolB : 1)

          const potentialWinnings = stake.amount * odds
          const actualWinnings = match.status === 'resolved' && match.result === stake.outcome
            ? potentialWinnings
            : (match.status === 'resolved' ? 0 : undefined)

          return {
            id: stake.id || '',
            matchId: stake.matchId,
            teamA: match.teamA,
            teamB: match.teamB,
            stakedTeam: stake.outcome === 'teamA' ? match.teamA : match.teamB,
            amount: stake.amount,
            odds,
            potentialWinnings,
            actualWinnings,
            status: match.status === 'resolved' 
              ? (match.result === stake.outcome ? 'won' : 'lost')
              : 'active',
            placedAt: stake.timestamp instanceof Date ? stake.timestamp : new Date(stake.timestamp),
            matchTime: match.startTime instanceof Date ? match.startTime : new Date(match.startTime),
            resolvedAt: match.status === 'resolved' && match.endTime
              ? (match.endTime instanceof Date ? match.endTime : new Date(match.endTime))
              : undefined,
          }
        }).filter(Boolean)
      }

      const formattedActive = formatStakes(active, allMatches)
      const formattedResolved = formatStakes(resolved, allMatches)

      setActiveStakes(formattedActive)
      setResolvedStakes(formattedResolved)
      setAllMatches(allMatches)
      setUserStakes(userStakes)
    } catch (err: any) {
      console.error('Failed to load portfolio:', err)
      setError(err.message || 'Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">Please connect your wallet to view your portfolio</p>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Portfolio</h1>
          <p className="text-muted-foreground">Track your stakes, earnings, and performance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Portfolio Overview */}
        <PortfolioOverview data={portfolioData} />

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-12">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Stakes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <PortfolioChart 
              stakes={userStakes} 
              matches={allMatches} 
            />
          </TabsContent>

          {/* Active Stakes Tab */}
          <TabsContent value="active" className="mt-6">
            {activeStakes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active stakes</p>
              </div>
            ) : (
              <StakesTable stakes={activeStakes} type="active" />
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            {resolvedStakes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stake history</p>
              </div>
            ) : (
              <StakesTable stakes={resolvedStakes} type="resolved" />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
