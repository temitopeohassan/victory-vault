"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Stake, Match } from "@/lib/api"

// Helper function to convert Firestore timestamp to Date
function toDate(value: Date | string | { seconds?: number; nanoseconds?: number } | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  if (typeof value === 'object' && 'seconds' in value && value.seconds) {
    return new Date(value.seconds * 1000)
  }
  return null
}

interface PortfolioChartProps {
  stakes: Stake[]
  matches: Match[]
}

interface ChartDataPoint {
  date: string
  balance: number
  earned: number
}

export function PortfolioChart({ stakes, matches }: PortfolioChartProps) {
  const chartData = useMemo(() => {
    if (!stakes || stakes.length === 0) {
      return []
    }

    // Create a map of match results for quick lookup
    const matchResults = new Map<string, Match>()
    matches.forEach(match => {
      matchResults.set(match.id, match)
    })

    // Process stakes and create events for both staking and earnings
    const events: Array<{
      date: Date
      type: 'stake' | 'earnings'
      amount: number
    }> = []

    stakes.forEach((stake) => {
      const stakeDate = toDate(stake.timestamp)
      if (!stakeDate) return // Skip if date is invalid
      
      const match = matchResults.get(stake.matchId)
      
      // Add stake event
      events.push({
        date: stakeDate,
        type: 'stake',
        amount: stake.amount,
      })
      
      // Add earnings event if match is resolved and won
      if (match && match.status === 'resolved' && match.result === stake.outcome) {
        // Calculate winnings based on pool odds
        const odds = stake.outcome === 'teamA'
          ? (match.poolA > 0 ? match.totalPool / match.poolA : 1)
          : (match.poolB > 0 ? match.totalPool / match.poolB : 1)
        
        const winnings = stake.amount * odds
        const earnings = winnings - stake.amount // Net earnings (winnings - stake)
        
        // Use match endTime if available, otherwise use stake date
        const resolvedDate = match.endTime ? toDate(match.endTime) : null
        const resolutionDate = resolvedDate || stakeDate
        
        events.push({
          date: resolutionDate,
          type: 'earnings',
          amount: earnings,
        })
      }
    })

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Group by date and calculate cumulative values
    const dateMap = new Map<string, { balance: number; earned: number }>()
    
    let cumulativeBalance = 0
    let cumulativeEarned = 0

    events.forEach((event) => {
      const dateKey = event.date.toISOString().split('T')[0] // YYYY-MM-DD
      
      if (event.type === 'stake') {
        cumulativeBalance += event.amount
      } else if (event.type === 'earnings') {
        cumulativeEarned += event.amount
      }

      // Update or create entry for this date
      dateMap.set(dateKey, {
        balance: cumulativeBalance,
        earned: cumulativeEarned,
      })
    })

    // Convert to array and format for chart, sorted by date
    const data: ChartDataPoint[] = Array.from(dateMap.entries())
      .map(([date, values]) => {
        const dateObj = new Date(date)
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
        const day = dateObj.getDate()
        
        return {
          dateKey: date, // Keep original date for sorting
          date: `${month} ${day}`,
          balance: values.balance,
          earned: values.earned,
        }
      })
      .sort((a, b) => {
        // Sort by actual date for proper ordering
        return new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime()
      })
      .map(({ dateKey, ...rest }) => rest) // Remove dateKey from final data

    return data
  }, [stakes, matches])

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>No portfolio data available. Start staking to see your performance!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
              formatter={(value) => `$${(value as number).toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: "var(--color-primary)", r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Balance"
            />
            <Line
              type="monotone"
              dataKey="earned"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ fill: "var(--color-accent)", r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Earned"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
