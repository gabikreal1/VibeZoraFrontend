"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, ImagePlus } from "lucide-react"
import { useWalletContext } from "@/context/wallet-context"
import Image from "next/image"
import { ZoraCoin } from "@/lib/zora-coins-api"
import { usePublicClient, useChainId, useWalletClient } from "wagmi"
import { CreateCoinButton, type CoinParams } from "@/components/create-coin"
import { Address } from "viem"
import React from "react"
import { generateImage, extractImageUrls } from "@/lib/image-generation-service"

// Platform referrer from environment
const PLATFORM_REFERRER = process.env.NEXT_PUBLIC_PLATFORM_REFERRER as Address || "0x0000000000000000000000000000000000000000" as Address;

interface UploadConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: () => void
  selectedCoins: ZoraCoin[]
  customPrompt: string
}

export default function UploadConfirmation({ 
  open, 
  onOpenChange, 
  onUploadComplete, 
  selectedCoins, 
  customPrompt 
}: UploadConfirmationProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isCoinCreated, setIsCoinCreated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const { address, isConnected, formatDisplayAddress } = useWalletContext()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  // Effect to start the process when the dialog opens
  React.useEffect(() => {
    if (open && selectedCoins.length > 0) {
      generateMeme();
    }
  }, [open, selectedCoins]);

  // Generate a meme using OpenAI
  const generateMeme = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected")
      return
    }

    setError(null);
    setIsGeneratingImage(true);
    setGeneratedImage(null);

    try {
      // Get image URLs from selected coins
      const images = extractImageUrls(selectedCoins)
      
      console.log("Images for meme generation:", images);
      
      // Create meme prompt if not provided
      const memePrompt = customPrompt || `Create a funny crypto meme with ${selectedCoins.map(coin => coin.name || coin.symbol).join(' and ')}`;
      
      // Generate meme with OpenAI
      const result = await generateImage({
        images,
        prompt: memePrompt
      })
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate meme")
      }
      
      // Store the generated image
      setGeneratedImage(result.imageBase64);
      setIsGeneratingImage(false);
    } catch (err: any) {
      setIsGeneratingImage(false);
      setError(err.message || "Failed to generate meme");
      console.error("Meme generation error:", err);
    }
  }

  // Create coin params using the generated image
  const coinParams: CoinParams | null = (address && generatedImage) ? {
    name: `${selectedCoins.map(c => c.name || c.symbol).join('+')} Meme`,
    symbol: selectedCoins.map(c => c.symbol?.[0] || 'M').join(''),
    uri: generatedImage, // Use the generated image directly
    payoutRecipient: address as Address,
    platformReferrer: PLATFORM_REFERRER
  } : null;

  const handleCoinCreationComplete = () => {
    setIsCoinCreated(true);
    // Close the dialog after coin creation completes
    setTimeout(() => {
      onUploadComplete()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Meme Coin</DialogTitle>
          <DialogDescription>Generate a crypto meme and mint it as a Zora coin</DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center">
          {isCoinCreated ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-medium">Meme coin successfully created!</p>
              <p className="text-xs text-muted-foreground">
                Created by {formatDisplayAddress(address)}
              </p>
            </div>
          ) : isGeneratingImage ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-center font-medium">Generating crypto meme with AI...</p>
              <p className="text-xs text-muted-foreground">This may take up to 30 seconds...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-red-500">{error}</p>
              <Button onClick={generateMeme}>Try Again</Button>
            </div>
          ) : generatedImage ? (
            <div className="w-full space-y-6">
              {/* Display the generated meme */}
              <div className="relative aspect-square w-full max-w-[250px] mx-auto border rounded-md overflow-hidden">
                <Image
                  src={ "https://media.decentralized-content.com/-/rs:fill:2500:3750/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWhlaW51bHpuZHE3eHVhYm1rdGdkdnRnc3ZtaTNodmVyM25ubmlqeXBpMmh1Z2ZkNWg3aHU" }
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              
              {/* Display name for the coin */}
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold">{coinParams?.name || "Meme Coin"}</h3>
                <p className="text-sm text-muted-foreground">Your AI-generated crypto meme</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-center">
                  Create your meme coin using this generated content
                </p>
                
                {address && (
                  <p className="text-xs text-muted-foreground text-center">
                    Payout Recipient: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
                
                {coinParams && (
                  <CreateCoinButton 
                    coinParams={coinParams} 
                    onComplete={handleCoinCreationComplete}
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
