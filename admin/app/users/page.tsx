'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUsers, type User } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
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
            <Link href="/users" className="px-4 py-2 bg-blue-100 rounded font-medium">
              Users
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Users</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Staked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id || user.walletAddress} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{user.walletAddress}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">${user.totalStaked.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      ${user.totalEarned.toLocaleString()}
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

export default function UsersPageProtected() {
  return (
    <ProtectedRoute>
      <UsersPage />
    </ProtectedRoute>
  )
}

