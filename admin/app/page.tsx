'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getMatches, getUsers, type Match, type User } from '@/lib/api'
import { Calendar, Users, Trophy, TrendingUp, Plus, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'

function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeMatches: 0,
    totalUsers: 0,
    totalVolume: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [matchesData, usersData] = await Promise.all([
        getMatches().catch(() => []),
        getUsers().catch(() => []),
      ])
      
      setMatches(matchesData)
      setUsers(usersData)
      
      setStats({
        totalMatches: matchesData.length,
        activeMatches: matchesData.filter(m => m.status === 'active').length,
        totalUsers: usersData.length,
        totalVolume: matchesData.reduce((sum, m) => sum + (m.totalPool || 0), 0),
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Victory  Vault Admin</h1>
          <div className="flex items-center gap-4">
            <Link href="/matches" className="px-4 py-2 hover:bg-gray-100 rounded">
              Matches
            </Link>
            <Link href="/users" className="px-4 py-2 hover:bg-gray-100 rounded">
              Users
            </Link>
            <Link href="/oracle" className="px-4 py-2 hover:bg-gray-100 rounded">
              Oracle
            </Link>
            <div className="flex items-center gap-3 border-l pl-4">
              <span className="text-sm text-gray-600">{user?.username || user?.email}</span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">Total Matches</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalMatches}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Active Matches</h3>
            </div>
            <p className="text-3xl font-bold">{stats.activeMatches}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-600">Total Volume</h3>
            </div>
            <p className="text-3xl font-bold">${stats.totalVolume.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Matches</h2>
            <Link
              href="/matches/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Match
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Teams</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Total Pool</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 5).map((match) => (
                  <tr key={match.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{match.id.slice(0, 8)}...</td>
                    <td className="p-2">
                      {match.teamA} vs {match.teamB}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          match.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'resolved'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="p-2">${match.totalPool.toLocaleString()}</td>
                    <td className="p-2">
                      <Link
                        href={`/matches/${match.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}

