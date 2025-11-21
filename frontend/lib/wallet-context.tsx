"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
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
  const { address: wagmiAddress, isConnected: wagmiConnected, connector, chainId } = useAccount()
  const { connect, connectors, isPending: wagmiPending } = useConnect()
  const { disconnect } = useDisconnect()
  // Fetch native CELO balance (not token balance)
  // Explicitly fetch native token balance by not providing token address
  const { data: wagmiBalance, refetch: refetchBalance } = useBalance({ 
    address: wagmiAddress,
    // No token address means native token (CELO on Celo network)
    query: {
      enabled: !!wagmiAddress && wagmiConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })
  
  // Determine if we're inside Farcaster
  const isInFarcaster = isInsideFarcaster()
  
  // Access AppKit without using the hook to avoid SSR issues
  const [appKitOpen, setAppKitOpen] = useState<(() => void) | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    // Access AppKit instance from window (set by AppKitProvider)
    if (!isInFarcaster && typeof window !== 'undefined') {
      const checkAppKit = () => {
        // First, try the exposed open method from AppKitModalExposer
        const appKitOpenMethod = (window as any).__REOWN_APPKIT_OPEN__
        if (appKitOpenMethod && typeof appKitOpenMethod === 'function') {
          setAppKitOpen(() => appKitOpenMethod)
          return
        }
        
        // Fallback: try to access from instance
        const appKitInstance = (window as any).__REOWN_APPKIT_INSTANCE__
        if (appKitInstance) {
          // Try multiple ways to access the modal
          if (appKitInstance.open) {
            setAppKitOpen(() => appKitInstance.open.bind(appKitInstance))
          } else if (appKitInstance.modal?.open) {
            setAppKitOpen(() => appKitInstance.modal.open.bind(appKitInstance.modal))
          } else if (appKitInstance.setOpen) {
            setAppKitOpen(() => () => appKitInstance.setOpen(true))
          } else if (typeof appKitInstance === 'function') {
            // If the instance itself is a function (like openModal)
            setAppKitOpen(() => appKitInstance)
          }
        }
      }
      
      // Check immediately
      checkAppKit()
      
      // Also check after a short delay in case AppKit initializes asynchronously
      const timeoutId = setTimeout(checkAppKit, 100)
      const timeoutId2 = setTimeout(checkAppKit, 500)
      
      return () => {
        clearTimeout(timeoutId)
        clearTimeout(timeoutId2)
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
  const balance = useMemo(() => {
    if (isInFarcaster) {
      const bal = farcaster.walletBalance ? parseFloat(farcaster.walletBalance) : 0
      if (bal > 0) console.log('Farcaster balance:', bal)
      return bal
    } else {
      const bal = wagmiBalance ? parseFloat(wagmiBalance.formatted) : 0
      if (wagmiBalance) {
        console.log('Wagmi balance:', {
          formatted: wagmiBalance.formatted,
          value: wagmiBalance.value?.toString(),
          decimals: wagmiBalance.decimals,
          symbol: wagmiBalance.symbol
        })
      }
      return bal
    }
  }, [isInFarcaster, farcaster.walletBalance, wagmiBalance])

  // Refresh balance when wallet connects or address changes
  useEffect(() => {
    if (isInFarcaster && isConnected && farcaster.isWalletConnected && farcaster.requestWalletBalance) {
      // Refresh Farcaster wallet balance
      farcaster.requestWalletBalance().catch((err) => {
        console.warn('Failed to refresh Farcaster balance:', err)
      })
    } else if (!isInFarcaster && wagmiConnected && wagmiAddress && refetchBalance) {
      // Refresh wagmi balance when connected
      refetchBalance().catch((err) => {
        console.warn('Failed to refresh wagmi balance:', err)
      })
    }
  }, [isInFarcaster, isConnected, farcaster.isWalletConnected, address, wagmiConnected, wagmiAddress, refetchBalance])

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
          // First, try the exposed open method from AppKitModalExposer
          const appKitOpenMethod = typeof window !== 'undefined' ? (window as any).__REOWN_APPKIT_OPEN__ : null
          if (appKitOpenMethod && typeof appKitOpenMethod === 'function') {
            appKitOpenMethod()
            return
          }
          
          // Try the stored appKitOpen function
          if (appKitOpen) {
            appKitOpen() // Open the AppKit connection modal
            return
          }
          
          // Try to get AppKit instance directly
          if (typeof window !== 'undefined') {
            const appKitInstance = (window as any).__REOWN_APPKIT_INSTANCE__
            if (appKitInstance) {
              // Try to open modal directly
              if (appKitInstance.open) {
                appKitInstance.open()
                return
              } else if (appKitInstance.modal?.open) {
                appKitInstance.modal.open()
                return
              } else if (appKitInstance.setOpen) {
                appKitInstance.setOpen(true)
                return
              }
            }
          }
          
          // Fallback: try to connect using wagmi's connect directly
          // This will use the first available connector (usually injected wallets like MetaMask)
          if (connectors.length > 0) {
            // Filter out Farcaster connector when outside Farcaster
            const nonFarcasterConnectors = connectors.filter(
              (c) => c.id !== 'farcasterMiniApp' && c.id !== 'farcaster'
            )
            if (nonFarcasterConnectors.length > 0) {
              connect({ connector: nonFarcasterConnectors[0] })
            } else if (connectors.length > 0) {
              connect({ connector: connectors[0] })
            }
          } else {
            console.warn('No connectors available. Make sure AppKit is properly initialized.')
          }
          return
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      // Don't set isConnecting to false immediately - let wagmi handle the connection state
      // The wagmiPending state will handle the loading state
      setTimeout(() => setIsConnecting(false), 100)
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
