import type { CollectionConfig } from 'payload'

export const Contact: CollectionConfig = {
  slug: 'contact',
  labels: {
    singular: {
      en: 'Contact Submission',
      de: 'Kontaktanfrage',
    },
    plural: {
      en: 'Contact Submissions',
      de: 'Kontaktanfragen',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    description: {
      en: 'Manage contact form submissions',
      de: 'Verwalten Sie Kontaktformular-Einreichungen',
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')), // Only admin can read
    create: () => true, // Public can create (submit forms)
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Name',
        de: 'Name',
      },
      admin: {
        description: {
          en: 'Full name of the person submitting the form',
          de: 'Vollständiger Name der Person, die das Formular einreicht',
        },
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: {
        en: 'Email',
        de: 'E-Mail',
      },
      admin: {
        description: {
          en: 'Email address for contact',
          de: 'E-Mail-Adresse für Kontakt',
        },
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        en: 'Phone',
        de: 'Telefon',
      },
      admin: {
        description: {
          en: 'Phone number (optional)',
          de: 'Telefonnummer (optional)',
        },
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: {
        en: 'Subject',
        de: 'Betreff',
      },
      admin: {
        description: {
          en: 'Subject of the message',
          de: 'Betreff der Nachricht',
        },
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: {
        en: 'Message',
        de: 'Nachricht',
      },
      admin: {
        description: {
          en: 'Message content',
          de: 'Nachrichteninhalt',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        {
          label: {
            en: 'New',
            de: 'Neu',
          },
          value: 'new',
        },
        {
          label: {
            en: 'In Progress',
            de: 'In Bearbeitung',
          },
          value: 'in_progress',
        },
        {
          label: {
            en: 'Resolved',
            de: 'Erledigt',
          },
          value: 'resolved',
        },
      ],
      admin: {
        description: {
          en: 'Status of the contact submission',
          de: 'Status der Kontaktanfrage',
        },
      },
    },
  ],
  timestamps: true,
}

