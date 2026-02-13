'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { Media } from '@/payload-types'

interface PostGalleryProps {
  images: (Media | number)[]
  title?: string
  className?: string
}

function getImageUrl(image: Media | number | null | undefined): string {
  const fallback = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'

  if (!image) return fallback
  if (typeof image === 'number') return fallback
  if (image.url) return image.url

  return fallback
}

export default function PostGallery({ images, title, className = '' }: PostGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Filter out invalid images
  const validImages = images.filter((img): img is Media => {
    return img !== null && typeof img !== 'number' && typeof img === 'object' && 'url' in img && Boolean(img.url)
  })

  // Open lightbox when image is clicked
  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsLightboxOpen(true)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'
  }

  // Close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setSelectedIndex(null)
    document.body.style.overflow = 'unset'
  }

  // Navigate in lightbox
  const goToPrevious = () => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : (prev || 0) - 1))
  }

  const goToNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => ((prev || 0) + 1) % validImages.length)
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') closeLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, selectedIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (validImages.length === 0) return null

  const currentImage = selectedIndex !== null ? validImages[selectedIndex] : null

  return (
    <>
      {/* Gallery Grid */}
      <div className={`w-full ${className}`}>
        {/* Gallery Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title || 'Gallery'}
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            {validImages.length} {validImages.length === 1 ? 'image' : 'images'}
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {validImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              onClick={() => openLightbox(index)}
            >
              {/* Image */}
              <Image
                src={getImageUrl(image)}
                alt={`Gallery image ${index + 1}${title ? ` - ${title}` : ''}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && currentImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeLightbox()
            }}
            className="absolute top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-3 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={getImageUrl(currentImage)}
              alt={`Gallery image ${selectedIndex + 1}${title ? ` - ${title}` : ''}`}
              width={1920}
              height={1080}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              priority
            />

            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-white border border-white/30 text-gray-900 p-4 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-white border border-white/30 text-gray-900 p-4 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold z-10 shadow-xl">
              <span className="text-white/80">{selectedIndex + 1}</span>
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white">{validImages.length}</span>
            </div>

            {/* Thumbnail Strip (Desktop) */}
            {validImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 z-10 hidden lg:flex gap-2 max-w-[90vw] overflow-x-auto">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIndex(index)
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedIndex === index
                        ? 'border-white ring-2 ring-white/50 scale-110'
                        : 'border-white/30 hover:border-white/60 hover:scale-105'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <Image
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

