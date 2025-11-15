"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { StakingPanel } from "@/components/staking-panel"
import { MatchDetails } from "@/components/match-details"
import { PoolChart } from "@/components/pool-chart"
import { RecentStakes } from "@/components/recent-stakes"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getMatch, getStakes, type Match, type Stake } from "@/lib/api"

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | null>(null)
  const [match, setMatch] = useState<Match | null>(null)
  const [stakes, setStakes] = useState<Stake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (matchId) {
      loadMatchData()
    }
  }, [matchId])

  const loadMatchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [matchData, stakesData] = await Promise.all([
        getMatch(matchId),
        getStakes(matchId),
      ])
      setMatch(matchData)
      setStakes(stakesData)
    } catch (err: any) {
      console.error('Failed to load match:', err)
      setError(err.message || 'Failed to load match')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading match...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-destructive">{error || 'Match not found'}</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                Back to Markets
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Format match for components
  const formattedMatch = {
    ...match,
    startTime: match.startTime instanceof Date ? match.startTime : new Date(match.startTime),
    endTime: match.endTime ? (match.endTime instanceof Date ? match.endTime : new Date(match.endTime)) : undefined,
    odds: {
      teamA: match.poolA > 0 ? match.totalPool / match.poolA : 1,
      teamB: match.poolB > 0 ? match.totalPool / match.poolB : 1,
    },
  }

  // Format stakes for RecentStakes component
  const formattedStakes = stakes.map((stake) => ({
    id: stake.id || '',
    user: stake.userId || 'Unknown',
    team: stake.outcome === 'teamA' ? match.teamA : match.teamB,
    amount: stake.amount,
    odds: stake.outcome === 'teamA' ? formattedMatch.odds.teamA : formattedMatch.odds.teamB,
    timestamp: stake.timestamp instanceof Date ? stake.timestamp.getTime() : new Date(stake.timestamp).getTime(),
  }))

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

        {/* Match Header */}
        <MatchDetails match={formattedMatch} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Pool Chart and Stakes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pool Distribution Chart */}
            <PoolChart match={formattedMatch} />

            {/* Recent Stakes */}
            <RecentStakes stakes={formattedStakes} />
          </div>

          {/* Right Column - Staking Panel */}
          <div>
            <StakingPanel match={formattedMatch} selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
          </div>
        </div>
      </main>
    </div>
  )
}
