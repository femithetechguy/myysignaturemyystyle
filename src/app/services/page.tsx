import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('services', 'Hair Services at Myy Signature Myy Style')

export default function ServicesPage() {
  return <SectionRedirect anchor="services" />
}
