'use client'

import { createAppKit } from '@reown/appkit/react'
import { celo } from '@reown/appkit/networks'
import { wagmiAdapter, projectId } from '@/lib/contracts/config'
import { useEffect } from 'react'

// Helper to check if we're inside Farcaster
function isInsideFarcaster(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).farcaster
}

let appKitInitialized = false
let appKitInstance: any = null

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only create AppKit if we're not inside Farcaster and not already initialized
    if (isInsideFarcaster() || appKitInitialized) {
      return
    }

    // Only initialize on client side
    if (typeof window === 'undefined') {
      return
    }

    // Filter WebSocket connection errors from WalletConnect relay
    // These are often non-fatal retry attempts and can spam the console
    // We'll filter them permanently but only for WalletConnect-specific errors
    if (typeof window !== 'undefined' && !(window as any).__WALLETCONNECT_ERROR_FILTER_APPLIED__) {
      const originalError = console.error
      const originalWarn = console.warn

      console.error = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        // Filter WalletConnect WebSocket connection errors
        if (
          typeof message === 'string' &&
          message.includes('WebSocket connection') &&
          (message.includes('relay.walletconnect.org') || message.includes('relay.reown.com'))
        ) {
          // Silently ignore - these are often non-fatal retry attempts
          return
        }
        originalError.apply(console, args)
      }

      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        // Filter WalletConnect WebSocket warnings
        if (
          typeof message === 'string' &&
          message.includes('WebSocket') &&
          (message.includes('relay.walletconnect.org') || message.includes('relay.reown.com'))
        ) {
          // Silently ignore
          return
        }
        originalWarn.apply(console, args)
      }

      // Mark as applied to avoid multiple filters
      ;(window as any).__WALLETCONNECT_ERROR_FILTER_APPLIED__ = true
    }

    // Warn if using default project ID
    if (projectId === 'default') {
      console.warn(
        '⚠️ Reown AppKit is using "default" project ID. ' +
        'Get a valid project ID from https://cloud.reown.com and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your environment variables.'
      )
    }

    const metadata = {
      name: 'Victory  Vault',
      description: 'Soccer Prediction Market',
      url: window.location.origin,
      icons: [],
    }

    try {
      const instance = createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks: [celo], // Celo mainnet network
        metadata,
        features: {
          // Disable analytics if using default project ID to reduce errors
          analytics: projectId !== 'default',
        },
      })

      appKitInstance = instance
      // Store on window for access from wallet-context
      ;(window as any).__REOWN_APPKIT_INSTANCE__ = instance
      appKitInitialized = true
    } catch (error) {
      console.warn('Failed to initialize AppKit:', error)
    }
  }, [])

  return <>{children}</>
}

// Export function to get AppKit instance
export function getAppKitInstance() {
  return appKitInstance || (typeof window !== 'undefined' ? (window as any).__REOWN_APPKIT_INSTANCE__ : null)
}

