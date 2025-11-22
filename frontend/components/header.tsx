"use client"
import { useEffect, useState } from "react"
import { useWallet } from "@/lib/wallet-context"
import { useFarcaster } from "@/lib/farcaster-context"
import Link from "next/link"
import Image from "next/image"
import { WalletButton } from "@/components/wallet-button"

// Helper to check if we're inside Farcaster
function isInsideFarcaster(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).farcaster
}

export function Header() {
  console.log('[Header] Component rendered')
  
  const { isConnected, isConnecting, connectWallet, address, balance } = useWallet()
  console.log('[Header] Wallet context state', { isConnected, isConnecting, address, balance })
  
  const farcaster = useFarcaster()
  console.log('[Header] Farcaster context state', {
    isWalletConnected: farcaster.isWalletConnected,
    walletAddress: farcaster.walletAddress,
    walletBalance: farcaster.walletBalance
  })
  
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  // Check if we're inside Farcaster
  useEffect(() => {
    const inFarcaster = isInsideFarcaster()
    console.log('[Header] Checking if inside Farcaster', { inFarcaster })
    setIsInFarcaster(inFarcaster)
  }, [])

  // Auto-connect when running inside Farcaster
  useEffect(() => {
    console.log('[Header] Auto-connect effect', { 
      isWindow: typeof window !== "undefined",
      hasFarcaster: !!(typeof window !== "undefined" && (window as any).farcaster),
      isConnected,
      isConnecting
    })
    
    if (typeof window === "undefined") return
    const fc = (window as any).farcaster
    if (!fc) {
      console.log('[Header] No Farcaster SDK found')
      return
    }
    if (isConnected || isConnecting) {
      console.log('[Header] Already connected or connecting, skipping auto-connect')
      return
    }
    console.log('[Header] Attempting auto-connect to Farcaster wallet')
    
    const id = requestAnimationFrame(() => {
      void connectWallet().catch((err) => {
        console.warn('[Header] Auto-connect failed:', err)
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isConnected, isConnecting, connectWallet])

  // Use Farcaster wallet data as fallback if wallet context hasn't synced yet
  const displayAddress = address || farcaster.walletAddress
  const displayBalance = balance !== undefined ? balance : farcaster.walletBalance
  
  console.log('[Header] Display data', { 
    displayAddress, 
    displayBalance,
    addressSource: address ? 'wallet-context' : 'farcaster-context',
    balanceSource: balance !== undefined ? 'wallet-context' : 'farcaster-context'
  })

  // Format balance for display
  const formattedBalance = displayBalance !== undefined && displayBalance !== null
    ? Number(displayBalance).toFixed(4)
    : '0.0000'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Victory Vault Logo" 
              width={60} 
              height={60} 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Victory Vault</h1>
        </Link>

        {/* Wallet button - only show outside Farcaster (uses AppKit) */}
        {!isInFarcaster ? (
          <WalletButton />
        ) : (
          /* Show address and balance when in Farcaster */
          (isConnected || farcaster.isWalletConnected) && displayAddress ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {formattedBalance} CELO
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>
    </header>
  )
}