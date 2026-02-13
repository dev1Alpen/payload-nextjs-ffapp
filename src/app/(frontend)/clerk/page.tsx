import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import OurTasksClient from '@/components/home/OurTasksClient'
import TeamMemberCard from '@/components/common/TeamMemberCard'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export default async function ClerkPage({ searchParams }: Props) {
  const { lang } = await searchParams
  const locale = (lang === 'en' ? 'en' : 'de') as 'en' | 'de'

  // Fetch tasks from CMS
  let tasks: any[] = []
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    
    const tasksResult = await payload.find({
      collection: 'tasks',
      sort: 'order',
      locale,
      limit: 100,
    })
    tasks = tasksResult.docs
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }

  // Fetch clerk page data from CMS
  const pageData = {
    title: locale === 'de' ? 'Kanzlei der FF-Droß' : 'Clerk of FF-Droß',
    intro: locale === 'de' 
      ? 'Wir sind sehr stolz darüber einige sehr aktive Mitglieder in unseren Reihen zu haben, doch wir freuen uns auch sehr, wenn wir neue Kameraden in unseren Reihen begrüßen dürfen. Bei Interesse melden Sie sich einfach bei unserem Kanzler.'
      : 'We are very proud to have some very active members in our ranks, but we are also very happy to welcome new comrades to our ranks. If you are interested, please contact our clerk.',
    teamMembers: [] as any[],
  }

  let clerkTeam: any[] = []
  
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    
    // Fetch the first clerk document (typically there will be only one)
    const clerkResult = await payload.find({
      collection: 'clerk',
      locale,
      limit: 1,
      depth: 2, // Need depth 2 to get image data from nested team members
    })

    if (clerkResult.docs.length > 0) {
      const clerk = clerkResult.docs[0]
      pageData.title = clerk.title || pageData.title
      pageData.intro = clerk.intro || pageData.intro
      
      // Process team members
      if (clerk.teamMembers && Array.isArray(clerk.teamMembers)) {
        // Sort by order
        const sortedMembers = [...clerk.teamMembers].sort((a: any, b: any) => {
          const orderA = a.order ?? 0
          const orderB = b.order ?? 0
          return orderA - orderB
        })
        
        clerkTeam = sortedMembers.map((member: any, index: number) => {
          // Get profile image URL
          const profileImage = typeof member.image === 'object' && member.image?.url 
            ? member.image.url 
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format'
          
          // Get bio text
          let bio = ''
          if (member.bio) {
            if (typeof member.bio === 'string') {
              bio = member.bio
            } else if (typeof member.bio === 'object' && member.bio !== null) {
              const bioObj = member.bio as Record<string, string>
              bio = bioObj[locale] || bioObj.en || bioObj.de || ''
            }
          }
          
          // Get audio URL
          const audioUrl = typeof member.audio === 'object' && member.audio?.url 
            ? member.audio.url 
            : null
          
          // Get card media
          let cardImageUrl = null
          let cardVideoUrl = null
          if (member.cardMedia) {
            if (member.cardMedia.mediaType === 'image' && member.cardMedia.image) {
              cardImageUrl = typeof member.cardMedia.image === 'object' && member.cardMedia.image?.url
                ? member.cardMedia.image.url
                : null
            } else if (member.cardMedia.mediaType === 'video' && member.cardMedia.videoUrl) {
              cardVideoUrl = member.cardMedia.videoUrl
            }
          }
          
          return {
            id: member.id || index,
            name: member.name || '',
            position: member.position || '',
            rank: member.rank || '',
            email: member.email || '',
            image: profileImage,
            bio,
            audioUrl,
            cardImageUrl,
            cardVideoUrl,
          }
        })
      }
    }
  } catch (error) {
    console.error('Error fetching clerk page data:', error)
    // Use fallback values if fetch fails
    clerkTeam = []
  }

  const t = {
    title: pageData.title,
    intro: pageData.intro,
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-[#DC2626]" />}>
        <Navigation initialLocale={locale} />
      </Suspense>

      <div className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-16">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
            <div className="h-40 md:h-52 bg-[url('/images/banner.png')] bg-cover bg-center opacity-20 rounded-b-3xl" />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-gray-900 via-red-600 to-red-500 overflow-hidden">
          {/* Modern Geometric Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%), linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
              backgroundSize: '60px 60px',
            }}></div>
          </div>

          {/* Animated Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/40 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/40 rounded-full blur-3xl"></div>
          </div>

          {/* White straight bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <svg
              className="w-full h-24 md:h-32"
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M0 0L1440 0L1440 120L0 120Z"
                fill="white"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center pb-24 md:pb-32">
            <div className="w-full py-12 md:py-16 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                {t.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {t.intro}
              </p>
            </div>
          </div>
        </section>

        {/* Clerk Team Section */}
        {clerkTeam.length > 0 && (
          <section className="mt-16 md:mt-24 mb-16 md:mb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                {clerkTeam.map((member, index) => (
                  <TeamMemberCard
                    key={member.id || index}
                    name={member.name}
                    position={member.position}
                    rank={member.rank}
                    email={member.email}
                    image={member.image}
                    bio={member.bio}
                    audioUrl={member.audioUrl}
                    cardImageUrl={member.cardImageUrl}
                    cardVideoUrl={member.cardVideoUrl}
                    locale={locale}
                    index={index}
                    gradientIdPrefix="clerkBorderGrad"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Our Tasks Section */}
        <OurTasksClient tasks={tasks} locale={locale} />

      </div>

      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}

