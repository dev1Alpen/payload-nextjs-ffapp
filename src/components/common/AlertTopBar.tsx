'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import ArrowIcon from './ArrowIcon'

type AlertTopBarData = {
  active?: boolean
  title?: string
  description?: string
  color?: 'red' | 'yellow' | 'orange' | 'purple' | 'green'
  readMoreLink?: {
    url?: string
    text?: string
    openInNewTab?: boolean
  }
}

const colorConfig = {
  red: {
    bg: 'bg-red-600',
    text: 'text-white',
    link: 'text-white hover:opacity-80',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-gray-900',
    link: 'text-gray-900 hover:opacity-80',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    link: 'text-white hover:opacity-80',
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-white',
    link: 'text-white hover:opacity-80',
  },
  green: {
    bg: 'bg-green-600',
    text: 'text-white',
    link: 'text-white hover:opacity-80',
  },
}

const LiveTickerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="79"
    height="54"
    viewBox="0 0 79 54"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12.0517 4.16378e-05C11.629 0.00306528 11.2077 0.170163 10.8998 0.503956C4.54086 7.39266 0.660156 16.5832 0.660156 26.676C0.660156 36.7688 4.54086 45.9593 10.8998 52.848C11.5155 53.5156 12.5793 53.5134 13.2224 52.8732L16.6715 49.4403C17.292 48.8227 17.2881 47.8398 16.7 47.1916C11.7667 41.7574 8.76078 34.5596 8.76078 26.676C8.76078 18.7924 11.7667 11.5946 16.7 6.16039C17.2881 5.51215 17.292 4.53088 16.6715 3.91167L13.2224 0.47876C12.9009 0.158674 12.4743 -0.00298185 12.0517 4.16378e-05ZM67.0346 4.16378e-05C66.6116 -0.00257871 66.1854 0.158674 65.8638 0.47876L62.4116 3.91482C61.7911 4.53242 61.795 5.51215 62.3831 6.16039C67.318 11.593 70.3255 18.7924 70.3255 26.676C70.3255 34.5596 67.3195 41.7574 62.3863 47.1916C61.7982 47.8398 61.7942 48.8211 62.4147 49.4403L65.8638 52.8732C66.507 53.5134 67.5708 53.514 68.1864 52.848C74.5454 45.9593 78.4261 36.7688 78.4261 26.676C78.4261 16.5832 74.5454 7.39266 68.1864 0.503956C67.8786 0.170163 67.4577 0.00266215 67.0346 4.16378e-05ZM56.757 10.2893C56.3197 10.2678 55.8733 10.4224 55.5355 10.7586L52.0833 14.1947C51.5017 14.7736 51.438 15.7059 51.9662 16.3332C54.3251 19.1357 55.7444 22.743 55.7444 26.676C55.7444 30.6089 54.3251 34.2147 51.9662 37.0157C51.438 37.6429 51.5017 38.5753 52.0833 39.1542L55.5355 42.5934C56.2111 43.2658 57.3119 43.2055 57.9372 42.4863C61.6182 38.247 63.845 32.7197 63.845 26.676C63.845 20.6322 61.6182 15.105 57.9372 10.8657C57.6246 10.5061 57.1942 10.3109 56.757 10.2893ZM22.3293 10.2925C21.8921 10.3141 21.4617 10.5092 21.149 10.8688C17.4681 15.1066 15.2413 20.6322 15.2413 26.676C15.2413 32.7197 17.4681 38.247 21.149 42.4863C21.7744 43.2055 22.8751 43.2658 23.5507 42.5934L27.003 39.1573C27.5846 38.5784 27.6482 37.6461 27.1201 37.0188C24.7612 34.2163 23.3419 30.6089 23.3419 26.676C23.3419 22.743 24.7612 19.1373 27.1201 16.3363C27.6482 15.709 27.5846 14.7767 27.003 14.1978L23.5507 10.7586C23.2129 10.4224 22.7665 10.2709 22.3293 10.2925ZM39.5431 17.0008C34.174 17.0008 29.8224 21.3321 29.8224 26.676C29.8224 32.0199 34.174 36.3511 39.5431 36.3511C44.9122 36.3511 49.2639 32.0199 49.2639 26.676C49.2639 21.3321 44.9122 17.0008 39.5431 17.0008Z"
      fill="currentColor"
    />
  </svg>
)

const AlertTopBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [alertData, setAlertData] = useState<AlertTopBarData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const alertBarRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  // Update CSS variable for navigation positioning (watch for size changes on mobile)
  useEffect(() => {
    const element = alertBarRef.current
    if (!isVisible || !element) {
      document.documentElement.style.setProperty('--alert-top-bar-height', '0px')
      return
    }

    const updateHeight = () => {
      const height = element.offsetHeight
      document.documentElement.style.setProperty('--alert-top-bar-height', `${height}px`)
    }

    updateHeight()

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateHeight())
      resizeObserver.observe(element)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [isVisible])

  // Get locale from URL params or default to 'de'
  const locale = (searchParams?.get('lang') === 'en' ? 'en' : 'de') as 'en' | 'de'

  // Check if alert was dismissed and detect content changes
  // This runs when alertData is loaded
  useEffect(() => {
    if (typeof window === 'undefined' || !alertData) return

    // Create a hash of the alert content to detect changes
    const alertHash = JSON.stringify({
      title: alertData.title,
      description: alertData.description,
      active: alertData.active,
    })
    
    const storedHash = localStorage.getItem('alert-top-bar-hash')
    const dismissed = localStorage.getItem('alert-top-bar-dismissed')
    
    // If content changed (hash is different), reset dismissed state
    if (storedHash && storedHash !== alertHash) {
      // Content changed - show the alert again
      setIsDismissed(false)
      localStorage.removeItem('alert-top-bar-dismissed')
      localStorage.setItem('alert-top-bar-hash', alertHash)
    } else if (storedHash === alertHash && dismissed === 'true') {
      // Same content and was dismissed - keep it dismissed
      setIsDismissed(true)
    } else if (!storedHash) {
      // First time seeing this alert - store the hash
      localStorage.setItem('alert-top-bar-hash', alertHash)
      // Check if it was previously dismissed (for backward compatibility)
      if (dismissed === 'true') {
        setIsDismissed(true)
      } else {
        setIsDismissed(false)
      }
    }
  }, [alertData])

  // Fetch alert top bar data from backend
  useEffect(() => {
    const fetchAlertData = async () => {
      try {
        const response = await fetch(`/api/alert-top-bar?locale=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setAlertData(data)
        } else {
          console.error('Failed to fetch alert top bar data')
          setAlertData(null)
        }
      } catch (error) {
        console.error('Error fetching alert top bar:', error)
        setAlertData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlertData()
  }, [locale])

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDismissed(true)
    setIsVisible(false)
    
    if (typeof window !== 'undefined' && alertData) {
      // Store dismissed state with current alert hash
      const alertHash = JSON.stringify({
        title: alertData.title,
        description: alertData.description,
        active: alertData.active,
      })
      localStorage.setItem('alert-top-bar-dismissed', 'true')
      localStorage.setItem('alert-top-bar-hash', alertHash)
    }
  }

  // Check if banner should be visible
  useEffect(() => {
    if (isLoading) {
      setIsVisible(false)
      return
    }

    // Don't show if dismissed
    if (isDismissed) {
      setIsVisible(false)
      return
    }

    if (alertData && alertData.active === true) {
      setIsAnimating(true)
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [alertData, isLoading, isDismissed])

  // Don't render while loading
  if (isLoading) return null

  if (!alertData || alertData.active !== true) return null

  const displayData = alertData

  if (!isVisible) return null

  // Professional text handling: trim and validate
  const title = displayData.title?.trim() || null
  const description = displayData.description?.trim() || null
  const readMoreText = displayData.readMoreLink?.text?.trim() || (locale === 'en' ? 'Read more' : 'Weiterlesen')
  const readMoreUrl = displayData.readMoreLink?.url?.trim() || null

  // Don't render if there's no content at all
  if (!title && !description) return null

  const colorScheme = displayData.color ? colorConfig[displayData.color] : colorConfig.red
  const hasReadMore = Boolean(readMoreUrl)

  return (
    <div
      ref={alertBarRef}
      id="alert-top-bar"
      className={`alert alert-danger alert-liveticker fixed top-0 left-0 right-0 z-[60] w-full ${colorScheme.bg} ${colorScheme.text} transition-all duration-300 ease-in-out ${
        isAnimating ? 'animate-slideDown' : 'opacity-0'
      }`}
      role="alert"
      aria-live="polite"
      aria-label={title || description || 'Alert notification'}
    >
      <div className="alert-liveticker-content">
        {/* Container aligned with navigation logo - matches navigation container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-3 py-2">
          {/* Icon Section - inside container */}
          <div className="alert-liveticker-icon flex-shrink-0" aria-hidden="true">
            <LiveTickerIcon />
          </div>

          {/* Text Section - vertical layout: title on top, description below */}
          <div className="alert-liveticker-text flex-1 min-w-0 w-full lg:w-auto">
            {title && (
              <h2 className="heading" aria-label={title}>
                {title}
              </h2>
            )}
            {description && (
              <span className="description" aria-label={description}>
                {description}
              </span>
            )}
          </div>

          {/* Link Section - Only show if URL exists */}
          {hasReadMore && (
            <div className="alert-liveticker-link flex-shrink-0 w-full lg:w-auto">
              <a
                href={readMoreUrl || '#'}
                target={displayData.readMoreLink?.openInNewTab ? '_blank' : '_self'}
                rel={displayData.readMoreLink?.openInNewTab ? 'noopener noreferrer' : undefined}
                className={`btn-liveticker-readmore ${colorScheme.link} group`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!readMoreUrl) {
                    e.preventDefault()
                  }
                }}
                aria-label={`${readMoreText}${title ? `: ${title}` : description ? `: ${description}` : ''}`}
              >
                <span className="btn-liveticker-text">{readMoreText}</span>
                <ArrowIcon
                  direction="right"
                  className="btn-liveticker-arrow"
                  strokeWidth={2.5}
                />
              </a>
            </div>
          )}

          {/* Close Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleClose}
              className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 transition-colors ${colorScheme.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white/50`}
              aria-label={locale === 'en' ? 'Close alert' : 'Alert schließen'}
              title={locale === 'en' ? 'Close' : 'Schließen'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertTopBar

