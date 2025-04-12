"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useWallet } from '@/hooks/use-wallet'
import { formatAddress, formatEth } from '@/lib/wallet-utils'
import { ZoraUser, fetchZoraUser, createEmptyUser } from '@/lib/zora-api'
import { toast } from 'sonner'

// Define the context type
type WalletContextType = ReturnType<typeof useWallet> & {
  // Add any additional methods or properties here
  formatDisplayAddress: (address?: string) => string
  formatEthValue: (value?: bigint | string) => string
  zoraUser: ZoraUser | null
  isLoadingZoraUser: boolean
  connectWalletWithZoraCheck: () => Promise<void>
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet()
  const [zoraUser, setZoraUser] = useState<ZoraUser | null>(null)
  const [isLoadingZoraUser, setIsLoadingZoraUser] = useState(false)

  console.log("WalletProvider rendered. isConnected:", wallet.isConnected, "Address:", wallet.address);
  
  // Additional helper functions
  const formatDisplayAddress = (address?: string) => {
    return formatAddress(address as `0x${string}` || wallet.address)
  }
  
  const formatEthValue = (value?: bigint | string) => {
    return formatEth(value || wallet.balance?.value)
  }

  // Load Zora user data when wallet is connected
  useEffect(() => {
    const loadZoraUser = async () => {
      if (wallet.isConnected && wallet.address) {
        setIsLoadingZoraUser(true)
        try {
          console.log('Loading Zora user for wallet:', wallet.address)
          const user = await fetchZoraUser(wallet.address)
          setZoraUser(user)
          
          // If user doesn't exist in Zora, just notify them (but don't disconnect)
          if (!user.exists) {
            console.log('Zora profile not found for address:', wallet.address)
            toast.warning('Zora profile not found', {
              description: 'We couldn\'t find a Zora profile for your wallet. Using fallback display.',
              duration: 5000,
            })
            // Create an empty user but don't disconnect
            setZoraUser(createEmptyUser(wallet.address))
          } else {
            console.log('Zora profile found:', user)
          }
        } catch (error) {
          console.error('Failed to load Zora user:', error)
          setZoraUser(wallet.address ? createEmptyUser(wallet.address) : null)
        } finally {
          setIsLoadingZoraUser(false)
        }
      } else {
        setZoraUser(null)
      }
    }

    loadZoraUser()
  }, [wallet.isConnected, wallet.address]) // Dependency array ensures this runs when connection state or address changes

  // Connect wallet with Zora check
  const connectWalletWithZoraCheck = async () => {
    try {
      await wallet.connectWallet()
      // The effect above will handle the Zora user check after connection
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }
  
  // Combine the wallet hooks with additional methods
  const value = {
    ...wallet,
    formatDisplayAddress,
    formatEthValue,
    zoraUser, // Use the state variable which gets updated by the effect
    isLoadingZoraUser,
    connectWalletWithZoraCheck
  }
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// Custom hook to use the wallet context
export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
} 