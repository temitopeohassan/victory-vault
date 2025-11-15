'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { login, logout, verifyToken, type AuthUser } from './api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        try {
          const userData = await verifyToken(token)
          setUser(userData)
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('admin_token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const response = await login(email, password)
      localStorage.setItem('admin_token', response.token)
      setUser(response.user)
      router.push('/')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }, [router])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_token')
      setUser(null)
      router.push('/login')
    }
  }, [router])

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      try {
        const userData = await verifyToken(token)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('admin_token')
        setUser(null)
      }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

