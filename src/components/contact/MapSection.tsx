'use client'

import { useState } from 'react'
import type { MapSetting } from '@/payload-types'

interface MapSectionProps {
  mapConfig?: MapSetting | null
  locale: 'en' | 'de'
}

export default function MapSection({ mapConfig, locale }: MapSectionProps) {
  // Hooks must be called before any early returns
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)

  // Don't render if map is disabled or config is missing
  if (!mapConfig || !mapConfig.enabled || !mapConfig.mapLocations || mapConfig.mapLocations.length === 0) {
    return null
  }
  
  const mapTitle = mapConfig.mapTitle || (locale === 'de' ? 'So finden Sie uns' : 'How to Find Us')
  const displayMode = mapConfig.displayMode || 'first'
  const locations = mapConfig.mapLocations
  const mapType = mapConfig.mapType || 'google'

  // Get locations to display based on display mode
  const getLocationsToDisplay = () => {
    if (displayMode === 'first') {
      return [locations[0]]
    } else if (displayMode === 'switchable') {
      return [locations[selectedLocationIndex]]
    }
    return locations // 'all' mode
  }

  const locationsToDisplay = getLocationsToDisplay()

  // Generate map embed URL for a location
  const getMapSrc = (location: NonNullable<MapSetting['mapLocations']>[number]) => {
    if (mapType === 'osm') {
      const lat = location.latitude || 48.123456
      const lon = location.longitude || 15.123456
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`
    } else {
      return (
        location.googleMapsEmbedUrl ||
        `https://www.google.com/maps?q=${encodeURIComponent(location.address || '')}&output=embed`
      )
    }
  }

  return (
    <div className="mt-12 lg:mt-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
        {mapTitle}
      </h2>
      <div className="w-20 h-1 bg-fire mx-auto rounded-full mb-8"></div>

      {/* Location selector for switchable mode */}
      {displayMode === 'switchable' && locations.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {locations.map((location, index) => (
            <button
              key={index}
              onClick={() => setSelectedLocationIndex(index)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedLocationIndex === index
                  ? 'bg-fire text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {location.title || `Location ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Map(s) display */}
      <div className="space-y-8">
        {locationsToDisplay.map((location, index) => (
          <div key={index}>
            {locationsToDisplay.length > 1 && (
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {location.title}
              </h3>
            )}
            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <iframe
                src={getMapSrc(location)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={location.title || mapTitle}
              />
            </div>
            {location.address && (
              <p className="text-center text-gray-600 mt-4 text-sm md:text-base">
                {location.address}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

