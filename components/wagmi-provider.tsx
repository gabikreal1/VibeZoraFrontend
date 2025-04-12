"use client"

import { ReactNode } from 'react'
import { WagmiProvider as Provider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { config, queryClient } from '@/lib/wagmi'
import { WalletProvider } from '@/context/wallet-context'
import { ZoraProvider } from '@/context/zora-context'

interface WagmiProviderProps {
  children: ReactNode
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <Provider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <ZoraProvider>
            {children}
          </ZoraProvider>
        </WalletProvider>
      </QueryClientProvider>
    </Provider>
  )
} 