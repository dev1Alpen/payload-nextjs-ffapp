import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media, Category } from '@/payload-types'
import { getCategoryLabel } from '@/lib/categories'
import ArrowIcon from '@/components/common/ArrowIcon'

type PostCardProps = {
  post: Post
  locale: 'en' | 'de'
  href: string
  getImageUrl: (image: Media | number | null | undefined) => string
  formatDate: (dateString: string | null | undefined) => string
  variant?: 'default' | 'category-page'
  index?: number
}

export default function PostCard({
  post,
  locale,
  href,
  getImageUrl,
  formatDate,
  variant = 'default',
  index = 0,
}: PostCardProps) {
  if (variant === 'category-page') {
    return (
      <Link
        href={href}
        className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col cursor-pointer post-card animate-fade-in"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Image */}
        <div className="relative w-full h-72 flex-shrink-0 overflow-hidden">
          <Image
            src={getImageUrl(post.featuredImage)}
            alt={post.title || 'Post'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
            
          {post.category && typeof post.category !== 'number' && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-xl backdrop-blur-md border border-white/20">
                {getCategoryLabel(post.category, locale)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50">
          <div>
            <div className="flex items-center space-x-2 mb-4 text-xs text-gray-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(post.publishedDate || post.createdAt)}</span>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 leading-tight line-clamp-2">
              {post.title}
            </h2>
          </div>

          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-600 hover:text-red-500 transition-all mt-auto border-t-2 border-gray-100 group/link">
            <ArrowIcon
              direction="right"
              className="w-5 h-5 transform group-hover/link:translate-x-1 transition-transform flex-shrink-0"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </Link>
    )
  }

  // Default variant (NewsWithSidebarSection)
  return (
    <Link
      href={href}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 block cursor-pointer"
    >
      <div className="relative h-72 md:h-80">
        <Image
          src={getImageUrl(post.featuredImage)}
          alt={post.title || 'Post'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          {/* Category Badge */}
          {post.category && typeof post.category !== 'number' && (
            <div className="mb-3">
              <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg inline-block">
                {getCategoryLabel(post.category, locale)}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-red-400 transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>

          {/* Date */}
          <div className="flex items-center space-x-2 text-white/90 text-xs mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(post.publishedDate || post.createdAt)}</span>
          </div>

          {/* Read More Link */}
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-400/20 hover:bg-red-400/30 text-red-400 hover:text-red-300 transition-all group/link">
            <ArrowIcon
              direction="right"
              className="w-5 h-5 transform group-hover/link:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

