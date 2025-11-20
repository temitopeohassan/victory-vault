import './globals.css'
import { ReactNode } from 'react'
import { Inter, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { WalletProvider } from '@/lib/wallet-context'
import { FarcasterProvider } from '@/lib/farcaster-context'
import { ContractProvider } from '@/lib/wagmi-provider'
import { AppKitProvider } from '@/components/appkit-provider'
import { FooterTabs } from '@/components/footer-tabs'
import { FarcasterReady } from '@/components/farcaster-ready'

const inter = Inter({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Victory  Vault - Soccer Prediction Market',
  description:
    'Decentralized soccer prediction market where users stake tokens on match outcomes',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${geistMono.className} min-h-screen bg-background text-foreground`}>
        <FarcasterReady />
        <FarcasterProvider>
          <ContractProvider>
            <AppKitProvider>
              <WalletProvider>
                <div className="pb-20">
                  {children}
                </div>
                <FooterTabs />
              </WalletProvider>
            </AppKitProvider>
          </ContractProvider>
        </FarcasterProvider>
      </body>
    </html>
  )
}
