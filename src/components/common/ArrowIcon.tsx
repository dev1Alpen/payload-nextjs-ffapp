import React from 'react'

type ArrowIconProps = {
  direction?: 'right' | 'left' | 'down' | 'up'
  className?: string
  strokeWidth?: number
}

const arrowPaths = {
  right: 'M9 5l7 7-7 7',
  left: 'M15 19l-7-7 7-7',
  down: 'M19 9l-7 7-7-7',
  up: 'M5 15l7-7 7 7',
}

export default function ArrowIcon({
  direction = 'right',
  className = 'w-4 h-4',
  strokeWidth = 2,
}: ArrowIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d={arrowPaths[direction]}
      />
    </svg>
  )
}

