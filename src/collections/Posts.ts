import type { CollectionConfig } from 'payload'

// Helper function to create URL-friendly slugs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, '') // Trim hyphens from end
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: {
      en: 'Post',
      de: 'Beitrag',
    },
    plural: {
      en: 'Posts',
      de: 'Beiträge',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'publishedDate', 'author', 'createdAt'],
    description: {
      en: 'Manage news articles, operations, training reports, and events',
      de: 'Verwalten Sie Nachrichtenartikel, Einsätze, Übungsberichte und Veranstaltungen',
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published posts
      if (!user) {
        return {
          _status: { equals: 'published' },
        }
      }
      // Authenticated users can read all posts
      return true
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      // Admin and site-admin can create posts
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admin and site-admin can update posts
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Title',
        de: 'Titel',
      },
      admin: {
        description: {
          en: 'The title of the post',
          de: 'Der Titel des Beitrags',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: true,
      label: {
        en: 'Slug',
        de: 'Slug',
      },
      admin: {
        description: {
          en: 'URL-friendly version of the title (auto-generated)',
          de: 'URL-freundliche Version des Titels (automatisch generiert)',
        },
        readOnly: true,
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      required: true,
      label: {
        en: 'Content',
        de: 'Inhalt',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: {
        en: 'Category',
        de: 'Kategorie',
      },
      admin: {
        description: {
          en: 'Select the category for this post',
          de: 'Wählen Sie die Kategorie für diesen Beitrag',
        },
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Featured Image',
        de: 'Beitragsbild',
      },
      admin: {
        description: {
          en: 'Main image displayed with the post',
          de: 'Hauptbild, das mit dem Beitrag angezeigt wird',
        },
      },
    },
    {
      name: 'galleryImages',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: {
        en: 'Gallery Images',
        de: 'Galeriebilder',
      },
      admin: {
        description: {
          en: 'Multiple images displayed in a slider/gallery on the post page',
          de: 'Mehrere Bilder, die in einem Slider/Galerie auf der Beitragsseite angezeigt werden',
        },
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: {
        en: 'Published Date',
        de: 'Veröffentlichungsdatum',
      },
      admin: {
        description: {
          en: 'Date when the post was or will be published',
          de: 'Datum, an dem der Beitrag veröffentlicht wurde oder wird',
        },
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      label: {
        en: 'Author',
        de: 'Autor',
      },
      admin: {
        description: {
          en: 'The author of this post (automatically set to logged-in user if not provided)',
          de: 'Der Autor dieses Beitrags (wird automatisch auf den angemeldeten Benutzer gesetzt, wenn nicht angegeben)',
        },
      },
    },
    {
      name: 'showAuthor',
      type: 'checkbox',
      label: {
        en: 'Show Author on Frontend',
        de: 'Autor im Frontend anzeigen',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'If checked, the author will be displayed on the frontend blog post page',
          de: 'Wenn aktiviert, wird der Autor auf der Frontend-Blogpost-Seite angezeigt',
        },
      },
    },
    {
      name: 'meta',
      type: 'group',
      label: {
        en: 'SEO Meta',
        de: 'SEO Meta',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          label: {
            en: 'Meta Title',
            de: 'Meta-Titel',
          },
          admin: {
            description: {
              en: 'SEO title (defaults to post title if empty)',
              de: 'SEO-Titel (standardmäßig Beitragstitel, wenn leer)',
            },
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Meta Description',
            de: 'Meta-Beschreibung',
          },
          admin: {
            description: {
              en: 'SEO description for search engines',
              de: 'SEO-Beschreibung für Suchmaschinen',
            },
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Guard against undefined data
        if (!data) return data

        // Auto-generate slug from title before validation
        // Only generate if slug is missing or if this is a create operation
        if (data.title && (operation === 'create' || !data.slug)) {
          try {
            // Handle localized titles - generate slug for each locale
            if (typeof data.title === 'object' && data.title !== null) {
              // Localized title object
              const slugs: Record<string, string> = {}
              for (const [locale, title] of Object.entries(data.title)) {
                if (title && typeof title === 'string' && title.trim()) {
                  const generatedSlug = slugify(title)
                  if (generatedSlug) {
                    slugs[locale] = generatedSlug
                  }
                }
              }
              // Set slug if we have at least one valid slug
              if (Object.keys(slugs).length > 0) {
                data.slug = slugs
              }
            } else if (typeof data.title === 'string' && data.title.trim()) {
              // Single title string
              const generatedSlug = slugify(data.title)
              if (generatedSlug) {
                data.slug = generatedSlug
              }
            }
          } catch (error) {
            console.error('Error generating slug:', error)
            // If slug generation fails, set a fallback
            if (operation === 'create') {
              data.slug = `post-${Date.now()}`
            }
          }
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // Guard against undefined data
        if (!data) return data

        // Auto-set publishedDate when _status changes to published
        if (
          data._status === 'published' &&
          (!data.publishedDate || (originalDoc && originalDoc._status !== 'published'))
        ) {
          data.publishedDate = new Date()
        }

        // Auto-set author to logged-in user if not provided
        if (!data.author && req.user) {
          data.author = req.user.id
        }

        return data
      },
    ],
  },
  timestamps: true,
}
