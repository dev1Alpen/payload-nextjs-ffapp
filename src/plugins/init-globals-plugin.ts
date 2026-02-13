import type { Config, DataFromGlobalSlug, GeneratedTypes, Plugin } from 'payload'

/**
 * Plugin to initialize homepage content on server startup
 * This ensures home page data exists before any queries are made
 */
export const initGlobalsPlugin =
  (): Plugin =>
  (incomingConfig: Config): Config => {
    return {
      ...incomingConfig,
      onInit: async (payload) => {
        const scheduleGlobalInit = <Slug extends keyof GeneratedTypes['globals']>(
          slug: Slug,
          data: Omit<DataFromGlobalSlug<Slug>, 'id'>,
          shouldInit: (existing: unknown) => boolean,
        ) => {
          const maxAttempts = 5

          const run = async (attempt = 1) => {
            try {
              const existing = await payload
                .findGlobal({
                  slug,
                  overrideAccess: true,
                })
                .catch(() => null)

              if (!shouldInit(existing)) {
                console.log(`✅ ${slug} global already exists`)
                return
              }

              console.log(`Initializing ${slug} global...`)
              await payload.updateGlobal({
                slug,
                data: data as any,
                overrideAccess: true,
              })
              console.log(`✅ ${slug} global initialized`)
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error)
              const schemaNotReady =
                message.includes('does not exist') || message.includes('relation')

              if (schemaNotReady && attempt < maxAttempts) {
                const delayMs = 1000 * attempt
                console.warn(
                  `Database not ready for ${slug}; retrying in ${delayMs}ms (attempt ${attempt + 1})`,
                )
                setTimeout(() => {
                  void run(attempt + 1)
                }, delayMs)
                return
              }

              console.error(`Failed to initialize ${slug} global:`, message)
            }
          }

          void run()
        }

        // Initialize cookie banner with default values for both locales
        const initCookieBanner = async (attempt = 1) => {
          const maxAttempts = 5
          try {
            // Check if global exists
            const existing = await payload
              .findGlobal({
                slug: 'cookie-banner',
                overrideAccess: true,
              })
              .catch(() => null)

            const existingData = existing as { id?: unknown; enabled?: boolean } | null

            // If it exists and has data, skip initialization
            if (existingData && existingData.id && existingData.enabled !== undefined) {
              console.log('✅ cookie-banner global already exists')
              return
            }

            console.log('Initializing cookie-banner global...')

            // Initialize for English locale
            await payload.updateGlobal({
              slug: 'cookie-banner',
              data: {
                enabled: true,
                title: 'Cookies & Privacy',
                description:
                  'We use cookies to improve your experience on our website. By using this site, you agree to the use of cookies. For more information, please see our privacy policy.',
                buttonText: 'Accept',
              },
              locale: 'en',
              overrideAccess: true,
            })

            // Initialize for German locale
            await payload.updateGlobal({
              slug: 'cookie-banner',
              data: {
                enabled: true,
                title: 'Cookies & Datenschutz',
                description:
                  'Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. Durch die Nutzung dieser Seite stimmen Sie der Verwendung von Cookies zu. Weitere Informationen finden Sie in unserer Datenschutzerklärung.',
                buttonText: 'Einverstanden',
              },
              locale: 'de',
              overrideAccess: true,
            })

            console.log('✅ cookie-banner global initialized')
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            const schemaNotReady =
              message.includes('does not exist') || message.includes('relation')

            if (schemaNotReady && attempt < maxAttempts) {
              const delayMs = 1000 * attempt
              console.warn(
                `Database not ready for cookie-banner; retrying in ${delayMs}ms (attempt ${attempt + 1})`,
              )
              setTimeout(() => {
                void initCookieBanner(attempt + 1)
              }, delayMs)
              return
            }

            console.error('Failed to initialize cookie-banner global:', message)
          }
        }

        void initCookieBanner()

        // Initialize alert top bar with default values for both locales
        const initAlertTopBar = async (attempt = 1) => {
          const maxAttempts = 10
          try {
            // Check if global exists
            const existing = await payload
              .findGlobal({
                slug: 'alert-top-bar',
                overrideAccess: true,
              })
              .catch(() => null)

            const existingData = existing as { id?: unknown; active?: boolean } | null

            // If it exists and has data, skip initialization
            if (existingData && existingData.id) {
              console.log('✅ alert-top-bar global already exists')
              return
            }

            console.log('Initializing alert-top-bar global...')

            // Initialize for English locale
            await payload.updateGlobal({
              slug: 'alert-top-bar',
              data: {
                active: false,
                color: 'red',
                title: 'Live alert',
                description: 'This is a default alert message.',
                readMoreText: 'Read more',
              },
              locale: 'en',
              overrideAccess: true,
            })

            // Initialize for German locale
            await payload.updateGlobal({
              slug: 'alert-top-bar',
              data: {
                active: false,
                color: 'red',
                title: 'Live-Alarm',
                description: 'Dies ist eine Standard-Warnmeldung.',
                readMoreText: 'Weiterlesen',
              },
              locale: 'de',
              overrideAccess: true,
            })

            console.log('✅ alert-top-bar global initialized')
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            const errorString = String(error)
            const schemaNotReady =
              message.includes('does not exist') ||
              message.includes('relation') ||
              message.includes('Failed query') ||
              errorString.includes('relation') ||
              errorString.includes('does not exist')

            if (schemaNotReady && attempt < maxAttempts) {
              const delayMs = 2000 * attempt
              console.warn(
                `Database not ready for alert-top-bar; retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxAttempts})`,
              )
              setTimeout(() => {
                void initAlertTopBar(attempt + 1)
              }, delayMs)
              return
            }

            console.error('Failed to initialize alert-top-bar global:', message)
            if (attempt >= maxAttempts) {
              console.error(
                'Max attempts reached. Please restart the server or manually initialize via /api/init-alert-top-bar',
              )
            }
          }
        }

        void initAlertTopBar()

        // Initialize sidebar widgets with default values
        scheduleGlobalInit(
          'sidebar-widgets',
          {
            facebook: {
              enabled: true,
              pageUrl: 'https://web.facebook.com/ffdross',
            },
            instagram: {
              enabled: true,
              username: 'ff_dross',
            },
          },
          (existing) => {
            const existingData = existing as {
              id?: unknown
              facebook?: unknown
              instagram?: unknown
            } | null
            return !existingData || !existingData.id
          },
        )

        // Initialize site settings with default values for both locales
        const initSiteSettings = async (attempt = 1) => {
          const maxAttempts = 5
          try {
            // Check if global exists
            const existing = await payload
              .findGlobal({
                slug: 'site-settings',
                overrideAccess: true,
              })
              .catch(() => null)

            const existingData = existing as { id?: unknown; siteName?: unknown } | null

            // If it exists and has data, skip initialization
            if (existingData && existingData.id && existingData.siteName) {
              console.log('✅ site-settings global already exists')
              return
            }

            console.log('Initializing site-settings global...')

            // Initialize for English locale
            await payload.updateGlobal({
              slug: 'site-settings',
              data: {
                siteName: '',
                siteDescription: '',
              },
              locale: 'en',
              overrideAccess: true,
            })

            // Initialize for German locale
            await payload.updateGlobal({
              slug: 'site-settings',
              data: {
                siteName: 'Freiwillige Feuerwehr Droß',
                siteDescription: 'Offizielle Website der Freiwilligen Feuerwehr Droß',
              },
              locale: 'de',
              overrideAccess: true,
            })

            console.log('✅ site-settings global initialized')
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            const schemaNotReady =
              message.includes('does not exist') || message.includes('relation')

            if (schemaNotReady && attempt < maxAttempts) {
              const delayMs = 1000 * attempt
              console.warn(
                `Database not ready for site-settings; retrying in ${delayMs}ms (attempt ${attempt + 1})`,
              )
              setTimeout(() => {
                void initSiteSettings(attempt + 1)
              }, delayMs)
              return
            }

            console.error('Failed to initialize site-settings global:', message)
          }
        }

        void initSiteSettings()

        // Initialize map settings with default values for both locales
        const initMapSettings = async (attempt = 1) => {
          const maxAttempts = 10
          try {
            // Check if global exists
            const existing = await payload
              .findGlobal({
                slug: 'map-settings',
                overrideAccess: true,
              })
              .catch(() => null)

            const existingData = existing as {
              id?: unknown
              enabled?: boolean
              mapLocations?: unknown[]
              mapType?: string
            } | null

            // If it exists and has the new structure (mapLocations), skip initialization
            if (
              existingData &&
              existingData.id &&
              existingData.enabled !== undefined &&
              Array.isArray(existingData.mapLocations) &&
              existingData.mapLocations.length > 0
            ) {
              console.log('✅ map-settings global already exists with new structure')
              return
            }

            // If it exists but has old structure, migrate it
            if (existingData && existingData.id && existingData.enabled !== undefined) {
              console.log('🔄 Migrating map-settings from old structure to new structure...')
              try {
                // Migrate old structure to new structure
                const oldData = existingData as {
                  googleMapsEmbedUrl?: string
                  mapAddress?: string
                  mapTitle?: string
                }

                // Create new structure with old data
                const migrationData = {
                  enabled: existingData.enabled ?? true,
                  mapType: (existingData.mapType as 'google' | 'osm') || 'google',
                  mapLocations: [
                    {
                      title: 'Main Location',
                      address: oldData.mapAddress || 'Schloßstraße 308, A-3552 Droß, Austria',
                      googleMapsEmbedUrl:
                        oldData.googleMapsEmbedUrl ||
                        'https://www.google.com/maps?q=Schloßstraße+308,+3552+Droß,+Austria&output=embed',
                    },
                  ],
                  displayMode: 'first' as const,
                  mapTitle: oldData.mapTitle || 'How to Find Us',
                }

                // Update English locale
                await payload.updateGlobal({
                  slug: 'map-settings',
                  data: migrationData,
                  locale: 'en',
                  overrideAccess: true,
                })

                // Update German locale
                await payload.updateGlobal({
                  slug: 'map-settings',
                  data: {
                    ...migrationData,
                    mapLocations: [
                      {
                        title: 'Hauptstandort',
                        address: oldData.mapAddress || 'Schloßstraße 308, A-3552 Droß, Österreich',
                        googleMapsEmbedUrl: migrationData.mapLocations[0].googleMapsEmbedUrl,
                      },
                    ],
                    mapTitle: oldData.mapTitle || 'So finden Sie uns',
                  },
                  locale: 'de',
                  overrideAccess: true,
                })

                console.log('✅ map-settings migrated successfully')
                return
              } catch (migrationError) {
                console.error('Failed to migrate map-settings, will re-initialize:', migrationError)
                // Continue to initialization below
              }
            }

            console.log('Initializing map-settings global...')

            // Initialize for English locale
            await payload.updateGlobal({
              slug: 'map-settings',
              data: {
                enabled: true,
                mapType: 'google',
                mapLocations: [
                  {
                    title: 'Main Station',
                    address: 'Schloßstraße 308, A-3552 Droß, Austria',
                    googleMapsEmbedUrl:
                      'https://www.google.com/maps?q=Schloßstraße+308,+3552+Droß,+Austria&output=embed',
                  },
                ],
                displayMode: 'first',
                mapTitle: 'How to Find Us',
              },
              locale: 'en',
              overrideAccess: true,
            })

            // Initialize for German locale
            await payload.updateGlobal({
              slug: 'map-settings',
              data: {
                enabled: true,
                mapType: 'google',
                mapLocations: [
                  {
                    title: 'Hauptwache',
                    address: 'Schloßstraße 308, A-3552 Droß, Österreich',
                    googleMapsEmbedUrl:
                      'https://www.google.com/maps?q=Schloßstraße+308,+3552+Droß,+Austria&output=embed',
                  },
                ],
                displayMode: 'first',
                mapTitle: 'So finden Sie uns',
              },
              locale: 'de',
              overrideAccess: true,
            })

            console.log('✅ map-settings global initialized')
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            const errorString = String(error)
            const schemaNotReady =
              message.includes('does not exist') ||
              message.includes('relation') ||
              message.includes('Failed query') ||
              message.includes('not-found') ||
              errorString.includes('relation') ||
              errorString.includes('does not exist') ||
              errorString.includes('map_settings')

            if (schemaNotReady && attempt < maxAttempts) {
              const delayMs = 2000 * attempt
              console.warn(
                `Database schema not ready for map-settings; retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxAttempts})`,
              )
              setTimeout(() => {
                void initMapSettings(attempt + 1)
              }, delayMs)
              return
            }

            console.error('Failed to initialize map-settings global:', message)
            if (attempt >= maxAttempts) {
              console.error(
                'Max attempts reached. Please restart the server to ensure database schema is created, or manually initialize via /api/init-map-settings',
              )
            }
          }
        }

        // Delay map settings initialization slightly to ensure schema is ready
        setTimeout(() => {
          void initMapSettings()
        }, 3000)

        // Call original onInit if it exists
        if (incomingConfig.onInit) {
          await incomingConfig.onInit(payload)
        }
      },
    }
  }
