import type { CollectionConfig } from 'payload'

export const CommandTeam: CollectionConfig = {
  slug: 'command-team',
  labels: {
    singular: {
      en: 'Command Team Member',
      de: 'Kommando-Mitglied',
    },
    plural: {
      en: 'Kommando',
      de: 'Kommando',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rank', 'position', 'order', 'createdAt'],
    group: 'Content',
    description: {
      en: 'Manage command team members displayed on the kommando page',
      de: 'Verwalten Sie die Kommandomitarbeiter, die auf der Kommando-Seite angezeigt werden',
    },
  },
  access: {
    read: () => true, // Public can read
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: {
          en: 'Full name of the command team member',
          de: 'Vollständiger Name des Kommandomitarbeiters',
        },
      },
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: {
          en: 'Position/role (e.g., "Commander", "Deputy Commander")',
          de: 'Position/Rolle (z.B. "Kommandant", "Kommandant Stellvertreter")',
        },
      },
    },
    {
      name: 'rank',
      type: 'text',
      required: true,
      admin: {
        description: {
          en: 'Rank abbreviation (e.g., "HBI", "BI", "V")',
          de: 'Rang-Abkürzung (z.B. "HBI", "BI", "V")',
        },
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: {
          en: 'Contact email address',
          de: 'Kontakt-E-Mail-Adresse',
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
          en: 'Profile image of the command team member',
          de: 'Profilbild des Kommandomitarbeiters',
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

