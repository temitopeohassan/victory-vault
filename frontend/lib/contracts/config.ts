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
// The adapter will create its own wagmi config with all the necessary connectors
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [celo],
})

// Get the wagmi config from the adapter (includes all AppKit connectors)
// The adapter's config includes: MetaMask, WalletConnect, Coinbase Wallet, etc.
// The adapter exposes its config via the wagmiConfig property
const adapterConfig = (wagmiAdapter as any).wagmiConfig

// Debug: Log adapter config availability
if (typeof window !== 'undefined') {
  console.log('WagmiAdapter config available:', !!adapterConfig)
  if (adapterConfig) {
    console.log('Adapter connectors count:', adapterConfig.connectors?.length || 0)
  }
}

// Create wagmi config that combines adapter connectors with Farcaster connector
// This ensures we have both AppKit connectors (for browser wallets) and Farcaster connector
export const wagmiConfig = adapterConfig
  ? createConfig({
      ...adapterConfig,
      connectors: [
        ...adapterConfig.connectors, // All AppKit connectors (MetaMask, WalletConnect, etc.)
        farcasterMiniApp(), // Farcaster connector (used when inside Farcaster)
      ],
    })
  : createConfig({
      chains: [celo],
      transports: {
        [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org'),
      },
      connectors: [
        farcasterMiniApp(), // Farcaster connector (used when inside Farcaster)
      ],
      ssr: true,
    })

// Note: The AppKit adapter manages its own connectors through the modal UI.
// The Farcaster connector is available directly in the config for use inside Farcaster.
// Both share the same chains and network configuration.

export const CONTRACT_ADDRESS = contractAddress || '0xd8d5EC59A5e28Df6e9c1A5DAf5dC82F38Aea6442' as `0x${string}`

// Divvi Consumer Identifier (get from Divvi dashboard)
export const DIVVI_CONSUMER = (process.env.NEXT_PUBLIC_DIVVI_CONSUMER || '0xaF108Dd1aC530F1c4BdED13f43E336A9cec92B44') as `0x${string}`

// Export adapter and project ID for AppKit provider
export { wagmiAdapter, projectId }

