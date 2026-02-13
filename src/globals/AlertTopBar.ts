import type { GlobalConfig } from 'payload'

export const AlertTopBar: GlobalConfig = {
  slug: 'alert-top-bar',
  label: {
    en: 'Alert Top Bar',
    de: 'Alert-Top-Leiste',
  },
  admin: {
    description: {
      en: 'Configure the live alert bar shown at the top of the site',
      de: 'Konfigurieren Sie die Live-Alert-Leiste am oberen Rand der Website',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'active',
      type: 'checkbox',
      label: {
        en: 'Active',
        de: 'Aktiv',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'Show or hide the alert bar',
          de: 'Alert-Leiste ein- oder ausblenden',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        de: 'Titel',
      },
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        de: 'Beschreibung',
      },
      localized: true,
    },
    {
      name: 'color',
      type: 'select',
      label: {
        en: 'Color',
        de: 'Farbe',
      },
      defaultValue: 'red',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Orange', value: 'orange' },
        { label: 'Purple', value: 'purple' },
        { label: 'Green', value: 'green' },
      ],
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      label: {
        en: 'Related Post',
        de: 'Verwandter Beitrag',
      },
      filterOptions: {
        _status: {
          equals: 'published',
        },
      },
      admin: {
        description: {
          en: 'Select a post to link to from the alert bar',
          de: 'Wählen Sie einen Beitrag, zu dem die Warnleiste verlinkt',
        },
      },
    },
    {
      name: 'readMoreText',
      type: 'text',
      label: {
        en: 'Read More Button Text',
        de: 'Text der "Weiterlesen"-Schaltfläche',
      },
      localized: true,
      admin: {
        description: {
          en: 'Optional custom label for the read more button',
          de: 'Optionaler eigener Text für die Weiterlesen-Schaltfläche',
        },
      },
    },
  ],
}
