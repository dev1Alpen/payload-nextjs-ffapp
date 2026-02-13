import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: {
    en: 'Site Settings',
    de: 'Website-Einstellungen',
  },
  admin: {
    description: {
      en: 'Manage basic site-wide configuration including site name, description, logo, and favicon',
      de: 'Verwalten Sie grundlegende websiteweite Konfigurationen einschließlich Website-Name, Beschreibung, Logo und Favicon',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: {
        en: 'Site Name',
        de: 'Website-Name',
      },
      required: true,
      localized: true,
      admin: {
        description: {
          en: 'The site name/title displayed in browser tabs and metadata',
          de: 'Der Website-Name/Titel, der in Browser-Tabs und Metadaten angezeigt wird',
        },
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: {
        en: 'Site Description',
        de: 'Website-Beschreibung',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'Meta description for SEO and social sharing',
          de: 'Meta-Beschreibung für SEO und Social Sharing',
        },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Logo',
        de: 'Logo',
      },
      required: false,
      admin: {
        description: {
          en: 'Main site logo image',
          de: 'Hauptlogo der Website',
        },
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Favicon',
        de: 'Favicon',
      },
      required: false,
      admin: {
        description: {
          en: 'Site favicon displayed in browser tabs',
          de: 'Website-Favicon, das in Browser-Tabs angezeigt wird',
        },
      },
    },
    {
      name: 'adminLogo',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Admin Panel Logo',
        de: 'Admin-Panel-Logo',
      },
      required: false,
      admin: {
        description: {
          en: 'Custom logo displayed in the Payload admin panel. If not set, the default Payload logo will be used.',
          de: 'Benutzerdefiniertes Logo, das im Payload-Admin-Panel angezeigt wird. Wenn nicht festgelegt, wird das Standard-Payload-Logo verwendet.',
        },
      },
    },
  ],
}

