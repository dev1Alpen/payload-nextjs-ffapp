import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Media } from '@/payload-types'

/**
 * Custom Logo component for Payload Admin Panel
 * Fetches the admin logo from SiteSettings global
 */
export default async function AdminLogo() {
  let logoUrl: string | null = null

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Fetch site settings with depth to populate adminLogo relationship
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })

    if (siteSettings?.adminLogo) {
      const adminLogo = siteSettings.adminLogo as Media | number | null

      if (adminLogo && typeof adminLogo === 'object') {
        // Use url if available (Vercel Blob or other storage)
        if (adminLogo.url && typeof adminLogo.url === 'string') {
          logoUrl = adminLogo.url
        }
        // Fallback to filename if url is not available
        else if (adminLogo.filename && typeof adminLogo.filename === 'string') {
          logoUrl = `/media/${adminLogo.filename}`
        }
      }
    }
  } catch (error) {
    // Silently fail and use default logo
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching admin logo:', error)
    }
  }

  // If no custom logo, return null to use default Payload logo
  if (!logoUrl) {
    return null
  }

  // Return custom logo
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <img
        src={logoUrl}
        alt="Admin Logo"
        style={{
          maxHeight: '40px',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

