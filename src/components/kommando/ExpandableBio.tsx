'use client'

import { useState, useRef, useEffect } from 'react'
import ArrowIcon from '@/components/common/ArrowIcon'

interface ExpandableBioProps {
  bio: string
  locale: 'en' | 'de'
  maxLines?: number
}

export default function ExpandableBio({ bio, locale, maxLines = 3 }: ExpandableBioProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      // Check if text is actually truncated
      const isTruncated = textRef.current.scrollHeight > textRef.current.clientHeight
      setShowButton(isTruncated || bio.length > 150)
    }
  }, [bio])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="mb-3">
      <div
        ref={textRef}
        className={`text-sm md:text-base text-gray-700 leading-relaxed ${
          !isExpanded 
            ? 'line-clamp-3' 
            : 'max-h-48 overflow-y-auto'
        }`}
      >
        {bio}
      </div>
      {showButton && (
        <button
          onClick={toggleExpanded}
          className="mt-1.5 text-fire hover:text-fire-light font-semibold text-sm transition-colors duration-200 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <span>{locale === 'de' ? 'Weniger anzeigen' : 'Show less'}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </>
          ) : (
            <>
              <span>{locale === 'de' ? 'Mehr anzeigen' : 'Read more'}</span>
              <ArrowIcon
                direction="down"
                className="w-4 h-4"
              />
            </>
          )}
        </button>
      )}
    </div>
  )
}

