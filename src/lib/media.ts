import type { Media } from '@/payload-types'

/**
 * Get the URL for a media file (image, video, or audio)
 * Supports both Vercel Blob storage (url property) and local storage (filename)
 */
export function getMediaUrl(media: Media | number | null | undefined): string {
  if (!media) {
    return ''
  }

  if (typeof media === 'number') {
    // Media is just an ID, not populated
    if (process.env.NODE_ENV === 'development') {
      console.warn('getMediaUrl: Media is just an ID, not populated. Depth might be too low:', media)
    }
    return ''
  }

  // Check if it's a Media object
  if (typeof media === 'object' && media !== null) {
    // Try url property first (most common - Vercel Blob or other storage)
    if (media.url && typeof media.url === 'string' && media.url.trim()) {
      return media.url
    }

    // Fallback to filename if url is not available (local storage)
    if (media.filename && typeof media.filename === 'string') {
      return `/media/${media.filename}`
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('getMediaUrl: Media object has no valid URL or filename:', {
        id: media.id,
        url: media.url,
        filename: media.filename,
      })
    }
  }

  return ''
}

/**
 * Check if a media file is an image based on its MIME type
 */
export function isImage(media: Media | number | null | undefined): boolean {
  if (!media || typeof media === 'number') return false

  if (typeof media === 'object' && media !== null) {
    const mimeType = media.mimeType || ''
    return mimeType.startsWith('image/')
  }

  return false
}

/**
 * Check if a media file is a video based on its MIME type
 */
export function isVideo(media: Media | number | null | undefined): boolean {
  if (!media || typeof media === 'number') return false

  if (typeof media === 'object' && media !== null) {
    const mimeType = media.mimeType || ''
    return mimeType.startsWith('video/')
  }

  return false
}

/**
 * Check if a media file is audio based on its MIME type
 */
export function isAudio(media: Media | number | null | undefined): boolean {
  if (!media || typeof media === 'number') return false

  if (typeof media === 'object' && media !== null) {
    const mimeType = media.mimeType || ''
    return mimeType.startsWith('audio/')
  }

  return false
}

