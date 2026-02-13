import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      // Users can read their own profile, admins can read all
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { id: { equals: user.id } }
    },
    create: async ({ req }) => {
      // Allow anonymous creation ONLY when bootstrapping the very first user
      if (!req.user) {
        const { totalDocs } = await req.payload.find({
          collection: 'users',
          depth: 0,
          limit: 0,
        })
        return totalDocs === 0
      }

      // After bootstrap, only admins can create users
      return Boolean(req.user.roles?.includes('admin'))
    },
    update: ({ req: { user } }) => {
      // Users can update their own profile, admins can update all
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
        // Hide roles on the "create first user" bootstrap screen (no authenticated admin yet).
        // Show it when an admin is logged in (e.g. creating/editing users in the Admin UI).
        condition: (_data, _siblingData, context) => {
          const user = (context as any)?.user
          return Boolean(user?.roles?.includes('admin'))
        },
      },
      saveToJWT: true, // Include in JWT for fast access checks
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // For public registration (no authenticated user), restrict to admin role only
        if (operation === 'create' && !req.user) {
          // Ensure only admin role can be set during public registration
          if (data.roles && Array.isArray(data.roles)) {
            // Filter to only allow 'admin' role for public registrations
            data.roles = data.roles.filter((role: string) => role === 'admin')
            // If no valid roles, set default
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
