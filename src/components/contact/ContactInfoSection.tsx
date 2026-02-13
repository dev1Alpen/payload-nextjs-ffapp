'use client'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

interface ContactInfoSectionProps {
  address?: unknown
  locale: 'en' | 'de'
}

export default function ContactInfoSection({
  address,
  locale,
}: ContactInfoSectionProps) {
  // Convert Lexical content to HTML
  let addressHtml = ''
  try {
    if (address && typeof address === 'object') {
      // Check if it's a Lexical editor structure
      if ('root' in address) {
        addressHtml = convertLexicalToHTML({
          data: address as Parameters<typeof convertLexicalToHTML>[0]['data'],
        })
      }
    }
  } catch (error) {
    console.error('Error converting Lexical content to HTML:', error, address)
  }

  const hasAddress = addressHtml.trim().length > 0

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 md:p-10 h-full">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-fire rounded-full flex items-center justify-center mr-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {locale === 'de' ? 'Unsere Adresse' : 'Our Address'}
        </h2>
      </div>
      <div className="w-20 h-1 bg-fire rounded-full mb-6"></div>
      
      {hasAddress ? (
        <div
          className="text-gray-700 text-lg max-w-none [&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-3xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-2xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-gray-900 [&_h4]:text-xl [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-bold [&_h4]:text-gray-900 [&_h5]:text-lg [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:font-bold [&_h5]:text-gray-900 [&_h6]:text-base [&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:font-bold [&_h6]:text-gray-900 [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-fire [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-gray-900 [&_strong]:font-semibold [&_ul]:text-gray-700 [&_ol]:text-gray-700 [&_li]:my-2"
          dangerouslySetInnerHTML={{ __html: addressHtml }}
        />
      ) : (
        <div className="text-gray-500 text-base py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
          {locale === 'de' 
            ? 'Keine Adressinformationen konfiguriert. Bitte fügen Sie Informationen im Admin-Panel hinzu.' 
            : 'No address information configured. Please add information in the admin panel.'}
        </div>
      )}
    </div>
  )
}

