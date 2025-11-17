"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, TrendingUp, Target } from "lucide-react"
import { getLeaderboard, type User } from "@/lib/api"
import { useAccount } from "wagmi"

interface LeaderboardEntry {
  rank: number
  username: string
  walletAddress: string
  totalEarned: number
  totalStaked: number
  roi: number
}

export default function LeaderboardPage() {
  const { address } = useAccount()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch leaderboard data
      const leaderboardData = await getLeaderboard(100)

      // Format leaderboard entries
      const formattedLeaderboard: LeaderboardEntry[] = leaderboardData.map((user, index) => ({
        rank: index + 1,
        username: user.username || user.walletAddress?.slice(0, 8) || 'Unknown',
        walletAddress: user.walletAddress,
        totalEarned: user.totalEarned || 0,
        totalStaked: user.totalStaked || 0,
        roi: user.totalStaked > 0 ? ((user.totalEarned || 0) / user.totalStaked) * 100 : 0,
      }))

      setLeaderboard(formattedLeaderboard)

      // Find user's rank if connected
      if (address) {
        const userRankIndex = formattedLeaderboard.findIndex(
          (entry) => entry.walletAddress?.toLowerCase() === address.toLowerCase()
        )
        setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null)
      }
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err)
      setError(err.message || 'Failed to load leaderboard data')
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />
      default:
        return null
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600"
      case 2:
        return "bg-gray-400/10 border-gray-400/30 text-gray-600"
      case 3:
        return "bg-orange-600/10 border-orange-600/30 text-orange-600"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Top Pundits</h1>
          </div>
          <p className="text-muted-foreground">See who's leading the prediction market</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* User Rank Card - Show if user is in leaderboard */}
        {userRank && userRank <= 100 && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`${getRankBadgeColor(userRank)} text-lg px-4 py-1`}>
                    #{userRank}
                  </Badge>
                  <div>
                    <p className="font-semibold text-foreground">
                      {leaderboard[userRank - 1]?.username || 'You'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {leaderboard[userRank - 1]?.roi.toFixed(1)}% ROI
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    ${leaderboard[userRank - 1]?.totalEarned.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Global Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No leaderboard data available yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start staking to appear on the leaderboard!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const isCurrentUser = address && entry.walletAddress?.toLowerCase() === address.toLowerCase()
                  
                  return (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isCurrentUser
                          ? "bg-primary/10 border-2 border-primary/30"
                          : entry.rank <= 3
                          ? "bg-muted/50 hover:bg-muted/80"
                          : "bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 flex-shrink-0">
                          {getMedalIcon(entry.rank) || (
                            <Badge
                              variant="outline"
                              className={`${getRankBadgeColor(entry.rank)} font-semibold`}
                            >
                              #{entry.rank}
                            </Badge>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-base font-semibold truncate ${
                              isCurrentUser ? "text-primary" : "text-foreground"
                            }`}>
                              {entry.username}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              <span>{entry.roi.toFixed(1)}% ROI</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="w-3 h-3" />
                              <span>${entry.totalStaked.toLocaleString()} staked</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Earnings */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-foreground">
                          ${entry.totalEarned.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

