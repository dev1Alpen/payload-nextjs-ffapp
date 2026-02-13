import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'General',
  },
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      if (!user) return false
      // Admin and site-admin can create media
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admin and site-admin can update media
      return Boolean(user.roles?.includes('admin') || user.roles?.includes('site-admin'))
    },
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  upload: true,
  fields: [],
}

export default Media
