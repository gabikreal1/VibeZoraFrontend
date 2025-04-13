# VibeZora Upload and NFT Minting Guide

This guide explains how the image upload and NFT minting process works in the VibeZora app.

## Overview

The upload flow in VibeZora follows these steps:

1. User selects coins from the gallery (up to 2 coins)
2. User enters a custom prompt (optional)
3. User clicks "Create NFT" button
4. The app sends the preview image links and prompt to the backend
5. The backend processes the request and returns an IPFS metadata URI and a base64 image preview
6. The app creates an NFT on the Zora network using the IPFS metadata

## Implementation Details

### 1. Selecting Coins and Entering Prompt

The main page (`app/page.tsx`) allows users to select coins from the gallery and enter a custom prompt. These inputs are then passed to the `UploadConfirmation` component.

### 2. Upload Service

The `upload-service.ts` file contains:
- `extractPreviewLinks`: Extracts image URLs from selected ZoraCoin objects
- `uploadToBackend`: Sends preview links and prompt to backend, receives IPFS URI and base64 image preview

```typescript
export interface UploadRequest {
  previewLinks: string[]
  prompt: string
  walletAddress: Address
  signature?: string
}

export interface UploadResponse {
  success: boolean
  ipfsMetadataUri: string  // IPFS CID
  imageBase64?: string     // Base64 image preview
  error?: string
}
```

### 3. Zora Coin Creator Service

The `zora-coin-creator-service.ts` file contains:
- `createZoraCoin`: Creates a Zora NFT (ERC-1155) using the IPFS metadata URI

### 4. Upload Confirmation Component

The `UploadConfirmation` component:
- Displays a preview of the selected coins and prompt
- Handles the signature process using the user's wallet
- Sends the data to the backend via the `uploadToBackend` function
- Displays the generated image preview from the backend
- Creates an NFT on Zora using the `createZoraCoin` function

### 5. Backend API

The backend expects a POST request to the `/api/generate` endpoint with:

```json
{
  "walletAddress": "0x...",
  "previewLinks": [
    "https://image1.url",
    "https://image2.url"
  ],
  "prompt": "Custom prompt text",
  "signature": "0x..."
}
```

The backend will return:

```json
{
  "ipfsMetadataUri": "ipfs://...",
  "imageBase64": "data:image/..."
}
```

### 6. Zora NFT Creation

The app uses the Zora Protocol SDK to create an ERC-1155 NFT. This is done through the `createZoraCoin` function, which:

1. Initializes a creator client from the Zora Protocol SDK
2. Creates a 1155 contract and token with the IPFS metadata URI
3. Signs and submits the transaction to the Zora network
4. Returns the collection address and token ID for the created NFT

## Example Usage

```typescript
// 1. Import the required functions
import { uploadToBackend, extractPreviewLinks } from "@/lib/upload-service";
import { createZoraCoin } from "@/lib/zora-coin-creator-service";

// 2. Define your component function
async function handleUpload() {
  // Extract image links from selected coins
  const previewLinks = extractPreviewLinks(selectedCoins);
  
  // 3. Send preview links and prompt to the backend
  const uploadResult = await uploadToBackend({
    previewLinks,
    prompt: customPrompt,
    walletAddress: address,
    signature
  });
  
  if (!uploadResult.success) {
    // Handle error
    return;
  }
  
  // Display the generated image preview
  // uploadResult.imageBase64 contains the base64 image data
  
  // 4. Create a Zora NFT using the IPFS metadata from the backend
  const nftResult = await createZoraCoin(
    chainId,
    publicClient,
    walletClient,
    uploadResult.ipfsMetadataUri,
    address
  );
  
  if (nftResult.success) {
    // Success! NFT created
    console.log("NFT created successfully:", nftResult);
    // nftResult.collection contains the collection address
    // nftResult.uid contains the NFT token ID
  }
}
```

## Important Notes

1. Make sure to have the `@zoralabs/protocol-sdk` package installed
2. The backend must be configured to accept the upload request format
3. Ensure that the wallet is connected before attempting to upload
4. The signature is used to verify the request on the backend 