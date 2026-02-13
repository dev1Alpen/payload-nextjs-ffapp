import type { CollectionConfig } from 'payload'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, '') // Trim hyphens from end
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      de: 'Kategorie',
    },
    plural: {
      en: 'Categories',
      de: 'Kategorien',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active', 'createdAt'],
    description: {
      en: 'Manage post categories',
      de: 'Verwalten Sie Beitragskategorien',
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Name',
        de: 'Name',
      },
      admin: {
        description: {
          en: 'The display name of the category',
          de: 'Der Anzeigename der Kategorie',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: true, // IMPORTANT: Slug is localized
      label: {
        en: 'Slug',
        de: 'Slug',
      },
      admin: {
        description: {
          en: 'URL-friendly version of the name (auto-generated)',
          de: 'URL-freundliche Version des Namens (automatisch generiert)',
        },
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Description',
        de: 'Beschreibung',
      },
      admin: {
        description: {
          en: 'Optional description of the category',
          de: 'Optionale Beschreibung der Kategorie',
        },
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Active',
        de: 'Aktiv',
      },
      admin: {
        description: {
          en: 'Whether this category is active and can be used',
          de: 'Ob diese Kategorie aktiv ist und verwendet werden kann',
        },
      },
    },
    {
      name: 'icon',
      type: 'text',
      label: {
        en: 'Icon',
        de: 'Symbol',
      },
      admin: {
        description: {
          en: 'Optional icon identifier (e.g., emoji or icon name)',
          de: 'Optionaler Symbolbezeichner (z. B. Emoji oder Symbolname)',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Guard against undefined data
        if (!data) return data

        // Auto-generate slug from name before validation
        // Only generate if slug is missing or if this is a create operation
        if (data.name && (operation === 'create' || !data.slug)) {
          try {
            // Handle localized names - generate slug for each locale
            if (typeof data.name === 'object' && data.name !== null) {
              // Localized name object
              const slugs: Record<string, string> = {}
              for (const [locale, name] of Object.entries(data.name)) {
                if (name && typeof name === 'string' && name.trim()) {
                  const generatedSlug = slugify(name)
                  if (generatedSlug) {
                    slugs[locale] = generatedSlug
                  }
                }
              }
              // Set slug if we have at least one valid slug
              if (Object.keys(slugs).length > 0) {
                data.slug = slugs
              }
            } else if (typeof data.name === 'string' && data.name.trim()) {
              // Single name string
              const generatedSlug = slugify(data.name)
              if (generatedSlug) {
                data.slug = generatedSlug
              }
            }
          } catch (error) {
            console.error('Error generating category slug:', error)
            // If slug generation fails, set a fallback
            if (operation === 'create') {
              data.slug = `category-${Date.now()}`
            }
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}

