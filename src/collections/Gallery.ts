import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    group: 'General',
    useAsTitle: 'title',
    defaultColumns: ['title', 'mediaType', 'order', 'createdAt'],
  },
  labels: {
    singular: {
      en: 'Gallery Item',
      de: 'Galerie-Element',
    },
    plural: {
      en: 'Gallery Items',
      de: 'Galerie-Elemente',
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      if (!user) return false
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
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
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      localized: true,
      label: {
        en: 'Description',
        de: 'Beschreibung',
      },
    },
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      options: [
        {
          label: {
            en: 'Image',
            de: 'Bild',
          },
          value: 'image',
        },
        {
          label: {
            en: 'Video',
            de: 'Video',
          },
          value: 'video',
        },
        {
          label: {
            en: 'Audio',
            de: 'Audio',
          },
          value: 'audio',
        },
      ],
      defaultValue: 'image',
      label: {
        en: 'Media Type',
        de: 'Medientyp',
      },
      admin: {
        description: {
          en: 'Select the type of media (image, video, or audio)',
          de: 'Wählen Sie den Medientyp (Bild, Video oder Audio)',
        },
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Media File',
        de: 'Mediendatei',
      },
      admin: {
        description: {
          en: 'Upload an image, video, or audio file',
          de: 'Laden Sie eine Bild-, Video- oder Audiodatei hoch',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      required: false,
      defaultValue: 0,
      label: {
        en: 'Order',
        de: 'Reihenfolge',
      },
      admin: {
        description: {
          en: 'Order in which items appear in the gallery (lower numbers appear first)',
          de: 'Reihenfolge, in der Elemente in der Galerie angezeigt werden (niedrigere Zahlen erscheinen zuerst)',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      label: {
        en: 'Featured',
        de: 'Hervorgehoben',
      },
      admin: {
        description: {
          en: 'Mark this item as featured (will appear more prominently)',
          de: 'Markieren Sie dieses Element als hervorgehoben (wird prominenter angezeigt)',
        },
      },
    },
  ],
  timestamps: true,
}

export default Gallery

