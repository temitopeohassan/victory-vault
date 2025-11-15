"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

interface Match {
  id: string
  teamA: string
  teamB: string
  startTime: Date
  status: string
  league: string
  stadium: string
  date: string
}

export function MatchDetails({ match }: { match: Match }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="pt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Team A */}
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-foreground mb-2">{match.teamA}</h2>
            <p className="text-muted-foreground">{match.league}</p>
          </div>

          {/* VS and Match Info */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {match.date} at {formatTime(match.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{match.stadium}</span>
              </div>
            </div>
            <Badge className="bg-accent text-accent-foreground">{match.status}</Badge>
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
