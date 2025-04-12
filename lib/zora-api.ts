import { Address } from 'viem'

// Get the Zora API URL from environment or use the default
const ZORA_API_URL = process.env.NEXT_PUBLIC_ZORA_API_URL || 'https://api-sdk.zora.engineering'



export type ZoraUser = {
  handle: string | null
  avatar: string | null
  address: Address
  exists: boolean
}

// Default user when no profile is found
export const createEmptyUser = (address: Address): ZoraUser => ({
  handle: null,
  avatar: null,
  address,
  exists: false
})


/**
 * Fetch Zora user profile data by wallet address
 * @param address Wallet address to lookup
 * @returns ZoraUser object
 */
export async function fetchZoraUser(address: Address): Promise<ZoraUser> {
  // If using mock data, return a mock user

  
  try {
    console.log(`Fetching Zora user for address: ${address}`)
    
    // Query the Zora API - profile endpoint from the documentation
    const apiUrl = `${ZORA_API_URL}/profile?identifier=${address}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch Zora user: ${response.status} ${response.statusText}`)
    }
    
    const data = (await response.json()).profile;
    
    console.log(data);

    // If no profile data or missing avatar, user likely doesn't exist in Zora
    if (!data) {
      console.log('No profile data or avatar found')
      return createEmptyUser(address)
    }
    
    // Try to get avatar from any available property
    let avatarUrl = null
    if (data.avatar) {
      avatarUrl = data.avatar.small || 
                 data.avatar.preview || 
                 data.avatar.large || 
                 data.avatar.profile ||
                 data.avatar.image ||
                 null
    }
    
    // Create ZoraUser from API response
    const user = {
      handle: "@"+ data.handle || null,
      avatar: avatarUrl,
      address,
      exists: Boolean(avatarUrl)
    }
    
    console.log('Created Zora user:', user)
    return user
  } catch (error) {
    console.error('Error fetching Zora user:', error)
    // For now, if there's an error, just create a mock user instead of failing
   
    return createEmptyUser(address)
  }
}

/**
 * Check if a Zora user exists for a given wallet address
 * @param address Wallet address to check
 * @returns boolean indicating if user exists
 */
export async function checkZoraUserExists(address: Address): Promise<boolean> {
  const user = await fetchZoraUser(address)
  return user.exists
} 