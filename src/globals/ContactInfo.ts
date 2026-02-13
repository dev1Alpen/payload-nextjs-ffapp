import type { GlobalConfig } from 'payload'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: {
    en: 'Contact Information',
    de: 'Kontaktinformationen',
  },
  admin: {
    description: {
      en: 'Manage address information displayed on the contact page',
      de: 'Verwalten Sie Adressinformationen, die auf der Kontaktseite angezeigt werden',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'address',
      type: 'richText',
      label: {
        en: 'Address Information',
        de: 'Adressinformationen',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'Fire Department address and contact details. Use rich text formatting for better presentation.',
          de: 'Adresse und Kontaktdaten der Feuerwehr. Verwenden Sie Rich-Text-Formatierung für eine bessere Darstellung.',
        },
      },
    },
  ],
}

