import type { GlobalConfig } from 'payload'

export const SidebarWidgets: GlobalConfig = {
  slug: 'sidebar-widgets',
  label: {
    en: 'Sidebar Widgets',
    de: 'Sidebar-Widgets',
  },
  admin: {
    description: {
      en: 'Manage social media widgets displayed in the news sidebar',
      de: 'Verwalten Sie Social-Media-Widgets, die in der News-Sidebar angezeigt werden',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'facebook',
      type: 'group',
      label: {
        en: 'Facebook Widget',
        de: 'Facebook-Widget',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: {
            en: 'Enable Facebook Widget',
            de: 'Facebook-Widget aktivieren',
          },
          defaultValue: true,
        },
        {
          name: 'pageUrl',
          type: 'text',
          label: {
            en: 'Facebook Page URL',
            de: 'Facebook-Seiten-URL',
          },
          required: false,
          admin: {
            description: {
              en: 'Full URL to your Facebook page (e.g., https://web.facebook.com/ffdross)',
              de: 'Vollständige URL zu Ihrer Facebook-Seite (z.B. https://web.facebook.com/ffdross)',
            },
          },
        },
      ],
    },
    {
      name: 'instagram',
      type: 'group',
      label: {
        en: 'Instagram Widget',
        de: 'Instagram-Widget',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: {
            en: 'Enable Instagram Widget',
            de: 'Instagram-Widget aktivieren',
          },
          defaultValue: true,
        },
        {
          name: 'username',
          type: 'text',
          label: {
            en: 'Instagram Username',
            de: 'Instagram-Benutzername',
          },
          required: false,
          admin: {
            description: {
              en: 'Instagram username without @ (e.g., ff_dross)',
              de: 'Instagram-Benutzername ohne @ (z.B. ff_dross)',
            },
          },
        },
      ],
    },
  ],
}

