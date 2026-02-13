import type { CollectionConfig } from 'payload'

export const MagazineSlides: CollectionConfig = {
  slug: 'magazine-slides',
  labels: {
    singular: {
      en: 'Magazine Slide',
      de: 'Magazin-Folie',
    },
    plural: {
      en: 'Magazine Slides',
      de: 'Magazin-Folien',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'createdAt'],
    description: {
      en: 'Manage slides for the home page magazine slider',
      de: 'Verwalten Sie die Folien für den Magazin-Slider auf der Startseite',
    },
    listSearchableFields: ['title'],
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
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'author',
      type: 'text',
      required: false,
      localized: true,
      defaultValue: ({ user }) => {
        // Pre-fill with logged-in user's email
        return user?.email || ''
      },
      admin: {
        description: {
          en: 'Author email (automatically filled from logged-in user if not provided)',
          de: 'Autor-E-Mail (wird automatisch vom angemeldeten Benutzer ausgefüllt, wenn nicht angegeben)',
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
          en: 'If checked, the author will be displayed on the magazine slider',
          de: 'Wenn aktiviert, wird der Autor im Magazin-Slider angezeigt',
        },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: {
          en: 'Short description or excerpt',
          de: 'Kurze Beschreibung oder Auszug',
        },
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: {
          en: 'Slide background image',
          de: 'Hintergrundbild der Folie',
        },
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      admin: {
        description: {
          en: 'Related article/post to link to',
          de: 'Verwandter Artikel/Beitrag, zu dem verlinkt werden soll',
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
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        description: {
          en: 'Publication date',
          de: 'Veröffentlichungsdatum',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Set author to current logged-in user's email before validation
        if (!data) return data
        
        if (req?.user?.email) {
          // Always set to current user's email
          data.author = req.user.email
        }
        
        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        // Always set author to current logged-in user's email
        if (!data) return data
        
        if (req?.user?.email) {
          // Always set to current user's email (overrides any existing value)
          data.author = req.user.email
        }
        
        return data
      },
    ],
  },
  timestamps: true,
}

