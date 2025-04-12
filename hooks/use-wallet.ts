"use client"

import { useAccount, useBalance, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useEffect } from 'react'

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const { signMessageAsync } = useSignMessage()

  // Auto reconnect on page load if previously connected
  // useEffect(() => {
  //   // Find the last connector the user was connected with from localStorage
  //   const lastConnectorId = typeof window !== 'undefined' 
  //     ? localStorage.getItem('lastConnector') 
  //     : null;
      
  //   if (lastConnectorId) {
  //     const foundConnector = connectors.find(c => c.id === lastConnectorId);
  //     if (foundConnector && !isConnected) {
  //       console.log('Attempting to reconnect with:', lastConnectorId);
  //       connect({ connector: foundConnector });
  //     }
  //   }
  // }, [connect, connectors, isConnected]);

  // Save the last used connector when connecting
  const connectWallet = async (connector = injected()) => {
    // if (typeof window !== 'undefined') {
    //   localStorage.setItem('lastConnector', connector.id);
    // }
    return connect({ connector });
  };

  // Remove the stored connector when disconnecting
  const disconnectWallet = () => {
    // if (typeof window !== 'undefined') {
    //   localStorage.removeItem('lastConnector');
    // }
    disconnect();
  };

  // Sign a message and return the signature
  const signMessage = async (message: string) => {
    if (!isConnected || !address) throw new Error('Wallet not connected')
    return signMessageAsync({ message })
  }

  // Get formatted account info
  const getAccountInfo = () => {
    if (!isConnected || !address) return null
    
    return {
      address,
      chainId: chain?.id,
      balance: {
        formatted: balance?.formatted,
        symbol: balance?.symbol,
        value: balance?.value
      }
    }
  }

  // Helper to truncate address for display
  const truncateAddress = (addr = address) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    address,
    isConnected,
    chain,
    balance,
    connectWallet,
    disconnect: disconnectWallet,
    signMessage,
    getAccountInfo,
    truncateAddress
  }
} 