'use client'

import { useState } from 'react'

interface ContactFormProps {
  locale: 'en' | 'de'
}

export default function ContactForm({ locale }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError(null)
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError(locale === 'de' ? 'Bitte füllen Sie alle Pflichtfelder aus.' : 'Please fill in all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(locale === 'de' ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' : 'Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (locale === 'de' ? 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.' : 'Error sending message. Please try again.'))
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      setIsSubmitting(false)
    } catch (err) {
      console.error('Contact form error:', err)
      setError(locale === 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' : 'An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const translations = {
    de: {
      name: 'Name',
      email: 'E-Mail',
      phone: 'Telefon (optional)',
      subject: 'Betreff',
      message: 'Nachricht',
      submit: 'Nachricht senden',
      submitting: 'Wird gesendet...',
      success: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.',
    },
    en: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone (optional)',
      subject: 'Subject',
      message: 'Message',
      submit: 'Send Message',
      submitting: 'Sending...',
      success: 'Thank you! Your message has been sent successfully.',
    },
  }

  const t = translations[locale]

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 md:p-10">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-fire to-fire-light rounded-full flex items-center justify-center mr-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {locale === 'de' ? 'Nachricht senden' : 'Send us a Message'}
        </h2>
      </div>
      <div className="w-20 h-1 bg-fire rounded-full mb-8"></div>

      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-700 font-medium">{t.success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.name} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fire focus:border-fire outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder={t.name}
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.email} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fire focus:border-fire outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder={t.email}
              />
            </div>
          </div>
        </div>

        <div className="group">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.phone}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder={t.phone}
            />
          </div>
        </div>

        <div className="group">
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.subject} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder={t.subject}
            />
          </div>
        </div>

        <div className="group">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.message} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fire focus:border-fire outline-none transition-all resize-vertical bg-gray-50 focus:bg-white"
              placeholder={t.message}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-fire to-fire-light text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.submitting}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              {t.submit}
            </>
          )}
        </button>
      </form>
    </div>
  )
}

