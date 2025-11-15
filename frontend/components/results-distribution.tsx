"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

interface Match {
  teamA: string
  teamB: string
  winningPool: number
  losingPool: number
  platformFee: number
}

export function ResultsDistribution({ match }: { match: Match }) {
  const data = [
    { name: `${match.teamA} (Winners)`, value: match.winningPool },
    { name: `${match.teamB} (Losers)`, value: match.losingPool },
    { name: "Platform Fee", value: match.platformFee },
  ]

  const COLORS = ["var(--color-accent)", "var(--color-destructive)", "var(--color-muted)"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${(value as number).toLocaleString()}`}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
