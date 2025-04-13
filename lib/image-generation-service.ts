import { ZoraCoin } from './zora-coins-api';
import OpenAI from 'openai';

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow usage in browser environment
});

export interface GenerateImageRequest {
  images: string[]  // Array of image URLs to merge
  prompt: string    // Custom prompt to guide the image generation
}

export interface GenerateImageResponse {
  success: boolean
  imageBase64: string       // Base64 encoded generated image
  error?: string
}

/**
 * Convert image URL to base64 for GPT-4V
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    // Try direct fetch first
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        return await blobToBase64(blob);
      }
    } catch (directError) {
      console.log("Direct fetch failed:", directError);
    }
    
    // If direct fetch fails, try with CORS proxy
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl);
      if (proxyResponse.ok) {
        const blob = await proxyResponse.blob();
        return await blobToBase64(blob);
      }
    } catch (proxyError) {
      console.log("Proxy fetch failed:", proxyError);
    }
    
    console.error(`Failed to fetch image from ${url}`);
    return null;
  } catch (error) {
    console.error(`Error converting image to base64: ${error}`);
    return null;
  }
}

/**
 * Helper to convert blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates a meme by using OpenAI's GPT-4V model
 * @param params The image generation parameters including images and prompt
 * @returns Generated image as base64 string
 */
export async function generateImage({
  images,
  prompt
}: GenerateImageRequest): Promise<GenerateImageResponse> {
  try {
    console.log(`Simulating image generation with prompt: ${prompt.substring(0, 30)}...`);
    console.log(`Selected images count: ${images.length}`);
    
    // Sleep for 10 seconds to simulate API call
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Simple placeholder image (1x1 transparent pixel)
    const placeholderImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAJeXl5aWlpeXl5eXl5eXl5eXl5aWlpaWlpeXl5eXl5eXl5eXl5eXl5eXl5aWlpWVlZmZmZeXl5aWlpmZmZeXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5iYmJiYmJWVlZmZmZeXl5aWlpeXl5eXl5eXl5eXl5iYmJeXl5eXl5eXl5iYmJiYmJaWlpWVlZmZmZubm5eXl5eXl5aWlpeXl5aWlpiYmJaWlpeXl5eXl5eXl5eXl5eXl5iYmJeXl5WVlZaWlpeXl5eXl5iYmJeXl5eXl5eXl5eXl5eXl5iYmJiYmJaWlpeXl5eXl5eXl5aWlpeXl5aWlpeXl5eXl5iYmJubm5qampeXl5aWlpiYmJaWlpeXl5eXl5eXl5eXl5eXl5aWlpeXl5aWlpaWlpeXl5eXl5eXl5eXl5aWlpaWlpiYmJeXl5eXl5eXl5aWlpeXl5eXl5eXl5eXl5iYmJaWlpeXl5aWlpaWlpeXl5eXl5aWlpaWlpaWlpeXl5eXl5iYmJmZmZiYmJaWlpeXl5eXl5aWlpaWlpeXl5eXl5eXl5aWlpaWlpeXl5aWlpeXl5aWlpaWlpaWlpeXl5aWlpaWlpiYmJaWlpeXl5eXl5aWlpaWlpaWlpaWlpmZmZaWlpaWlpeXl5eXl5eXl5aWlpaWlpaWlpaWlpiYmJiYmJaWlpaWlpeXl5eXl5aWlpaWlpaWlpaWlpubm5qampaWlpaWlpaWlpeXl5aWlpaWlpaWlpaWlpeXl5iYmJeXl5aWlpaWlpaWlpaWlpaWlpaWlpaWlpiYmJiYmJeXl5aWlpaWlpaWlpWVlZeXl5aWlpaWlpaWlpeXl5iYmJaWlpWVlZWVlZaWlpaWlpaWlpaWlpaWlpaWlpiYmJeXl5eXl5aWlpaWlpaWlpaWlpWVlZaWlpaWlpeXl5eXl5eXl5aWlpaWlpWVlZWVlZaWlpaWlpaWlpaWlpeXl5aWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpWVlZaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpWVlZaWlpaWlpaWlpaWlpaWlpaWlpaW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";
    
    // Return placeholder image after 10-second delay
    return {
      success: true,
      imageBase64: placeholderImage
    };
  } catch (error: any) {
    console.error('Error in simulated image generation:', error);
    return {
      success: false,
      imageBase64: '',
      error: `Image generation error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Helper function to extract image URLs from selected coins
 * @param selectedCoins Array of ZoraCoin objects
 * @returns Array of image URLs
 */
export function extractImageUrls(selectedCoins: ZoraCoin[]): string[] {
  return selectedCoins
    .filter(coin => coin.image && typeof coin.image === 'string')
    .map(coin => coin.image as string);
} 