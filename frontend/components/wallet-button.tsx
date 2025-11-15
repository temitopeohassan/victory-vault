"use client"

import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy, Check, User } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export function WalletButton() {
  const { 
    isConnected, 
    address, 
    balance, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    isFarcasterWallet,
    farcasterUser
  } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          {isFarcasterWallet ? <User className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {isFarcasterWallet && farcasterUser ? farcasterUser.displayName : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </span>
          <span className="sm:hidden">
            {isFarcasterWallet && farcasterUser ? farcasterUser.displayName?.slice(0, 8) : `${address?.slice(0, 4)}...`}
          </span>
          {isFarcasterWallet && (
            <Badge variant="secondary" className="text-xs">
              Farcaster
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {isFarcasterWallet && farcasterUser && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground mb-1">Farcaster Profile</p>
              <p className="text-sm font-semibold text-foreground">{farcasterUser.displayName}</p>
              <p className="text-xs text-muted-foreground">@{farcasterUser.username}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
          <p className="text-sm font-mono font-semibold text-foreground break-all">{address}</p>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground mb-1">USDC Balance</p>
          <p className="text-lg font-bold text-foreground">${balance.toLocaleString()}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
