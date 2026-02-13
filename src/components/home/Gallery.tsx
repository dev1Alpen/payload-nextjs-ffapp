'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import type { Gallery as GalleryType, Media } from '@/payload-types'
import { getMediaUrl, isImage, isVideo, isAudio } from '@/lib/media'

interface GalleryProps {
  items?: GalleryType[]
  locale?: 'en' | 'de'
}

export default function Gallery({ items = [], locale = 'de' }: GalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryType | null>(null)
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all')

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Gallery component - items:', items?.length || 0, items)
  }

  // Sort items by order, then by createdAt
  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return []
    return [...items].sort((a, b) => {
      const orderA = a.order ?? 0
      const orderB = b.order ?? 0
      if (orderA !== orderB) {
        return orderA - orderB
      }
      // If order is the same, sort by createdAt (newest first)
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [items])

  // Filter items based on selected filter
  const filteredItems = useMemo(() => {
    if (filter === 'all') return sortedItems
    return sortedItems.filter((item) => {
      if (!item.media || typeof item.media === 'number') return false
      const media = item.media as Media
      if (filter === 'image') return isImage(media)
      if (filter === 'video') return isVideo(media)
      if (filter === 'audio') return isAudio(media)
      return true
    })
  }, [sortedItems, filter])

  // Get media type for an item
  const getItemMediaType = (item: GalleryType): 'image' | 'video' | 'audio' => {
    if (!item.media || typeof item.media === 'number') return 'image'
    const media = item.media as Media
    if (isVideo(media)) return 'video'
    if (isAudio(media)) return 'audio'
    return 'image'
  }

  // Filter out items without valid media URLs
  const validItems = useMemo(() => {
    return filteredItems.filter((item) => {
      const mediaUrl = getMediaUrl(item.media)
      return mediaUrl && mediaUrl.trim() !== ''
    })
  }, [filteredItems])

  return (
    <>
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'en' ? 'Gallery' : 'Galerie'}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'en'
                ? 'Explore our collection of images, videos, and audio'
                : 'Entdecken Sie unsere Sammlung von Bildern, Videos und Audio'}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {locale === 'en' ? 'All' : 'Alle'}
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'image'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {locale === 'en' ? 'Images' : 'Bilder'}
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'video'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {locale === 'en' ? 'Videos' : 'Videos'}
            </button>
            <button
              onClick={() => setFilter('audio')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'audio'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {locale === 'en' ? 'Audio' : 'Audio'}
            </button>
          </div>

          {/* Gallery Grid */}
          {validItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {locale === 'en'
                  ? 'No gallery items available'
                  : 'Keine Galerie-Elemente verfügbar'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {validItems.map((item) => {
              const mediaUrl = getMediaUrl(item.media)
              const mediaType = getItemMediaType(item)
              
              // Handle localized title - can be string or object with locale keys
              let title = ''
              if (typeof item.title === 'string') {
                title = item.title
              } else if (item.title && typeof item.title === 'object') {
                const titleObj = item.title as Record<string, string>
                title = titleObj[locale] || titleObj.en || titleObj.de || ''
              }
              
              // Handle localized description - can be string or object with locale keys
              let description = ''
              if (item.description) {
                if (typeof item.description === 'string') {
                  description = item.description
                } else if (typeof item.description === 'object') {
                  const descObj = item.description as Record<string, string>
                  description = descObj[locale] || descObj.en || descObj.de || ''
                }
              }

              if (!mediaUrl) return null

              return (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    item.featured ? 'ring-2 ring-red-500' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Image Preview */}
                  {mediaType === 'image' && (
                    <div className="relative aspect-square w-full">
                      <Image
                        src={mediaUrl}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  )}

                  {/* Video Preview */}
                  {mediaType === 'video' && (
                    <div className="relative aspect-square w-full bg-gray-900">
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onMouseEnter={(e) => {
                          const video = e.currentTarget
                          video.play().catch(() => {
                            // Ignore autoplay errors
                          })
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget
                          video.pause()
                          video.currentTime = 0
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio Preview */}
                  {mediaType === 'audio' && (
                    <div className="relative aspect-square w-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                      <div className="text-center p-6">
                        <svg
                          className="w-16 h-16 text-white mx-auto mb-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-white text-sm font-medium">
                          {locale === 'en' ? 'Audio' : 'Audio'}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  )}

                  {/* Featured Badge */}
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {locale === 'en' ? 'Featured' : 'Hervorgehoben'}
                    </div>
                  )}

                  {/* Title Overlay */}
                  {title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2">
                        {title}
                      </h3>
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          )}
        </div>
      </section>

      {/* Modal for Full View */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all"
              aria-label={locale === 'en' ? 'Close' : 'Schließen'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="bg-white rounded-lg overflow-hidden">
              {(() => {
                const mediaUrl = getMediaUrl(selectedItem.media)
                const mediaType = getItemMediaType(selectedItem)
                
                // Handle localized title - can be string or object with locale keys
                let title = ''
                if (typeof selectedItem.title === 'string') {
                  title = selectedItem.title
                } else if (selectedItem.title && typeof selectedItem.title === 'object') {
                  const titleObj = selectedItem.title as Record<string, string>
                  title = titleObj[locale] || titleObj.en || titleObj.de || ''
                }
                
                // Handle localized description - can be string or object with locale keys
                let description = ''
                if (selectedItem.description) {
                  if (typeof selectedItem.description === 'string') {
                    description = selectedItem.description
                  } else if (typeof selectedItem.description === 'object') {
                    const descObj = selectedItem.description as Record<string, string>
                    description = descObj[locale] || descObj.en || descObj.de || ''
                  }
                }

                if (!mediaUrl) return null

                return (
                  <>
                    {/* Media Display */}
                    <div className="relative w-full bg-black">
                      {mediaType === 'image' && (
                        <div className="relative w-full aspect-video">
                          <Image
                            src={mediaUrl}
                            alt={title}
                            fill
                            className="object-contain"
                            sizes="100vw"
                          />
                        </div>
                      )}

                      {mediaType === 'video' && (
                        <div className="relative w-full">
                          <video
                            src={mediaUrl}
                            controls
                            className="w-full max-h-[70vh]"
                            autoPlay
                          >
                            {locale === 'en'
                              ? 'Your browser does not support the video tag.'
                              : 'Ihr Browser unterstützt das Video-Tag nicht.'}
                          </video>
                        </div>
                      )}

                      {mediaType === 'audio' && (
                        <div className="p-8 md:p-12">
                          <div className="max-w-md mx-auto text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                              <svg
                                className="w-12 h-12 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <audio src={mediaUrl} controls className="w-full">
                              {locale === 'en'
                                ? 'Your browser does not support the audio tag.'
                                : 'Ihr Browser unterstützt das Audio-Tag nicht.'}
                            </audio>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title and Description */}
                    {(title || description) && (
                      <div className="p-6 md:p-8">
                        {title && (
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            {title}
                          </h3>
                        )}
                        {description && (
                          <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                            {description}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

