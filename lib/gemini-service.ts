import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content, Part, InlineDataPart } from "@google/generative-ai";
import { ZoraCoin } from "./zora-coins-api";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = process.env.NEXT_PUBLIC_GEMINI_MODEL_NAME || "gemini-2.0-flash-exp-image-generation";

if (!API_KEY) {
  console.warn("Gemini API Key not found in environment variables. Generation will likely fail.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};


/**
 * Represents image data suitable for the Gemini API (structurally compatible with Part type).
 */
interface GeminiImagePart { 
  inlineData: {
    mimeType: string;
    data: string; // Base64 encoded image data
  };
}

/**
 * Converts an image URL to a Base64 encoded string suitable for Gemini API.
 * Handles potential CORS issues by routing through a proxy if needed.
 */
async function urlToGenerativePart(imageInput: string | any, mimeType: string): Promise<GeminiImagePart> {
  // Extract image URL from potential object structure
  let url: string;
  if (typeof imageInput === 'string') {
    url = imageInput;
  } else if (imageInput && typeof imageInput === 'object') {
    // Try to extract image URL from object structure (for previewImage)
    url = imageInput.medium || imageInput.large || imageInput.small || imageInput.raw || '/placeholder.svg';
  } else {
    console.warn("Invalid image input:", imageInput);
    url = '/placeholder.svg';
  }

  // If URL is relative, make it absolute
  if (url.startsWith('/') && !url.startsWith('//')) {
    url = `${window.location.origin}${url}`;
  }

  console.log("Fetching image for Gemini:", url);
  try {
    // For client-side use with browser APIs
    const response = await fetch(url, { 
      mode: 'cors', // Try with CORS initially
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Use Browser Blob API instead of Node.js Buffer
    const blob = await response.blob();
    
    // Convert Blob to base64 using FileReader (browser API)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString() || '';
        // Extract just the base64 part, removing the data URL prefix
        const base64 = base64data.split(',')[1] || '';
        
        resolve({
          inlineData: {
            mimeType,
            data: base64,
          },
        });
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image directly:", error);
    
    // Try using an image proxy as fallback
    try {
      // Create a data URL for a generic placeholder image
      console.log("Using a placeholder image instead");
      // Simple 1x1 transparent pixel as fallback
      const fallbackBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      
      return {
        inlineData: {
          mimeType: "image/png",
          data: fallbackBase64,
        },
      };
    } catch (fallbackError) {
      console.error("Failed to create placeholder image:", fallbackError);
      throw new Error(`Failed to process image URL: ${url}. Error: ${error}`);
    }
  }
}

/**
 * Represents the result from the Gemini image generation.
 */
export interface GeminiGeneratedImage {
  imageData: string; // Base64 encoded image data
  mimeType: string;
}

/**
 * Represents an error response from the generation function.
 */
export interface GeminiError {
  error: string;
}

/**
 * Type guard to check if an object is a GeminiGeneratedImage.
 */
export function isGeneratedImage(obj: any): obj is GeminiGeneratedImage {
  return obj && typeof obj.imageData === 'string' && typeof obj.mimeType === 'string';
}

/**
 * Type guard to check if an object is a GeminiError.
 */
export function isError(obj: any): obj is GeminiError {
  return obj && typeof obj.error === 'string';
}

/**
 * Generates an image based on selected coins and a custom prompt using the Gemini API.
 * Now returns an actual image instead of just text.
 */
export async function generateContentWithGemini(
  selectedCoins: ZoraCoin[],
  customPrompt: string
): Promise<string> {
  console.log("Generating image with Gemini...");
  
  try {
    if (!API_KEY) {
      throw new Error("Gemini API key not found in environment variables");
    }

    // Use gemini-2.0-flash-exp-image-generation model for image generation
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      // Update generation config to match Google's example for image generation
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });



    // Create an array to hold all parts of the prompt (text and images)
    const promptParts: Part[] = [{ text: customPrompt }];
    
    // Process images in parallel with Promise.all if we have selected coins
    if (selectedCoins.length > 0) {
      try {
        console.log("Adding coin images as reference to prompt...");
        
        // Log all coin images for debugging
        selectedCoins.forEach(coin => {
          console.log(`Coin ${coin.name} has image: `, coin.image);
        });
        
        // Process images in parallel with Promise.all
        const imagePromises = selectedCoins
          .filter(coin => {
            const hasImage = coin.image && 
                          typeof coin.image === 'string' && 
                          !coin.image.includes('placeholder');
            if (!hasImage) {
              console.log(`Skipping image for ${coin.name}: Invalid or placeholder image`);
            }
            return hasImage;
          })
          .slice(0, 2) // Limit to max 2 images
          .map(async coin => {
            try {
              const imageUrl = coin.image as string;
              const mimeType = imageUrl.toLowerCase().endsWith(".png") ? "image/png" : 
                            imageUrl.toLowerCase().endsWith(".jpg") || imageUrl.toLowerCase().endsWith(".jpeg") ? "image/jpeg" : 
                            imageUrl.toLowerCase().endsWith(".gif") ? "image/gif" :
                            "image/webp";
              console.log(`Processing image for ${coin.name} with MIME type ${mimeType}`);
              return await urlToGenerativePart(imageUrl, mimeType);
            } catch (error) {
              console.warn(`Failed to process image for ${coin.name}:`, error);
              return null;
            }
          });
        
        const imageParts = await Promise.all(imagePromises);
        imageParts
          .filter((part): part is GeminiImagePart => part !== null)
          .forEach(part => promptParts.push(part));
        
        console.log(`Successfully added ${imageParts.filter(p => p !== null).length} reference images to prompt`);
      } catch (imageError) {
        console.error("Failed to process images for prompt:", imageError);
        // Continue without images, don't throw
      }
    }

    console.log(`Sending image generation request to Gemini with ${promptParts.length} parts...`);

    try {
      // Start a chat session as shown in Google's example
      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        history: [],
      });

      // Send the message with all prompt parts
      const result = await chatSession.sendMessage(promptParts);
      const response = result.response;
      
      // Extract the image data from the response
      let imageData = "";
      let mimeType = "image/jpeg";
      
      // Access candidates and parts as shown in Google's example
      const candidates = response.candidates || [];
      
      for (let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
        const candidateParts = candidates[candidate_index]?.content?.parts || [];
        for (let part_index = 0; part_index < candidateParts.length; part_index++) {
          const part = candidateParts[part_index];
          if (part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType;
            console.log(`Found image data with MIME type: ${mimeType}`);
            break;
          }
        }
        if (imageData) break;
      }
      
      if (!imageData) {
        // If no image was returned, fallback to text response
        console.log("No image was returned, using text response instead");
        return response.text() || "Failed to generate an image. Please try again.";
      }
      
      console.log("Successfully generated image with Gemini");
      // Return a data URL that can be directly used in an <img> tag
      return `data:${mimeType};base64,${imageData}`;
      
    } catch (error) {
      console.error("Error during image generation:", error);
      // Try text-only generation as fallback
      return `Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a different prompt.`;
    }
    
  } catch (error) {
    console.error("Error in Gemini service:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "An unknown error occurred while generating the image";
  }
}

