import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media } from '@/payload-types'
import { getCategoryLabel } from '@/lib/categories'
import ArrowIcon from '@/components/common/ArrowIcon'

type PostListItemProps = {
  post: Post
  locale: 'en' | 'de'
  href: string
  getImageUrl: (image: Media | number | null | undefined) => string
  formatDate: (dateString: string | null | undefined) => string
}

export default function PostListItem({
  post,
  locale,
  href,
  getImageUrl,
  formatDate,
}: PostListItemProps) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md hover:border-red-400 transition-all duration-300 flex flex-row cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-32 md:w-40 h-32 md:h-40 flex-shrink-0 overflow-hidden">
        <Image
          src={getImageUrl(post.featuredImage)}
          alt={post.title || 'Post'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 128px, 160px"
        />
        {post.category && typeof post.category !== 'number' && (
          <div className="absolute top-2 left-2">
            <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-md">
              {getCategoryLabel(post.category, locale)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(post.publishedDate || post.createdAt)}</span>
          </div>

          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 leading-tight line-clamp-2">
            {post.title}
          </h3>
        </div>

        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-600 hover:text-red-500 transition-all group/link mt-2">
          <ArrowIcon
            direction="right"
            className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  )
}

