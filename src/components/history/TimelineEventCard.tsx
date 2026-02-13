import Image from 'next/image'

type TimelineEventCardProps = {
  image?: unknown
  videoUrl?: string | null
  header?: string | null
  description: string
  alignment?: 'left' | 'right'
  year?: string
}

// Helper function to get image URL
function getImageUrl(image: unknown): string {
  const fallback = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
  if (!image) return fallback
  if (typeof image === 'number') return fallback
  if (typeof image === 'object' && image !== null) {
    const img = image as Record<string, unknown>
    if ('url' in img && typeof img.url === 'string') {
      return img.url
    }
    if ('filename' in img && typeof img.filename === 'string') {
      // Handle Payload media object
      return `/media/${img.filename}`
    }
  }
  return fallback
}

// Helper function to convert video URL to embed format
function getVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null
  
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  
  // If already an embed URL or other format, return as-is
  return url
}

export default function TimelineEventCard({
  image,
  videoUrl,
  header,
  description,
  alignment = 'left',
  year,
}: TimelineEventCardProps) {
  const isRightAligned = alignment === 'right'

  return (
    <div
      className={`flex-1 ${
        isRightAligned ? 'md:pr-8' : 'md:pl-8'
      } ${
        isRightAligned ? 'md:text-right' : 'md:text-left'
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow ${
          isRightAligned ? 'md:mr-auto md:max-w-md' : 'md:ml-auto md:max-w-md'
        }`}
      >
        {/* Image or Video */}
        {(image || videoUrl) && (
          <div className="relative w-full aspect-video bg-gray-100">
            {videoUrl ? (
              (() => {
                const embedUrl = getVideoEmbedUrl(videoUrl)
                return embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={year ? `Video for ${year}` : 'Timeline event video'}
                  />
                ) : null
              })()
            ) : image ? (
              <Image
                src={getImageUrl(image)}
                alt={year ? `History event ${year}` : 'Timeline event'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            ) : null}
          </div>
        )}
        <div className="p-6 md:p-8">
          {header && (
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight break-words">
              {header}
            </h3>
          )}
          <p className="text-gray-700 leading-relaxed text-sm md:text-base break-words overflow-hidden">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

