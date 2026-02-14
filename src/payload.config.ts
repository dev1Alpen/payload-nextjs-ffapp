import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { de } from '@payloadcms/translations/languages/de'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { Tasks } from './collections/Tasks'
import { Contact } from './collections/Contact'
import { Sponsors } from './collections/Sponsors'
import { MagazineSlides } from './collections/MagazineSlides'
import { Categories } from './collections/Categories'
import { History } from './collections/History'
import { Kommando } from './collections/Kommando'
import { Clerk } from './collections/Clerk'
import { ActiveMembers } from './collections/ActiveMembers'
import { FireBrigadeYouth } from './collections/FireBrigadeYouth'
import { Reserve } from './collections/Reserve'
import { Gallery } from './collections/Gallery'
import { Impressum } from './collections/Impressum'
import { Datenschutz } from './collections/Datenschutz'
import { ContactInfo } from './globals/ContactInfo'
import { CookieBanner } from './globals/CookieBanner'
import { AlertTopBar } from './globals/AlertTopBar'
import { SidebarWidgets } from './globals/SidebarWidgets'
import { MapSettings } from './globals/MapSettings'
import { SiteSettings } from './globals/SiteSettings'
import { initGlobalsPlugin } from './plugins/init-globals-plugin'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const getDatabaseConfig = () => {
  let connectionString = process.env.DATABASE_URL || ''
  try {
    if (connectionString.includes('?')) {
      const [baseUrl, queryString] = connectionString.split('?')
      if (queryString) {
        const params = new URLSearchParams(queryString)
        params.delete('sslmode')
        params.delete('ssl')
        params.delete('uselibpqcompat')
        const newQueryString = params.toString()
        connectionString = newQueryString ? `${baseUrl}?${newQueryString}` : baseUrl
      }
    }
  } catch (error) {
    console.warn('Could not parse DATABASE_URL, using as-is:', error)
  }

  return {
    pool: {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    push: process.env.NODE_ENV === 'development',
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '',
    },
    components: {
      graphics: {
        Logo: '/components/admin/AdminLogo',
      },
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en, de },
  },
  localization: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
  collections: [
    Users,
    Media,
    Categories,
    Posts,
    Pages,
    Tasks,
    Contact,
    Sponsors,
    MagazineSlides,
    History,
    Kommando,
    Clerk,
    ActiveMembers,
    FireBrigadeYouth,
    Reserve,
    Gallery,
    Impressum,
    Datenschutz,
  ],
  globals: [ContactInfo, CookieBanner, AlertTopBar, SidebarWidgets, MapSettings, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    push: process.env.NODE_ENV === 'development',
  }),
  sharp,
  plugins: [
    initGlobalsPlugin(),
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
