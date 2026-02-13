import type { CollectionConfig } from 'payload'

export const History: CollectionConfig = {
  slug: 'history',
  labels: {
    singular: {
      en: 'History',
      de: 'Geschichte',
    },
    plural: {
      en: 'History',
      de: 'Geschichte',
    },
  },
  admin: {
    useAsTitle: 'heroTitle',
    defaultColumns: ['heroTitle', '_status', 'updatedAt'],
    group: 'Pages',
    description: {
      en: 'Manage history timeline events and content',
      de: 'Verwalten Sie historische Zeitachsenereignisse und Inhalte',
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published history items
      if (!user) {
        return {
          _status: { equals: 'published' },
        }
      }
      // Authenticated users can read all history items
      return true
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Hero Image',
        de: 'Hero-Bild',
      },
      admin: {
        description: {
          en: 'Image displayed on the left side of the hero banner',
          de: 'Bild, das auf der linken Seite des Hero-Banners angezeigt wird',
        },
      },
    },
    {
      name: 'heroTitle',
      type: 'text',
      localized: true,
      label: {
        en: 'Hero Title',
        de: 'Hero-Titel',
      },
      admin: {
        description: {
          en: 'Large title displayed in the hero section',
          de: 'Großer Titel, der im Hero-Bereich angezeigt wird',
        },
      },
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      localized: true,
      label: {
        en: 'Hero Subtitle',
        de: 'Hero-Untertitel',
      },
      admin: {
        description: {
          en: 'Subtitle displayed below the hero title',
          de: 'Untertitel, der unter dem Hero-Titel angezeigt wird',
        },
      },
    },
    {
      name: 'heroParagraph1',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Hero Paragraph 1',
        de: 'Hero-Absatz 1',
      },
      admin: {
        description: {
          en: 'First paragraph in the hero section',
          de: 'Erster Absatz im Hero-Bereich',
        },
      },
    },
    {
      name: 'heroParagraph2',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Hero Paragraph 2',
        de: 'Hero-Absatz 2',
      },
      admin: {
        description: {
          en: 'Second paragraph in the hero section',
          de: 'Zweiter Absatz im Hero-Bereich',
        },
      },
    },
    {
      name: 'heroParagraph3',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Hero Paragraph 3',
        de: 'Hero-Absatz 3',
      },
      admin: {
        description: {
          en: 'Third paragraph in the hero section',
          de: 'Dritter Absatz im Hero-Bereich',
        },
      },
    },
    {
      name: 'timelineEvents',
      type: 'array',
      label: {
        en: 'Timeline Events',
        de: 'Zeitachsenereignisse',
      },
      minRows: 1,
      fields: [
        {
          name: 'year',
          type: 'text',
          required: true,
          label: {
            en: 'Year',
            de: 'Jahr',
          },
          admin: {
            description: {
              en: 'Year of the event (e.g., "1883")',
              de: 'Jahr des Ereignisses (z.B. "1883")',
            },
          },
        },
        {
          name: 'header',
          type: 'text',
          required: false,
          localized: true,
          label: {
            en: 'Header/Title',
            de: 'Überschrift/Titel',
          },
          admin: {
            description: {
              en: 'Header text displayed at the top of the timeline card',
              de: 'Überschriftstext, der oben auf der Zeitachsenkarte angezeigt wird',
            },
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: {
            en: 'Description',
            de: 'Beschreibung',
          },
          admin: {
            description: {
              en: 'Description of the historical event',
              de: 'Beschreibung des historischen Ereignisses',
            },
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Image',
            de: 'Bild',
          },
          admin: {
            description: {
              en: 'Optional image for this timeline event',
              de: 'Optionales Bild für dieses Zeitachsenereignis',
            },
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: {
            en: 'Video URL',
            de: 'Video-URL',
          },
          admin: {
            description: {
              en: 'Optional video URL (YouTube, Vimeo, etc.)',
              de: 'Optionale Video-URL (YouTube, Vimeo, etc.)',
            },
          },
        },
      ],
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
              en: 'SEO title (defaults to page title if empty)',
              de: 'SEO-Titel (standardmäßig Seitentitel, wenn leer)',
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

        return data
      },
    ],
  },
  timestamps: true,
}

