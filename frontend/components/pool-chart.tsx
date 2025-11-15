"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface Match {
  teamA: string
  teamB: string
  totalPool: number
  poolA: number
  poolB: number
}

export function PoolChart({ match }: { match: Match }) {
  const data = [
    {
      name: match.teamA,
      amount: match.poolA,
      percentage: ((match.poolA / match.totalPool) * 100).toFixed(1),
    },
    {
      name: match.teamB,
      amount: match.poolB,
      percentage: ((match.poolB / match.totalPool) * 100).toFixed(1),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
              formatter={(value) => `$${(value as number).toLocaleString()}`}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              <Cell fill="var(--color-primary)" />
              <Cell fill="var(--color-secondary)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{match.teamA}</p>
            <p className="text-2xl font-bold text-foreground">${match.poolA.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{((match.poolA / match.totalPool) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{match.teamB}</p>
            <p className="text-2xl font-bold text-foreground">${match.poolB.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{((match.poolB / match.totalPool) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
