import { Address } from 'viem'

export interface BackendUser {
  _id: string
  walletAddress: string
  isAutoMintEnabled: boolean
  isSentimentAnalysisEnabled: boolean
  basePrompt: string
  createdAt: string
  updatedAt: string
  __v: number
}

// Get the backend API URL from environment variables or use the default
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://zora.devanshkaria.dev'

/**
 * Create an empty backend user with default values
 * @param walletAddress The wallet address
 * @returns A default BackendUser object
 */
export const createEmptyBackendUser = (walletAddress: string): BackendUser => ({
  _id: '',
  walletAddress,
  isAutoMintEnabled: false,
  isSentimentAnalysisEnabled: false,
  basePrompt: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0
})

/**
 * Fetch backend user data by wallet address
 * @param walletAddress The wallet address to fetch user data for
 * @returns BackendUser object if found, or empty user if not found
 */
export async function fetchBackendUser(walletAddress: string): Promise<BackendUser> {
  try {
    console.log(`Fetching backend user for wallet: ${walletAddress}`)
    
    const apiUrl = `${BACKEND_API_URL}/api/users/by-wallet?walletAddress=${walletAddress}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`)
      // If user doesn't exist (404) or other error, return empty user
      return createEmptyBackendUser(walletAddress)
    }
    
    const data = await response.json()
    console.log('Backend user data:', data)
    
    return data as BackendUser
  } catch (error) {
    console.error('Error fetching backend user:', error)
    // Return empty user on error
    return createEmptyBackendUser(walletAddress)
  }
} 