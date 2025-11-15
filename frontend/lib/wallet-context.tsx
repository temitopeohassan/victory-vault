"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useFarcaster } from './farcaster-context'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
// Don't import useAppKit directly - we'll use dynamic import to avoid SSR issues

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: number
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  updateBalance: (amount: number) => void
  // Farcaster integration
  isFarcasterWallet: boolean
  farcasterUser: any | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Helper to check if we're inside Farcaster
function isInsideFarcaster(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).farcaster
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Farcaster integration
  const farcaster = useFarcaster()
  const [isFarcasterWallet, setIsFarcasterWallet] = useState(false)
  const [farcasterUser, setFarcasterUser] = useState<any | null>(null)
  
  // Wagmi hooks for external wallet connections
  const { address: wagmiAddress, isConnected: wagmiConnected, connector } = useAccount()
  const { connect, connectors, isPending: wagmiPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: wagmiBalance } = useBalance({ address: wagmiAddress })
  
  // Determine if we're inside Farcaster
  const isInFarcaster = isInsideFarcaster()
  
  // Access AppKit without using the hook to avoid SSR issues
  const [appKitOpen, setAppKitOpen] = useState<(() => void) | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    // Access AppKit instance from window (set by AppKitProvider)
    if (!isInFarcaster && typeof window !== 'undefined') {
      const appKitInstance = (window as any).__REOWN_APPKIT_INSTANCE__
      if (appKitInstance && appKitInstance.open) {
        setAppKitOpen(() => appKitInstance.open.bind(appKitInstance))
      }
    }
  }, [isInFarcaster])
  
  // Determine connection state and address
  const isConnected = isInFarcaster 
    ? farcaster.isWalletConnected 
    : wagmiConnected
  const address = isInFarcaster
    ? farcaster.walletAddress
    : wagmiAddress

  // Get balance from appropriate source
  const balance = isInFarcaster
    ? farcaster.walletBalance ? parseFloat(farcaster.walletBalance) : 0
    : wagmiBalance ? parseFloat(wagmiBalance.formatted) : 0

  // Sync with Farcaster wallet when available
  useEffect(() => {
    if (isInFarcaster && farcaster.isWalletConnected && farcaster.walletAddress) {
      setIsFarcasterWallet(true)
      setFarcasterUser(farcaster.user)
    } else if (isInFarcaster && !farcaster.isWalletConnected) {
      setIsFarcasterWallet(false)
      setFarcasterUser(null)
    } else if (!isInFarcaster) {
      setIsFarcasterWallet(false)
      setFarcasterUser(null)
    }
  }, [isInFarcaster, farcaster.isWalletConnected, farcaster.walletAddress, farcaster.user])

  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    try {
      if (isInFarcaster) {
        // Try Farcaster wallet if inside Farcaster
        if (farcaster.sdk && !farcaster.isWalletConnected) {
          await farcaster.connectWallet()
          // The useEffect above will handle the state updates
          return
        }
      } else {
        // Use AppKit modal for external connections
        if (!wagmiConnected) {
          if (appKitOpen) {
            appKitOpen() // Open the AppKit connection modal
          } else {
            // Fallback: try to connect using wagmi's connect directly
            if (connectors.length > 0) {
              connect({ connector: connectors[0] })
            }
          }
          return
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }, [isInFarcaster, farcaster, wagmiConnected, appKitOpen, connect, connectors, isClient])

  const disconnectWallet = useCallback(async () => {
    if (isInFarcaster) {
      // Disconnect Farcaster wallet if connected
      if (isFarcasterWallet && farcaster.sdk) {
        await farcaster.disconnectWallet()
      }
    } else {
      // Disconnect wagmi wallet
      disconnect()
    }
  }, [isInFarcaster, isFarcasterWallet, farcaster, disconnect])

  const updateBalance = useCallback(
    (amount: number) => {
      // Balance is managed by wagmi or Farcaster, so this is mainly for UI updates
      // You might want to refetch balance after transactions
    },
    [],
  )

  return (
    <WalletContext.Provider
      value={{ 
        isConnected: isConnected || false, 
        address: address || null, 
        balance, 
        isConnecting: isConnecting || wagmiPending, 
        connectWallet, 
        disconnectWallet, 
        updateBalance,
        isFarcasterWallet,
        farcasterUser
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
