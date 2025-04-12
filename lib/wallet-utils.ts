import { Address } from 'viem'

/**
 * Formats an ETH address for display
 * @param address - ETH address to format
 * @param length - Number of characters to show at beginning and end
 */
export function formatAddress(address?: Address, beginLength = 6, endLength = 4): string {
  if (!address) return ''
  return `${address.slice(0, beginLength)}...${address.slice(-endLength)}`
}

/**
 * Formats ETH value with specified precision
 */
export function formatEth(value?: bigint | string, precision = 4): string {
  if (!value) return '0'
  
  const valueString = typeof value === 'bigint' 
    ? (Number(value) / 1e18).toString() 
    : value

  // Split on decimal point
  const [whole, fraction] = valueString.split('.')
  
  // Handle the fraction part with specified precision
  const formattedFraction = fraction 
    ? `.${fraction.slice(0, precision)}` 
    : ''
  
  return `${whole}${formattedFraction}`
}

/**
 * Prepares message for signing with Sora SDK
 * This function would be expanded when integrated with Sora SDK
 */
export function prepareSoraMessage(data: any): string {
  // This is a placeholder - you'll implement Sora SDK specific logic here
  const message = JSON.stringify({
    app: 'Vibe-Zora',
    action: 'create',
    timestamp: Date.now(),
    data
  })
  
  return message
}

/**
 * Verifies a signature for Sora SDK
 * This function would be expanded when integrated with Sora SDK
 */
export function verifySoraSignature(signature: string, message: string, address: Address): boolean {
  // This is a placeholder - you'll implement Sora SDK specific verification logic here
  // For now, just returning true to indicate successful verification
  return true
} 