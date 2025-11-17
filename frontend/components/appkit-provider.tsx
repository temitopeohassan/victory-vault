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

