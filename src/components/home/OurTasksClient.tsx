'use client'

import React from 'react'
import Image from 'next/image'
import type { Task, Media } from '@/payload-types'
import { getMediaUrl } from '@/lib/media'

interface OurTasksClientProps {
  tasks: Task[]
  locale: 'en' | 'de'
}

// Icon mapping based on task icon value
function getTaskIcon(iconValue: string) {
  const icons: Record<string, React.ReactNode> = {
    rescue: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 480 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M472 334.4L336.1 256l135.9-78.4c7.7-4.4 10.3-14.2 5.9-21.9l-32-55.4c-4.4-7.7-14.2-10.3-21.9-5.9l-135.9 78.4V16c0-8.8-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16v156.9L56 94.4c-7.7-4.4-17.5-1.8-21.9 5.9L2.2 155.7c-4.4 7.7-1.8 17.4 5.9 21.9L143.9 256 8 334.4c-7.7 4.4-10.3 14.2-5.9 21.9l32 55.4c4.4 7.7 14.2 10.3 21.9 5.9l135.9-78.4V496c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V339.1l135.9 78.4c7.7 4.4 17.5 1.8 21.9-5.9l32-55.4c4.4-7.7 1.8-17.4-5.9-21.9z" />
      </svg>
    ),
    extinguish: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M434 26.3l-168 28C254.7 56.2 256 67.8 256 72h-58.3C208.4 36.1 181.4 0 144 0c-39.4 0-66.4 39.7-52.2 76.2-52 13.1-75.4 54.2-90 90.9-4.9 12.3 1.1 26.3 13.4 31.2 12.3 4.9 26.3-1.1 31.2-13.4C75.1 113 107 120 168 120v27.1c-41.5 10.9-72 49.2-72 94.1V488c0 13.3 10.7 24 24 24h144c13.3 0 24-10.7 24-24V240c0-44.7-30.6-82.3-72-93V120h40c0 3-1.7 15.7 10 17.7l168 28C441.3 166.9 448 161.3 448 153.8V38.2c0-7.4-6.7-13.1-14-11.8zM144 72c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z" />
      </svg>
    ),
    recover: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M288 350.1l0 1.9-32 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L447.3 128.1c-12.3-1-25 3-34.8 11.7c-35.4 31.6-65.6 67.7-87.3 102.8C304.3 276.5 288 314.9 288 350.1zM480 512c-88.4 0-160-71.6-160-160c0-76.7 62.5-144.7 107.2-179.4c5-3.9 10.9-5.8 16.8-5.8c7.9-.1 16 3.1 22 9.2l46 46 11.3-11.3c11.7-11.7 30.6-12.7 42.3-1C624.5 268 640 320.2 640 352c0 88.4-71.6 160-160 160zm64-111.8c0-36.5-37-73-54.8-88.4c-5.4-4.7-13.1-4.7-18.5 0C453 327.1 416 363.6 416 400.2c0 35.3 28.7 64 64 64s64-28.7 64-64z" />
      </svg>
    ),
    protect: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c1.8 0 3.5-.2 5.3-.5c-76.3-55.1-99.8-141-103.1-200.2c-16.1-4.8-33.1-7.3-50.7-7.3l-91.4 0zm308.8-78.3l-120 48C358 277.4 352 286.2 352 296c0 63.3 25.9 168.8 134.8 214.2c5.9 2.5 12.6 2.5 18.5 0C614.1 464.8 640 359.3 640 296c0-9.8-6-18.6-15.1-22.3l-120-48c-5.7-2.3-12.1-2.3-17.8 0zM591.4 312c-3.9 50.7-27.2 116.7-95.4 149.7l0-187.8L591.4 312z" />
      </svg>
    ),
  }
  return icons[iconValue] || icons.rescue
}

export default function OurTasksClient({ tasks, locale }: OurTasksClientProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
      <div className="w-full max-w-[1170px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {locale === 'de' ? 'Unsere Aufgaben' : 'Our Tasks'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group relative bg-white rounded-2xl p-5 md:p-6 hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-red-600 overflow-hidden cursor-pointer"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-600/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex flex-col items-center text-center">
                {/* Icon with background circle */}
                <div className="mb-3 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-full p-4 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                    <div className="text-red-600 group-hover:text-red-500 transition-colors">
                      {(() => {
                        // Check if custom icon image is uploaded
                        const iconImageUrl = task.iconImage
                          ? getMediaUrl(task.iconImage as Media | number)
                          : null

                        if (iconImageUrl) {
                          // Check if it's an SVG by MIME type or file extension
                          const media = task.iconImage as Media | null
                          const isSvg =
                            (media &&
                              typeof media === 'object' &&
                              (media.mimeType === 'image/svg+xml' ||
                                media.filename?.endsWith('.svg'))) ||
                            iconImageUrl.toLowerCase().endsWith('.svg')

                          if (isSvg) {
                            // For SVG, use img tag to preserve SVG functionality and allow CSS styling
                            return (
                              <img
                                src={iconImageUrl}
                                alt=""
                                className="w-16 h-16"
                                style={{
                                  filter: 'none',
                                  color: 'currentColor',
                                }}
                              />
                            )
                          } else {
                            // For regular images, use Next.js Image component
                            return (
                              <div className="relative w-16 h-16">
                                <Image
                                  src={iconImageUrl}
                                  alt=""
                                  fill
                                  className="object-contain"
                                  sizes="64px"
                                />
                              </div>
                            )
                          }
                        }

                        // Fallback to default icon if no custom image
                        return getTaskIcon(task.icon || 'rescue')
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                  {task.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {task.description}
                </p>
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

