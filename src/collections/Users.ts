import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      de: 'Benutzer',
    },
    plural: {
      en: 'Users',
      de: 'Benutzer',
    },
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { id: { equals: user.id } }
    },
    create: async ({ req }) => {
      if (!req.user) {
        const { totalDocs } = await req.payload.find({
          collection: 'users',
          depth: 0,
          limit: 0,
        })
        return totalDocs === 0
      }

      return Boolean(req.user.roles?.includes('admin'))
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'site-admin'],
      defaultValue: ['admin'],
      required: true,
      admin: {
        condition: (_data, _siblingData, context) => {
          const user = (context as any)?.user
          return Boolean(user?.roles?.includes('admin'))
        },
      },
      saveToJWT: true,
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && !req.user) {
          if (data.roles && Array.isArray(data.roles)) {
            data.roles = data.roles.filter((role: string) => role === 'admin')
            if (data.roles.length === 0) {
              data.roles = ['admin']
            }
          } else {
            data.roles = ['admin']
          }
        }
        return data
      },
    ],
  },
}
