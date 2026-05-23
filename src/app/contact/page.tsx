import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('contact', 'Contact Myy Signature Myy Style')

export default function ContactPage() {
  return <SectionRedirect anchor="contact" />
}
