'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import type { Sponsor } from '@/payload-types'
import ArrowIcon from '@/components/common/ArrowIcon'

interface SponsorsSliderProps {
  sponsors: Sponsor[]
  locale?: 'en' | 'de'
}

export default function SponsorsSlider({ sponsors, locale = 'de' }: SponsorsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [itemsPerView, setItemsPerView] = useState(4)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth
      if (width < 640) {
        setItemsPerView(1)
      } else if (width < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(4)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Create infinite loop by duplicating sponsors
  const infiniteSponsors = sponsors && sponsors.length > 0 ? [...sponsors, ...sponsors, ...sponsors] : []
  const totalSponsors = sponsors?.length || 0
  const startIndex = totalSponsors // Start at the middle set

  // Initialize to start index
  useEffect(() => {
    if (startIndex > 0) {
      setCurrentIndex(startIndex)
    }
  }, [startIndex])

  // Handle seamless loop
  useEffect(() => {
    if (!sliderRef.current || totalSponsors <= itemsPerView) return

    const handleTransitionEnd = () => {
      if (currentIndex >= totalSponsors * 2) {
        // Jumped to end duplicate, move to middle
        setIsTransitioning(false)
        setCurrentIndex(currentIndex - totalSponsors)
        setTimeout(() => setIsTransitioning(true), 10)
      } else if (currentIndex < totalSponsors) {
        // Jumped to start duplicate, move to middle
        setIsTransitioning(false)
        setCurrentIndex(currentIndex + totalSponsors)
        setTimeout(() => setIsTransitioning(true), 10)
      }
    }

    const slider = sliderRef.current
    slider.addEventListener('transitionend', handleTransitionEnd)
    return () => slider.removeEventListener('transitionend', handleTransitionEnd)
  }, [currentIndex, totalSponsors, itemsPerView])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || totalSponsors <= itemsPerView) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalSponsors, itemsPerView])

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev - 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  // Calculate translateX - each item is 100% / itemsPerView wide
  const itemWidth = 100 / itemsPerView
  const translateX = -currentIndex * itemWidth

  // Calculate real index for indicators
  const getRealIndex = (index: number) => {
    if (index < totalSponsors) return index
    if (index >= totalSponsors * 2) return index - totalSponsors * 2
    return index - totalSponsors
  }

  const realIndex = getRealIndex(currentIndex)
  const totalSlides = Math.ceil(totalSponsors / itemsPerView)

  // Early return after all hooks
  if (!sponsors || sponsors.length === 0) {
    return (
      <section className="w-full bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'de' ? 'Unsere Sponsoren' : 'Our Sponsors'}
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              {locale === 'de'
                ? 'Wir danken unseren Partnern für ihre Unterstützung'
                : 'We thank our partners for their support'}
            </p>
          </div>
          <p className="text-center text-gray-500">No sponsors available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {locale === 'de' ? 'Unsere Sponsoren' : 'Our Sponsors'}
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            {locale === 'de'
              ? 'Wir danken unseren Partnern für ihre Unterstützung'
              : 'We thank our partners for their support'}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Wrapper */}
          <div className="overflow-hidden w-full py-4">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(${translateX}%)`,
                transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none',
              }}
            >
              {infiniteSponsors.map((sponsor, index) => {
                // Get logo URL - handle different formats
                let logoUrl = '/images/logo.jpg'
                if (sponsor.logo) {
                  if (typeof sponsor.logo === 'object') {
                    if (sponsor.logo.url) {
                      logoUrl = sponsor.logo.url
                    } else if ('filename' in sponsor.logo && typeof sponsor.logo.filename === 'string') {
                      // Handle case where logo might have filename property
                      logoUrl = `/media/${sponsor.logo.filename}`
                    }
                  } else if (typeof sponsor.logo === 'string') {
                    logoUrl = sponsor.logo
                  }
                }

                const itemWidthPercent = 100 / itemsPerView

                return (
                  <div
                    key={`sponsor-${sponsor.id}-${index}`}
                    className="flex-shrink-0"
                    style={{
                      width: `${itemWidthPercent}%`,
                      minWidth: `${itemWidthPercent}%`,
                    }}
                  >
                    <div className="px-2 sm:px-3 md:px-4 relative">
                      {sponsor.website ? (
                        <Link
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 rounded-lg hover:bg-white transition-all duration-300 group border-2 border-gray-200 hover:border-red-600 hover:shadow-xl h-32 sm:h-40 md:h-48 transform hover:scale-105 hover:-translate-y-2 cursor-pointer relative hover:z-20">
                            <div className="relative w-full h-full max-w-[200px] transform transition-transform duration-300 group-hover:scale-110">
                              <Image
                                src={logoUrl}
                                alt={sponsor.name || 'Sponsor logo'}
                                fill
                                className="object-contain transition-all duration-300 p-2"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 rounded-lg hover:bg-white transition-all duration-300 group border-2 border-gray-200 hover:border-red-600 hover:shadow-xl h-32 sm:h-40 md:h-48 transform hover:scale-105 hover:-translate-y-2 cursor-pointer relative hover:z-20">
                          <div className="relative w-full h-full max-w-[200px] transform transition-transform duration-300 group-hover:scale-110">
                            <Image
                              src={logoUrl}
                              alt={sponsor.name || 'Sponsor logo'}
                              fill
                              className="object-contain transition-all duration-300 p-2"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalSponsors > 0 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 lg:-translate-x-8 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white hover:bg-red-600 text-gray-700 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl group"
                aria-label="Previous sponsors"
              >
                <ArrowIcon
                  direction="left"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
                />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 lg:translate-x-8 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white hover:bg-red-600 text-gray-700 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl group"
                aria-label="Next sponsors"
              >
                <ArrowIcon
                  direction="right"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
                />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => {
                const slideStartIndex = index * itemsPerView
                const isActive = Math.floor(realIndex / itemsPerView) === index

                return (
                  <button
                    key={index}
                    onClick={() => {
                      const targetIndex = totalSponsors + slideStartIndex
                      setCurrentIndex(targetIndex)
                      setIsAutoPlaying(false)
                      setTimeout(() => setIsAutoPlaying(true), 10000)
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-8 h-2 bg-red-600'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
