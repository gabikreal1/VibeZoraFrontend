import { Address } from 'viem'
import { ZoraCoin } from './zora-coins-api'

// Get the backend API URL from environment variables or use the default
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://zora.devanshkaria.dev'

export interface UploadRequest {
  picture: string  // Base64 encoded image (generated meme)
  prompt: string   // Custom prompt used for generation
}

export interface UploadResponse {
  success: boolean
  ipfsMetadataUri: string  // IPFS CID
  imageBase64?: string     // Base64 image preview
  name: string             // Name for the coin
  description: string      // Description for the coin
  error?: string
}

/**
 * Uploads a generated meme image and prompt to the backend
 * @param params Upload parameters including base64 image and prompt
 * @returns UploadResponse with IPFS metadata URI and coin info
 */
export async function uploadToBackend({
  picture,
  prompt
}: UploadRequest): Promise<UploadResponse> {
  try {
    console.log(`Uploading meme to backend with prompt: ${prompt.substring(0, 30)}...`);
    
    const apiUrl = `${BACKEND_API_URL}/api/content/content`
    
    // Prepare data to send to backend - the backend expects 'pictures' array
    const requestData = {
      prompt,
      pictures: [picture] // Put the single image in an array for backend compatibility
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`)
      return {
        success: false,
        ipfsMetadataUri: '',
        name: '',
        description: '',
        error: `Upload failed: ${response.status} ${response.statusText}`
      }
    }
    
    const data = await response.json()
    console.log('Backend upload response:', data)
    
    return {
      success: true,
      ipfsMetadataUri: data.data?.ipfsUri || '',
      imageBase64: picture, // Use the original generated image
      name: data.data?.metadata?.name || 'Vibe Coin',
      description: data.data?.metadata?.description || 'Generated with Vibe'
    }
  } catch (error) {
    console.error('Error uploading to backend:', error)
    return {
      success: false,
      ipfsMetadataUri: '',
      name: '',
      description: '',
      error: `Upload error: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * Helper function to extract image URLs from selected coins
 * @param selectedCoins Array of ZoraCoin objects
 * @returns Array of image URLs
 */
export function extractPreviewLinks(selectedCoins: ZoraCoin[]): string[] {
  return selectedCoins
    .filter(coin => coin.image && typeof coin.image === 'string')
    .map(coin => coin.image as string);
} 