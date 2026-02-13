import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media, Category } from '@/payload-types'
import { getCategoryLabel } from '@/lib/categories'
import ArrowIcon from '@/components/common/ArrowIcon'

type FeaturedPostCardProps = {
  post: Post
  locale: 'en' | 'de'
  href: string
  getImageUrl: (image: Media | number | null | undefined) => string
  formatDate: (dateString: string | null | undefined) => string
  variant?: 'default' | 'category-page'
}

export default function FeaturedPostCard({
  post,
  locale,
  href,
  getImageUrl,
  formatDate,
  variant = 'default',
}: FeaturedPostCardProps) {
  if (variant === 'category-page') {
    return (
      <Link
        href={href}
        className="group block rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100/50"
      >
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          <Image
            src={getImageUrl(post.featuredImage)}
            alt={post.title || 'Featured post'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, 66vw"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"></div>
          
          {/* Floating Badges */}
          <div className="absolute top-8 left-8 flex flex-col space-y-3">
            {post.category && typeof post.category !== 'number' && (
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-wider shadow-2xl backdrop-blur-md border border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{getCategoryLabel(post.category, locale)}</span>
              </span>
            )}
            <span className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl text-white text-xs font-bold px-5 py-2.5 rounded-full uppercase tracking-wider border border-white/30 shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{locale === 'de' ? 'Featured' : 'Featured'}</span>
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-10 md:p-12">
            <div className="flex items-center space-x-3 text-white/90 text-sm mb-4 font-medium">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(post.publishedDate || post.createdAt)}</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              {post.title}
            </h2>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white text-red-600 shadow-xl hover:shadow-2xl transition-all group/link">
              <ArrowIcon
                direction="right"
                className="w-7 h-7 transform group-hover/link:translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant (NewsWithSidebarSection)
  return (
    <Link
      href={href}
      className="group relative mb-8 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 block cursor-pointer"
    >
      <div className="relative h-[500px] md:h-[600px]">
        <Image
          src={getImageUrl(post.featuredImage)}
          alt={post.title || 'Featured post'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg inline-block">
                {typeof post.category === 'number' 
                  ? '' 
                  : getCategoryLabel(post.category, locale)}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-red-400 transition-colors duration-300">
            {post.title}
          </h3>

          {/* Date */}
          <div className="flex items-center space-x-2 text-white/90 text-sm md:text-base mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {locale === 'de' ? 'Gepostet am:' : 'Posted on:'} {formatDate(post.publishedDate || post.createdAt)}
              {post.category && typeof post.category !== 'number' && ` | ${locale === 'de' ? 'Kategorie:' : 'Category:'} ${getCategoryLabel(post.category, locale)}`}
            </span>
          </div>

          {/* Read More Link */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-400/20 hover:bg-red-400/30 text-red-400 hover:text-red-300 transition-all group/link">
            <ArrowIcon
              direction="right"
              className="w-6 h-6 transform group-hover/link:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

