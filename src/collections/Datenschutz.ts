import type { CollectionConfig } from 'payload'

export const Datenschutz: CollectionConfig = {
  slug: 'datenschutz',
  labels: {
    singular: {
      en: 'Datenschutz',
      de: 'Datenschutz',
    },
    plural: {
      en: 'Datenschutz',
      de: 'Datenschutz',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'updatedAt'],
    group: 'Pages',
    description: {
      en: 'Manage Datenschutz (Privacy Policy) page content. Only one record can exist.',
      de: 'Verwalten Sie den Inhalt der Datenschutz-Seite. Es kann nur ein Datensatz existieren.',
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published datenschutz
      if (!user) {
        return {
          _status: { equals: 'published' },
        }
      }
      // Authenticated users can read all
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
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: {
        en: 'Title',
        de: 'Titel',
      },
      admin: {
        placeholder: {
          en: 'Privacy Policy',
          de: 'Datenschutz',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      required: false,
      label: {
        en: 'Description',
        de: 'Beschreibung',
      },
      admin: {
        description: {
          en: 'Short description or subtitle displayed below the title',
          de: 'Kurze Beschreibung oder Untertitel, der unter dem Titel angezeigt wird',
        },
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
      async ({ data, req, operation }) => {
        if (!data || operation !== 'create') return data

        // Enforce singleton: prevent creating more than one record
        try {
          const existing = await req.payload.find({
            collection: 'datenschutz',
            limit: 1,
            overrideAccess: true,
            depth: 0,
          })

          if (existing.totalDocs > 0) {
            throw new Error('Only one Datenschutz record is allowed. Please update the existing record instead.')
          }
        } catch (error) {
          // If it's our custom error, re-throw it
          if (error instanceof Error && error.message.includes('Only one Datenschutz record')) {
            throw error
          }
          // Otherwise, log and continue (don't block creation if query fails)
          console.error('Error checking for existing Datenschutz:', error)
        }

        return data
      },
    ],
  },
  timestamps: true,
}

