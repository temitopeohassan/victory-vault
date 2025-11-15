'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createMatch, type Match } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'

function NewMatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    teamA: '',
    teamB: '',
    startTime: '',
    status: 'active' as const,
    totalPool: 0,
    poolA: 0,
    poolB: 0,
    resolved: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const matchData: Match = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        totalPool: Number(formData.totalPool),
        poolA: Number(formData.poolA),
        poolB: Number(formData.poolB),
      }
      await createMatch(matchData)
      router.push('/matches')
    } catch (error) {
      console.error('Failed to create match:', error)
      alert('Failed to create match')
    } finally {
      setLoading(false)
    }
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create New Match</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Match ID</label>
            <input
              type="text"
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., 0x1234..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team A</label>
              <input
                type="text"
                required
                value={formData.teamA}
                onChange={(e) => setFormData({ ...formData, teamA: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team B</label>
              <input
                type="text"
                required
                value={formData.teamB}
                onChange={(e) => setFormData({ ...formData, teamB: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Match'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default function NewMatchPageProtected() {
  return (
    <ProtectedRoute>
      <NewMatchPage />
    </ProtectedRoute>
  )
}

