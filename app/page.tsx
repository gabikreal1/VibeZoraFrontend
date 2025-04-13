"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import UploadConfirmation from "@/components/upload-confirmation"
import { WalletConnect } from "@/components/wallet-connect"
import { useWalletContext } from "@/context/wallet-context"
import { ZoraCoin, fetchTopVolumeCoins, fetchTopGainersCoins } from "@/lib/zora-coins-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumber } from "@/lib/utils" // Assuming a utility for formatting large numbers
import { TrendingUp, BarChart, Users, DollarSign, Flame } from "lucide-react"

type GalleryFilter = "volume" | "gainers";

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]) // Store ZoraCoin IDs
  const [customPrompt, setCustomPrompt] = useState("")
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false)
  const { isConnected } = useWalletContext()

  const [galleryCoins, setGalleryCoins] = useState<ZoraCoin[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>("volume")

  // Fetch gallery data based on the selected filter
  useEffect(() => {
    const loadGalleryData = async () => {
      setIsLoadingGallery(true);
      let coins: ZoraCoin[] | null = null;
      
      if (galleryFilter === "volume") {
        coins = await fetchTopVolumeCoins(15);
      } else if (galleryFilter === "gainers") {
        coins = await fetchTopGainersCoins(15);
      }

      setGalleryCoins(coins || []); // Set to empty array if fetch fails
      setIsLoadingGallery(false);
    };

    loadGalleryData();
  }, [galleryFilter]); // Refetch when filter changes

  const handleImageSelect = (id: string) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter((coinId) => coinId !== id))
    } else {
      if (selectedImages.length < 2) {
        setSelectedImages([...selectedImages, id])
      }
    }
  }

  // Get the full ZoraCoin object for a selected ID
  const getSelectedCoinData = (id: string): ZoraCoin | undefined => {
    return galleryCoins.find(coin => coin.id === id);
  }

  const handleUploadClick = () => {
    if (isConnected && selectedImages.length > 0) {
      setShowUploadConfirmation(true) 
    }
  }

  const handleUploadComplete = () => {
    setShowUploadConfirmation(false)
    setSelectedImages([])
    setCustomPrompt("")
  }


  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header with title and wallet connect */}
        <div className="flex items-center justify-between mb-6">
          <WalletConnect />
          <h1 className="text-3xl md:text-4xl font-bold text-center">Vibe-Zora</h1>
          <div className="w-[120px]"></div> {/* Placeholder for alignment */}
        </div>

        <p className="text-center text-muted-foreground mb-6">
          Select up to 2 coins from the gallery, customize with a prompt, and create your NFT on Zora
        </p>

        {/* Gallery Filter Selector */} 
        <div className="flex justify-end mb-4">
          <Select 
            value={galleryFilter} 
            onValueChange={(value) => setGalleryFilter(value as GalleryFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Top Volume 24h</SelectItem>
              <SelectItem value="gainers">Top Gainers 24h</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Gallery */} 
        {isLoadingGallery ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : galleryCoins.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            Failed to load coin data. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
            {galleryCoins.map((coin) => (
              <Card
                key={coin.id}
                className={`overflow-hidden cursor-pointer transition-all ${selectedImages.includes(coin.id) ? "ring-2 ring-primary" : "hover:scale-105"}`}
                onClick={() => handleImageSelect(coin.id)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    <Image 
                      src={coin.image || "/placeholder.svg"} 
                      alt={coin.name || 'Zora Coin'}
                      fill 
                      className="object-cover" 
                      unoptimized // Use if image URLs are external and not optimized by Next.js
                      onError={(e) => (e.currentTarget.src = '/placeholder.svg')} // Fallback image on error
                    />
                    {selectedImages.includes(coin.id) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {selectedImages.indexOf(coin.id) + 1}
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="text-xs font-medium truncate" title={coin.name || 'Unnamed Coin'}>
                      {coin.name || 'Unnamed Coin'} ({coin.symbol || '-'})
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      {/* Display Volume or % Change based on filter */} 
                      {galleryFilter === 'volume' ? (
                        <div className="flex items-center" title={`Volume (24h): ${coin.volume24h ? formatNumber(coin.volume24h, 'usd') : 'N/A'}`}>
                          <Flame className="h-3 w-3 mr-0.5" />
                          {coin.volume24h ? formatNumber(coin.volume24h, 'compact') : '-'}
                        </div>
                      ) : (
                        <div 
                          className={`flex items-center ${coin.marketCapDelta24h && coin.marketCapDelta24h > 0 ? 'text-green-500' : coin.marketCapDelta24h && coin.marketCapDelta24h < 0 ? 'text-red-500' : ''}`} 
                          title={`Change (24h): ${coin.marketCapDelta24h ? coin.marketCapDelta24h.toFixed(2) + '%' : 'N/A'}`}
                        >
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                          {coin.marketCapDelta24h ? `${coin.marketCapDelta24h.toFixed(1)}%` : '-'}
                        </div>
                      )}
                      
                      {/* Market Cap (Now in the middle) */}
                      <div className="flex items-center" title={`Market Cap: ${coin.marketCap ? formatNumber(coin.marketCap, 'usd') : 'N/A'}`}>
                        <BarChart className="h-3 w-3 mr-0.5" />
                        {coin.marketCap ? formatNumber(coin.marketCap, 'compact') : '-'}
                      </div>
                      
                      {/* Holders Count */}
                      <div className="flex items-center" title={`Holders: ${coin.uniqueHolders ? coin.uniqueHolders.toLocaleString() : 'N/A'}`}>
                        <Users className="h-3 w-3 mr-0.5" />
                        {coin.uniqueHolders ? formatNumber(coin.uniqueHolders, 'compact') : '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Customization Bar */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="relative w-full">
            <Input
              placeholder="Type your creative prompt here (e.g., 'A futuristic landscape with elements of crypto')..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleUploadClick}
            disabled={selectedImages.length === 0 || !isConnected} // Disable if nothing selected
            className="w-full md:w-auto"
          >
            Create NFT
          </Button>
        </div>

        {/* Selected Coins Preview */}
        {selectedImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Selected Coins</h2>
            <div className="flex gap-4">
              {selectedImages.map((id) => {
                const coin = getSelectedCoinData(id);
                return coin ? (
                  <div key={id} className="relative w-24 h-24 border rounded-md overflow-hidden bg-muted">
                    <Image
                      src={coin.image || "/placeholder.svg"}
                      alt={coin.name || 'Selected Coin'}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                    />
                  </div>
                ) : null; 
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upload Confirmation Dialog */}
      <UploadConfirmation
        open={showUploadConfirmation}
        onOpenChange={setShowUploadConfirmation}
        onUploadComplete={handleUploadComplete}
        selectedCoins={selectedImages.map(id => getSelectedCoinData(id)).filter(Boolean) as ZoraCoin[]}
        customPrompt={customPrompt}
      />
    </main>
  )
}
