"use client"

import { createContext, useContext, ReactNode, useState } from 'react'
import { Address } from 'viem'
import { ZoraUser, fetchZoraUser, createEmptyUser } from '@/lib/zora-api'
import { useWalletContext } from './wallet-context'

type ZoraContextType = {
  user: ZoraUser | null
  isLoading: boolean
  error: Error | null
  fetchUserProfile: (address: Address) => Promise<ZoraUser | null>
  checkUserExists: (address: Address) => Promise<boolean>
}

const ZoraContext = createContext<ZoraContextType | undefined>(undefined)

export function ZoraProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ZoraUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { address } = useWalletContext()

  const fetchUserProfile = async (address: Address): Promise<ZoraUser | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const userData = await fetchZoraUser(address)
      setUser(userData)
      return userData
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch user profile')
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserExists = async (address: Address): Promise<boolean> => {
    try {
      const user = await fetchUserProfile(address)
      return Boolean(user?.exists)
    } catch (err) {
      return false
    }
  }

  return (
    <ZoraContext.Provider 
      value={{
        user,
        isLoading,
        error,
        fetchUserProfile,
        checkUserExists,
      }}
    >
      {children}
    </ZoraContext.Provider>
  )
}

export function useZora() {
  const context = useContext(ZoraContext)
  
  if (context === undefined) {
    throw new Error('useZora must be used within a ZoraProvider')
  }
  
  return context
} 