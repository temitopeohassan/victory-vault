import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface User {
  id?: string
  walletAddress: string
  username: string
  totalStaked: number
  totalEarned: number
}

export interface Match {
  id: string
  teamA: string
  teamB: string
  startTime: Date | string | { seconds?: number; nanoseconds?: number }
  endTime?: Date | string | { seconds?: number; nanoseconds?: number }
  status: 'active' | 'upcoming' | 'resolved'
  totalPool: number
  poolA: number
  poolB: number
  result?: 'teamA' | 'teamB' | 'draw' | null
  resolved: boolean
}

export interface Stake {
  id?: string
  userId: string
  matchId: string
  outcome: 'teamA' | 'teamB'
  amount: number
  timestamp: Date | string | { seconds?: number; nanoseconds?: number }
}

// Helper function to convert Firestore timestamp to Date
function toDate(value: Date | string | { seconds?: number; nanoseconds?: number } | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  if (value.seconds) return new Date(value.seconds * 1000)
  return null
}

// Helper function to normalize match data
export function normalizeMatch(match: Match): Match {
  return {
    ...match,
    startTime: toDate(match.startTime) || new Date(),
    endTime: match.endTime ? toDate(match.endTime) : undefined,
  } as Match
}

// Users
export const getUsers = () => api.get<User[]>(`/api/users`).then(r => r.data)
export const getLeaderboard = (limit?: number) => 
  api.get<User[]>(`/api/users?leaderboard=true&limit=${limit || 100}`).then(r => r.data)
export const getUser = (id: string) => api.get<User>(`/api/users/${id}`).then(r => r.data)
export const getUserByWallet = (walletAddress: string) => api.get<User>(`/api/users/${walletAddress}`).then(r => r.data)
export const createUser = (data: Omit<User, 'id'>) => api.post<User>(`/api/users`, data).then(r => r.data)

// Matches
export const getMatches = () => 
  api.get<Match[]>(`/api/matches`).then(r => r.data.map(normalizeMatch))
export const getMatch = (id: string) => 
  api.get<Match>(`/api/matches/${id}`).then(r => normalizeMatch(r.data))
export const createMatch = (data: Match) => 
  api.post<Match>(`/api/matches`, data).then(r => normalizeMatch(r.data))

// Stakes
export const getStakes = (matchId?: string) => {
  const url = matchId ? `/api/stakes?matchId=${matchId}` : `/api/stakes`
  return api.get<Stake[]>(url).then(r => r.data.map(stake => ({
    ...stake,
    timestamp: toDate(stake.timestamp) || new Date(),
  })))
}
export const createStake = (data: Omit<Stake, 'id' | 'timestamp'>) => 
  api.post(`/api/stakes`, data).then(r => r.data)

