"use client"

import { ReactNode } from 'react'
import { WagmiProvider as Provider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { config, queryClient } from '@/lib/wagmi'
import { WalletProvider } from '@/context/wallet-context'
import { ZoraProvider } from '@/context/zora-context'
import { BackendUserProvider } from '@/context/backend-user-context'
import { setupZoraEventListeners } from '@/lib/wallet-utils'
import { useEffect } from 'react'

interface WagmiProviderProps {
  children: ReactNode
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  useEffect(() => {
    setupZoraEventListeners();
  }, []);

  return (
    <Provider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <BackendUserProvider>
            <ZoraProvider>
              {children}
            </ZoraProvider>
          </BackendUserProvider>
        </WalletProvider>
      </QueryClientProvider>
    </Provider>
  )
} 