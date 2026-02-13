import Image from 'next/image'
import ExpandableBio from '@/components/kommando/ExpandableBio'

type TeamMemberCardProps = {
  name: string
  position: string
  rank: string
  email: string
  image: string
  bio?: string | null
  audioUrl?: string | null
  cardImageUrl?: string | null
  cardVideoUrl?: string | null
  locale: 'en' | 'de'
  index: number
  gradientIdPrefix?: string
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

export default function TeamMemberCard({
  name,
  position,
  rank,
  email,
  image,
  bio,
  audioUrl,
  cardImageUrl,
  cardVideoUrl,
  locale,
  index,
  gradientIdPrefix = 'borderGrad',
}: TeamMemberCardProps) {
  const gradientId = `${gradientIdPrefix}-${index}`

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
      {/* Left border - thick in center, thin at top/bottom */}
      <div className="absolute left-0 top-0 bottom-0 w-2">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 8 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#DC2626" stopOpacity="0.6" />
              <stop offset="45%" stopColor="#DC2626" stopOpacity="1" />
              <stop offset="50%" stopColor="#DC2626" stopOpacity="1" />
              <stop offset="55%" stopColor="#DC2626" stopOpacity="1" />
              <stop offset="70%" stopColor="#DC2626" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="4" height="100" fill={`url(#${gradientId})`} />
        </svg>
      </div>

      {/* Card Media (Image or Video) */}
      {(cardImageUrl || cardVideoUrl) && (
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          {cardVideoUrl ? (
            (() => {
              const embedUrl = getVideoEmbedUrl(cardVideoUrl)
              return embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video for ${name}`}
                />
              ) : null
            })()
          ) : cardImageUrl ? (
            <Image
              src={cardImageUrl}
              alt={`${name} - Card image`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : null}
        </div>
      )}

      {/* Content Container */}
      <div className="p-4 md:p-5 bg-gradient-to-br from-white to-gray-50/30 flex flex-col">
        {/* Full Profile Image */}
        <div className="relative w-full aspect-[3/4] mb-3 rounded-lg overflow-hidden bg-gray-100 shadow-md flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Rank Badge */}
          <div className="absolute top-3 right-3 bg-fire text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg ring-2 ring-white z-10">
            {rank}
          </div>
        </div>

        {/* Name and Position */}
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 leading-tight">
            {name}
          </h3>
          <p className="text-fire font-semibold text-sm md:text-base mb-2">
            {position}
          </p>
        </div>

        {/* Bio Text */}
        {bio && (
          <div className="flex-shrink-0">
            <ExpandableBio bio={bio} locale={locale} maxLines={3} />
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-3 flex-shrink-0">
            <audio
              controls
              className="w-full h-10"
              src={audioUrl}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-fire/20 mb-3 flex-shrink-0"></div>

        {/* Contact Button */}
        <a
          href={`mailto:${email}`}
          className="flex items-center justify-center w-full px-5 py-3 bg-fire/10 hover:bg-fire text-fire hover:text-white font-semibold rounded-lg transition-all duration-300 border-2 border-fire/30 hover:border-fire group/btn shadow-sm hover:shadow-md"
        >
          <svg
            className="w-4 h-4 mr-2 text-fire group-hover/btn:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">{locale === 'de' ? 'Kontakt' : 'Contact'}</span>
        </a>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-fire/0 to-fire/0 group-hover:from-fire/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
    </div>
  )
}

