'use client'

import { createAppKit, useAppKit } from '@reown/appkit/react'
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
        const fullMessage = args.map(arg => String(arg)).join(' ')
        
        // Filter WalletConnect WebSocket connection errors
        if (
          typeof message === 'string' &&
          message.includes('WebSocket connection') &&
          (message.includes('relay.walletconnect.org') || message.includes('relay.reown.com'))
        ) {
          // Silently ignore - these are often non-fatal retry attempts
          return
        }
        
        // Filter Coinbase analytics errors
        if (
          (typeof message === 'string' || typeof fullMessage === 'string') &&
          (fullMessage.includes('cca-lite.coinbase.com') ||
           fullMessage.includes('Analytics SDK') ||
           fullMessage.includes('Failed to fetch') ||
           message.includes('ERR_NAME_NOT_RESOLVED'))
        ) {
          // Silently ignore Coinbase analytics errors
          return
        }
        
        originalError.apply(console, args)
      }

      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        const fullMessage = args.map(arg => String(arg)).join(' ')
        
        // Filter WalletConnect WebSocket warnings
        if (
          typeof message === 'string' &&
          message.includes('WebSocket') &&
          (message.includes('relay.walletconnect.org') || message.includes('relay.reown.com'))
        ) {
          // Silently ignore
          return
        }
        
        // Filter font preload warnings from Reown AppKit
        if (
          (typeof message === 'string' || typeof fullMessage === 'string') &&
          (fullMessage.includes('preloaded using link preload') ||
           fullMessage.includes('fonts.reown.com') ||
           fullMessage.includes('KHTeka'))
        ) {
          // Silently ignore font preload warnings
          return
        }
        
        originalWarn.apply(console, args)
      }

      // Filter network errors for Coinbase analytics and other non-critical errors
      const originalAddEventListener = window.addEventListener.bind(window)
      window.addEventListener = function(type: string, listener: any, options?: any) {
        if (type === 'error') {
          const wrappedListener = (event: ErrorEvent) => {
            // Filter Coinbase analytics network errors
            if (
              event.message?.includes('cca-lite.coinbase.com') ||
              event.filename?.includes('installHook.js') ||
              (event.error && String(event.error).includes('Analytics SDK')) ||
              (event.error && String(event.error).includes('Failed to fetch'))
            ) {
              return // Silently ignore
            }
            listener(event)
          }
          return originalAddEventListener(type, wrappedListener, options)
        }
        return originalAddEventListener(type, listener, options)
      }

      // Also intercept unhandled promise rejections that might be from Coinbase SDK
      const originalUnhandledRejection = window.onunhandledrejection
      window.onunhandledrejection = function(event: PromiseRejectionEvent) {
        const reason = event.reason?.toString() || ''
        if (
          reason.includes('cca-lite.coinbase.com') ||
          reason.includes('Analytics SDK') ||
          reason.includes('Failed to fetch')
        ) {
          event.preventDefault() // Prevent the error from showing in console
          return
        }
        if (originalUnhandledRejection) {
          originalUnhandledRejection.call(window, event)
        }
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

  return <AppKitModalExposer>{children}</AppKitModalExposer>
}

// Component to expose AppKit modal open method
function AppKitModalExposer({ children }: { children: React.ReactNode }) {
  // Check if we're in Farcaster
  const isInFarcaster = typeof window !== 'undefined' && !!(window as any).farcaster
  
  // Use AppKit hook - must be called unconditionally
  // The hook should return default values if AppKit isn't initialized
  const appKit = useAppKit()

  useEffect(() => {
    if (!isInFarcaster && appKit && typeof window !== 'undefined') {
      // Store the open method on window for wallet-context to access
      if (appKit.open) {
        ;(window as any).__REOWN_APPKIT_OPEN__ = () => {
          appKit.open()
        }
      }
    } else if (typeof window !== 'undefined') {
      // Clear the method if we're in Farcaster or appKit is not available
      delete (window as any).__REOWN_APPKIT_OPEN__
    }
  }, [appKit, isInFarcaster])

  return <>{children}</>
}

// Export function to get AppKit instance
export function getAppKitInstance() {
  return appKitInstance || (typeof window !== 'undefined' ? (window as any).__REOWN_APPKIT_INSTANCE__ : null)
}

