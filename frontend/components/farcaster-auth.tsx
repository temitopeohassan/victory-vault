'use client'

import { useState } from 'react'
import { useFarcaster } from '@/lib/farcaster-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Wallet, Bell, Share2 } from 'lucide-react'

export function FarcasterAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    authenticate,
    signOut,
    isWalletConnected,
    walletAddress,
    requestNotificationPermission,
    sendNotification,
    shareApp
  } = useFarcaster()

  const [isRequestingNotification, setIsRequestingNotification] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleAuthenticate = async () => {
    try {
      await authenticate()
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleRequestNotification = async () => {
    try {
      setIsRequestingNotification(true)
      const permission = await requestNotificationPermission()
      console.log('Notification permission:', permission)
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    } finally {
      setIsRequestingNotification(false)
    }
  }

  const handleSendTestNotification = async () => {
    try {
      await sendNotification(
        'Welcome to Victory  Vault!',
        'You\'re now connected to the prediction market. Start making predictions and earning rewards!'
      )
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  const handleShareApp = async () => {
    try {
      setIsSharing(true)
      await shareApp()
    } catch (error) {
      console.error('Failed to share app:', error)
    } finally {
      setIsSharing(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading Farcaster...</span>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Connect with Farcaster
          </CardTitle>
          <CardDescription>
            Sign in with your Farcaster account to access the prediction market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAuthenticate} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              'Connect with Farcaster'
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Farcaster Profile
        </CardTitle>
        <CardDescription>
          Connected to Farcaster
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.pfpUrl} alt={user?.displayName} />
            <AvatarFallback>
              {user?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.displayName}</p>
            <p className="text-sm text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="text-sm">
            {isWalletConnected ? (
              <span className="text-green-600">
                Wallet Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
            ) : (
              <span className="text-muted-foreground">Wallet Not Connected</span>
            )}
          </span>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Follower Count</p>
            <p className="font-medium">{user?.followerCount?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Following</p>
            <p className="font-medium">{user?.followingCount?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleRequestNotification}
            variant="outline"
            className="w-full"
            disabled={isRequestingNotification}
          >
            <Bell className="h-4 w-4 mr-2" />
            {isRequestingNotification ? 'Requesting...' : 'Enable Notifications'}
          </Button>

          <Button
            onClick={handleSendTestNotification}
            variant="outline"
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>

          <Button
            onClick={handleShareApp}
            variant="outline"
            className="w-full"
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? 'Sharing...' : 'Share App'}
          </Button>

          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
