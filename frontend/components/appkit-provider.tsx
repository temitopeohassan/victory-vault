'use client'

import { createAppKit, useAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId } from '@/lib/contracts/config'
import { useEffect, useState } from 'react'
import { celo } from 'wagmi/chains'

// Helper to check if we're inside Farcaster
function isInsideFarcaster(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).farcaster
}

let appKitInitialized = false
let appKitInstance: any = null

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  const [isAppKitReady, setIsAppKitReady] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    const isInFarcaster = isInsideFarcaster()

    // Only create AppKit if we're not inside Farcaster and not already initialized
    if (isInFarcaster || appKitInitialized) {
      if (!isInFarcaster && appKitInitialized) {
        setIsAppKitReady(true)
      }
      return
    }

    // Filter WebSocket connection errors from WalletConnect relay
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
          return
        }
        
        // Filter font preload warnings from Reown AppKit
        if (
          (typeof message === 'string' || typeof fullMessage === 'string') &&
          (fullMessage.includes('preloaded using link preload') ||
           fullMessage.includes('fonts.reown.com') ||
           fullMessage.includes('KHTeka'))
        ) {
          return
        }
        
        originalWarn.apply(console, args)
      }

      // Filter network errors for Coinbase analytics
      const originalAddEventListener = window.addEventListener.bind(window)
      window.addEventListener = function(type: string, listener: any, options?: any) {
        if (type === 'error') {
          const wrappedListener = (event: ErrorEvent) => {
            if (
              event.message?.includes('cca-lite.coinbase.com') ||
              event.filename?.includes('installHook.js') ||
              (event.error && String(event.error).includes('Analytics SDK')) ||
              (event.error && String(event.error).includes('Failed to fetch'))
            ) {
              return
            }
            listener(event)
          }
          return originalAddEventListener(type, wrappedListener, options)
        }
        return originalAddEventListener(type, listener, options)
      }

      // Intercept unhandled promise rejections
      const originalUnhandledRejection = window.onunhandledrejection
      window.onunhandledrejection = function(event: PromiseRejectionEvent) {
        const reason = event.reason?.toString() || ''
        if (
          reason.includes('cca-lite.coinbase.com') ||
          reason.includes('Analytics SDK') ||
          reason.includes('Failed to fetch')
        ) {
          event.preventDefault()
          return
        }
        if (originalUnhandledRejection) {
          originalUnhandledRejection.call(window, event)
        }
      }

      ;(window as any).__WALLETCONNECT_ERROR_FILTER_APPLIED__ = true
    }

    // Warn if using default project ID
    if (projectId === 'default') {
      console.warn(
        '⚠️ Reown AppKit is using "default" project ID. ' +
        'Get a valid project ID from https://cloud.reown.com and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'
      )
    }

    const metadata = {
      name: 'Victory Vault',
      description: 'Soccer Prediction Market on Celo',
      url: window.location.origin,
      icons: [window.location.origin + '/logo.png'],
    }

    try {
      console.log('[AppKit] Initializing with config:', {
        projectId: projectId.slice(0, 8) + '...',
        network: 'Celo',
        chainId: celo.id,
      })

      // CRITICAL FIX: Use the Celo chain from wagmi/chains
      // This ensures consistency with your wagmi config
      const instance = createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks: [celo], // Only Celo - using wagmi/chains version
        defaultNetwork: celo, // CRITICAL: Set Celo as default
        metadata,
        features: {
          analytics: projectId !== 'default',
          email: false,
          socials: [],
          emailShowWallets: false,
        },
        themeMode: 'dark',
        themeVariables: {
          '--w3m-z-index': '9999',
          '--w3m-accent': '#FBCC5C', // Celo yellow
        },
      })

      appKitInstance = instance
      ;(window as any).__REOWN_APPKIT_INSTANCE__ = instance
      appKitInitialized = true
      setIsAppKitReady(true)
      
      console.log('[AppKit] Initialized successfully with Celo as default chain')
    } catch (error) {
      console.error('[AppKit] Failed to initialize:', error)
      setIsAppKitReady(true)
    }
  }, [])

  const shouldRenderExposer = isMounted && isAppKitReady && typeof window !== 'undefined' && !isInsideFarcaster()

  return (
    <>
      {shouldRenderExposer && <AppKitModalExposer />}
      {children}
    </>
  )
}

function AppKitModalExposer() {
  const appKit = useAppKit()

  useEffect(() => {
    if (appKit && typeof window !== 'undefined') {
      if (appKit.open) {
        ;(window as any).__REOWN_APPKIT_OPEN__ = () => {
          console.log('[AppKit] Opening modal')
          appKit.open()
        }
        console.log('[AppKit] Modal open method exposed globally')
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__REOWN_APPKIT_OPEN__
      }
    }
  }, [appKit])

  return null
}

export function getAppKitInstance() {
  return appKitInstance || (typeof window !== 'undefined' ? (window as any).__REOWN_APPKIT_INSTANCE__ : null)
}