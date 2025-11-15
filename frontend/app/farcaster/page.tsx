'use client'

import { FarcasterAuth } from '@/components/farcaster-auth'
import { useFarcaster } from '@/lib/farcaster-context'
import { useWallet } from '@/lib/wallet-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Wallet, 
  Bell, 
  Share2, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useState } from 'react'

export default function FarcasterPage() {
  const farcaster = useFarcaster()
  const wallet = useWallet()
  const [isTestingNotification, setIsTestingNotification] = useState(false)

  const handleTestNotification = async () => {
    try {
      setIsTestingNotification(true)
      await farcaster.sendNotification(
        'Test Notification',
        'This is a test notification from Victory  Vault!'
      )
    } catch (error) {
      console.error('Failed to send test notification:', error)
    } finally {
      setIsTestingNotification(false)
    }
  }

  const handleShareApp = async () => {
    try {
      await farcaster.shareApp()
    } catch (error) {
      console.error('Failed to share app:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Farcaster Integration</h1>
            <p className="text-lg text-muted-foreground">
              Experience Victory  Vault with Farcaster's social features and wallet integration
            </p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {farcaster.isAuthenticated ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
                {farcaster.user && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {farcaster.user.displayName}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {wallet.isFarcasterWallet ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Farcaster Wallet</span>
                    </>
                  ) : wallet.isConnected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                      <span className="text-blue-600 font-medium">External Wallet</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
                {wallet.address && (
                  <p className="text-sm text-muted-foreground mt-2 font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    onClick={handleTestNotification}
                    disabled={isTestingNotification || !farcaster.isAuthenticated}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {isTestingNotification ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Test Notification'
                    )}
                  </Button>
                  <Button
                    onClick={handleShareApp}
                    disabled={!farcaster.isAuthenticated}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share App
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Farcaster Auth Component */}
          <FarcasterAuth />

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Farcaster Features</CardTitle>
              <CardDescription>
                Discover what you can do with Farcaster integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Social Features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Seamless authentication with Farcaster account
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Access to user profile and social data
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Share predictions and results with your network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Discover new matches through social feed
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Wallet Integration</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integrated Ethereum wallet for transactions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Seamless staking and claiming rewards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Real-time balance updates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Secure transaction signing
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SDK Status */}
          <Card>
            <CardHeader>
              <CardTitle>SDK Status</CardTitle>
              <CardDescription>
                Current state of the Farcaster Mini App SDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SDK Initialized</span>
                  <Badge variant={farcaster.sdk ? "default" : "secondary"}>
                    {farcaster.sdk ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Loading State</span>
                  <Badge variant={farcaster.isLoading ? "secondary" : "default"}>
                    {farcaster.isLoading ? "Loading..." : "Ready"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Authenticated</span>
                  <Badge variant={farcaster.isAuthenticated ? "default" : "secondary"}>
                    {farcaster.isAuthenticated ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wallet Connected</span>
                  <Badge variant={farcaster.isWalletConnected ? "default" : "secondary"}>
                    {farcaster.isWalletConnected ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
