"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import SignInModal from "@/components/sign-in-modal"
import UploadConfirmation from "@/components/upload-confirmation"

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<number[]>([])
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false)

  // Mock gallery images (3x5 grid = 15 images)
  const galleryImages = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    src: `/placeholder.svg?height=300&width=300`,
    alt: `Gallery image ${i + 1}`,
  }))

  const handleImageSelect = (id: number) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter((imageId) => imageId !== id))
    } else {
      if (selectedImages.length < 2) {
        setSelectedImages([...selectedImages, id])
      }
    }
  }

  const handleGenerate = () => {
    if (selectedImages.length === 0) return

    setIsGenerating(true)

    // Mock generation process with timeout
    setTimeout(() => {
      setIsGenerating(false)
      setShowPreview(true)
    }, 2000)
  }

  const handleSignInClick = () => {
    setShowPreview(false)
    setShowSignIn(true)
  }

  const handleSignInComplete = () => {
    setShowSignIn(false)
    setShowUploadConfirmation(true)
  }

  const handleUploadComplete = () => {
    setShowUploadConfirmation(false)
    setSelectedImages([])
    setCustomPrompt("")
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header with title and sign in button */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => setShowSignIn(true)} className="text-xs">
            Sign in with Zora
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-center">Vibe-Zora</h1>
          <div className="w-[120px]"></div> {/* Empty div for balance */}
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Select up to 2 images from the gallery, customize, and generate your unique creation
        </p>

        {/* Image Gallery */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
          {galleryImages.map((image) => (
            <Card
              key={image.id}
              className={`overflow-hidden cursor-pointer transition-all ${
                selectedImages.includes(image.id) ? "ring-2 ring-primary" : "hover:scale-105"
              }`}
              onClick={() => handleImageSelect(image.id)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                  {selectedImages.includes(image.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center">
                      {selectedImages.indexOf(image.id) + 1}
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <div className="text-xs font-medium">Item #{image.id + 1}</div>
                  <div className="flex justify-between items-center text-xs">
                    {/* Price change - randomly up or down */}
                    <div className="flex items-center">
                      {image.id % 2 === 0 ? (
                        <span className="text-green-500 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 7a1 1 0 01-1 1H9v9a1 1 0 01-2 0V8H5a1 1 0 110-2h12a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 015 6h12a1 1 0 011 1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ${(Math.random() * 10).toFixed(1)}k
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 13a1 1 0 01-1-1V4a1 1 0 112 0v8a1 1 0 01-1 1zm-8.707.293a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 9.414l-3.293 3.293a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ${(Math.random() * 10).toFixed(1)}k
                        </span>
                      )}
                    </div>

                    {/* Fire/Heat indicator */}
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ${(Math.random() * 5).toFixed(3)}
                    </div>

                    {/* People/Users indicator */}
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {Math.floor(Math.random() * 20)}.{Math.floor(Math.random() * 9)}k
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customization Bar */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="relative w-full">
            <Input
              placeholder="Customise your creation..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={selectedImages.length === 0 || isGenerating}
            className="w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Selected Images</h2>
            <div className="flex gap-4">
              {selectedImages.map((id) => (
                <div key={id} className="relative w-24 h-24">
                  <Image
                    src={galleryImages[id].src || "/placeholder.svg"}
                    alt={galleryImages[id].alt}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Generated Creation</DialogTitle>
            <DialogDescription>Here's a preview of your customized creation</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square w-full max-w-sm mx-auto my-4">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="Generated preview"
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSignInClick}>Sign into Zora to Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign In Modal */}
      <SignInModal open={showSignIn} onOpenChange={setShowSignIn} onSignInComplete={handleSignInComplete} />

      {/* Upload Confirmation */}
      <UploadConfirmation
        open={showUploadConfirmation}
        onOpenChange={setShowUploadConfirmation}
        onUploadComplete={handleUploadComplete}
      />
    </main>
  )
}
