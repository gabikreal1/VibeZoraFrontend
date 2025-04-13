"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { BackendUser, createEmptyBackendUser, fetchBackendUser } from '@/lib/backend-user-api'
import { useWalletContext } from './wallet-context'
import { toast } from 'sonner'

// Define the context type
type BackendUserContextType = {
  backendUser: BackendUser | null
  isLoadingBackendUser: boolean
  error: Error | null
  refreshBackendUser: () => Promise<BackendUser | null>
}

// Create the context
const BackendUserContext = createContext<BackendUserContextType | undefined>(undefined)

// Provider component
export function BackendUserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWalletContext()
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
  const [isLoadingBackendUser, setIsLoadingBackendUser] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load backend user data when wallet is connected
  useEffect(() => {
    const loadBackendUser = async () => {
      if (isConnected && address) {
        await refreshBackendUser()
      } else {
        setBackendUser(null)
      }
    }

    loadBackendUser()
  }, [isConnected, address])

  // Refresh backend user data
  const refreshBackendUser = async (): Promise<BackendUser | null> => {
    if (!isConnected || !address) {
      return null
    }

    setIsLoadingBackendUser(true)
    setError(null)

    try {
      console.log('Loading backend user for wallet:', address)
      const user = await fetchBackendUser(address)
      setBackendUser(user)
      return user
    } catch (error: any) {
      console.error('Failed to load backend user:', error)
      const err = error instanceof Error ? error : new Error(error?.message || 'Failed to load backend user')
      setError(err)
      toast.error('Failed to load user data', {
        description: 'There was an error loading your user data. Using default settings.',
      })
      return null
    } finally {
      setIsLoadingBackendUser(false)
    }
  }

  return (
    <BackendUserContext.Provider
      value={{
        backendUser,
        isLoadingBackendUser,
        error,
        refreshBackendUser
      }}
    >
      {children}
    </BackendUserContext.Provider>
  )
}

// Custom hook to use the backend user context
export const useBackendUser = () => {
  const context = useContext(BackendUserContext)
  if (context === undefined) {
    throw new Error('useBackendUser must be used within a BackendUserProvider')
  }
  return context
} 