"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface UploadConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: () => void
}

export default function UploadConfirmation({ open, onOpenChange, onUploadComplete }: UploadConfirmationProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleUpload = () => {
    setIsUploading(true)

    // Mock upload process
    setTimeout(() => {
      setIsUploading(false)
      setIsComplete(true)

      // Auto close after showing success
      setTimeout(() => {
        onUploadComplete()
      }, 2000)
    }, 2000)
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
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <p className="text-center">Your creation will be minted as an NFT and listed on the Zora marketplace.</p>

              <div className="flex justify-center">
                <Button onClick={handleUpload} disabled={isUploading} size="lg">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading to Zora...
                    </>
                  ) : (
                    "Upload Now"
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
