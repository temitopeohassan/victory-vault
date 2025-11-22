import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`
if (!contractAddress) {
  console.warn('[Config] NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS not set')
}

// Get project ID from environment or use default
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default'

console.log('[Config] Initializing with:', {
  projectId: projectId.slice(0, 8) + '...',
  celoChainId: celo.id,
  celoName: celo.name,
})

// Create wagmi adapter with Reown AppKit
// CRITICAL: Only use Celo network
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [celo], // Only Celo
})

// Get the wagmi config from the adapter
const adapterConfig = (wagmiAdapter as any).wagmiConfig

// Debug: Log adapter config availability
if (typeof window !== 'undefined') {
  console.log('[Config] WagmiAdapter config available:', !!adapterConfig)
  if (adapterConfig) {
    console.log('[Config] Adapter connectors count:', adapterConfig.connectors?.length || 0)
    console.log('[Config] Adapter chains:', adapterConfig.chains?.map((c: any) => ({ id: c.id, name: c.name })))
  }
}

// Create wagmi config that combines adapter connectors with Farcaster connector
// CRITICAL: Explicitly set chains and transports to ensure only Celo is used
export const wagmiConfig = adapterConfig
  ? createConfig({
      chains: [celo], // CRITICAL: Explicitly set to only Celo
      transports: {
        [celo.id]: http(
          process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
          {
            batch: true, // Enable batching for better performance
          }
        ),
      },
      connectors: [
        ...adapterConfig.connectors, // All AppKit connectors (MetaMask, WalletConnect, etc.)
        farcasterMiniApp(), // Farcaster connector (used when inside Farcaster)
      ],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
    })
  : createConfig({
      chains: [celo],
      transports: {
        [celo.id]: http(
          process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
          {
            batch: true,
          }
        ),
      },
      connectors: [
        farcasterMiniApp(), // Farcaster connector (used when inside Farcaster)
      ],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
    })

// Log final config for debugging
if (typeof window !== 'undefined') {
  console.log('[Config] Final wagmi config:', {
    chains: wagmiConfig.chains.map(c => ({ id: c.id, name: c.name })),
    connectorsCount: wagmiConfig.connectors.length,
    connectorNames: wagmiConfig.connectors.map(c => c.name),
    hasCeloTransport: !!wagmiConfig._internal.transports[celo.id],
  })
}

export const CONTRACT_ADDRESS = contractAddress || '0xd8d5EC59A5e28Df6e9c1A5DAf5dC82F38Aea6442' as `0x${string}`

// Divvi Consumer Identifier (get from Divvi dashboard)
export const DIVVI_CONSUMER = (process.env.NEXT_PUBLIC_DIVVI_CONSUMER || '0xaF108Dd1aC530F1c4BdED13f43E336A9cec92B44') as `0x${string}`

console.log('[Config] Contract configuration:', {
  contractAddress: CONTRACT_ADDRESS,
  divviConsumer: DIVVI_CONSUMER,
})

// Export adapter and project ID for AppKit provider
export { wagmiAdapter, projectId }