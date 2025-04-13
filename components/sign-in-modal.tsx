"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useConnect } from 'wagmi'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'
import { WALLET_CONNECT_PROJECT_ID } from '@/lib/walletconnect-config'
import { useBackendUser } from '@/context/backend-user-context'

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignInComplete: () => void
}

export default function SignInModal({ open, onOpenChange, onSignInComplete }: SignInModalProps) {
  const [mounted, setMounted] = useState(false)
  const { connect, isPending, error: connectError } = useConnect()
  const { backendUser, isLoadingBackendUser, error: backendError, refreshBackendUser } = useBackendUser()
  
  // Only render wallet UI after client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Call onSignInComplete when backend user data is loaded
  useEffect(() => {
    if (backendUser && !isLoadingBackendUser) {
      onSignInComplete()
    }
  }, [backendUser, isLoadingBackendUser, onSignInComplete])

  // Handle wallet connection
  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector })
      // After connection, the BackendUserProvider will automatically fetch user data
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  // Only render once the component is mounted on the client
  if (!mounted) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your wallet to sign in and access your Vibe Zora account</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => handleConnect(injected())} 
            disabled={isPending || isLoadingBackendUser}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "MetaMask / Browser Wallet"
            )}
          </Button>
          
          <Button 
            onClick={() => handleConnect(coinbaseWallet())} 
            disabled={isPending || isLoadingBackendUser}
            className="w-full"
          >
            Coinbase Wallet
          </Button>
          
          <Button 
            onClick={() => handleConnect(walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }))} 
            disabled={isPending || isLoadingBackendUser}
            className="w-full"
          >
            WalletConnect
          </Button>
        </div>
        
        {(connectError || backendError) && (
          <p className="text-sm text-red-500">
            {connectError?.message || backendError?.message || "Failed to connect wallet"}
          </p>
        )}

        {isLoadingBackendUser && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading user data...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
