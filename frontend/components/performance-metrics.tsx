"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface LeagueStat {
  league: string
  matches: number
  wins: number
  roi: number
}

export function PerformanceMetrics({ leagueStats }: { leagueStats: LeagueStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by League</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={leagueStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="league" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="matches" fill="var(--color-primary)" name="Matches" radius={[8, 8, 0, 0]} />
            <Bar dataKey="wins" fill="var(--color-accent)" name="Wins" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* League Stats Table */}
        <div className="mt-6 space-y-2">
          {leagueStats.map((stat) => (
            <div key={stat.league} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">{stat.league}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.wins} wins out of {stat.matches} matches
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent">{stat.roi.toFixed(1)}% ROI</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
