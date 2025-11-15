"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface Match {
  teamA: string
  teamB: string
  result: string
  score: string
  status: string
  league: string
  date: string
}

export function MatchResultsHeader({ match }: { match: Match }) {
  return (
    <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
      <CardContent className="pt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Team A */}
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-foreground mb-2">{match.teamA}</h2>
            <p className="text-muted-foreground">{match.league}</p>
          </div>

          {/* Result */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">{match.score.split("-")[0]}</p>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">{match.score.split("-")[1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <Badge className="bg-accent text-accent-foreground">{match.status}</Badge>
            </div>
          </div>

          {/* Team B */}
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-foreground mb-2">{match.teamB}</h2>
            <p className="text-muted-foreground">{match.league}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
