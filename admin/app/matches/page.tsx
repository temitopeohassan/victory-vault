'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMatches, createMatch, type Match } from '@/lib/api'
import { Plus } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const data = await getMatches()
      setMatches(data)
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Victory  Vault Admin
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 hover:bg-gray-100 rounded">
              Dashboard
            </Link>
            <Link href="/matches" className="px-4 py-2 bg-blue-100 rounded font-medium">
              Matches
            </Link>
            <Link href="/users" className="px-4 py-2 hover:bg-gray-100 rounded">
              Users
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Matches</h1>
          <Link
            href="/matches/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Match
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pool</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{match.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{match.teamA}</div>
                      <div className="text-sm text-gray-500">vs {match.teamB}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(match.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
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
                    <td className="px-6 py-4 font-medium">${match.totalPool.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/matches/${match.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default function MatchesPageProtected() {
  return (
    <ProtectedRoute>
      <MatchesPage />
    </ProtectedRoute>
  )
}

