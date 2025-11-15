'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createOracleFeed, getMatches, type Match } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'

function OraclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [formData, setFormData] = useState({
    matchId: '',
    source: 'Chainlink',
    result: 'teamA' as 'teamA' | 'teamB' | 'draw',
  })

  const loadMatches = async () => {
    try {
      const data = await getMatches()
      setMatches(data.filter(m => !m.resolved))
    } catch (error) {
      console.error('Failed to load matches:', error)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [])

  const [result, setResult] = useState<{
    message: string
    rewardsDistributed: { distributed: number; totalAmount: number } | null
    distributionError: string | null
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await createOracleFeed({
        ...formData,
        verifiedAt: new Date().toISOString(),
      })
      
      setResult({
        message: response.message || 'Oracle feed created successfully',
        rewardsDistributed: response.rewardsDistributed,
        distributionError: response.distributionError,
      })

      // Reload matches to update the list
      loadMatches()
    } catch (error: any) {
      console.error('Failed to create oracle feed:', error)
      setResult({
        message: error.response?.data?.error || 'Failed to create oracle feed',
        rewardsDistributed: null,
        distributionError: 'An error occurred',
      })
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
            <Link href="/matches" className="px-4 py-2 hover:bg-gray-100 rounded">
              Matches
            </Link>
            <Link href="/users" className="px-4 py-2 hover:bg-gray-100 rounded">
              Users
            </Link>
            <Link href="/oracle" className="px-4 py-2 bg-blue-100 rounded font-medium">
              Oracle
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Post Oracle Result</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Match</label>
            <select
              required
              value={formData.matchId}
              onChange={(e) => setFormData({ ...formData, matchId: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a match</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.teamA} vs {match.teamB} - {match.id.slice(0, 8)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <input
              type="text"
              required
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Chainlink Sports Data Feed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Result</label>
            <select
              required
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="teamA">Team A Wins</option>
              <option value="teamB">Team B Wins</option>
              <option value="draw">Draw</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Oracle Result'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.rewardsDistributed 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <h3 className="font-bold mb-2">
              {result.rewardsDistributed ? '✅ Success!' : '⚠️ Partial Success'}
            </h3>
            <p className="mb-2">{result.message}</p>
            {result.rewardsDistributed && (
              <div className="mt-2 text-sm">
                <p>
                  <strong>Rewards Distributed:</strong> {result.rewardsDistributed.distributed} users
                </p>
                <p>
                  <strong>Total Amount:</strong> ${result.rewardsDistributed.totalAmount.toFixed(2)}
                </p>
              </div>
            )}
            {result.distributionError && (
              <p className="mt-2 text-sm text-yellow-800">
                ⚠️ {result.distributionError}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OraclePageProtected() {
  return (
    <ProtectedRoute>
      <OraclePage />
    </ProtectedRoute>
  )
}

