import type { CollectionConfig } from 'payload'

export const ActiveMembers: CollectionConfig = {
  slug: 'active-members',
  labels: {
    singular: {
      en: 'Active Member',
      de: 'Aktives Mitglied',
    },
    plural: {
      en: 'Active Members',
      de: 'Aktive Mitglieder',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Pages',
    description: {
      en: 'Manage the active members page heading and team members',
      de: 'Verwalten Sie den Seitentitel für aktive Mitglieder und die Teammitglieder',
    },
    listSearchableFields: ['title'],
  },
  access: {
    read: () => true, // Public can read
    create: async ({ req: { user, payload } }) => {
      // Only allow admin to create, and only if no documents exist (singleton pattern)
      if (!user || !user.roles?.includes('admin')) return false
      
      try {
        const existing = await payload.find({
          collection: 'active-members',
          limit: 1,
          overrideAccess: true,
        })
        // Only allow create if no documents exist
        return existing.totalDocs === 0
      } catch {
        return false
      }
    },
    update: ({ req: { user } }) => {
      // Only admin can update
      return Boolean(user?.roles?.includes('admin'))
    },
    delete: () => {
      // Prevent deletion - always return false
      return false
    },
  },
  hooks: {
    beforeChange: [
      async ({ operation, req }) => {
        // Prevent creating a new record if one already exists
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'active-members',
            limit: 1,
            overrideAccess: true,
          })
          if (existing.totalDocs > 0) {
            throw new Error('Only one Active Members record is allowed. Please update the existing record instead.')
          }
        }
      },
    ],
    beforeDelete: [
      async () => {
        // Prevent deletion by throwing an error
        throw new Error('Deletion of Active Members record is not allowed')
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Page Title',
        de: 'Seitentitel',
      },
      admin: {
        description: {
          en: 'Main title displayed in the hero section',
          de: 'Haupttitel, der im Hero-Bereich angezeigt wird',
        },
        placeholder: {
          en: 'Active Members of FF-Droß',
          de: 'Aktive Mitglieder der FF-Droß',
        },
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Introduction Text',
        de: 'Einführungstext',
      },
      admin: {
        description: {
          en: 'Introduction paragraph displayed below the title',
          de: 'Einführungsabsatz, der unter dem Titel angezeigt wird',
        },
        placeholder: {
          en: 'We are very proud to have some very active members in our ranks, but we are also very happy to welcome new comrades to our ranks. If you are interested, please contact us.',
          de: 'Wir sind sehr stolz darüber einige sehr aktive Mitglieder in unseren Reihen zu haben, doch wir freuen uns auch sehr, wenn wir neue Kameraden in unseren Reihen begrüßen dürfen. Bei Interesse melden Sie sich einfach bei uns.',
        },
      },
    },
    {
      name: 'teamMembers',
      type: 'array',
      required: false,
      label: {
        en: 'Team Members',
        de: 'Teammitglieder',
      },
      minRows: 0,
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
              en: 'Full name of the team member',
              de: 'Vollständiger Name des Teammitglieds',
            },
          },
        },
        {
          name: 'position',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Position',
            de: 'Position',
          },
          admin: {
            description: {
              en: 'Position/role (e.g., "Active Member", "Volunteer")',
              de: 'Position/Rolle (z.B. "Aktives Mitglied", "Freiwilliger")',
            },
          },
        },
        {
          name: 'rank',
          type: 'text',
          required: true,
          label: {
            en: 'Rank',
            de: 'Rang',
          },
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
          label: {
            en: 'Email',
            de: 'E-Mail',
          },
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
          label: {
            en: 'Profile Image',
            de: 'Profilbild',
          },
          admin: {
            description: {
              en: 'Profile image of the team member (displayed as full image on card)',
              de: 'Profilbild des Teammitglieds (wird als vollständiges Bild auf der Karte angezeigt)',
            },
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          required: false,
          localized: true,
          label: {
            en: 'Short Bio',
            de: 'Kurze Biografie',
          },
          admin: {
            description: {
              en: 'Short biography text about the team member',
              de: 'Kurzer Biografietext über das Teammitglied',
            },
          },
        },
        {
          name: 'audio',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: {
            en: 'Audio File',
            de: 'Audiodatei',
          },
          admin: {
            description: {
              en: 'Optional audio file for the team member bio',
              de: 'Optionale Audiodatei für die Biografie des Teammitglieds',
            },
          },
        },
        {
          name: 'cardMedia',
          type: 'group',
          label: {
            en: 'Card Media',
            de: 'Karten-Medien',
          },
          fields: [
            {
              name: 'mediaType',
              type: 'radio',
              options: [
                {
                  label: {
                    en: 'None',
                    de: 'Keine',
                  },
                  value: 'none',
                },
                {
                  label: {
                    en: 'Image',
                    de: 'Bild',
                  },
                  value: 'image',
                },
                {
                  label: {
                    en: 'Video',
                    de: 'Video',
                  },
                  value: 'video',
                },
              ],
              defaultValue: 'none',
              admin: {
                description: {
                  en: 'Select whether to show an image or video on the card',
                  de: 'Wählen Sie, ob ein Bild oder Video auf der Karte angezeigt werden soll',
                },
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                condition: (data) => data.mediaType === 'image',
              },
              label: {
                en: 'Card Image',
                de: 'Kartenbild',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              required: false,
              admin: {
                condition: (data) => data.mediaType === 'video',
                description: {
                  en: 'Video URL (YouTube, Vimeo, etc.)',
                  de: 'Video-URL (YouTube, Vimeo, etc.)',
                },
              },
              label: {
                en: 'Video URL',
                de: 'Video-URL',
              },
            },
          ],
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Order',
            de: 'Reihenfolge',
          },
          admin: {
            description: {
              en: 'Display order (lower numbers appear first)',
              de: 'Anzeigereihenfolge (niedrigere Zahlen erscheinen zuerst)',
            },
          },
        },
      ],
    },
  ],
  timestamps: true,
}

