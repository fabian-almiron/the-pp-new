"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GalleryImage {
  src: string
  alt: string
}

interface ItemGalleryProps {
  images: GalleryImage[]
  className?: string
}

export function ItemGallery({ images, className }: ItemGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const imagesPerPage = 6
  const maxVisibleIndex = Math.min(currentPage + imagesPerPage, images.length) - 1
  const minVisibleIndex = Math.max(0, maxVisibleIndex - imagesPerPage + 1)
  const showArrows = images.length > imagesPerPage
  
  // Calculate which images to show - always show 6, but reveal one at a time
  const visibleImages = images.slice(minVisibleIndex, minVisibleIndex + imagesPerPage)
  
  const nextPage = () => {
    if (maxVisibleIndex < images.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setIsTransitioning(false)
      }, 150)
    }
  }
  
  const prevPage = () => {
    if (minVisibleIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="aspect-square bg-gray-100 flex items-center justify-center border border-gray-200">
          <span className="text-gray-400">No images available</span>
        </div>
      </div>
    )
  }

  const selectedImage = images[selectedImageIndex]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="aspect-square bg-white overflow-hidden border border-gray-200">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          width={600}
          height={600}
          className="w-full h-full object-cover transition-opacity duration-300"
          priority
        />
      </div>

      {/* Thumbnail Images */}
      <div className="relative overflow-hidden">
        {/* Left Arrow */}
        {showArrows && (
          <button
            onClick={prevPage}
            disabled={minVisibleIndex <= 0}
            className={cn(
              "absolute left-0 top-0 bottom-0 z-10 w-8 bg-white/90 backdrop-blur-sm border-r shadow-sm transition-all duration-300 flex items-center justify-center",
              minVisibleIndex <= 0
                ? "border-[#D4A771] text-[#D4A771]"
                : "border-gray-200 hover:bg-[#D4A771]/90 hover:text-white hover:border-[#D4A771]"
            )}
            style={minVisibleIndex <= 0 ? {
              cursor: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzRBNDA3MSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJyZ2JhKDIxMiwgMTY3LCAxMTMsIDAuMSkiLz4KPHN0cm9rZSB4MT0iOCIgeTE9IjgiIHgyPSIxNiIgeTI9IjE2IiBzdHJva2U9IiNENEE3NzEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxzdHJva2UgeDE9IjE2IiB5MT0iOCIgeDI9IjgiIHkyPSIxNiIgc3Ryb2tlPSIjRDRBNzcxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K") 12 12, not-allowed'
            } : {}}
            aria-label="Previous images"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Thumbnail Grid Container with Slide Animation */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          showArrows ? "mx-8" : "",
          isTransitioning ? "opacity-0 transform translate-x-2" : "opacity-100 transform translate-x-0"
        )}>
          <div className="grid grid-cols-6 gap-2">
            {visibleImages.map((image, index) => {
              const actualIndex = minVisibleIndex + index
              return (
                <button
                  key={actualIndex}
                  onClick={() => setSelectedImageIndex(actualIndex)}
                  className={cn(
                    "aspect-square bg-white border overflow-hidden transition-all duration-200",
                    selectedImageIndex === actualIndex
                      ? "border-black ring-2 ring-black ring-offset-2"
                      : "border-gray-200 hover:border-[#D4A771] hover:ring-1 hover:ring-[#D4A771] hover:ring-offset-1"
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Arrow */}
        {showArrows && (
          <button
            onClick={nextPage}
            disabled={maxVisibleIndex >= images.length - 1}
            className={cn(
              "absolute right-0 top-0 bottom-0 z-10 w-8 bg-white/90 backdrop-blur-sm border-l shadow-sm transition-all duration-300 flex items-center justify-center",
              maxVisibleIndex >= images.length - 1
                ? "border-[#D4A771] text-[#D4A771]"
                : "border-gray-200 hover:bg-[#D4A771]/90 hover:text-white hover:border-[#D4A771]"
            )}
            style={maxVisibleIndex >= images.length - 1 ? {
              cursor: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzRBNDA3MSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJyZ2JhKDIxMiwgMTY3LCAxMTMsIDAuMSkiLz4KPHN0cm9rZSB4MT0iOCIgeTE9IjgiIHgyPSIxNiIgeTI9IjE2IiBzdHJva2U9IiNENEE3NzEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxzdHJva2UgeDE9IjE2IiB5MT0iOCIgeDI9IjgiIHkyPSIxNiIgc3Ryb2tlPSIjRDRBNzcxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K") 12 12, not-allowed'
            } : {}}
            aria-label="Next images"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
