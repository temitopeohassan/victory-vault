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
  const { isConnected, isConnecting, connectWallet, address } = useWallet()
  const farcaster = useFarcaster()
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  // Check if we're inside Farcaster
  useEffect(() => {
    setIsInFarcaster(isInsideFarcaster())
  }, [])

  // Auto-connect when running inside Farcaster
  useEffect(() => {
    if (typeof window === "undefined") return
    const fc = (window as any).farcaster
    if (!fc) return
    if (isConnected || isConnecting) return

    // Defer one frame to avoid layout jitter on first paint
    const id = requestAnimationFrame(() => {
      void connectWallet().catch(() => {
        // swallow errors; user may not have a wallet connected yet
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isConnected, isConnecting, connectWallet])

  // Use Farcaster wallet address as fallback if wallet context hasn't synced yet
  const displayAddress = address || farcaster.walletAddress

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <Image src="/logo.png" alt="Victory Vautlt Logo" width={60} height={60} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Victory  Vault</h1>
        </Link>

        {/* Top navigation removed; replaced by a fixed footer tab bar */}

        {/* Wallet button - only show outside Farcaster (uses AppKit) */}
        {!isInFarcaster ? (
          <WalletButton />
        ) : (
          /* Show address when in Farcaster */
          (isConnected || farcaster.isWalletConnected) && displayAddress ? (
            <span className="font-mono text-sm text-muted-foreground">
              {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
            </span>
          ) : null
        )}
      </div>
    </header>
  )
}
