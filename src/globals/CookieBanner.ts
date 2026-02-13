import type { GlobalConfig } from 'payload'

export const CookieBanner: GlobalConfig = {
  slug: 'cookie-banner',
  label: {
    en: 'Cookie Banner',
    de: 'Cookie-Banner',
  },
  admin: {
    description: {
      en: 'Manage cookie banner settings and content',
      de: 'Verwalten Sie Cookie-Banner-Einstellungen und -Inhalte',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Core behaviour
    {
      name: 'enabled',
      type: 'checkbox',
      label: {
        en: 'Enable Cookie Banner',
        de: 'Cookie-Banner aktivieren',
      },
      defaultValue: true,
      admin: {
        description: {
          en: 'Show or hide the cookie banner on the website',
          de: 'Cookie-Banner auf der Website anzeigen oder ausblenden',
        },
      },
    },
    {
      name: 'version',
      type: 'number',
      label: {
        en: 'Consent Version',
        de: 'Zustimmungs-Version',
      },
      defaultValue: 1,
      min: 1,
      admin: {
        description: {
          en: 'Increase this when you change cookie purposes to re-request consent.',
          de: 'Erhöhen Sie diesen Wert, wenn sich die Zwecke der Cookies ändern, um erneut um Zustimmung zu bitten.',
        },
      },
    },
    // Main texts
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        de: 'Titel',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'The title displayed in the cookie banner',
          de: 'Der im Cookie-Banner angezeigte Titel',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        de: 'Beschreibung',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'The description text displayed in the cookie banner',
          de: 'Der Beschreibungstext, der im Cookie-Banner angezeigt wird',
        },
      },
    },
    {
      name: 'buttonText',
      type: 'text',
      label: {
        en: 'Primary Button Text',
        de: 'Text der Hauptschaltfläche',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'The text displayed on the main action button (e.g. “Accept all”).',
          de: 'Der Text der Hauptaktion (z. B. „Alle akzeptieren“).',
        },
      },
    },
    {
      name: 'rejectButtonText',
      type: 'text',
      label: {
        en: 'Reject Button Text',
        de: 'Text der Ablehnen-Schaltfläche',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'Text for the button that rejects non-essential cookies.',
          de: 'Text für die Schaltfläche, die nicht notwendige Cookies ablehnt.',
        },
      },
    },
    {
      name: 'saveButtonText',
      type: 'text',
      label: {
        en: 'Save Selection Button Text',
        de: 'Text der Schaltfläche „Auswahl speichern“',
      },
      required: false,
      localized: true,
      admin: {
        description: {
          en: 'Text for the button that saves the selected categories.',
          de: 'Text für die Schaltfläche, die die ausgewählten Kategorien speichert.',
        },
      },
    },
    // Category configuration so texts and visibility can be controlled from the backend
    // Essential (always shown, but text editable)
    {
      name: 'essentialLabel',
      type: 'text',
      label: {
        en: 'Essential Label',
        de: 'Bezeichnung „Unbedingt erforderlich“',
      },
      required: false,
      localized: true,
    },
    {
      name: 'essentialDescription',
      type: 'textarea',
      label: {
        en: 'Essential Description',
        de: 'Beschreibung „Unbedingt erforderlich“',
      },
      required: false,
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showAnalytics',
          type: 'checkbox',
          label: {
            en: 'Show Analytics Category',
            de: 'Analyse-Kategorie anzeigen',
          },
          defaultValue: true,
        },
        {
          name: 'analyticsLabel',
          type: 'text',
          label: {
            en: 'Analytics Label',
            de: 'Analyse-Bezeichnung',
          },
          required: false,
          localized: true,
        },
        {
          name: 'analyticsDescription',
          type: 'textarea',
          label: {
            en: 'Analytics Description',
            de: 'Analyse-Beschreibung',
          },
          required: false,
          localized: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showMarketing',
          type: 'checkbox',
          label: {
            en: 'Show Marketing Category',
            de: 'Marketing-Kategorie anzeigen',
          },
          defaultValue: true,
        },
        {
          name: 'marketingLabel',
          type: 'text',
          label: {
            en: 'Marketing Label',
            de: 'Marketing-Bezeichnung',
          },
          required: false,
          localized: true,
        },
        {
          name: 'marketingDescription',
          type: 'textarea',
          label: {
            en: 'Marketing Description',
            de: 'Marketing-Beschreibung',
          },
          required: false,
          localized: true,
        },
      ],
    },
  ],
}

