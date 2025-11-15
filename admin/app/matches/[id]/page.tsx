'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMatch, distributeRewards, type Match } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'

function MatchDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [distributing, setDistributing] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadMatch(params.id as string)
    }
  }, [params.id])

  const loadMatch = async (id: string) => {
    try {
      const data = await getMatch(id)
      setMatch(data)
    } catch (error) {
      console.error('Failed to load match:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDistribute = async () => {
    if (!match) return
    if (!confirm('Distribute rewards for this match?')) return

    setDistributing(true)
    try {
      await distributeRewards(match.id)
      alert('Rewards distributed successfully')
      router.push('/matches')
    } catch (error) {
      console.error('Failed to distribute rewards:', error)
      alert('Failed to distribute rewards')
    } finally {
      setDistributing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Match not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/matches" className="text-blue-600 hover:underline">
            ← Back to Matches
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6">
            {match.teamA} vs {match.teamB}
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Match ID</p>
              <p className="font-mono text-sm">{match.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
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
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p>{new Date(match.startTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Result</p>
              <p>{match.result || 'Not resolved'}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Pool Information</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Pool</p>
                <p className="text-2xl font-bold">${match.totalPool.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pool A ({match.teamA})</p>
                <p className="text-2xl font-bold">${match.poolA.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pool B ({match.teamB})</p>
                <p className="text-2xl font-bold">${match.poolB.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {match.resolved && match.status === 'resolved' && (
            <div className="border-t pt-6 mt-6">
              <button
                onClick={handleDistribute}
                disabled={distributing}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {distributing ? 'Distributing...' : 'Distribute Rewards'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function MatchDetailsPageProtected() {
  return (
    <ProtectedRoute>
      <MatchDetailsPage />
    </ProtectedRoute>
  )
}

