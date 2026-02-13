import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
      limit: 1,
    })

    if (existingUsers.totalDocs > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user with default site-admin role
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email: email.toLowerCase(),
        password,
        roles: ['site-admin'], // Set default role as site-admin
      },
    })

    // Return success response (don't return password)
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error registering user:', error)

    // Handle specific Payload errors
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('E11000') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

