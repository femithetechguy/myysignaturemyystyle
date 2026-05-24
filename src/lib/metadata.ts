import type { Metadata } from 'next'
import appConfig from '../../app.json'

type PageKey = keyof typeof appConfig.seo.pages

export function buildPageMetadata(pageKey: PageKey, ogAlt?: string): Metadata {
  const { site_name } = appConfig.seo
  const page = appConfig.seo.pages[pageKey]
  const fullTitle = `${page.title} | ${site_name}`

  const imageUrl = `/api/og?title=${encodeURIComponent(page.title)}&tagline=${encodeURIComponent(page.og_description)}`

  return {
    title: fullTitle,
    description: page.description,
    openGraph: {
      title: fullTitle,
      description: page.og_description,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: ogAlt ?? fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: page.og_description,
      images: [imageUrl],
    },
  }
}
