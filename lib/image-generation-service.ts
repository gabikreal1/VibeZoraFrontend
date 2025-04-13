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
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured - please check your .env.local file');
    }

    console.log(`Generating meme with ${images.length} images and prompt: ${prompt.substring(0, 30)}...`);
    
    // Get coin names for better context
    const coinDescriptions = images.map(imageUrl => {
      try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        const coinName = filename.split('.')[0]
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .replace(/\d+/g, '')
          .trim();
          
        return coinName || 'cryptocurrency';
      } catch {
        return 'cryptocurrency';
      }
    });
    
    // Enhanced prompt for GPT-4V
    const enhancedPrompt = `You are a crypto meme generator. Create a hilarious and creative meme based on the images of cryptocurrencies I'm showing you.

These images are of: ${coinDescriptions.join(', ')}

User prompt: ${prompt}

Instructions:
1. Analyze these cryptocurrency images
2. Create a funny and witty meme concept that combines elements from these images
3. The meme should reference crypto culture, trading, or blockchain technology
4. Include a caption/text for the meme that would go well with these images
5. IMPORTANT: Output a description of how exactly the meme should look - be very specific so DALL-E can generate it later

Output in this format:
MEME CONCEPT: [1-2 sentences describing the meme idea]
VISUAL ELEMENTS: [What should be visually shown in the meme]
TEXT OVERLAY: [The exact text that should be on the meme]
DETAILED DESCRIPTION: [A paragraph with specific details about the image layout, style, and elements that should be included]`;

    // Convert image URLs to base64 for GPT-4V
    const imageContents = await Promise.all(
      images.map(async (url) => {
        const base64 = await imageUrlToBase64(url);
        return base64 ? { type: "image_url", image_url: { url: base64 } } : null;
      })
    );
    
    // Filter out any images that failed to convert
    const validImageContents = imageContents.filter(content => content !== null);
    
    if (validImageContents.length === 0 && images.length > 0) {
      console.log("Could not load any of the provided images, generating without images");
    }
    
    // Set up the messages for GPT-4V
    const messages = [
      { role: "system", content: "You are a creative crypto meme designer." },
      { 
        role: "user", 
        content: [
          { type: "text", text: enhancedPrompt },
          ...validImageContents as any[]
        ]
      }
    ];
    
    // First use GPT-4V to generate a detailed meme description
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages as any,
      max_tokens: 1000,
    });
    
    const memeDescription = response.choices[0].message.content;
    console.log("Generated meme description:", memeDescription);
    
    // Now use DALL-E 3 to create the actual image based on the description
    const dall_e_prompt = `Create a crypto meme with this exact specification: ${memeDescription}
The meme should be in a popular internet meme format with clear text.
Make sure any text overlay is large, readable, and follows meme conventions.
DO NOT include any watermarks or borders.`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: dall_e_prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
      response_format: "b64_json",
    });
    
    // Extract the base64 image from the response
    const generatedImageBase64 = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    
    return {
      success: true,
      imageBase64: generatedImageBase64
    };
  } catch (error: any) {
    console.error('Error in generateImage function:', error);
    
    // Try fallback to direct DALL-E if GPT-4V fails
    try {
      console.log('Falling back to DALL-E generation...');
      const fallbackPrompt = `Create a crypto meme featuring ${images.length > 0 
        ? images.map(imageUrl => {
            try {
              const url = new URL(imageUrl);
              const pathParts = url.pathname.split('/');
              const filename = pathParts[pathParts.length - 1];
              return filename.split('.')[0]
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .replace(/\d+/g, '')
                .trim() || 'cryptocurrency';
            } catch {
              return 'cryptocurrency';
            }
          }).join(', ')
        : 'cryptocurrencies'}. ${prompt}. Include cryptocurrency symbols, coins, and add witty text overlay.`;
      
      const fallbackResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: fallbackPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
      });
      
      const fallbackImage = `data:image/png;base64,${fallbackResponse.data[0].b64_json}`;
      return {
        success: true,
        imageBase64: fallbackImage
      };
    } catch (fallbackError: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error generating image';
      return {
        success: false,
        imageBase64: '',
        error: `Image generation error: ${errorMessage}`
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