import type { Metadata } from 'next'
import './globals.css'
import appConfig from '../../app.json'

const { seo } = appConfig

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || seo.site_url),
  title: seo.pages.home.title,
  description: seo.pages.home.description,
  keywords: seo.meta_tags.keywords,
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: seo.site_name,
    description: seo.pages.home.og_description,
    type: 'website',
    images: [{ url: `/api/og?title=${encodeURIComponent(seo.pages.home.title)}&tagline=${encodeURIComponent(seo.pages.home.og_description)}`, width: 1200, height: 630, alt: seo.site_name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.site_name,
    description: seo.pages.home.og_description,
    images: [`/api/og?title=${encodeURIComponent(seo.pages.home.title)}&tagline=${encodeURIComponent(seo.pages.home.og_description)}`],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0" />
        <script async src="https://www.instagram.com/embed.js"></script>
      </head>
      <body className="bg-slate-900 text-gray-100" suppressHydrationWarning>{children}</body>
    </html>
  )
}
