'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedPostsGridProps {
  children: React.ReactNode
  filterKey?: string | null
}

export default function AnimatedPostsGrid({ children, filterKey }: AnimatedPostsGridProps) {
  const [isVisible, setIsVisible] = useState(true)
  const prevFilterKeyRef = useRef<string | null | undefined>(filterKey)

  useEffect(() => {
    // Only animate if filter actually changed
    if (prevFilterKeyRef.current !== filterKey) {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setIsVisible(true)
        prevFilterKeyRef.current = filterKey
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [filterKey])

  return (
    <div 
      className={`posts-grid-container ${isVisible ? 'fade-in' : 'fade-out'}`}
    >
      {children}
    </div>
  )
}

