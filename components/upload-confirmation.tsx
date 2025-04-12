"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useWalletContext } from "@/context/wallet-context"
import { prepareSoraMessage } from "@/lib/wallet-utils"
import Image from "next/image"

interface UploadConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: () => void
  generatedContent?: string | null
}

export default function UploadConfirmation({ open, onOpenChange, onUploadComplete, generatedContent }: UploadConfirmationProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signMessage, address, isConnected, formatDisplayAddress } = useWalletContext()

  const handleUpload = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create message for Sora SDK
      const messageData = {
        creator: address,
        timestamp: Date.now(),
        action: "upload_creation"
      }
      
      const message = prepareSoraMessage(messageData)
      
      // Sign the message
      const signature = await signMessage(message)
      
      console.log("Signed message:", signature)
      
      // Here you would typically send the signed message to your backend or directly to Sora SDK
      
      // Mock upload process
      setTimeout(() => {
        setIsUploading(false)
        setIsComplete(true)

        // Auto close after showing success
        setTimeout(() => {
          onUploadComplete()
        }, 2000)
      }, 2000)
    } catch (err: any) {
      setIsUploading(false)
      setError(err.message || "Failed to sign transaction")
      console.error("Upload error:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload to Zora</DialogTitle>
          <DialogDescription>Your creation is ready to be uploaded to the Zora marketplace</DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center">
          {isComplete ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-medium">Successfully uploaded to Zora!</p>
              <p className="text-xs text-muted-foreground">
                Signed by {formatDisplayAddress(address)}
              </p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {/* Preview the content being uploaded */}
              {generatedContent && (
                generatedContent.startsWith('data:image/') ? (
                  <div className="relative aspect-square w-full max-w-[200px] mx-auto border rounded-md overflow-hidden">
                    <Image
                      src={generatedContent}
                      alt="Image to upload"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="max-h-[200px] overflow-auto border rounded-md p-4 mx-auto prose prose-sm dark:prose-invert">
                    {generatedContent.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )
              )}
              
              <p className="text-center">Your creation will be minted as an NFT and listed on the Zora marketplace.</p>
              
              {isConnected ? (
                <p className="text-center text-sm text-muted-foreground">
                  Connected as {formatDisplayAddress()}
                </p>
              ) : (
                <p className="text-center text-sm text-red-500">
                  Please connect your wallet first
                </p>
              )}

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <div className="flex justify-center">
                <Button onClick={handleUpload} disabled={isUploading || !isConnected} size="lg">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing & Uploading...
                    </>
                  ) : (
                    "Sign & Upload"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
