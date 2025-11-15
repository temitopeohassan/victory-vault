"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const chartData = [
  { date: "Oct 1", balance: 35000, earned: 0 },
  { date: "Oct 5", balance: 38500, earned: 3500 },
  { date: "Oct 10", balance: 42000, earned: 7000 },
  { date: "Oct 15", balance: 39500, earned: 4500 },
  { date: "Oct 18", balance: 45000, earned: 10000 },
  { date: "Oct 20", balance: 57500, earned: 12500 },
]

export function PortfolioChart() {
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
