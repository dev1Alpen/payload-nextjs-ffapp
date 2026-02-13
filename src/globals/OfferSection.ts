import type { CollectionConfig } from 'payload'

export const HomePages: CollectionConfig = {
  slug: 'home-pages',

  labels: {
    singular: 'Home Page',
    plural: 'Home Pages',
  },

  admin: {
    useAsTitle: 'title',
    description: 'Manage homepage content like the hero slider.',
  },

  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: {
        en: 'Home Page',
        de: 'Startseite',
      },
      label: {
        en: 'Title',
        de: 'Titel',
      },
    },

    {
      name: 'slides',
      type: 'array',
      label: {
        en: 'Slides',
        de: 'Folien',
      },
      labels: {
        singular: 'Slide',
        plural: 'Slides',
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
          name: 'subtitle',
          type: 'text',
          localized: true,
          label: {
            en: 'Subtitle',
            de: 'Untertitel',
          },
        },

        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Description',
            de: 'Beschreibung',
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
              en: 'Upload an image for the slide (preferred)',
              de: 'Laden Sie ein Bild für die Folie hoch (bevorzugt)',
            },
          },
        },

        {
          name: 'imageUrl',
          type: 'text',
          label: {
            en: 'Image URL (fallback)',
            de: 'Bild-URL (Fallback)',
          },
          admin: {
            description: {
              en: 'Used when no image is uploaded',
              de: 'Wird verwendet, wenn kein Bild hochgeladen wurde',
            },
          },
        },

        {
          name: 'primaryButtonText',
          type: 'text',
          localized: true,
          label: {
            en: 'Primary Button Text',
            de: 'Text der primären Schaltfläche',
          },
        },

        {
          name: 'primaryButtonLink',
          type: 'text',
          label: {
            en: 'Primary Button Link',
            de: 'Link der primären Schaltfläche',
          },
        },

        {
          name: 'secondaryButtonText',
          type: 'text',
          localized: true,
          label: {
            en: 'Secondary Button Text',
            de: 'Text der sekundären Schaltfläche',
          },
        },

        {
          name: 'secondaryButtonLink',
          type: 'text',
          label: {
            en: 'Secondary Button Link',
            de: 'Link der sekundären Schaltfläche',
          },
        },
      ],
    },
  ],
}
