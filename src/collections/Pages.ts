import type { CollectionConfig } from 'payload'

// Helper function to create URL-friendly slugs
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

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      en: 'Page',
      de: 'Seite',
    },
    plural: {
      en: 'Pages',
      de: 'Seiten',
    },
  },
  admin: {
    useAsTitle: 'menuLabel',
    defaultColumns: ['menuLabel', 'title', 'isTopItem', '_status', 'updatedAt'],
    group: 'Pages',
    description: {
      en: 'Manage content pages and navigation menu items. Top items are menu labels only, sub items are full content pages.',
      de: 'Verwalten Sie Inhaltsseiten und Navigationsmenüpunkte. Top-Elemente sind nur Menübezeichnungen, Unterelemente sind vollständige Inhaltsseiten.',
    },
    listSearchableFields: ['title', 'menuLabel'],
  },

  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          _status: { equals: 'published' },
        }
      }
      return true
    },
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
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'isTopItem',
      type: 'checkbox',
      label: {
        en: 'Top Menu Item',
        de: 'Top-Menüpunkt',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'If checked, this is a top-level menu label (no content/slug needed). If unchecked, this is a submenu item with full content.',
          de: 'Wenn aktiviert, ist dies ein Top-Level-Menübezeichnung (kein Inhalt/Slug erforderlich). Wenn deaktiviert, ist dies ein Untermenüpunkt mit vollem Inhalt.',
        },
      },
    },
    {
      name: 'menuLabel',
      type: 'text',
      required: false,
      localized: true,
      label: {
        en: 'Menu Label',
        de: 'Menü-Bezeichnung',
      },
      admin: {
        description: {
          en: 'Label to display in the navigation menu. For top items, this is required. For sub items, defaults to title if empty.',
          de: 'Bezeichnung, die im Navigationsmenü angezeigt wird. Für Top-Elemente ist dies erforderlich. Für Unterelemente wird standardmäßig der Titel verwendet, wenn leer.',
        },
      },
    },
    {
      name: 'menuParent',
      type: 'relationship',
      relationTo: 'pages',
      label: {
        en: 'Menu Parent',
        de: 'Menü-Übergeordnetes Element',
      },
      required: false,
      filterOptions: {
        isTopItem: {
          equals: true,
        },
      },
      admin: {
        description: {
          en: 'Parent top item for submenu items. Required for submenu items. Only top items (isTopItem: true) can be selected as parents.',
          de: 'Übergeordnetes Top-Element für Untermenüpunkte. Erforderlich für Untermenüpunkte. Nur Top-Elemente (isTopItem: true) können als Eltern ausgewählt werden.',
        },
        condition: (data, siblingData) => {
          const isTopItem = siblingData?.isTopItem ?? data?.isTopItem ?? false
          // Show menuParent only for sub items (not top items)
          return !isTopItem
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Content',
            de: 'Inhalt',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: false,
              localized: true,
              label: {
                en: 'Title',
                de: 'Titel',
              },
              admin: {
                description: {
                  en: 'The title of the page. For top items, optional (if provided, slug and content become required). For sub items, required.',
                  de: 'Der Titel der Seite. Für Top-Elemente optional (wenn angegeben, werden Slug und Inhalt erforderlich). Für Unterelemente erforderlich.',
                },
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: false,
              localized: true,
              label: {
                en: 'Description',
                de: 'Beschreibung',
              },
              admin: {
                description: {
                  en: 'Page description or summary (required for submenu items)',
                  de: 'Seitenbeschreibung oder Zusammenfassung (erforderlich für Untermenüpunkte)',
                },
                condition: (data, siblingData) => {
                  // Show description field only for sub items
                  const isTopItem = siblingData?.isTopItem ?? data?.isTopItem ?? false
                  return !isTopItem
                },
              },
            },
            {
              name: 'slug',
              type: 'text',
              unique: true,
              index: true,
              localized: true,
              required: true,
              label: {
                en: 'Slug',
                de: 'Slug',
              },
              admin: {
                description: {
                  en: 'URL-friendly version of the title (auto-generated from title if left empty). You can edit this manually.',
                  de: 'URL-freundliche Version des Titels (automatisch aus Titel generiert, wenn leer). Sie können dies manuell bearbeiten.',
                },
              },
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              required: false,
              label: {
                en: 'Content',
                de: 'Inhalt',
              },
              admin: {
                description: {
                  en: 'The main content of the page. For top items, optional (if title provided, becomes required). For sub items, required.',
                  de: 'Der Hauptinhalt der Seite. Für Top-Elemente optional (wenn Titel angegeben, wird erforderlich). Für Unterelemente erforderlich.',
                },
              },
            },
          ],
        },
        {
          label: {
            en: 'SEO',
            de: 'SEO',
          },
          fields: [
            {
              name: 'meta',
              type: 'group',
              label: {
                en: 'SEO Meta',
                de: 'SEO Meta',
              },
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  localized: true,
                  label: {
                    en: 'Meta Title',
                    de: 'Meta-Titel',
                  },
                  admin: {
                    description: {
                      en: 'SEO title (defaults to page title if empty). Recommended length: 50-60 characters.',
                      de: 'SEO-Titel (standardmäßig Seitentitel, wenn leer). Empfohlene Länge: 50-60 Zeichen.',
                    },
                  },
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Meta Description',
                    de: 'Meta-Beschreibung',
                  },
                  admin: {
                    description: {
                      en: 'SEO description for search engines. Recommended length: 150-160 characters.',
                      de: 'SEO-Beschreibung für Suchmaschinen. Empfohlene Länge: 150-160 Zeichen.',
                    },
                  },
                },
                {
                  name: 'metaKeywords',
                  type: 'text',
                  localized: true,
                  label: {
                    en: 'Meta Keywords',
                    de: 'Meta-Schlüsselwörter',
                  },
                  admin: {
                    description: {
                      en: 'Comma-separated keywords for SEO (optional)',
                      de: 'Durch Kommas getrennte Schlüsselwörter für SEO (optional)',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        if (!data) return data

        const isTopItem = data.isTopItem === true

        // Auto-generate slug from title if slug is empty (only on create or if slug is missing)
        if (data.title && (!data.slug || (operation === 'create' && !data.slug))) {
          if (typeof data.title === 'object' && data.title !== null) {
            const slugs: Record<string, string> = {}
            for (const [locale, title] of Object.entries(data.title)) {
              if (title && typeof title === 'string' && title.trim()) {
                // Only generate if slug for this locale is empty
                const currentSlug = typeof data.slug === 'object' && data.slug !== null ? data.slug[locale] : null
                if (!currentSlug || !currentSlug.trim()) {
                  slugs[locale] = slugify(title)
                } else {
                  slugs[locale] = currentSlug
                }
              }
            }
            if (Object.keys(slugs).length > 0) {
              data.slug = slugs
            }
          } else if (typeof data.title === 'string' && data.title.trim()) {
            // Only generate if slug is empty
            if (!data.slug || (typeof data.slug === 'string' && !data.slug.trim())) {
              data.slug = slugify(data.title)
            }
          }
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data

        const isTopItem = data.isTopItem === true

        // Validate top items: require menuLabel when published
        if (isTopItem && data._status === 'published') {
          const menuLabel = data.menuLabel
          const hasMenuLabel =
            menuLabel &&
            ((typeof menuLabel === 'string' && menuLabel.trim()) ||
              (typeof menuLabel === 'object' &&
                menuLabel !== null &&
                Object.values(menuLabel).some((v) => v && typeof v === 'string' && v.trim())))

          if (!hasMenuLabel) {
            throw new Error('Menu label is required for top menu items when publishing')
          }

          // Prevent top items from having a parent
          if (data.menuParent) {
            throw new Error('Top menu items cannot have a parent')
          }

          // If top item has title, slug, or content, all three must be present
          const hasTitle =
            data.title &&
            ((typeof data.title === 'string' && data.title.trim()) ||
              (typeof data.title === 'object' &&
                data.title !== null &&
                Object.values(data.title).some((v) => v && typeof v === 'string' && v.trim())))
          const hasSlug =
            data.slug &&
            ((typeof data.slug === 'string' && data.slug.trim()) ||
              (typeof data.slug === 'object' &&
                data.slug !== null &&
                Object.values(data.slug).some((v) => v && typeof v === 'string' && v.trim())))
          const hasContent =
            data.content && typeof data.content === 'object' && data.content !== null

          if (hasTitle || hasSlug || hasContent) {
            // If any content field is provided, all must be provided
            if (!hasTitle) {
              throw new Error('Title is required for top menu items when content is provided')
            }
            if (!hasSlug) {
              throw new Error('Slug is required for top menu items when content is provided')
            }
            if (!hasContent) {
              throw new Error('Content is required for top menu items when title/slug is provided')
            }
          }
        }

        // Validate sub items: require title, description, content, slug, and parent when published
        if (!isTopItem && data._status === 'published') {
          if (!data.title) {
            throw new Error('Title is required for submenu items when publishing')
          }

          if (!data.description) {
            throw new Error('Description is required for submenu items when publishing')
          }

          if (!data.content) {
            throw new Error('Content is required for submenu items when publishing')
          }

          if (!data.slug) {
            throw new Error('Slug is required for submenu items when publishing')
          }

          // Validate sub items must have a parent when published
          const hasMenuParent =
            data.menuParent !== undefined && data.menuParent !== null && data.menuParent !== ''

          if (!hasMenuParent) {
            throw new Error('Submenu items must have a menu parent selected when publishing')
          }

          // Verify parent is actually a top item
          if (data.menuParent) {
            const parentId =
              typeof data.menuParent === 'object' && data.menuParent !== null
                ? (data.menuParent as any)?.id
                : data.menuParent

            if (parentId) {
              try {
                const parent = await req.payload.findByID({
                  collection: 'pages',
                  id: String(parentId),
                  depth: 0,
                })

                if (!parent.isTopItem) {
                  throw new Error('Menu parent must be a top item (isTopItem: true)')
                }
              } catch (error) {
                // If parent lookup fails, let it pass (might be a new parent being created)
                // The validation will catch it on the parent's save
              }
            }
          }
        }

        // Prevent self-reference in menuParent
        if (data.menuParent && operation === 'update' && originalDoc?.id) {
          const parent = data.menuParent
          const parentId =
            typeof parent === 'object' && parent !== null ? (parent as any)?.id : parent

          if (parentId && String(parentId) === String(originalDoc.id)) {
            throw new Error('A page cannot be its own menu parent')
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
