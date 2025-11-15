'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Lightweight context that does not depend on SDK classes at build time
// We will use the actions.ready pattern elsewhere (see FarcasterReady)

type NotificationPermissionStatus = 'granted' | 'denied' | 'prompt'
type User = any
type Wallet = { address: string }

interface FarcasterContextType {
  // SDK instance
  sdk: any | null
  
  // User data
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Wallet integration
  wallet: Wallet | null
  isWalletConnected: boolean
  walletAddress: string | null
  walletBalance: string | null
  
  // Authentication methods
  authenticate: () => Promise<void>
  signOut: () => Promise<void>
  
  // Wallet methods
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  requestWalletBalance: () => Promise<void>
  
  // Notification methods
  requestNotificationPermission: () => Promise<NotificationPermissionStatus>
  sendNotification: (title: string, body: string) => Promise<void>
  
  // Utility methods
  shareApp: () => Promise<void>
  openExternalLink: (url: string) => Promise<void>
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined)

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<any | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string | null>(null)

  // No SDK initialization here; keep loading false to avoid blocking UI
  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Authentication methods
  const authenticate = useCallback(async () => {
    if (!sdk) return
    
    try {
      setIsLoading(true)
      const user = await sdk.authenticate()
      setUser(user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Authentication failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [sdk])

  const signOut = useCallback(async () => {
    if (!sdk) return
    
    try {
      await sdk.signOut()
      setUser(null)
      setIsAuthenticated(false)
      setWallet(null)
      setIsWalletConnected(false)
      setWalletAddress(null)
      setWalletBalance(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }, [sdk])

  // Wallet methods
  const connectWallet = useCallback(async () => {
    if (!sdk) return
    
    try {
      setIsLoading(true)
      const wallet = await sdk.connectWallet()
      setWallet(wallet)
      setIsWalletConnected(true)
      setWalletAddress(wallet.address)
      
      // Get wallet balance
      try {
        const balance = await sdk.getWalletBalance()
        setWalletBalance(balance)
      } catch (error) {
        console.warn('Could not fetch wallet balance:', error)
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [sdk])

  const disconnectWallet = useCallback(async () => {
    if (!sdk) return
    
    try {
      await sdk.disconnectWallet()
      setWallet(null)
      setIsWalletConnected(false)
      setWalletAddress(null)
      setWalletBalance(null)
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      throw error
    }
  }, [sdk])

  const requestWalletBalance = useCallback(async () => {
    if (!sdk || !isWalletConnected) return
    
    try {
      const balance = await sdk.getWalletBalance()
      setWalletBalance(balance)
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error)
      throw error
    }
  }, [sdk, isWalletConnected])

  // Notification methods
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    if (!sdk) throw new Error('SDK not initialized')
    
    try {
      const permission = await sdk.requestNotificationPermission()
      return permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      throw error
    }
  }, [sdk])

  const sendNotification = useCallback(async (title: string, body: string) => {
    if (!sdk) throw new Error('SDK not initialized')
    
    try {
      await sdk.sendNotification({ title, body })
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }, [sdk])

  // Utility methods
  const shareApp = useCallback(async () => {
    if (!sdk) return
    
    try {
      await sdk.shareApp()
    } catch (error) {
      console.error('Failed to share app:', error)
      throw error
    }
  }, [sdk])

  const openExternalLink = useCallback(async (url: string) => {
    if (!sdk) return
    
    try {
      await sdk.openExternalLink(url)
    } catch (error) {
      console.error('Failed to open external link:', error)
      throw error
    }
  }, [sdk])

  const value: FarcasterContextType = {
    sdk,
    user,
    isAuthenticated,
    isLoading,
    wallet,
    isWalletConnected,
    walletAddress,
    walletBalance,
    authenticate,
    signOut,
    connectWallet,
    disconnectWallet,
    requestWalletBalance,
    requestNotificationPermission,
    sendNotification,
    shareApp,
    openExternalLink,
  }

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  )
}

export function useFarcaster() {
  const context = useContext(FarcasterContext)
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider')
  }
  return context
}