import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('about', 'About Myy Signature Myy Style')

export default function AboutPage() {
  return <SectionRedirect anchor="about" />
}
