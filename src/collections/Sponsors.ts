import type { CollectionConfig } from 'payload'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  labels: {
    singular: {
      en: 'Sponsor',
      de: 'Sponsor',
    },
    plural: {
      en: 'Sponsors',
      de: 'Sponsoren',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'createdAt'],
    description: {
      en: 'Manage sponsors displayed on the home page',
      de: 'Verwalten Sie die auf der Startseite angezeigten Sponsoren',
    },
  },
  access: {
    read: () => true, // Public can read
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
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: {
          en: 'Sponsor name',
          de: 'Sponsorenname',
        },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: {
          en: 'Sponsor logo image',
          de: 'Sponsorenlogo-Bild',
        },
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: {
          en: 'Sponsor website URL (optional)',
          de: 'Sponsoren-Website-URL (optional)',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: {
          en: 'Display order (lower numbers appear first)',
          de: 'Anzeigereihenfolge (niedrigere Zahlen erscheinen zuerst)',
        },
      },
    },
  ],
  timestamps: true,
}

