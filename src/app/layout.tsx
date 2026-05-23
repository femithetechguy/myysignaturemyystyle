import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.myysignaturemyystyle.com'),
  title: 'Myy Signature Myy Style Salon - Book Your Appointment Online',
  description: 'Premium hair salon in Locust Grove, GA. Expert cuts, color, braids, locs, treatments, and more. Fast, easy online booking with secure payment.',
  keywords: 'salon, hair salon, hair styling, hair coloring, braids, locs, booking, Locust Grove, Henry County',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Myy Signature Myy Style Salon',
    description: 'Book your premium hair appointment online',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Myy Signature Myy Style — Book Your Appointment' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Myy Signature Myy Style Salon',
    description: 'Book your premium hair appointment online',
    images: ['/opengraph-image'],
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
