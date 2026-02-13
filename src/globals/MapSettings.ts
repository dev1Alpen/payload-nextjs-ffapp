import type { GlobalConfig } from 'payload'

export const MapSettings: GlobalConfig = {
  slug: 'map-settings',
  label: {
    en: 'Map Settings',
    de: 'Karteneinstellungen',
  },
  admin: {
    description: {
      en: 'Configure Google Maps or OpenStreetMap display on the contact page',
      de: 'Konfigurieren Sie die Anzeige von Google Maps oder OpenStreetMap auf der Kontaktseite',
    },
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: {
        en: 'Show Map',
        de: 'Karte anzeigen',
      },
      defaultValue: true,
      admin: {
        description: {
          en: 'Enable or disable the map display on the contact page',
          de: 'Kartenanzeige auf der Kontaktseite aktivieren oder deaktivieren',
        },
      },
    },
    {
      name: 'mapType',
      type: 'select',
      label: {
        en: 'Map Type',
        de: 'Kartentyp',
      },
      options: [
        {
          label: {
            en: 'Google Maps',
            de: 'Google Maps',
          },
          value: 'google',
        },
        {
          label: {
            en: 'OpenStreetMap',
            de: 'OpenStreetMap',
          },
          value: 'osm',
        },
      ],
      defaultValue: 'google',
      required: true,
      admin: {
        description: {
          en: 'Choose between Google Maps or OpenStreetMap',
          de: 'Wählen Sie zwischen Google Maps oder OpenStreetMap',
        },
      },
    },
    {
      name: 'mapLocations',
      type: 'array',
      label: {
        en: 'Map Locations',
        de: 'Kartenstandorte',
      },
      minRows: 1,
      admin: {
        description: {
          en: 'Add multiple addresses/locations to display on the map',
          de: 'Fügen Sie mehrere Adressen/Standorte hinzu, die auf der Karte angezeigt werden sollen',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Location Title',
            de: 'Standorttitel',
          },
          localized: true,
          required: true,
          admin: {
            description: {
              en: 'Title for this location (e.g., "Main Station", "Branch Office")',
              de: 'Titel für diesen Standort (z.B. "Hauptwache", "Nebenstelle")',
            },
          },
        },
        {
          name: 'address',
          type: 'text',
          label: {
            en: 'Address',
            de: 'Adresse',
          },
          localized: true,
          required: true,
          admin: {
            description: {
              en: 'Full address for this location',
              de: 'Vollständige Adresse für diesen Standort',
            },
          },
        },
        {
          name: 'googleMapsEmbedUrl',
          type: 'text',
          label: {
            en: 'Google Maps Embed URL',
            de: 'Google Maps Embed-URL',
          },
          required: false,
          admin: {
            description: {
              en: 'Paste the iframe src URL from Google Maps. To get this: 1) Go to https://www.google.com/maps, 2) Search for the address, 3) Click "Share" → "Embed a map", 4) Copy the src URL',
              de: 'Fügen Sie die iframe src-URL von Google Maps ein. So erhalten Sie diese: 1) Gehen Sie zu https://www.google.com/maps, 2) Suchen Sie nach der Adresse, 3) Klicken Sie auf "Teilen" → "Karte einbetten", 4) Kopieren Sie die src-URL',
            },
            condition: (_data, _siblingData, context) => {
              // Access root data from the form context
              const rootData = (context as any).data || (context as any).blockData
              return rootData?.mapType === 'google'
            },
          },
        },
        {
          name: 'latitude',
          type: 'number',
          label: {
            en: 'Latitude',
            de: 'Breitengrad',
          },
          required: false,
          admin: {
            description: {
              en: 'Latitude coordinate (e.g., 48.123456)',
              de: 'Breitengrad-Koordinate (z.B. 48.123456)',
            },
            condition: (_data, _siblingData, context) => {
              // Access root data from the form context
              const rootData = (context as any).data || (context as any).blockData
              return rootData?.mapType === 'osm'
            },
          },
        },
        {
          name: 'longitude',
          type: 'number',
          label: {
            en: 'Longitude',
            de: 'Längengrad',
          },
          required: false,
          admin: {
            description: {
              en: 'Longitude coordinate (e.g., 15.123456)',
              de: 'Längengrad-Koordinate (z.B. 15.123456)',
            },
            condition: (_data, _siblingData, context) => {
              // Access root data from the form context
              const rootData = (context as any).data || (context as any).blockData
              return rootData?.mapType === 'osm'
            },
          },
        },
      ],
    },
    {
      name: 'displayMode',
      type: 'select',
      label: {
        en: 'Display Mode',
        de: 'Anzeigemodus',
      },
      options: [
        {
          label: {
            en: 'Show All Locations',
            de: 'Alle Standorte anzeigen',
          },
          value: 'all',
        },
        {
          label: {
            en: 'Show First Location Only',
            de: 'Nur ersten Standort anzeigen',
          },
          value: 'first',
        },
        {
          label: {
            en: 'Allow Switching Between Locations',
            de: 'Zwischen Standorten wechseln',
          },
          value: 'switchable',
        },
      ],
      defaultValue: 'first',
      admin: {
        description: {
          en: 'How to display multiple locations: show all on one map, show only the first, or allow users to switch between them',
          de: 'Wie mehrere Standorte angezeigt werden: alle auf einer Karte, nur der erste, oder Benutzer können zwischen ihnen wechseln',
        },
      },
    },
    {
      name: 'mapTitle',
      type: 'text',
      label: {
        en: 'Map Section Title',
        de: 'Kartenbereich-Titel',
      },
      localized: true,
      required: false,
      admin: {
        description: {
          en: 'Title displayed above the map',
          de: 'Titel, der über der Karte angezeigt wird',
        },
      },
    },
  ],
}

