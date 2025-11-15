"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { useWallet } from "@/lib/wallet-context"
import { useAccount } from "wagmi"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileStats } from "@/components/profile-stats"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { LeagueRankings } from "@/components/league-rankings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getUserByWallet, getLeaderboard, getStakes, getMatches, type User, type Stake, type Match } from "@/lib/api"

export default function ProfilePage() {
  const { isConnected } = useWallet()
  const { address } = useAccount()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [profileStats, setProfileStats] = useState({
    totalMatches: 0,
    totalStaked: 0,
    totalEarned: 0,
    totalReturned: 0,
    roi: 0,
    winRate: 0,
    averageOdds: 0,
    bestWin: 0,
    longestWinStreak: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    if (isConnected && address) {
      loadProfileData()
    } else {
      setLoading(false)
    }
  }, [isConnected, address])

  const loadProfileData = async () => {
    if (!address) return

    try {
      setLoading(true)
      setError(null)

      // Fetch user data, leaderboard, stakes, and matches in parallel
      const [userData, leaderboardData, allStakes, allMatches] = await Promise.all([
        getUserByWallet(address).catch(() => null),
        getLeaderboard(100),
        getStakes(),
        getMatches(),
      ])

      setUserProfile(userData)
      setLeaderboard(leaderboardData)

      // Find user's rank in leaderboard
      const userRankIndex = leaderboardData.findIndex((u: User) => u.walletAddress?.toLowerCase() === address.toLowerCase())
      setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null)

      // Filter user's stakes and calculate stats
      const userStakes = allStakes.filter((s: Stake) => s.userId === address)

      // Calculate profile stats
      const totalMatches = userStakes.length
      const totalStaked = userData?.totalStaked || userStakes.reduce((sum, s) => sum + s.amount, 0)
      const totalEarned = userData?.totalEarned || 0
      const totalReturned = totalStaked + totalEarned
      const roi = totalStaked > 0 ? (totalEarned / totalStaked) * 100 : 0

      // Calculate win rate and other stats from resolved matches
      const resolvedStakes = userStakes.filter((s: Stake) => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        return match && match.status === 'resolved'
      })

      const wonStakes = resolvedStakes.filter((s: Stake) => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        return match && match.result === s.outcome
      })

      const winRate = resolvedStakes.length > 0 ? wonStakes.length / resolvedStakes.length : 0

      // Calculate average odds
      const totalOdds = userStakes.reduce((sum, s) => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        if (!match) return sum
        const odds = s.outcome === 'teamA'
          ? (match.poolA > 0 ? match.totalPool / match.poolA : 1)
          : (match.poolB > 0 ? match.totalPool / match.poolB : 1)
        return sum + odds
      }, 0)
      const averageOdds = userStakes.length > 0 ? totalOdds / userStakes.length : 0

      // Calculate best win and streaks
      const wins = wonStakes.map((s: Stake) => {
        const match = allMatches.find((m: Match) => m.id === s.matchId)
        if (!match) return 0
        const odds = s.outcome === 'teamA'
          ? (match.poolA > 0 ? match.totalPool / match.poolA : 1)
          : (match.poolB > 0 ? match.totalPool / match.poolB : 1)
        return s.amount * odds
      })
      const bestWin = wins.length > 0 ? Math.max(...wins) : 0

      // Calculate streaks (simplified - would need match dates sorted)
      const longestWinStreak = 0 // TODO: Calculate from match history
      const currentStreak = 0 // TODO: Calculate from recent matches

      setProfileStats({
        totalMatches,
        totalStaked,
        totalEarned,
        totalReturned,
        roi,
        winRate,
        averageOdds,
        bestWin,
        longestWinStreak,
        currentStreak,
      })
    } catch (err: any) {
      console.error('Failed to load profile:', err)
      setError(err.message || 'Failed to load profile data')
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
            <p className="text-muted-foreground mb-6">Please connect your wallet to view your profile</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Go to Dashboard</Button>
            </Link>
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
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  // Format leaderboard for display
  const formattedRankings = leaderboard.slice(0, 10).map((user, index) => ({
    rank: index + 1,
    username: user.username || user.walletAddress?.slice(0, 8) || 'Unknown',
    totalEarned: user.totalEarned || 0,
    roi: user.totalStaked > 0 ? ((user.totalEarned || 0) / user.totalStaked) * 100 : 0,
  }))

  // Mock league stats for now (could be enhanced with real league data)
  const leagueStats = [
    { league: "Premier League", matches: 0, wins: 0, roi: 0 },
    { league: "La Liga", matches: 0, wins: 0, roi: 0 },
    { league: "Serie A", matches: 0, wins: 0, roi: 0 },
    { league: "Bundesliga", matches: 0, wins: 0, roi: 0 },
  ]

  const profileData = {
    username: userProfile?.username || address?.slice(0, 8) || 'User',
    joinDate: userProfile ? new Date() : new Date(), // TODO: Add joinDate to user schema
    ...profileStats,
    favoriteLeague: "Premier League", // Mock
    favoriteTeam: "Unknown", // Mock
  }

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

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader profile={profileData} address={address || ''} />

        {/* Profile Stats */}
        <ProfileStats profile={profileData} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Left Column - Performance Metrics */}
          <div className="lg:col-span-2">
            <PerformanceMetrics leagueStats={leagueStats} />
          </div>

          {/* Right Column - League Rankings */}
          <div>
            <LeagueRankings rankings={formattedRankings} userRank={userRank} />
          </div>
        </div>
      </main>
    </div>
  )
}
