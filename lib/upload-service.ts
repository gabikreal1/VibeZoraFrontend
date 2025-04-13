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
    
    // Verify backend URL is configured
    if (!BACKEND_API_URL) {
      throw new Error('Backend API URL is not configured in environment variables');
    }
    
    const apiUrl = `${BACKEND_API_URL}/api/content/content`
    console.log(`Using backend URL: ${apiUrl}`);
    
    // Prepare data to send to backend - the backend expects 'pictures' array
    const requestData = {
      prompt,
      pictures: [picture] // Put the single image in an array for backend compatibility
    }
    
    // Add CORS mode explicitly
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors', // Explicitly request CORS
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      return {
        success: false,
        ipfsMetadataUri: '',
        name: '',
        description: '',
        error: `Upload failed (${response.status}): ${response.statusText}. Make sure your backend has CORS enabled.`
      }
    }
    
    const data = await response.json()
    console.log('Backend upload response:', data)
    
    // Handle successful response even if it doesn't match expected format
    if (!data.data) {
      console.warn('Backend response missing expected data structure:', data);
      return {
        success: true,
        ipfsMetadataUri: data.ipfsUri || data.ipfsMetadataUri || '',
        imageBase64: picture,
        name: data.metadata?.name || data.name || 'Vibe Coin',
        description: data.metadata?.description || data.description || 'Generated with Vibe'
      }
    }
    
    return {
      success: true,
      ipfsMetadataUri: data.data?.ipfsUri || '',
      imageBase64: picture, // Use the original generated image
      name: data.data?.metadata?.name || 'Vibe Coin',
      description: data.data?.metadata?.description || 'Generated with Vibe'
    }
  } catch (error) {
    console.error('Error uploading to backend:', error)
    
    // Provide helpful CORS-specific error message
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        ipfsMetadataUri: '',
        name: '',
        description: '',
        error: 'CORS error: Your backend server needs to enable CORS for requests from localhost:3000'
      }
    }
    
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