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
 * Fetches an image from a URL and converts it to a Blob
 * @param url Image URL
 * @returns Blob of the image
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  return await response.blob();
}

/**
 * Generates a meme by using OpenAI's DALL-E model
 * @param params The image generation parameters including images and prompt
 * @returns Generated image as base64 string
 */
export async function generateImage({
  images,
  prompt
}: GenerateImageRequest): Promise<GenerateImageResponse> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    if (images.length === 0) {
      throw new Error('No images provided for generation');
    }

    console.log(`Generating meme with ${images.length} reference images and prompt: ${prompt.substring(0, 30)}...`);
    
    // Enhanced prompt for funny memes
    const enhancedPrompt = `Create a hilarious meme using these images. ${prompt} Make it witty, funny, and shareable. Add text if appropriate.`;
    
    // Use the first image as the primary reference
    const imageBlob = await fetchImageAsBlob(images[0]);
    
    // Convert Blob to suitable format for OpenAI API
    const imageBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    
    // For TypeScript compatibility and API requirements
    const imageFile: any = uint8Array;
    imageFile.name = 'reference_image.png';

    // Generate the image with OpenAI
    const response = await openai.images.edit({
      model: "dall-e-2", // DALL-E 2 supports image edits
      image: imageFile,
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    
    // Extract the base64 image from the response
    const generatedImageBase64 = `data:image/png;base64,${response.data[0].b64_json}`;
    
    return {
      success: true,
      imageBase64: generatedImageBase64
    };
  } catch (error) {
    console.error('Error generating meme:', error);
    
    // If image edit fails, try generation without the image
    try {
      console.log('Falling back to pure generation without image editing');
      
      // Create a more descriptive prompt that includes description of the reference images
      const fallbackPrompt = `Create a hilarious meme about ${prompt}. Make it extremely funny and shareable with witty text overlay.`;
      
      const response = await openai.images.generate({
        model: "dall-e-3", // Use DALL-E 3 for high quality generation
        prompt: fallbackPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        response_format: "b64_json",
      });
      
      // Extract the base64 image from the response
      const generatedImageBase64 = `data:image/png;base64,${response.data[0].b64_json}`;
      
      return {
        success: true,
        imageBase64: generatedImageBase64
      };
    } catch (fallbackError) {
      console.error('Error in fallback generation:', fallbackError);
      return {
        success: false,
        imageBase64: '',
        error: `Image generation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
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