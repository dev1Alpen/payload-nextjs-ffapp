'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Breadcrumb from '@/components/common/Breadcrumb'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [locale, setLocale] = useState<'en' | 'de'>('de')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get locale from URL params
  useEffect(() => {
    const lang = searchParams?.get('lang')
    if (lang === 'en' || lang === 'de') {
      setLocale(lang)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Registration successful - redirect to login or home
      router.push('/login?registered=true')
    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 -mt-2 md:-mt-3 relative z-10">
        <Breadcrumb
          items={[
            {
              label: locale === 'de' ? 'Startseite' : 'Home',
              href: `/?lang=${locale}`,
            },
            {
              label: locale === 'de' ? 'Registrierung' : 'Register',
            },
          ]}
          locale={locale}
        />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-[#1c1f4a] via-[#24275c] to-[#1c1f4a] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#1c1f4a] mb-2">Create Account</h1>
              <p className="text-gray-600">Sign up to get started</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4c8bf5] focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4c8bf5] focus:border-transparent outline-none transition-all"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4c8bf5] focus:border-transparent outline-none transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4c8bf5] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#3f76d6] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#4c8bf5] font-semibold hover:text-[#3f76d6] transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <>
        <Suspense fallback={<div className="h-16 bg-fire" />}>
          <Navigation initialLocale="de" />
        </Suspense>
        <div className="min-h-screen bg-gradient-to-br from-[#1c1f4a] via-[#24275c] to-[#1c1f4a] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    }>
      <RegisterForm />
    </Suspense>
  )
}


