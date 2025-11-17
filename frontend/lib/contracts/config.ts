import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`

if (!contractAddress) {
  console.warn('NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS not set')
}

// Get project ID from environment or use default
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default'

// Create wagmi adapter with Reown AppKit
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [celo],
})

// Create wagmi config with Farcaster connector
// The AppKit adapter will provide its connectors through the modal
// We use the adapter's config as reference but create our own to include Farcaster
export const wagmiConfig = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org'),
  },
  connectors: [
    farcasterMiniApp(), // Farcaster connector (used when inside Farcaster)
    // AppKit connectors are provided by the adapter and available through the modal
  ],
  ssr: true,
})

// Note: The AppKit adapter manages its own connectors through the modal UI.
// The Farcaster connector is available directly in the config for use inside Farcaster.
// Both share the same chains and network configuration.

export const CONTRACT_ADDRESS = contractAddress || '0xd8d5EC59A5e28Df6e9c1A5DAf5dC82F38Aea6442' as `0x${string}`

// Export adapter and project ID for AppKit provider
export { wagmiAdapter, projectId }

