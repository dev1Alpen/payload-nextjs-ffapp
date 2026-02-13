import Link from 'next/link'
import ArrowIcon from './ArrowIcon'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  locale?: 'en' | 'de'
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) return null

  return (
    <nav className="mb-8 mt-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ArrowIcon
                  direction="right"
                  className="w-4 h-4 text-gray-400 mx-2"
                />
              )}
              {isLast ? (
                <span className="text-gray-900 font-medium">{item.label}</span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-600">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

