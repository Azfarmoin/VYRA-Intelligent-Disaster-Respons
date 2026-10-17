'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/report', label: 'Request help', urgent: true },
  { href: '/dashboard', label: 'Triage dashboard' },
  { href: '/map', label: 'Live map' },
  { href: '/resources', label: 'Resources' },
]

export default function SiteHeader() {
  const path = usePathname()
  return (
    <header className="sticky top-0 z-[1100] border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 font-black text-white">V</span>
          <span className="text-lg font-bold tracking-tight">VYRA</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto">
          {links.map((l) => {
            const active = path === l.href || path.startsWith(`${l.href}/`)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? 'bg-primary-100 text-primary-800' : l.urgent ? 'text-red-700 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
