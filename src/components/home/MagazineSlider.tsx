'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useMemo } from 'react'
import type { MagazineSlide as CMSMagazineSlide, Media, Post, Category } from '@/payload-types'
import ArrowIcon from '@/components/common/ArrowIcon'
import { getCategoryPath } from '@/lib/categories'

interface MagazineSlide {
  id: string
  title: string
  author: string
  showAuthor?: boolean
  date: string
  image: string
  excerpt?: string
  link: string
}

interface MagazineSliderProps {
  slides?: CMSMagazineSlide[]
  locale?: 'en' | 'de'
}

function getImageUrl(image: Media | number | null | undefined): string {
  const fallback = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'

  if (!image) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('MagazineSlider: No image provided')
    }
    return fallback
  }

  if (typeof image === 'number') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('MagazineSlider: Image is just an ID, not populated. Depth might be too low:', image)
    }
    return fallback
  }

  // Check if it's a Media object
  if (typeof image === 'object' && image !== null) {
    const media = image as Media
    
    // Try url property first (most common)
    if (media.url && typeof media.url === 'string' && media.url.trim()) {
      // URL should be absolute (from Vercel Blob or other storage)
      return media.url
    }
    
    // Fallback to filename if url is not available
    if (media.filename && typeof media.filename === 'string') {
      // If using local storage, construct URL from filename
      // Adjust this based on your storage configuration
      return `/media/${media.filename}`
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('MagazineSlider: Image object has no valid URL or filename:', {
        id: media.id,
        url: media.url,
        filename: media.filename,
        fullObject: media,
      })
    }
  }

  return fallback
}

function formatDate(dateString: string | null | undefined, locale: 'en' | 'de' = 'de'): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const localeString = locale === 'en' ? 'en-US' : 'de-DE'

  return date.toLocaleDateString(localeString, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function truncateToWords(text: string | null | undefined, maxWords: number = 40): string {
  if (!text) return ''

  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text

  return words.slice(0, maxWords).join(' ') + '...'
}

function getPostLink(post: Post | number | null | undefined, locale: 'en' | 'de' = 'de'): string {
  if (!post || typeof post === 'number' || typeof post !== 'object') return '#'

  try {
    // Get category path using the proper function from lib
    let categoryPath = 'news'
    if (post.category) {
      if (typeof post.category === 'number') {
        // Category is just an ID, can't get path without fetching
        categoryPath = 'news'
      } else {
        // Category is populated
        categoryPath = getCategoryPath(post.category, locale)
      }
    }

    const langParam = locale ? `?lang=${locale}` : ''
    
    // Handle localized slug - it might be a string or an object
    // Use optional chaining to safely access slug
    let slug: string | undefined
    if ('slug' in post && post.slug !== undefined && post.slug !== null) {
      if (typeof post.slug === 'string') {
        slug = post.slug
      } else if (typeof post.slug === 'object' && post.slug !== null) {
        // Handle localized slug object
        const slugObj = post.slug as Record<string, string>
        slug = slugObj[locale] || slugObj.en || slugObj.de
      }
    }
    
    if (slug) {
      return `/${categoryPath}/${slug}${langParam}`
    }
    // Fallback to ID if slug is not available
    const postId = ('id' in post && post.id) ? post.id : 'post'
    return `/${categoryPath}/${postId}${langParam}`
  } catch (error) {
    console.error('Error generating post link in MagazineSlider:', error, post)
    return '#'
  }
}

export default function MagazineSlider({ slides = [], locale = 'de' }: MagazineSliderProps) {
  // Transform CMS data to component format
  const transformedSlides: MagazineSlide[] = useMemo(() => {
    if (!slides || slides.length === 0) return []

    return slides.map((slide) => {
      const imageUrl = getImageUrl(slide.image)
      const date = formatDate(slide.publishedDate || slide.createdAt, locale)
      
      // Generate link from post relationship
      // Note: post might not be populated if depth is only 1, so we handle that
      const link = slide.post ? getPostLink(slide.post, locale) : '#'

      return {
        id: String(slide.id),
        title: slide.title || '',
        author: slide.author || '',
        showAuthor: slide.showAuthor || false,
        date,
        image: imageUrl,
        excerpt: truncateToWords(slide.excerpt, 40) || undefined,
        link,
      }
    })
  }, [slides, locale])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || transformedSlides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % transformedSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [transformedSlides.length, isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + transformedSlides.length) % transformedSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % transformedSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (!transformedSlides.length) {
    return null
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {transformedSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between py-8 md:py-12">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="max-w-3xl">
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                    <Link
                      href={slide.link}
                      className="hover:text-red-400 transition-colors duration-300"
                    >
                      {slide.title}
                    </Link>
                  </h1>

                  {/* Meta Information */}
                  <div className="flex items-center gap-2 md:gap-4 text-white/90 text-xs sm:text-sm md:text-base mb-4 md:mb-6">
                    {slide.showAuthor && slide.author && (
                      <>
                        <span className="font-medium">by {slide.author}</span>
                        <span className="text-white/60">•</span>
                      </>
                    )}
                    <span className="text-white/80">{slide.date}</span>
                  </div>

                  {/* Excerpt */}
                  {slide.excerpt && (
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl">
                      {slide.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="max-w-3xl">
                  {/* Read More Button - Bottom */}
                  <Link
                    href={slide.link}
                    className="inline-block px-4 py-2 md:px-6 md:py-3 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide transition-colors duration-300"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ArrowIcon
          direction="left"
          className="w-6 h-6 group-hover:scale-110 transition-transform"
        />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ArrowIcon
          direction="right"
          className="w-6 h-6 group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {transformedSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-12 h-1.5 bg-white'
                : 'w-8 h-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}


