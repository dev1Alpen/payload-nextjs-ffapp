import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Create contact submission in CMS
    const contactSubmission = await payload.create({
      collection: 'contact',
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
        status: 'new',
      },
    })

    // Return success response
    return NextResponse.json(
      {
        message: 'Contact submission created successfully',
        id: contactSubmission.id,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating contact submission:', error)

    // Handle specific Payload errors
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    )
  }
}

