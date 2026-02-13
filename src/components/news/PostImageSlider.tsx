'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { Media } from '@/payload-types'

interface PostImageSliderProps {
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

export default function PostImageSlider({ images, title, className = '' }: PostImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Filter out invalid images
  const validImages = images.filter((img): img is Media => {
    return img !== null && typeof img !== 'number' && typeof img === 'object' && 'url' in img && Boolean(img.url)
  })

  const goToPrevious = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 300)
  }

  const goToNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 300)
  }

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Auto-advance slider with smooth transitions
  useEffect(() => {
    if (validImages.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [validImages.length])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') setIsFullscreen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, goToPrevious, goToNext])

  if (validImages.length === 0) return null

  const currentImage = validImages[currentIndex]

  return (
    <>
      <div className={`relative w-full ${className}`}>
        {/* Main Slider */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center group">
          {/* Image Layer with Smooth Transition */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <Image
              src={getImageUrl(currentImage)}
              alt={title ? `${title} - Image ${currentIndex + 1}` : `Gallery image ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority={currentIndex === 0}
              sizes="100vw"
            />
          </div>

          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-[2]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-[2]" />

          {/* Navigation Arrows - Glassmorphism Style */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl hover:scale-110 group-hover:opacity-100 opacity-0 md:opacity-100"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl hover:scale-110 group-hover:opacity-100 opacity-0 md:opacity-100"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Progress Indicator Dots */}
          {validImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToSlide(index)
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    currentIndex === index
                      ? 'w-8 h-2 bg-white shadow-lg'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image Counter - Premium Style */}
          {validImages.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold z-20 shadow-lg">
              <span className="text-white/80">{currentIndex + 1}</span>
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white">{validImages.length}</span>
            </div>
          )}

          {/* Fullscreen Button - Premium Style */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFullscreen()
            }}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md hover:bg-black/80 border border-white/10 text-white p-2.5 md:p-3 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="View fullscreen"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>

          {/* Click to Fullscreen Hint */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Click to view fullscreen
          </div>
        </div>

        {/* Thumbnail Navigation - Premium Style */}
        {validImages.length > 1 && (
          <div className="mt-6 flex gap-3 overflow-x-auto overflow-y-visible pb-2 pt-2 hide-scrollbar px-4 justify-center">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-visible border-2 transition-all duration-300 group/thumb ${
                  currentIndex === index
                    ? 'border-red-600 ring-4 ring-red-600/30 shadow-lg shadow-red-600/20 scale-105'
                    : 'border-gray-300/50 hover:border-red-400/70 hover:scale-105'
                }`}
                aria-label={`Go to image ${index + 1}`}
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <Image
                    src={getImageUrl(image)}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className={`object-cover transition-transform duration-300 ${
                      currentIndex === index ? 'brightness-110' : 'group-hover/thumb:brightness-110'
                    }`}
                    sizes="96px"
                  />
                  {/* Active Indicator Overlay */}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal - Premium Style */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={toggleFullscreen}
        >
          {/* Close Button - Premium Style */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-3 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110"
            aria-label="Close fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Fullscreen Image Container */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={getImageUrl(currentImage)}
              alt={title ? `${title} - Image ${currentIndex + 1}` : `Gallery image ${currentIndex + 1}`}
              width={1920}
              height={1080}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              priority
            />

            {/* Navigation in Fullscreen - Premium Style */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-4 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-4 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Progress Dots in Fullscreen */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {validImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        goToSlide(index)
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        currentIndex === index
                          ? 'w-10 h-2 bg-white shadow-lg'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter in Fullscreen - Premium Style */}
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold z-10 shadow-xl">
                  <span className="text-white/80">{currentIndex + 1}</span>
                  <span className="mx-2 text-white/40">/</span>
                  <span className="text-white">{validImages.length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

