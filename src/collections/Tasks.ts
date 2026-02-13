import type { CollectionConfig } from 'payload'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  labels: {
    singular: {
      en: 'Task',
      de: 'Aufgabe',
    },
    plural: {
      en: 'Tasks',
      de: 'Aufgaben',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'createdAt'],
    description: {
      en: 'Manage tasks displayed on the home page',
      de: 'Verwalten Sie die auf der Startseite angezeigten Aufgaben',
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
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: {
          en: 'Task title (e.g., "Rescue", "Extinguish")',
          de: 'Aufgabentitel (z.B. "Retten", "Löschen")',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: {
          en: 'Task description',
          de: 'Aufgabenbeschreibung',
        },
      },
    },
    {
      name: 'iconImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: {
          en: 'Upload a custom SVG or image icon for this task. If provided, this will be used instead of the default icon.',
          de: 'Laden Sie ein benutzerdefiniertes SVG- oder Bildsymbol für diese Aufgabe hoch. Falls angegeben, wird dies anstelle des Standard-Symbols verwendet.',
        },
      },
    },
    {
      name: 'icon',
      type: 'select',
      required: false,
      options: [
        {
          label: {
            en: 'Rescue',
            de: 'Retten',
          },
          value: 'rescue',
        },
        {
          label: {
            en: 'Extinguish',
            de: 'Löschen',
          },
          value: 'extinguish',
        },
        {
          label: {
            en: 'Recover',
            de: 'Bergen',
          },
          value: 'recover',
        },
        {
          label: {
            en: 'Protect',
            de: 'Schützen',
          },
          value: 'protect',
        },
      ],
      admin: {
        description: {
          en: 'Select a default icon for this task (used if no custom icon image is uploaded)',
          de: 'Wählen Sie ein Standard-Symbol für diese Aufgabe (wird verwendet, wenn kein benutzerdefiniertes Symbolbild hochgeladen wurde)',
        },
        condition: (data) => !data.iconImage, // Only show if no iconImage is set
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

