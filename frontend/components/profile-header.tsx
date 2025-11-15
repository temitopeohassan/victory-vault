"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy } from "lucide-react"

interface Profile {
  username: string
  joinDate: Date
  totalMatches: number
  favoriteLeague: string
  favoriteTeam: string
  currentStreak: number
}

interface ProfileHeaderProps {
  profile: Profile
  address: string | null
}

export function ProfileHeader({ profile, address }: ProfileHeaderProps) {
  const joinedDate = profile.joinDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="pt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{profile.username}</h1>
            <p className="text-sm text-muted-foreground font-mono mb-4">{address}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinedDate}</span>
              </div>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                {profile.totalMatches} Matches
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                {profile.favoriteLeague}
              </Badge>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <p className="text-4xl font-bold text-accent">{profile.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">Wins in a row</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
